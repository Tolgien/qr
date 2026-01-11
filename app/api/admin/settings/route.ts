import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Fetch settings from database
    const settingsResult = await query(`
      SELECT setting_key, setting_value 
      FROM system_settings 
      WHERE setting_key IN ('iyzico_api_key', 'iyzico_secret_key', 'iyzico_uri', 'openai_api_key', 'use_openai', 'openai_model', 'google_translate_api_key', 'use_google_translate', 'resend_api_key', 'resend_from_email', 'require_email_verification')
    `)

    const settings = {
      iyzicoApiKey: '',
      iyzicoSecretKey: '',
      iyzicoUri: 'https://sandbox-api.iyzipay.com',
      openAiApiKey: '',
      useOpenAI: false,
      openAiModel: 'gpt-4o-mini',
      googleTranslateApiKey: '',
      useGoogleTranslate: false,
      resendApiKey: '',
      resendFromEmail: '',
      requireEmailVerification: false
    }

    settingsResult.rows.forEach(row => {
      if (row.setting_key === 'iyzico_api_key') {
        settings.iyzicoApiKey = row.setting_value || ''
      } else if (row.setting_key === 'iyzico_secret_key') {
        settings.iyzicoSecretKey = row.setting_value || ''
      } else if (row.setting_key === 'iyzico_uri') {
        settings.iyzicoUri = row.setting_value || 'https://sandbox-api.iyzipay.com'
      } else if (row.setting_key === 'openai_api_key') {
        settings.openAiApiKey = row.setting_value || ''
      } else if (row.setting_key === 'use_openai') {
        settings.useOpenAI = row.setting_value === 'true' || row.setting_value === true
      } else if (row.setting_key === 'openai_model') {
        settings.openAiModel = row.setting_value || 'gpt-4o-mini'
      } else if (row.setting_key === 'google_translate_api_key') {
        settings.googleTranslateApiKey = row.setting_value || ''
      } else if (row.setting_key === 'use_google_translate') {
        settings.useGoogleTranslate = row.setting_value === 'true' || row.setting_value === true
      } else if (row.setting_key === 'resend_api_key') {
        settings.resendApiKey = row.setting_value || ''
      } else if (row.setting_key === 'resend_from_email') {
        settings.resendFromEmail = row.setting_value || ''
      } else if (row.setting_key === 'require_email_verification') {
        settings.requireEmailVerification = row.setting_value === 'true' || row.setting_value === true
      }
    })

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const body = await request.json();
    const { iyzicoApiKey, iyzicoSecretKey, iyzicoUri } = body;

    // Update or insert settings
    const settings = [
      { key: 'iyzico_api_key', value: iyzicoApiKey, description: 'Iyzico API Key' },
      { key: 'iyzico_secret_key', value: iyzicoSecretKey, description: 'Iyzico Secret Key' },
      { key: 'iyzico_uri', value: iyzicoUri, description: 'Iyzico API URL' },
      { key: 'openai_api_key', value: body.openAiApiKey || null, description: 'OpenAI API Key' },
      { key: 'use_openai', value: body.useOpenAI || false, description: 'Use OpenAI' },
      { key: 'openai_model', value: body.openAiModel || 'gpt-4o-mini', description: 'OpenAI Model' },
      { key: 'google_translate_api_key', value: body.googleTranslateApiKey || null, description: 'Google Translate API Key' },
      { key: 'use_google_translate', value: body.useGoogleTranslate || false, description: 'Use Google Translate' },
      { key: 'resend_api_key', value: body.resendApiKey || null, description: 'Resend API Key' },
      { key: 'resend_from_email', value: body.resendFromEmail || null, description: 'Resend From Email' },
      { key: 'require_email_verification', value: body.requireEmailVerification || false, description: 'E-posta doğrulama zorunluluğu' }
    ]

    for (const setting of settings) {
      await query(`
        INSERT INTO system_settings (setting_key, setting_value, description, updated_by)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (setting_key) 
        DO UPDATE SET setting_value = $2, description = $3, updated_at = CURRENT_TIMESTAMP, updated_by = $4
      `, [setting.key, setting.value, setting.description, payload.userId])
    }

    // Update environment variables at runtime
    process.env.IYZICO_API_KEY = iyzicoApiKey
    process.env.IYZICO_SECRET_KEY = iyzicoSecretKey
    process.env.IYZICO_URI = iyzicoUri
    process.env.OPENAI_API_KEY = body.openAiApiKey || null
    process.env.USE_OPENAI = String(body.useOpenAI || false)
    process.env.OPENAI_MODEL = body.openAiModel || 'gpt-4o-mini'
    process.env.GOOGLE_TRANSLATE_API_KEY = body.googleTranslateApiKey || null
    process.env.USE_GOOGLE_TRANSLATE = String(body.useGoogleTranslate || false)
    process.env.RESEND_API_KEY = body.resendApiKey || null
    process.env.RESEND_FROM_EMAIL = body.resendFromEmail || null
    process.env.REQUIRE_EMAIL_VERIFICATION = String(body.requireEmailVerification || false)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}