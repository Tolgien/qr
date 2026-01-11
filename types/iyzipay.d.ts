declare module 'iyzipay' {
  interface IyzipayConfig {
    apiKey: string
    secretKey: string
    uri: string
  }

  interface BuyerInfo {
    id: string
    name: string
    surname: string
    gsmNumber: string
    email: string
    identityNumber: string
    registrationAddress: string
    ip: string
    city: string
    country: string
  }

  interface AddressInfo {
    contactName: string
    city: string
    country: string
    address: string
  }

  interface BasketItem {
    id: string
    name: string
    category1: string
    itemType: string
    price: string
  }

  interface PaymentRequest {
    locale: string
    conversationId: string
    price: string
    paidPrice: string
    currency: string
    basketId: string
    paymentGroup: string
    callbackUrl: string
    enabledInstallments: number[]
    buyer: BuyerInfo
    shippingAddress: AddressInfo
    billingAddress: AddressInfo
    basketItems: BasketItem[]
  }

  class Iyzipay {
    constructor(config: IyzipayConfig)

    static LOCALE: {
      TR: string
      EN: string
    }

    static CURRENCY: {
      TRY: string
      EUR: string
      USD: string
      GBP: string
    }

    static PAYMENT_GROUP: {
      PRODUCT: string
      LISTING: string
      SUBSCRIPTION: string
    }

    static BASKET_ITEM_TYPE: {
      PHYSICAL: string
      VIRTUAL: string
    }

    checkoutFormInitialize: {
      create(
        request: PaymentRequest,
        callback: (err: any, result: any) => void
      ): void
    }

    checkoutForm: {
      retrieve(
        request: { locale?: string; conversationId?: string; token: string },
        callback: (err: any, result: any) => void
      ): void
    }
  }

  export = Iyzipay
}
