# TwentyCRM Integration Setup

This project includes a backend integration with TwentyCRM to automatically create contacts from the "Join Our Interest List" form.

## Setup Instructions

### 1. Configure Environment Variables

1. Copy the environment template:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your TwentyCRM credentials:
   ```
   TWENTY_API_KEY=your_actual_api_key_here
   TWENTY_API_URL=https://api.twenty.com/rest
   ```

### 2. Get Your TwentyCRM API Key

1. Log into your TwentyCRM workspace
2. Go to Settings → API Keys
3. Create a new API key with appropriate permissions
4. Copy the Bearer token and use it as `TWENTY_API_KEY`

### 3. Test the Integration

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to `/join` and fill out the form
3. Submit the form - it should create a new person in TwentyCRM
4. Check your TwentyCRM workspace to verify the contact was created

## How It Works

### Form Data Mapping

The form collects the following data and maps it to TwentyCRM:

| Form Field | TwentyCRM Field | Notes |
|------------|-----------------|-------|
| firstName | name.firstName | Required |
| lastName | name.lastName | Required |
| email | emails.primaryEmail | Required, validated |
| phone | phones.primaryPhoneNumber | Optional, parsed for US format |
| reason | Included in note | Interest selection |
| message | Included in note | Additional comments (creates note if provided) |
| newsletter | Included in note | Marketing preference |
| privacy | Not stored | Required agreement |

### Note Creation

When a user provides additional information in the "Tell us more about yourself" field, the system automatically creates a comprehensive note in TwentyCRM that includes:

- Contact information summary
- Interest details
- Newsletter subscription status
- The user's additional message
- Submission date and source

### API Endpoint

- **URL**: `/api/join-interest-list`
- **Method**: POST
- **Content-Type**: `application/x-www-form-urlencoded` or `application/json`

### Error Handling

- Form validation (required fields, email format)
- TwentyCRM API error handling for both person and note creation
- Graceful fallback if TwentyCRM is unavailable
- User-friendly error messages
- Note creation failure doesn't affect person creation success

### Security Features

- Input validation and sanitization
- Email format validation
- Required privacy agreement
- API key stored in environment variables

## Troubleshooting

### Common Issues

1. **"TwentyCRM API key not configured"**
   - Make sure `.env` file exists and contains `TWENTY_API_KEY`
   - Restart the development server after adding environment variables

2. **"TwentyCRM API error: 401"**
   - Check that your API key is valid and has proper permissions
   - Ensure the API key hasn't expired

3. **"TwentyCRM API error: 404"**
   - Verify the `TWENTY_API_URL` is correct
   - Check that the `/people` endpoint exists in your TwentyCRM instance

4. **Form submission fails silently**
   - Check browser console for JavaScript errors
   - Check server logs for API errors
   - Ensure the API endpoint is accessible

### Debugging

Enable debug logging by checking the browser console and server logs. The integration logs:
- Form submission details (without sensitive data)
- TwentyCRM API responses
- Error messages and stack traces

## Customization

### Adding More Fields

To add more fields to TwentyCRM:

1. Update the form in `src/pages/join.astro`
2. Update the `FormData` interface in `src/pages/api/join-interest-list.ts`
3. Map the new field to the appropriate TwentyCRM field in `createPersonInTwentyCRM()`

### Custom Field Mapping

The `createPersonInTwentyCRM()` function can be modified to:
- Parse phone numbers for different countries
- Add custom fields to TwentyCRM
- Store additional form data in custom fields
- Add tags or labels based on form responses

### Styling

Form message styles can be customized in the `<style>` section of `join.astro`:
- `.form-message.success` - Success message styling
- `.form-message.error` - Error message styling
