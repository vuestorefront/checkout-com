<template>
  <div>
    <div class="card-frame" />
  </div>
</template>

<script>
import { onMounted, watch, ref } from '@vue/composition-api';
import useCkoCard from '../useCkoCard';
import { CkoPaymentType } from '../helpers';

export default {
  name: 'CreditCard',
  setup (_, context) {
    const paymentMethod = ref(CkoPaymentType.CREDIT_CARD);
    const { initCardForm, readyToPay } = useCkoCard(paymentMethod);
    onMounted(() => {
      initCardForm();
    })

    watch(() => readyToPay.value, () => context.emit('ready', readyToPay.value))

    return {
      readyToPay
    }
  }
}
</script>