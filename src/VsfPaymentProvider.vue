<template>
  <div class="payment-provider">
    <SfHeading
      :level="3"
      :title="$t('Payment methods')"
      class="sf-heading--left sf-heading--no-underline title"
    />
    <div class="form">
      <div class="form__radio-group">
          <SfRadio
            v-for="method in paymentMethods"
            :key="method.name"
            :label="method.label"
            :value="method.name"
            :selected="localPaymentMethod.name"
            @input="selectPaymentMethod(method)"
            name="paymentMethod"
            class="form__radio payment"
          >
            <template #label="{ label }">
              <div class="sf-radio__label payment__label">
                <div>{{ label }}</div>
              </div>
            </template>
            <template #description="{ description }">
              <div class="sf-radio__description payment__description">
                <div class="payment__info">
                  {{ description }}
                </div>
              </div>
            </template>
          </SfRadio>
        </div>
    </div>
    <div class="payment-sdk">
      <CreditCard 
        v-if="selectedPaymentMethod === CkoPaymentType.CREDIT_CARD"
        @ready="$emit('status', $event)"
      />
    </div>
  </div>
</template>

<script>
import {
  SfHeading,
  SfButton,
  SfRadio
} from '@storefront-ui/vue';
import { ref } from '@vue/composition-api';
import { useCko } from '.';
import { useCart, useUser } from '@vue-storefront/commercetools';
import { onMounted } from '@vue/composition-api';
import { CkoPaymentType } from './helpers';

export default {
  name: 'VsfPaymentProviderMock',
  components: {
    SfHeading,
    SfButton,
    SfRadio,
    CreditCard: () => import('./methods/CreditCard')
  },
  setup (_, context) {
    const {
      loadAvailableMethods,
      availableMethods: paymentMethods,
      selectedPaymentMethod
    } = useCko();
    const { cart } = useCart();
    const { user } = useUser();
    const localPaymentMethod = ref({});

    const paymentMethodToEnumValue = paymentMethod => {
      switch (paymentMethod.name) {
        case 'paypal':
          return CkoPaymentType.PAYPAL;
        case 'card':
          return CkoPaymentType.CREDIT_CARD;
        default:
          console.log('no method')
      }
    }

    const selectPaymentMethod = paymentMethod => {
      context.emit('status', false);
      localPaymentMethod.value = paymentMethod;
      selectedPaymentMethod.value = paymentMethodToEnumValue(paymentMethod);
      if (selectedPaymentMethod.value === CkoPaymentType.PAYPAL) {
        context.emit('status', true);
      }
    };

    onMounted(async () => {
      await loadAvailableMethods(cart.value.id, user.value && user.value.email)
    })

    return {
      paymentMethods,
      paymentMethodToEnumValue,
      selectedPaymentMethod,
      localPaymentMethod,
      selectPaymentMethod,

      CkoPaymentType
    };
  }
};
</script>

<style lang="scss" scoped>
.title {
  margin: var(--spacer-xl) 0 var(--spacer-base) 0;
}

.payment-provider {
  .sf-radio {
    &__label {
      display: flex;
      justify-content: space-between;
    }
    &__description {
      --radio-description-margin: 0;
      --radio-description-font-size: var(--font-xs);
    }
  }
}

.form {
  --button-width: 100%;
  @include for-desktop {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    --button-width: auto;
  }
  &__action {
    @include for-desktop {
      flex: 0 0 100%;
      display: flex;
    }
  }
  &__action-button {
    &--secondary {
      @include for-desktop {
        order: -1;
        text-align: left;
      }
    }
    &--add-address {
      width: 100%;
      margin: 0;
      @include for-desktop {
        margin: 0 0 var(--spacer-lg) 0;
        width: auto;
      }
    }
  }
  &__back-button {
    margin: var(--spacer-xl) 0 var(--spacer-sm);
    &:hover {
      color:  var(--c-white);
    }
    @include for-desktop {
      margin: 0 var(--spacer-xl) 0 0;
    }
  }
  &__radio-group {
    flex: 0 0 100%;
    margin: 0 0 var(--spacer-xl) 0;
    @include for-desktop {
      margin: 0 0 var(--spacer-2xl) 0;
    }

  }
}
</style>
