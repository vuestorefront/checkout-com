/* eslint-disable camelcase, @typescript-eslint/camelcase */

import { createContext } from './payment';
import { getSaveInstrumentKey, CardConfiguration, KlarnaConfiguration } from './configuration';
import { sharedRef } from '@vue-storefront/core';
import { computed, Ref } from '@vue/composition-api';
import { CkoPaymentType } from './helpers';
import useCkoCard from './useCkoCard';
import useCkoPaypal from './useCkoPaypal';
import useCkoSofort from './useCkoSofort';
import useCkoKlarna from './useCkoKlarna';

interface PaymentMethods {
  card?: boolean;
  klarna?: boolean;
}

interface PaymentMethodsConfig {
  card?: CardConfiguration;
  klarna?: KlarnaConfiguration;
}

const setSavePaymentInstrument = (newSavePaymentInstrument: boolean) => {
  localStorage.setItem(getSaveInstrumentKey(), JSON.stringify(newSavePaymentInstrument));
};
const loadSavePaymentInstrument = (): boolean => {
  const stringifiedValue = localStorage.getItem(getSaveInstrumentKey());
  return stringifiedValue ? JSON.parse(stringifiedValue) : false;
};

const useCko = () => {

  const error = sharedRef(null, 'useCko-error');
  const availableMethods = sharedRef([], 'useCko-availableMethods');
  const contextId = sharedRef<string>(null, 'useCko-contextId');
  const requiresCvv = sharedRef(false, 'useCko-requiresCvv');
  const selectedPaymentMethod = sharedRef<CkoPaymentType>(CkoPaymentType.NOT_SELECTED, 'useCko-selectedPaymentMethod');

  const {
    initCardForm,
    makePayment: makeCardPayment,
    error: cardError,
    submitForm: submitCardForm,
    setPaymentInstrument,
    removePaymentInstrument,
    loadStoredPaymentInstruments,
    removeTransactionToken,
    storedPaymentInstruments,
    submitDisabled
  } = useCkoCard(selectedPaymentMethod as any);

  const {
    initKlarnaForm,
    submitForm: submitKlarnaForm,
    makePayment: makeKlarnaPayment,
    error: klarnaError
  } = useCkoKlarna();

  const {
    makePayment: makePaypalPayment,
    error: paypalError
  } = useCkoPaypal();

  const {
    makePayment: makeSofortPayment,
    error: sofortError
  } = useCkoSofort();

  const loadAvailableMethods = async (reference, email?, products?) => {
    try {
      const response = await createContext({ reference, email, products });
      availableMethods.value = [
        ...response.data.apms,
        { name: 'card' }
      ];
      contextId.value = response.data.id;
      if (response.data.payment_settings && 'cvv_required' in response.data.payment_settings) {
        requiresCvv.value = response.data.payment_settings.cvv_required;
      }
      return response.data;
    } catch (e) {
      error.value = e;
      return null;
    }
  };

  const initForm = (initMethods: PaymentMethods = null, config: PaymentMethodsConfig = {}) => {
    if (initMethods && Object.keys(initMethods).length === 0) {
      return;
    }
    const hasSpecifiedMethods = initMethods && Object.keys(initMethods).length > 0;

    for (const currentPaymentMethod of availableMethods.value) {
      if (!hasSpecifiedMethods || initMethods[currentPaymentMethod.name]) {
        const methodConfig = config[currentPaymentMethod.name];
        switch (currentPaymentMethod.name) {
          case 'card':
            initCardForm(methodConfig);
            break;
          case 'klarna':
            initKlarnaForm(methodConfig, currentPaymentMethod, contextId.value);
            break;
        }
      }
    }
  };

  const makePayment = async ({
    cartId = null,
    email = null,
    contextDataId = null,
    success_url = null,
    failure_url = null,
    secure3d = true,
    attempt_n3d = false,
    cvv = null,
    reference = null
  } = {}) => {
    if (!selectedPaymentMethod.value) {
      error.value = new Error('Payment method not selected');
      return;
    }

    let finalizeTransactionFunction;
    let localError;

    if ([CkoPaymentType.CREDIT_CARD, CkoPaymentType.SAVED_CARD].includes(selectedPaymentMethod.value)) {
      const hasCvvIfRequired = selectedPaymentMethod.value === CkoPaymentType.SAVED_CARD && requiresCvv.value && !cvv;
      if (hasCvvIfRequired) {
        error.value = new Error('CVV is required');
        return;
      }
      finalizeTransactionFunction = makeCardPayment;
      localError = cardError;
    } else if (selectedPaymentMethod.value === CkoPaymentType.KLARNA) {
      finalizeTransactionFunction = makeKlarnaPayment;
      localError = klarnaError;
    } else if (selectedPaymentMethod.value === CkoPaymentType.PAYPAL) {
      finalizeTransactionFunction = makePaypalPayment;
      localError = paypalError;
    } else if (selectedPaymentMethod.value === CkoPaymentType.SOFORT) {
      finalizeTransactionFunction = makeSofortPayment;
      localError = sofortError;
    } else {
      error.value = new Error('Not supported payment method');
      return;
    }

    error.value = null;

    const response = await finalizeTransactionFunction({
      cartId,
      email,
      success_url,
      failure_url,
      secure3d,
      attempt_n3d,
      cvv,
      reference,
      contextDataId: contextDataId || contextId.value,
      savePaymentInstrument: loadSavePaymentInstrument()
    });

    if (localError.value) {
      error.value = localError.value;
    }

    return response;
  };

  return {
    availableMethods,
    error: computed(() => error.value || cardError.value || null),
    selectedPaymentMethod,
    storedPaymentInstruments,
    submitDisabled,
    storedContextId: computed(() => contextId.value),
    isCvvRequired: computed(() => requiresCvv.value),
    loadAvailableMethods,
    initForm,
    submitCardForm,
    submitKlarnaForm: (ctx?) => submitKlarnaForm(ctx || contextId.value),
    makePayment,
    setPaymentInstrument,
    setSavePaymentInstrument,
    loadSavePaymentInstrument,
    removePaymentInstrument,
    loadStoredPaymentInstruments,
    removeTransactionToken
  };
};
export default useCko;
