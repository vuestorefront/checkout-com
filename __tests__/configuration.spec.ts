import { defaultConfig, setup, getKlarnaContainerSelector, getPublicKey, getApiUrl, getFramesStyles, getFramesLocalization, getCkoProxyUrl, getTransactionTokenKey, getSaveInstrumentKey, getCurrentChannel, setChannel, isSCAenabled } from '../src/configuration';

const consoleLogMock = {
  error: jest.fn()
};

Object.defineProperty(window, 'console', {
  value: consoleLogMock
});

describe('[checkout-com] configuration', () => {

  it('uses fallback values', () => {

    const config = {
      channels: {
        en: {
          publicKey: '12'
        }
      },
      defaultChannel: 'en'
    };

    setup(config);

    expect(getPublicKey()).toBe(config.channels.en.publicKey);
    expect(getApiUrl()).toBe(defaultConfig.ctApiUrl);
    expect(getFramesStyles()).toEqual(defaultConfig.card.style);
    expect(getFramesLocalization()).toEqual(defaultConfig.card.localization);
    expect(getTransactionTokenKey()).toBe(defaultConfig.tokenizedCardKey);
    expect(getCurrentChannel()).toBe(config.defaultChannel);
    expect(getKlarnaContainerSelector()).toBe(defaultConfig.klarna.containerSelector);

  });

  it('appends configuration properly', () => {

    const config = {
      channels: {
        en: {
          publicKey: 'some-public-key',
          ctApiUrl: 'https://pwebhook.com/api/a',
          card: {
            style: {ab: '12'},
            localization: 'en-US'
          },
          klarna: {
            containerSelector: '#test',
            mounted: () => {
              return 1 + 2;
            }
          },
          tokenizedCardKey: 'temporary-tokenized-value-key',
          saveInstrumentKey: 'some-new-value',
          ckoSCAenabled: false
        }
      },
      defaultChannel: 'en'
    };

    setup(config);

    expect(getPublicKey()).toBe(config.channels.en.publicKey);
    expect(getApiUrl()).toBe(config.channels.en.ctApiUrl);
    expect(getFramesStyles()).toEqual(config.channels.en.card.style);
    expect(getFramesLocalization()).toEqual(config.channels.en.card.localization);
    expect(getTransactionTokenKey()).toBe(config.channels.en.tokenizedCardKey);
    expect(getSaveInstrumentKey()).toBe(config.channels.en.saveInstrumentKey);
    expect(getKlarnaContainerSelector()).toBe(config.channels.en.klarna.containerSelector);
    expect(getCurrentChannel()).toBe(config.defaultChannel);
    expect(isSCAenabled()).toBe(config.channels.en.ckoSCAenabled);

  });

  it('properly generates cko proxy url', () => {

    expect(getCkoProxyUrl()).toBe(`${window.location.origin}/cko-api`);

  });

  it('set ups new channel properly', () => {

    const config = {
      channels: {
        en: {
          publicKey: 'some-public-key',
          ctApiUrl: 'https://pwebhook.com/api/a',
          card: {
            style: {ab: '12'},
            localization: 'en-US'
          },
          klarna: {
            containerSelector: '#ab',
            mounted: () => {
              return 1 + 2;
            }
          },
          tokenizedCardKey: 'temporary-tokenized-value-key',
          saveInstrumentKey: 'some-new-value'
        },
        it: {
          publicKey: 'some-public-xcxcxc-asdas',
          ctApiUrl: 'https://abcc.com/api/bbba',
          card: {
            style: {asdas: '1552'},
            localization: 'it-IT'
          },
          klarna: {
            containerSelector: '#other',
            mounted: () => {
              return 1 + 2;
            }
          },
          tokenizedCardKey: 'some-token-value-it',
          saveInstrumentKey: 'some-new-value-it-ab',
          ckoSCAenabled: true
        }
      },
      defaultChannel: 'en'
    };

    setup(config);
    const newChannel = 'it';
    setChannel(newChannel);

    expect(getPublicKey()).toBe(config.channels.it.publicKey);
    expect(getApiUrl()).toBe(config.channels.it.ctApiUrl);
    expect(getFramesStyles()).toEqual(config.channels.it.card.style);
    expect(getFramesLocalization()).toEqual(config.channels.it.card.localization);
    expect(getTransactionTokenKey()).toBe(config.channels.it.tokenizedCardKey);
    expect(getSaveInstrumentKey()).toBe(config.channels.it.saveInstrumentKey);
    expect(getKlarnaContainerSelector()).toBe(config.channels.it.klarna.containerSelector);
    expect(getCurrentChannel()).toBe(newChannel);
    expect(isSCAenabled()).toBe(config.channels.it.ckoSCAenabled);

  });

  it('prints error if not existing channel is default', () => {

    const config = {
      channels: {
        en: {
          publicKey: 'some-public-key',
          ctApiUrl: 'https://pwebhook.com/api/a',
          card: {
            style: {ab: '12'},
            localization: 'en-US'
          },
          tokenizedCardKey: 'temporary-tokenized-value-key',
          saveInstrumentKey: 'some-new-value'
        }
      },
      defaultChannel: 'ch'
    };

    setup(config);
    expect(consoleLogMock.error).toHaveBeenCalledWith('[CKO] Bad config provided');

  });

  it('prints error if not existing channel is picked', () => {

    const config = {
      channels: {
        en: {
          publicKey: 'some-public-key',
          ctApiUrl: 'https://pwebhook.com/api/a',
          card: {
            style: {ab: '12'},
            localization: 'en-US'
          },
          tokenizedCardKey: 'temporary-tokenized-value-key',
          saveInstrumentKey: 'some-new-value'
        }
      },
      defaultChannel: 'en'
    };

    setup(config);
    setChannel('it');
    expect(consoleLogMock.error).toHaveBeenCalledWith('[CKO] Requested channel does not exist in the config');

  });

});
