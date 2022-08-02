import useCko from '../src/useCko';
import { createContext } from '../src/payment';
import { CkoPaymentType } from '../src/helpers';
import { ref } from '@vue/composition-api';

const contextPaymentMethods = [
  {
    name: 'paypal'
  },
  {
    name: 'klarna'
  }
];

const allPaymentMethods = [
  ...contextPaymentMethods,
  {
    name: 'card'
  }
];

const customerId = 12;
const contextData = {
  apms: contextPaymentMethods,
  id: customerId,
  // eslint-disable-next-line
  payment_settings: {
    // eslint-disable-next-line
    cvv_required: true
  }
};

const finalizeTransactionResponse = 'abc';
const saveInstrumentKey = 'save-instrument-super-key';

const useCkoPaypalMock = {
  makePayment: jest.fn(() => finalizeTransactionResponse),
  error: {
    value: {
      message: 'some-paypal-weird-error'
    }
  }
};
const useCkoSofortMock = {
  makePayment: jest.fn(() => finalizeTransactionResponse),
  error: {
    value: {
      message: 'some-sofort-weird-error'
    }
  }
};
const useCkoKlarnaMock = {
  makePayment: jest.fn(() => finalizeTransactionResponse),
  initKlarnaForm: jest.fn(),
  submitForm: jest.fn(),
  error: {
    value: {
      message: 'some-klarna-weird-error'
    }
  }
};
const useCkoCardMock = {
  initCardForm: jest.fn(),
  makePayment: jest.fn(() => finalizeTransactionResponse),
  error: ref(null),
  submitForm: jest.fn(),
  setPaymentInstrument: jest.fn(),
  removePaymentInstrument: jest.fn(),
  loadStoredPaymentInstruments: jest.fn(),
  storedPaymentInstruments: jest.fn(),
  submitDisabled: jest.fn()
};
jest.mock('../src/useCkoSofort', () => () => useCkoSofortMock);
jest.mock('../src/useCkoPaypal', () => () => useCkoPaypalMock);
jest.mock('../src/useCkoCard', () => () => useCkoCardMock);
jest.mock('../src/useCkoKlarna', () => () => useCkoKlarnaMock);
jest.mock('../src/helpers', () => ({
  getCurrentPaymentMethodPayload: jest.fn(),
  CkoPaymentType: jest.requireActual('../src/helpers').CkoPaymentType
}));
jest.mock('../src/configuration', () => ({
  getSaveInstrumentKey: jest.fn(() => saveInstrumentKey),
  Configuration: jest.requireActual('../src/configuration').Configuration
}));
jest.mock('../src/payment', () => ({
  createContext: jest.fn(() => Promise.resolve({
    data: contextData
  }))
}));

jest.mock('@vue-storefront/core', () => ({
  sharedRef: value => ref(value)
}))

const localStorageMock = {
  removeItem: jest.fn(),
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
  key: jest.fn(),
  length: 1
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

const {
  availableMethods,
  storedContextId,
  error,
  selectedPaymentMethod,
  isCvvRequired,
  loadAvailableMethods,
  initForm,
  submitKlarnaForm,
  makePayment,
  setSavePaymentInstrument,
  loadSavePaymentInstrument
} = useCko();

describe('[checkout-com] useCko', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('loads available methods for guest', async () => {

    const payload = {
      reference: '1'
    };

    const response = await loadAvailableMethods(payload.reference);

    expect(availableMethods.value).toEqual(allPaymentMethods);
    expect(storedContextId.value).toBe(customerId);
    expect(response).toEqual(contextData);

  });

  it('loads available methods for customer', async () => {

    const payload = {
      reference: '1',
      email: 'abc@gmail.com'
    };

    await loadAvailableMethods(payload.reference, payload.email);

    expect(availableMethods.value).toEqual(allPaymentMethods);
    expect(storedContextId.value).toBe(customerId);

  });

  it('loads cvv_required for guest', async () => {

    const payload = {
      reference: '1'
    };

    await loadAvailableMethods(payload.reference);

    expect(isCvvRequired.value).toEqual(contextData.payment_settings.cvv_required);

  });

  it('loads cvv_required for customer', async () => {

    const payload = {
      reference: '1',
      email: 'abc@gmail.com'
    };

    await loadAvailableMethods(payload.reference, payload.email);

    expect(isCvvRequired.value).toEqual(contextData.payment_settings.cvv_required);

  });

  it('requiresCvv equals false if not cvv_required in response', async () => {

    const payload = {
      reference: '1'
    };
    jest.mock('../src/payment', () => ({
      createContext: jest.fn(() => Promise.resolve({
        data: contextData
      }))
    }));

    (createContext as jest.Mock).mockImplementation(() => Promise.resolve({
      data: {
        apms: contextData.apms,
        id: contextData.id
      }
    }));

    await loadAvailableMethods(payload.reference);

    expect(isCvvRequired.value).toEqual(contextData.payment_settings.cvv_required);

  });

  it('sets error if available methods fails', async () => {

    const errorMessage = 'load available methods fails';
    const payload = {
      reference: '1'
    };
    const mockCreateContext = (createContext as jest.Mock).mockImplementation(() => {
      throw new Error(errorMessage);
    });

    await loadAvailableMethods(payload.reference);

    expect(error.value.message).toEqual(errorMessage);

    mockCreateContext.mockReset();
  });

  it('stops initForm if initMethods is an empty object', () => {
    initForm({}, {});
    expect(useCkoCardMock.initCardForm).not.toHaveBeenCalled();
  });

  it('inits card form in initForm if available', async () => {
    await loadAvailableMethods('1');
    initForm(null, {});

    expect(useCkoCardMock.initCardForm).toHaveBeenCalled();
  });

  it('inits card form in initForm if available and requested', async () => {
    await loadAvailableMethods('1');
    initForm({
      card: true
    }, {});

    expect(useCkoCardMock.initCardForm).toHaveBeenCalled();
  });

  it('inits klarna form in initForm if available and requested', async () => {
    await loadAvailableMethods('1');
    initForm({
      klarna: true
    }, {});

    expect(useCkoKlarnaMock.initKlarnaForm).toHaveBeenCalled();
  });


  it('inits card form in initForm if available without params', async () => {
    await loadAvailableMethods('1');
    initForm();

    expect(useCkoCardMock.initCardForm).toHaveBeenCalled();
  });

  it('inits klarna form in initForm if available and requested', async () => {
    await loadAvailableMethods('1');
    initForm({
      klarna: true
    }, {});

    expect(useCkoKlarnaMock.initKlarnaForm).toHaveBeenCalled();
  });

  it('calls submitKlarnaForm with provided context', () => {
    const ctx = 15;
    submitKlarnaForm(ctx);

    expect(useCkoKlarnaMock.submitForm).toHaveBeenCalledWith(ctx);
  });

  it('calls submitKlarnaForm with fetched value by default', async () => {
    await loadAvailableMethods('1');
    submitKlarnaForm();

    expect(useCkoKlarnaMock.submitForm).toHaveBeenCalledWith(customerId);
  });

  it('inits card form in initForm if available with custom config', async () => {
    const customConfig = {
      card: {
        style: 1,
        localization: 'sads'
      }
    };
    await loadAvailableMethods('1');
    initForm(null, customConfig);

    expect(useCkoCardMock.initCardForm).toHaveBeenCalledWith(customConfig.card);
  });

  it('does not make payment if payment method not selected', async () => {
    await makePayment({});

    expect(error.value.message).toBe('Payment method not selected');
  });

  it('does not make payment if payment method not selected without params', async () => {
    await makePayment();

    expect(error.value.message).toBe('Payment method not selected');
  });

  it('makes payment for credit card', async () => {
    selectedPaymentMethod.value = CkoPaymentType.CREDIT_CARD;

    /*eslint-disable */
    const payload = {
      cartId: '1',
      email: 'a@gmail.com',
      contextDataId: '12',
      secure3d: true,
      success_url: null,
      failure_url: null
    }

    localStorageMock.getItem.mockImplementation(() => 'true')

    const expectedPayload = {
      cartId: '1',
      email: 'a@gmail.com',
      contextDataId: '12',
      cvv: null,
      secure3d: true,
      attempt_n3d: false,
      success_url: null,
      failure_url: null,
      savePaymentInstrument: true,
      reference: null
    }
    /* eslint-enable */

    const response = await makePayment(payload);

    expect(useCkoCardMock.makePayment).toHaveBeenCalledWith(expectedPayload);
    expect(response).toBe(finalizeTransactionResponse);
  });

  it('clears error and makes payment for credit card', async () => {
    selectedPaymentMethod.value = null;
    await makePayment({});
    expect(error.value.message).toBe('Payment method not selected');

    /*eslint-disable */
    selectedPaymentMethod.value = CkoPaymentType.CREDIT_CARD;
    const payload = {
      cartId: '1',
      email: 'a@gmail.com',
      contextDataId: '12',
      secure3d: true,
      success_url: null,
      failure_url: null
    }

    localStorageMock.getItem.mockImplementation(() => 'true');
    /* eslint-enable */

    await makePayment(payload);

    expect(error.value).toBe(null);
  });

  it('makes payment for saved card', async () => {
    selectedPaymentMethod.value = CkoPaymentType.SAVED_CARD;
    /*eslint-disable */
    const payload = {
      cartId: '1',
      email: 'a@gmail.com',
      cvv: 899,
      contextDataId: '12',
      secure3d: true,
      success_url: null,
      failure_url: null,
      reference: 'zyxxzxz'
    }

    localStorageMock.getItem.mockImplementation(() => 'true')

    const expectedPayload = {
      cartId: '1',
      email: 'a@gmail.com',
      contextDataId: '12',
      cvv: 899,
      secure3d: true,
      attempt_n3d: false,
      success_url: null,
      failure_url: null,
      savePaymentInstrument: true,
      reference: 'zyxxzxz'
    }
    /* eslint-enable */

    const response = await makePayment(payload);

    expect(useCkoCardMock.makePayment).toHaveBeenCalledWith(expectedPayload);
    expect(response).toBe(finalizeTransactionResponse);
  });

  it('throws with saved card when CVV required and not provided', async () => {
    selectedPaymentMethod.value = CkoPaymentType.SAVED_CARD;
    /*eslint-disable */
    const payload = {
      cartId: '1',
      email: 'a@gmail.com',
      cvv: null,
      contextDataId: '12',
      secure3d: true,
      success_url: null,
      failure_url: null
    }

    localStorageMock.getItem.mockImplementation(() => 'true')
    /* eslint-enable */

    await makePayment(payload);
    expect(error.value.message).toBe('CVV is required');
  });

  it('makes payment for PayPal', async () => {
    selectedPaymentMethod.value = CkoPaymentType.PAYPAL;
    /*eslint-disable */
    const payload = {
      cartId: '1',
      email: 'a@gmail.com',
      contextDataId: '12',
      secure3d: true,
      success_url: null,
      failure_url: null
    }

    localStorageMock.getItem.mockImplementation(() => 'true')

    const expectedPayload = {
      cartId: '1',
      email: 'a@gmail.com',
      contextDataId: '12',
      cvv: null,
      secure3d: true,
      attempt_n3d: false,
      success_url: null,
      failure_url: null,
      savePaymentInstrument: true,
      reference: null
    }
    /* eslint-enable */

    const response = await makePayment(payload);

    expect(useCkoPaypalMock.makePayment).toHaveBeenCalledWith(expectedPayload);
    expect(response).toBe(finalizeTransactionResponse);
  });

  it('makes payment for Sofort', async () => {
    selectedPaymentMethod.value = CkoPaymentType.SOFORT;
    /*eslint-disable */
    const payload = {
      cartId: '1',
      email: 'a@gmail.com',
      contextDataId: '12',
      secure3d: true,
      success_url: null,
      failure_url: null
    }

    localStorageMock.getItem.mockImplementation(() => 'true')

    const expectedPayload = {
      cartId: '1',
      email: 'a@gmail.com',
      contextDataId: '12',
      cvv: null,
      secure3d: true,
      attempt_n3d: false,
      success_url: null,
      failure_url: null,
      savePaymentInstrument: true,
      reference: null
    }
    /* eslint-enable */

    const response = await makePayment(payload);

    expect(useCkoSofortMock.makePayment).toHaveBeenCalledWith(expectedPayload);
    expect(response).toBe(finalizeTransactionResponse);
  });

  it('makes payment for Klarna', async () => {
    selectedPaymentMethod.value = CkoPaymentType.KLARNA;
    /*eslint-disable */
    const payload = {
      cartId: '1',
      email: 'a@gmail.com',
      contextDataId: '12',
      secure3d: true,
      success_url: null,
      failure_url: null
    }

    localStorageMock.getItem.mockImplementation(() => 'true')

    const expectedPayload = {
      cartId: '1',
      email: 'a@gmail.com',
      contextDataId: '12',
      cvv: null,
      secure3d: true,
      attempt_n3d: false,
      success_url: null,
      failure_url: null,
      savePaymentInstrument: true,
      reference: null
    }
    /* eslint-enable */

    const response = await makePayment(payload);

    expect(useCkoKlarnaMock.makePayment).toHaveBeenCalledWith(expectedPayload);
    expect(response).toBe(finalizeTransactionResponse);
  });

  it('sets error for not supported payment method', async () => {
    selectedPaymentMethod.value = 312321;

    await makePayment({});

    expect(useCkoPaypalMock.makePayment).not.toHaveBeenCalled();
    expect(error.value.message).toBe('Not supported payment method');
  });

  it('inherits error from payment methods makePayment', async () => {
    selectedPaymentMethod.value = CkoPaymentType.PAYPAL;

    await makePayment({});
    expect(error.value.message).toBe(useCkoPaypalMock.error.value.message);
  });

  it('sets savePaymentInstrument', () => {
    const someValue = true;

    setSavePaymentInstrument(someValue);

    expect(localStorageMock.setItem).toHaveBeenCalledWith(saveInstrumentKey, JSON.stringify(someValue));
  });

  it('loadSavePaymentInstrument works', () => {
    localStorageMock.getItem.mockImplementation(() => undefined);
    const defaultValue = loadSavePaymentInstrument();
    localStorageMock.getItem.mockImplementation(() => 'true');
    const storedValue = loadSavePaymentInstrument();

    expect(defaultValue).toBeFalsy();
    expect(storedValue).toBeTruthy();
  });

});
