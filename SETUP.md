# Google Drive Integration Setup

This application integrates with Google Drive to allow users to view and manage their files.

## Setup Instructions

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Drive API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Drive API"
   - Click "Enable"

### 2. Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Configure the OAuth consent screen if prompted
4. Choose "Web application" as the application type
5. Add authorized redirect URIs:
   - For local development: `http://localhost:3000/api/auth/google/callback`
   - For production: `https://yourdomain.com/api/auth/google/callback`
6. Copy the Client ID and Client Secret

### 3. Configure Environment Variables

Create a `.env.local` file in the root of your project and add:

\`\`\`env
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
\`\`\`

For production, update `NEXT_PUBLIC_APP_URL` to your actual domain.

### 4. Test the Integration

1. Start your development server: `npm run dev`
2. Navigate to Settings page
3. Click "Connect Google Drive"
4. Authorize the application
5. You should be redirected back with a success message

## Features

- **OAuth 2.0 Authentication**: Secure connection to Google Drive
- **View Files**: Browse your Google Drive files
- **Upload Files**: Upload files directly to Google Drive
- **File Management**: View file details, sizes, and modification dates

## Security Notes

- Access tokens are stored in HTTP-only cookies
- In production, consider using a database to store refresh tokens securely
- Always use HTTPS in production
- Keep your client secret secure and never commit it to version control
