# TwentyCRM Integration Setup

This project includes a backend integration with TwentyCRM to automatically create contacts from the "Join Our Interest List" form using Netlify Functions.

## Setup Instructions

### 1. Configure Environment Variables

#### For Local Development:
1. Copy the environment template:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your TwentyCRM credentials:
   ```
   TWENTY_API_KEY=your_actual_api_key_here
   TWENTY_API_URL=https://api.twenty.com/rest
   ```

#### For Netlify Deployment:
1. Go to your Netlify site dashboard
2. Navigate to Site settings → Environment variables
3. Add the following variables:
   - `TWENTY_API_KEY`: Your TwentyCRM API key
   - `TWENTY_API_URL`: `https://api.twenty.com/rest` (or your custom URL)

### 2. Get Your TwentyCRM API Key

1. Log into your TwentyCRM workspace
2. Go to Settings → API Keys
3. Create a new API key with appropriate permissions
4. Copy the Bearer token and use it as `TWENTY_API_KEY`

### 3. Deploy to Netlify

#### Option A: Deploy via Netlify CLI
1. Install Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```

2. Build and deploy:
   ```bash
   npm run build
   netlify deploy --prod --dir=dist
   ```

#### Option B: Deploy via Git Integration
1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables in Netlify dashboard
5. Deploy automatically on git push

### 4. Test the Integration

1. **Local Testing** (requires Netlify CLI):
   ```bash
   netlify dev
   ```

2. **Production Testing**:
   - Navigate to your deployed site's `/join` page
   - Fill out the form and submit
   - Check your TwentyCRM workspace to verify the contact was created

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

- **URL**: `/.netlify/functions/join-interest-list`
- **Method**: POST
- **Content-Type**: `application/x-www-form-urlencoded` or `application/json`
- **Platform**: Netlify Functions (Serverless)

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
   - **Local**: Make sure `.env` file exists and contains `TWENTY_API_KEY`
   - **Netlify**: Check that environment variables are set in Netlify dashboard
   - Restart the development server after adding environment variables

2. **"TwentyCRM API error: 401"**
   - Check that your API key is valid and has proper permissions
   - Ensure the API key hasn't expired

3. **"TwentyCRM API error: 404"**
   - Verify the `TWENTY_API_URL` is correct
   - Check that the `/people` endpoint exists in your TwentyCRM instance

4. **Form submission fails silently**
   - Check browser console for JavaScript errors
   - Check Netlify function logs in the dashboard
   - Ensure the API endpoint is accessible

5. **Netlify Function not found (404)**
   - Verify the function is in `netlify/functions/` directory
   - Check that the function file is named correctly
   - Ensure the build completed successfully

6. **CORS errors**
   - The function includes CORS headers, but check browser console
   - Verify the request is going to the correct endpoint

### Debugging

Enable debug logging by checking the browser console and Netlify function logs. The integration logs:
- Form submission details (without sensitive data)
- TwentyCRM API responses
- Error messages and stack traces

**To view Netlify function logs:**
1. Go to your Netlify site dashboard
2. Navigate to Functions tab
3. Click on the function name to view logs
4. Check both "Invocations" and "Logs" tabs

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
