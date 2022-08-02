# Changelog

## 0.3.0
- Correctly, returning card error in composable ([#25](https://github.com/vuestorefront/checkout-com/issues/25))

## 0.2.0
- Strong Customer Authentication support ([#23](https://github.com/vuestorefront/checkout-com/issues/23))

## 0.1.2
- `attempt_n3d` parameter for makePayment method ([#16](https://github.com/vuestorefront/checkout-com/issues/16))

## 0.1.1
- `beforeLoad` hook for Klarna ([#5706](https://github.com/vuestorefront/vue-storefront/issues/5706))

## 0.0.9 (not released)
- Sofort support ([#5158](https://github.com/DivanteLtd/vue-storefront/issues/5158))
- Klarna support ([#5157](https://github.com/DivanteLtd/vue-storefront/pull/5157))
- Clearing error private refs after succesful payment & error public ref before makePayment action from payment method ([#6](https://github.com/vuestorefront/checkout-com/pull/6))

## 0.0.8

- Fixed proxied endpoints URLs ([#5117](https://github.com/DivanteLtd/vue-storefront/pull/5117))

## 0.0.7

- Removed `ckoWebHookUrl` ([#4910](https://github.com/DivanteLtd/vue-storefront/issues/4910))
- Storing payment token inside sessionStorage and exported `removeTransactionToken` method ([#4928](https://github.com/DivanteLtd/vue-storefront/issues/4928))
- Possible to add `cvv` to `makePayment` method for saved cards ([#4893](https://github.com/DivanteLtd/vue-storefront/issues/4893))
- `reference` attribute in `makePayment` method ([#5003](https://github.com/DivanteLtd/vue-storefront/issues/5003))

## 0.0.6

- Support for channels ([#4885](https://github.com/DivanteLtd/vue-storefront/issues/4885))
