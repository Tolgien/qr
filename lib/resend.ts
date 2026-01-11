import { Resend } from 'resend';
import { query } from './db';

let connectionSettings: any;

async function getCredentialsFromDatabase() {
  try {
    // Check if admin has configured Resend API in system settings
    const settingsResult = await query(`
      SELECT setting_key, setting_value 
      FROM system_settings 
      WHERE setting_key IN ('resend_api_key', 'resend_from_email')
    `);

    const settings: { apiKey?: string; fromEmail?: string } = {};
    
    settingsResult.rows.forEach(row => {
      if (row.setting_key === 'resend_api_key' && row.setting_value) {
        settings.apiKey = row.setting_value;
      } else if (row.setting_key === 'resend_from_email' && row.setting_value) {
        settings.fromEmail = row.setting_value;
      }
    });

    // If API key is configured, return it (fromEmail is optional, will fallback)
    if (settings.apiKey) {
      return settings;
    }

    return null;
  } catch (error) {
    console.error('Error fetching Resend settings from database:', error);
    return null;
  }
}

async function getCredentialsFromReplitConnector() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=resend',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  if (!connectionSettings || (!connectionSettings.settings.api_key)) {
    throw new Error('Resend not connected');
  }
  return {apiKey: connectionSettings.settings.api_key, fromEmail: connectionSettings.settings.from_email};
}

async function getCredentials() {
  // First, try to get credentials from database (admin configured)
  const dbCredentials = await getCredentialsFromDatabase();
  if (dbCredentials && dbCredentials.apiKey) {
    console.log('Using Resend API key from database (admin configured)');
    
    // If fromEmail is not in database, try Replit connector as fallback
    if (!dbCredentials.fromEmail) {
      try {
        const connectorCreds = await getCredentialsFromReplitConnector();
        if (connectorCreds.fromEmail) {
          console.log('Using fromEmail from Replit connector as fallback');
          dbCredentials.fromEmail = connectorCreds.fromEmail;
        }
      } catch (error) {
        console.log('Replit connector not available, using default fromEmail');
      }
    }
    
    return dbCredentials;
  }

  // Fallback to Replit connector
  console.log('Using Resend credentials from Replit connector');
  return await getCredentialsFromReplitConnector();
}

export async function getUncachableResendClient() {
  const credentials = await getCredentials();
  
  // Priority: DB fromEmail > Connector fromEmail > Test email (onboarding@resend.dev)
  const fromEmail = credentials.fromEmail || 'onboarding@resend.dev';
  
  return {
    client: new Resend(credentials.apiKey),
    fromEmail: fromEmail
  };
}

export async function sendVerificationEmail(email: string, token: string, name: string) {
  try {
    const { client, fromEmail } = await getUncachableResendClient();
    
    const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/verify-email?token=${token}`;
    
    const { data, error } = await client.emails.send({
      from: fromEmail,
      to: email,
      subject: 'E-posta Adresinizi Doğrulayın',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Hoş Geldiniz!</h1>
              </div>
              <div class="content">
                <p>Merhaba ${name},</p>
                <p>Hesabınızı oluşturduğunuz için teşekkür ederiz. E-posta adresinizi doğrulamak için aşağıdaki butona tıklayın:</p>
                <div style="text-align: center;">
                  <a href="${verificationUrl}" class="button">E-postamı Doğrula</a>
                </div>
                <p style="margin-top: 20px; font-size: 14px; color: #666;">
                  Veya aşağıdaki linki kopyalayıp tarayıcınıza yapıştırabilirsiniz:<br>
                  <span style="word-break: break-all;">${verificationUrl}</span>
                </p>
                <p style="margin-top: 20px; font-size: 12px; color: #999;">
                  Bu doğrulama linki 24 saat geçerlidir. Eğer bu hesabı siz oluşturmadıysanız, bu e-postayı görmezden gelebilirsiniz.
                </p>
              </div>
              <div class="footer">
                <p>Bu e-posta otomatik olarak gönderilmiştir. Lütfen yanıtlamayın.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error('Resend email error:', error);
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    console.error('Failed to send verification email:', error);
    throw error;
  }
}
