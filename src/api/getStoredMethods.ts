import axios from 'axios';
import { apiRequestHeaders } from './_utils'

const getStoredMethods = async ({ config }, params) => {
  try {
    if (!params || !params.customer_id) {
      throw new Error('Not provided customer_id')
    }
    if (!params.channel || !config.channels[params.channel]) {
      throw new Error('Not provided or not existing channel')
    }

    const channelConfiguration = config.channels[params.channel];
    const { data } = await axios.get(
      `${channelConfiguration.ctApiUrl}/api/merchants/${channelConfiguration.publicKey}/customers/${params.customer_id}`,
      apiRequestHeaders(channelConfiguration)
    );
    return {
      payment_instruments: [
        ...data.payment_instruments.filter((value, index, self) => {
          return self.findIndex(el => el.id === value.id) === index;
        })
      ]
    };
  } catch (err) {
    console.log(err);
    if (err.response) {
      console.error(err.response.data);
    }
    // How to respond with 400???
    return null;
  }
};

export default getStoredMethods;
