
import Iyzipay from 'iyzipay'
import { query } from './db'

let iyzicoInstance: any = null
let lastSettingsCheck = 0
const CACHE_DURATION = 60000 // 1 dakika

export const getIyzico = async () => {
  const now = Date.now()
  
  // Cache kontrolü - 1 dakikada bir yeniden kontrol et
  if (!iyzicoInstance || now - lastSettingsCheck > CACHE_DURATION) {
    try {
      // Veritabanından ayarları çek
      const settingsResult = await query(`
        SELECT setting_key, setting_value 
        FROM system_settings 
        WHERE setting_key IN ('iyzico_api_key', 'iyzico_secret_key', 'iyzico_uri')
      `)

      let apiKey = process.env.IYZICO_API_KEY || 'sandbox-YOUR_API_KEY'
      let secretKey = process.env.IYZICO_SECRET_KEY || 'sandbox-YOUR_SECRET_KEY'
      let uri = process.env.IYZICO_URI || 'https://sandbox-api.iyzipay.com'

      settingsResult.rows.forEach(row => {
        if (row.setting_key === 'iyzico_api_key' && row.setting_value) {
          apiKey = row.setting_value
        } else if (row.setting_key === 'iyzico_secret_key' && row.setting_value) {
          secretKey = row.setting_value
        } else if (row.setting_key === 'iyzico_uri' && row.setting_value) {
          uri = row.setting_value
        }
      })

      iyzicoInstance = new Iyzipay({
        apiKey,
        secretKey,
        uri
      })

      lastSettingsCheck = now
    } catch (error) {
      console.error('Error loading Iyzico settings from database:', error)
      // Fallback to env variables
      if (!iyzicoInstance) {
        iyzicoInstance = new Iyzipay({
          apiKey: process.env.IYZICO_API_KEY || 'sandbox-YOUR_API_KEY',
          secretKey: process.env.IYZICO_SECRET_KEY || 'sandbox-YOUR_SECRET_KEY',
          uri: process.env.IYZICO_URI || 'https://sandbox-api.iyzipay.com'
        })
      }
    }
  }
  
  return iyzicoInstance
}

export const createPaymentRequest = (
  price: string,
  paidPrice: string,
  basketId: string,
  buyer: {
    id: string
    name: string
    surname: string
    email: string
  },
  callbackUrl: string
) => {
  return {
    locale: Iyzipay.LOCALE.TR,
    conversationId: basketId,
    price,
    paidPrice,
    currency: Iyzipay.CURRENCY.TRY,
    basketId,
    paymentGroup: Iyzipay.PAYMENT_GROUP.SUBSCRIPTION,
    callbackUrl,
    enabledInstallments: [1],
    buyer: {
      id: buyer.id,
      name: buyer.name,
      surname: buyer.surname,
      gsmNumber: '+905350000000',
      email: buyer.email,
      identityNumber: '11111111111',
      registrationAddress: 'Türkiye',
      ip: '85.34.78.112',
      city: 'Istanbul',
      country: 'Turkey'
    },
    shippingAddress: {
      contactName: buyer.name + ' ' + buyer.surname,
      city: 'Istanbul',
      country: 'Turkey',
      address: 'Türkiye'
    },
    billingAddress: {
      contactName: buyer.name + ' ' + buyer.surname,
      city: 'Istanbul',
      country: 'Turkey',
      address: 'Türkiye'
    },
    basketItems: [
      {
        id: basketId,
        name: 'Membership Plan',
        category1: 'Subscription',
        itemType: Iyzipay.BASKET_ITEM_TYPE.VIRTUAL,
        price
      }
    ]
  }
}
