import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID || '';
const authToken = process.env.TWILIO_AUTH_TOKEN || '';
export const twilioWhatsAppNumber = process.env.TWILIO_WHATSAPP_NUMBER || '';
export const adminWhatsAppNumber = process.env.ADMIN_WHATSAPP_NUMBER || '';

const client = accountSid && accountSid.startsWith('AC') && authToken ? twilio(accountSid, authToken) : null;

export const sendWhatsAppMessage = async (to: string, message: string) => {
  if (!client) {
    console.warn('Twilio client not initialized. Missing TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN.');
    return { success: false, error: 'Twilio not configured' };
  }

  try {
    // Format number to add +91 if it's 10 digits without country code
    let cleanNumber = to.replace(/\s+/g, '');
    if (/^\d{10}$/.test(cleanNumber)) {
      cleanNumber = `+91${cleanNumber}`;
    }
    const toFormatted = cleanNumber.startsWith('whatsapp:') ? cleanNumber : `whatsapp:${cleanNumber}`;
    const fromFormatted = twilioWhatsAppNumber.startsWith('whatsapp:') 
      ? twilioWhatsAppNumber 
      : `whatsapp:${twilioWhatsAppNumber}`;

    const response = await client.messages.create({
      body: message,
      from: fromFormatted,
      to: toFormatted,
    });

    return { success: true, messageId: response.sid, status: response.status };
  } catch (error) {
    console.error('Error sending WhatsApp message via Twilio:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};
