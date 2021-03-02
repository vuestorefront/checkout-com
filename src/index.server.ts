import { apiClientFactory } from '@vue-storefront/core';
import * as api from './api'
import { MultichannelConfiguration } from './configuration'

const { createApiClient } = apiClientFactory<MultichannelConfiguration, typeof api>({
  onCreate: (config: MultichannelConfiguration) => {
    return {
      config,
      client: null
    }
  },
  api,
});
  
export {
  createApiClient
};