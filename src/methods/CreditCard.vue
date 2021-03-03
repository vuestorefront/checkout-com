<template>
  <div>
    <div class="card-frame" />
    <div class="card-user-area" v-if="isAuthenticated">
      <SfCheckbox
        data-cy="billing-details-checkbox_isDefault"
        v-model="savePaymentInstrument"
        name="savePaymentInstrument"
        label="Save payment instrument"
        class="billing-address-setAsDefault"
      />
    </div>
  </div>
</template>

<script>
import { onMounted, watch } from '@vue/composition-api';
import useCkoCard from '../useCkoCard';
import { useUser, useCart } from '@vue-storefront/commercetools';
import {
  SfCheckbox,
  SfRadio
} from '@storefront-ui/vue';

export default {
  name: 'CreditCard',
  components: {
    SfCheckbox,
    SfRadio
  },
  setup (_, context) {
    const { 
      initCardForm,
      readyToPay,
      loadStoredPaymentInstruments,
      savePaymentInstrument
    } = useCkoCard();
    const { isAuthenticated } = useUser();
    const { cart } = useCart();

    onMounted(async () => {
      initCardForm();
      if (isAuthenticated.value) {
        await loadStoredPaymentInstruments(cart.value.customerId);
      }
    })

    watch(() => readyToPay.value, () => context.emit('ready', readyToPay.value))

    return {
      readyToPay,
      isAuthenticated,
      savePaymentInstrument
    }
  }
}
</script>