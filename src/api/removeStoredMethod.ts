import axios from 'axios';
import { apiRequestHeaders } from './_utils'

const removeStoredMethod = async ({ config }, params) => {
  try {
    if (!params || !params.customer_id) {
      throw new Error('Not provided customer_id')
    }
    if (!params.payment_instrument_id) {
      throw new Error('Not provided payment_instrument_id')
    }
    if (!params.channel || !config.channels[params.channel]) {
      throw new Error('Not provided or not existing channel')
    }

    const channelConfiguration = config.channels[params.channel];
    return await axios.delete(
      `${channelConfiguration.ctApiUrl}/api/merchants/${channelConfiguration.publicKey}/customers/${params.customer_id}/payment-instruments/${params.payment_instrument_id}`,
      apiRequestHeaders(channelConfiguration)
    );
  } catch (err) {
    console.log(err);
    if (err.response) {
      console.error(err.response.data);
    }
    // How to respond with 400???
    return null;
  }
};

export default removeStoredMethod;
