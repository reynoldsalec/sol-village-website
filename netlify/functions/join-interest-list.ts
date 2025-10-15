import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';

// Type declaration for multipart module
declare const multipart: {
  parse(body: string, boundary: string): Array<{
    name?: string;
    data: Buffer;
  }>;
};

// Import multipart with type assertion
const multipartParser = require('multipart') as typeof multipart;

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  reason?: string;
  message?: string;
  newsletter?: string;
  privacy: string;
}

interface TwentyPersonData {
  phones: {
    primaryPhoneNumber?: string;
    primaryPhoneCallingCode?: string;
    primaryPhoneCountryCode?: string;
    additionalPhones: any[];
  };
  xLink: {
    primaryLinkLabel: string;
    primaryLinkUrl: string;
    additionalLinks: any[];
  };
  linkedinLink: {
    primaryLinkLabel: string;
    primaryLinkUrl: string;
    additionalLinks: any[];
  };
  emails: {
    primaryEmail: string;
    additionalEmails: any;
  };
  name: {
    firstName: string;
    lastName: string;
  };
}

interface TwentyNoteData {
  body: string;
  personId: string;
}

async function createPersonInTwentyCRM(formData: FormData): Promise<{ success: boolean; personId?: string; error?: string }> {
  console.log('=== CREATING PERSON IN TWENTYCRM ===');
  const twentyApiKey = process.env.TWENTY_API_KEY;
  const twentyApiUrl = process.env.TWENTY_API_URL || 'https://api.twenty.com/rest';

  console.log('TwentyCRM API URL:', twentyApiUrl);
  console.log('API Key exists:', !!twentyApiKey);
  console.log('API Key length:', twentyApiKey?.length || 0);

  if (!twentyApiKey) {
    console.error('ERROR: TwentyCRM API key not configured');
    throw new Error('TwentyCRM API key not configured');
  }

  // Parse phone number if provided
  let phoneData = {
    primaryPhoneNumber: '',
    primaryPhoneCallingCode: '',
    primaryPhoneCountryCode: '',
    additionalPhones: []
  };

  if (formData.phone) {
    // Simple phone parsing - you might want to enhance this
    const phone = formData.phone.replace(/\D/g, ''); // Remove non-digits
    if (phone.length >= 10) {
      phoneData.primaryPhoneNumber = phone;
      phoneData.primaryPhoneCallingCode = '+1'; // Default to US
      phoneData.primaryPhoneCountryCode = 'US';
    }
  }

  const twentyPersonData: TwentyPersonData = {
    phones: phoneData,
    xLink: {
      primaryLinkLabel: '',
      primaryLinkUrl: '',
      additionalLinks: []
    },
    linkedinLink: {
      primaryLinkLabel: '',
      primaryLinkUrl: '',
      additionalLinks: []
    },
    emails: {
      primaryEmail: formData.email,
      additionalEmails: null
    },
    name: {
      firstName: formData.firstName,
      lastName: formData.lastName
    }
  };

  console.log('TwentyCRM Person Data:', JSON.stringify(twentyPersonData, null, 2));
  console.log('Making request to:', `${twentyApiUrl}/people`);

  try {
    const response = await fetch(`${twentyApiUrl}/people`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${twentyApiKey}`
      },
      body: JSON.stringify(twentyPersonData)
    });

    console.log('TwentyCRM API Response Status:', response.status);
    console.log('TwentyCRM API Response Headers:', JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('TwentyCRM API ERROR - Status:', response.status);
      console.error('TwentyCRM API ERROR - Response:', errorText);
      throw new Error(`TwentyCRM API error: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    console.log('TwentyCRM API SUCCESS - Response:', JSON.stringify(result, null, 2));
    console.log('Created person with ID:', result.id);
    
    return {
      success: true,
      personId: result.id
    };
  } catch (error) {
    console.error('ERROR creating person in TwentyCRM:');
    console.error('Error type:', typeof error);
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Full error:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

async function createNoteInTwentyCRM(personId: string, message: string, formData: FormData): Promise<{ success: boolean; noteId?: string; error?: string }> {
  const twentyApiKey = process.env.TWENTY_API_KEY;
  const twentyApiUrl = process.env.TWENTY_API_URL || 'https://api.twenty.com/rest';

  if (!twentyApiKey) {
    throw new Error('TwentyCRM API key not configured');
  }

  // Create a comprehensive note with all form information
  const noteBody = `Interest List Submission - ${new Date().toLocaleDateString()}

Contact Information:
- Name: ${formData.firstName} ${formData.lastName}
- Email: ${formData.email}
${formData.phone ? `- Phone: ${formData.phone}` : ''}

Interest Details:
${formData.reason ? `- Primary Interest: ${formData.reason}` : ''}
${formData.newsletter ? '- Subscribed to newsletter updates' : '- Did not subscribe to newsletter'}

Additional Information:
${message || 'No additional information provided'}

Source: Sol Village Website Interest List Form`;

  const twentyNoteData: TwentyNoteData = {
    body: noteBody,
    personId: personId
  };

  try {
    const response = await fetch(`${twentyApiUrl}/notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${twentyApiKey}`
      },
      body: JSON.stringify(twentyNoteData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('TwentyCRM Notes API error:', response.status, errorText);
      throw new Error(`TwentyCRM Notes API error: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    return {
      success: true,
      noteId: result.id
    };
  } catch (error) {
    console.error('Error creating note in TwentyCRM:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export const handler = async (event: HandlerEvent, context: HandlerContext) => {
  // Add comprehensive debugging
  console.log('=== FUNCTION INVOCATION START ===');
  console.log('HTTP Method:', event.httpMethod);
  console.log('Headers:', JSON.stringify(event.headers, null, 2));
  console.log('Body length:', event.body?.length || 0);
  console.log('Environment variables check:');
  console.log('- TWENTY_API_KEY exists:', !!process.env.TWENTY_API_KEY);
  console.log('- TWENTY_API_KEY length:', process.env.TWENTY_API_KEY?.length || 0);
  console.log('- TWENTY_API_URL:', process.env.TWENTY_API_URL || 'NOT SET');

  // Handle CORS preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({
        success: false,
        error: 'Method not allowed'
      })
    };
  }

  try {
    const contentType = event.headers['content-type'] || '';
    console.log('Content-Type:', contentType);
    console.log('Raw body:', event.body);
    
    let data: FormData;
    
    if (contentType.includes('application/json')) {
      console.log('Processing JSON data');
      // Handle JSON data
      const jsonData = JSON.parse(event.body || '{}');
      console.log('Parsed JSON data:', JSON.stringify(jsonData, null, 2));
      data = {
        firstName: jsonData.firstName,
        lastName: jsonData.lastName,
        email: jsonData.email,
        phone: jsonData.phone || undefined,
        reason: jsonData.reason || undefined,
        message: jsonData.message || undefined,
        newsletter: jsonData.newsletter || undefined,
        privacy: jsonData.privacy
      };
    } else if (contentType.includes('multipart/form-data')) {
      console.log('Processing multipart form data');
      // Handle multipart form data
      const boundary = contentType.split('boundary=')[1];
      if (!boundary) {
        throw new Error('No boundary found in multipart data');
      }
      
      const parts = multipartParser.parse(event.body || '', boundary);
      console.log('Multipart parts:', parts);
      
      const formFields: Record<string, string> = {};
      for (const part of parts) {
        if (part.name && part.data) {
          formFields[part.name] = part.data.toString();
        }
      }
      
      console.log('Parsed form fields:', formFields);
      
      data = {
        firstName: formFields.firstName || '',
        lastName: formFields.lastName || '',
        email: formFields.email || '',
        phone: formFields.phone || undefined,
        reason: formFields.reason || undefined,
        message: formFields.message || undefined,
        newsletter: formFields.newsletter || undefined,
        privacy: formFields.privacy || ''
      };
    } else {
      console.log('Processing URL-encoded form data');
      // Handle URL-encoded form data
      const formData = new URLSearchParams(event.body || '');
      console.log('Form data entries:', Array.from(formData.entries()));
      data = {
        firstName: formData.get('firstName') || '',
        lastName: formData.get('lastName') || '',
        email: formData.get('email') || '',
        phone: formData.get('phone') || undefined,
        reason: formData.get('reason') || undefined,
        message: formData.get('message') || undefined,
        newsletter: formData.get('newsletter') || undefined,
        privacy: formData.get('privacy') || ''
      };
    }
    
    console.log('Processed form data:', JSON.stringify(data, null, 2));

    // Validate required fields
    if (!data.firstName || !data.lastName || !data.email || !data.privacy) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: false,
          error: 'Missing required fields'
        })
      };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: false,
          error: 'Invalid email format'
        })
      };
    }

    // Create person in TwentyCRM
    console.log('=== CALLING TWENTYCRM PERSON CREATION ===');
    const twentyResult = await createPersonInTwentyCRM(data);
    console.log('TwentyCRM Person Creation Result:', JSON.stringify(twentyResult, null, 2));

    if (!twentyResult.success) {
      console.error('FAILED to create person in TwentyCRM:', twentyResult.error);
      // Still return success to user, but log the error
      // You might want to implement fallback storage or retry logic
    } else {
      console.log('SUCCESS: Person created in TwentyCRM with ID:', twentyResult.personId);
    }

    // Create note in TwentyCRM if person was created successfully and message exists
    let noteResult = null;
    if (twentyResult.success && twentyResult.personId && data.message) {
      console.log('=== CALLING TWENTYCRM NOTE CREATION ===');
      console.log('Person ID for note:', twentyResult.personId);
      console.log('Message for note:', data.message);
      
      noteResult = await createNoteInTwentyCRM(twentyResult.personId, data.message, data);
      console.log('TwentyCRM Note Creation Result:', JSON.stringify(noteResult, null, 2));
      
      if (!noteResult.success) {
        console.error('FAILED to create note in TwentyCRM:', noteResult.error);
        // Note: We don't fail the entire request if note creation fails
      } else {
        console.log('SUCCESS: Note created in TwentyCRM with ID:', noteResult.noteId);
      }
    } else {
      console.log('SKIPPING note creation - Person success:', twentyResult.success, 'Person ID:', twentyResult.personId, 'Message exists:', !!data.message);
    }

    // Log the form submission for debugging
    console.log('=== FINAL SUMMARY ===');
    console.log('Form submission received:', {
      name: `${data.firstName} ${data.lastName}`,
      email: data.email,
      phone: data.phone,
      reason: data.reason,
      twentyPersonId: twentyResult.personId,
      twentyNoteId: noteResult?.noteId
    });

    const responseBody = {
      success: true,
      message: 'Thank you for joining our interest list! We\'ll be in touch soon.',
      personId: twentyResult.personId,
      noteId: noteResult?.noteId
    };

    console.log('Returning response:', JSON.stringify(responseBody, null, 2));
    console.log('=== FUNCTION INVOCATION END ===');

    // Return success response
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(responseBody)
    };

  } catch (error) {
    console.error('Error processing form submission:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: false,
        error: 'An unexpected error occurred. Please try again later.'
      })
    };
  }
};
