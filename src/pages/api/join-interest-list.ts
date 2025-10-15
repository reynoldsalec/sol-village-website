import type { APIRoute } from 'astro';

export const prerender = false;

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
  const twentyApiKey = import.meta.env.TWENTY_API_KEY;
  const twentyApiUrl = import.meta.env.TWENTY_API_URL || 'https://api.twenty.com/rest';

  if (!twentyApiKey) {
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

  try {
    const response = await fetch(`${twentyApiUrl}/people`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${twentyApiKey}`
      },
      body: JSON.stringify(twentyPersonData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('TwentyCRM API error:', response.status, errorText);
      throw new Error(`TwentyCRM API error: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    return {
      success: true,
      personId: result.id
    };
  } catch (error) {
    console.error('Error creating person in TwentyCRM:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

async function createNoteInTwentyCRM(personId: string, message: string, formData: FormData): Promise<{ success: boolean; noteId?: string; error?: string }> {
  const twentyApiKey = import.meta.env.TWENTY_API_KEY;
  const twentyApiUrl = import.meta.env.TWENTY_API_URL || 'https://api.twenty.com/rest';

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

export const POST: APIRoute = async ({ request }) => {
  try {
    const contentType = request.headers.get('content-type') || '';
    
    let data: FormData;
    
    if (contentType.includes('application/json')) {
      // Handle JSON data
      const jsonData = await request.json();
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
    } else {
      // Handle form data
      const formData = await request.formData();
      data = {
        firstName: formData.get('firstName') as string,
        lastName: formData.get('lastName') as string,
        email: formData.get('email') as string,
        phone: formData.get('phone') as string || undefined,
        reason: formData.get('reason') as string || undefined,
        message: formData.get('message') as string || undefined,
        newsletter: formData.get('newsletter') as string || undefined,
        privacy: formData.get('privacy') as string
      };
    }

    // Validate required fields
    if (!data.firstName || !data.lastName || !data.email || !data.privacy) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing required fields'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid email format'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    // Create person in TwentyCRM
    const twentyResult = await createPersonInTwentyCRM(data);

    if (!twentyResult.success) {
      console.error('Failed to create person in TwentyCRM:', twentyResult.error);
      // Still return success to user, but log the error
      // You might want to implement fallback storage or retry logic
    }

    // Create note in TwentyCRM if person was created successfully and message exists
    let noteResult = null;
    if (twentyResult.success && twentyResult.personId && data.message) {
      noteResult = await createNoteInTwentyCRM(twentyResult.personId, data.message, data);
      
      if (!noteResult.success) {
        console.error('Failed to create note in TwentyCRM:', noteResult.error);
        // Note: We don't fail the entire request if note creation fails
      }
    }

    // Log the form submission for debugging
    console.log('Form submission received:', {
      name: `${data.firstName} ${data.lastName}`,
      email: data.email,
      phone: data.phone,
      reason: data.reason,
      twentyPersonId: twentyResult.personId,
      twentyNoteId: noteResult?.noteId
    });

    // Return success response
    return new Response(JSON.stringify({
      success: true,
      message: 'Thank you for joining our interest list! We\'ll be in touch soon.',
      personId: twentyResult.personId,
      noteId: noteResult?.noteId
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('Error processing form submission:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: 'An unexpected error occurred. Please try again later.'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};
