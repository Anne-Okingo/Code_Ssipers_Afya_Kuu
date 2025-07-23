import { NextRequest, NextResponse } from 'next/server';

// SMS API Configuration for Africa's Talking
const SMS_CONFIG = {
  apiKey: process.env.AFRICASTALKING_API_KEY || 'demo_key',
  username: process.env.AFRICASTALKING_USERNAME || 'sandbox',
  baseUrl: process.env.NODE_ENV === 'production' 
    ? 'https://api.africastalking.com/version1/messaging'
    : 'https://api.sandbox.africastalking.com/version1/messaging'
};

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, message, from } = await request.json();

    // Validate input
    if (!phoneNumber || !message) {
      return NextResponse.json(
        { error: 'Phone number and message are required' },
        { status: 400 }
      );
    }

    // Format phone number for Kenya (+254)
    const formattedPhone = formatKenyanPhoneNumber(phoneNumber);
    
    if (!formattedPhone) {
      return NextResponse.json(
        { error: 'Invalid Kenyan phone number format' },
        { status: 400 }
      );
    }

    // For demo purposes, we'll simulate SMS sending
    // In production, uncomment the actual API call below
    
    /*
    // Actual Africa's Talking API call
    const response = await fetch(SMS_CONFIG.baseUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
        'apiKey': SMS_CONFIG.apiKey
      },
      body: new URLSearchParams({
        username: SMS_CONFIG.username,
        to: formattedPhone,
        message: message,
        from: from || 'AFYA_KUU'
      })
    });

    const result = await response.json();
    
    if (response.ok && result.SMSMessageData.Recipients[0].status === 'Success') {
      return NextResponse.json({
        success: true,
        messageId: result.SMSMessageData.Recipients[0].messageId,
        cost: result.SMSMessageData.Recipients[0].cost
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to send SMS', details: result },
        { status: 500 }
      );
    }
    */

    // Demo simulation - always return success
    console.log(`📱 SMS Demo: Sending to ${formattedPhone}`);
    console.log(`📄 Message: ${message}`);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return NextResponse.json({
      success: true,
      messageId: `demo_${Date.now()}`,
      cost: 'KES 2.00',
      demo: true,
      sentTo: formattedPhone,
      message: message
    });

  } catch (error) {
    console.error('SMS API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Format Kenyan phone numbers to international format
function formatKenyanPhoneNumber(phone: string): string | null {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Handle different Kenyan phone number formats
  if (cleaned.startsWith('254')) {
    // Already in international format
    return `+${cleaned}`;
  } else if (cleaned.startsWith('0') && cleaned.length === 10) {
    // Local format (0712345678) -> +254712345678
    return `+254${cleaned.substring(1)}`;
  } else if (cleaned.length === 9) {
    // Without leading zero (712345678) -> +254712345678
    return `+254${cleaned}`;
  }
  
  return null; // Invalid format
}

// Validate Kenyan mobile number prefixes
function isValidKenyanMobile(phone: string): boolean {
  const kenyanPrefixes = ['701', '702', '703', '704', '705', '706', '707', '708', '709', 
                         '710', '711', '712', '713', '714', '715', '716', '717', '718', '719',
                         '720', '721', '722', '723', '724', '725', '726', '727', '728', '729',
                         '730', '731', '732', '733', '734', '735', '736', '737', '738', '739',
                         '740', '741', '742', '743', '744', '745', '746', '747', '748', '749',
                         '750', '751', '752', '753', '754', '755', '756', '757', '758', '759',
                         '760', '761', '762', '763', '764', '765', '766', '767', '768', '769',
                         '770', '771', '772', '773', '774', '775', '776', '777', '778', '779',
                         '780', '781', '782', '783', '784', '785', '786', '787', '788', '789',
                         '790', '791', '792', '793', '794', '795', '796', '797', '798', '799'];
  
  const cleaned = phone.replace(/\D/g, '');
  const prefix = cleaned.startsWith('254') ? cleaned.substring(3, 6) : cleaned.substring(1, 4);
  
  return kenyanPrefixes.includes(prefix);
}
