<template>
  <div>
    <div class="card-frame" />
  </div>
</template>

<script>
import { onMounted, watch, ref } from '@vue/composition-api';
import useCkoCard from '../useCkoCard';

export default {
  name: 'CreditCard',
  setup (_, context) {
    const { initCardForm, readyToPay } = useCkoCard();
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