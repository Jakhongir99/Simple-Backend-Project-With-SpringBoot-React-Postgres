# OAuth2 Authentication Setup

This document provides instructions on how to set up OAuth2 authentication with Google and GitHub for your Spring Boot application.

## Overview

The application now supports OAuth2 authentication with:

- Google OAuth2
- GitHub OAuth2

Users can authenticate using their Google or GitHub accounts, and the system will automatically create or link user accounts.

## Prerequisites

1. **Google OAuth2 Setup**

   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable the Google+ API
   - Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
   - Configure the OAuth consent screen
   - Set the authorized redirect URI to: `http://localhost:8080/api/auth/oauth2/google/callback`
   - Copy the Client ID and Client Secret

2. **GitHub OAuth2 Setup**
   - Go to [GitHub Developer Settings](https://github.com/settings/developers)
   - Click "New OAuth App"
   - Set the Authorization callback URL to: `http://localhost:8080/api/auth/oauth2/github/callback`
   - Copy the Client ID and Client Secret

## Configuration

### 1. Update application.properties

Replace the placeholder values in `src/main/resources/application.properties`:

```properties
# Google OAuth2
spring.security.oauth2.client.registration.google.client-id=YOUR_GOOGLE_CLIENT_ID
spring.security.oauth2.client.registration.google.client-secret=YOUR_GOOGLE_CLIENT_SECRET

# GitHub OAuth2
spring.security.oauth2.client.registration.github.client-id=YOUR_GITHUB_CLIENT_ID
spring.security.oauth2.client.registration.github.client-secret=YOUR_GITHUB_CLIENT_SECRET
```

### 2. Database Migration

The application includes a Liquibase migration that adds OAuth2-related fields to the users table:

- `oauth2_provider`: Stores the OAuth2 provider (e.g., "google", "github")
- `oauth2_provider_id`: Stores the provider-specific user ID
- `profile_picture`: Stores the user's profile picture URL
- `email_verified`: Indicates if the email is verified
- `password`: Made nullable for OAuth2 users

Run the application to automatically apply the migration.

## API Endpoints

### OAuth2 Authorization URLs

- **Google**: `GET /api/auth/oauth2/google/authorize`

  - Returns the Google OAuth2 authorization URL
  - Redirect users to this URL to start the authentication flow

- **GitHub**: `GET /api/auth/oauth2/github/authorize`
  - Returns the GitHub OAuth2 authorization URL
  - Redirect users to this URL to start the authentication flow

### OAuth2 Callbacks

- **Google**: `GET /api/auth/oauth2/google/callback?code={authorization_code}`

  - Processes the Google OAuth2 callback
  - Exchanges the authorization code for an access token
  - Retrieves user information and creates/updates the user account
  - Returns a JWT token for authentication

- **GitHub**: `GET /api/auth/oauth2/github/callback?code={authorization_code}`
  - Processes the GitHub OAuth2 callback
  - Exchanges the authorization code for an access token
  - Retrieves user information and creates/updates the user account
  - Returns a JWT token for authentication

## Authentication Flow

1. **User clicks "Login with Google" or "Login with GitHub"**
2. **User is redirected to the provider's authorization page**
3. **User authorizes the application**
4. **Provider redirects back to the callback URL with an authorization code**
5. **Application exchanges the code for an access token**
6. **Application retrieves user information using the access token**
7. **Application creates or updates the user account**
8. **Application generates and returns a JWT token**
9. **User is authenticated and can access protected resources**

## Frontend Integration

### Example React Component

```tsx
import React from "react";

const OAuth2Login: React.FC = () => {
  const handleGoogleLogin = async () => {
    try {
      const response = await fetch("/api/auth/oauth2/google/authorize");
      const data = await response.json();
      window.location.href = data.authorizationUrl;
    } catch (error) {
      console.error("Error getting Google authorization URL:", error);
    }
  };

  const handleGitHubLogin = async () => {
    try {
      const response = await fetch("/api/auth/oauth2/github/authorize");
      const data = await response.json();
      window.location.href = data.authorizationUrl;
    } catch (error) {
      console.error("Error getting GitHub authorization URL:", error);
    }
  };

  return (
    <div>
      <button onClick={handleGoogleLogin}>Login with Google</button>
      <button onClick={handleGitHubLogin}>Login with GitHub</button>
    </div>
  );
};

export default OAuth2Login;
```

### Handling the Callback

After successful OAuth2 authentication, the user will be redirected back to your application with a JWT token. You can:

1. **Store the token in localStorage or sessionStorage**
2. **Update the application state to reflect the user is logged in**
3. **Redirect the user to the dashboard or intended page**

## Security Considerations

1. **HTTPS in Production**: Always use HTTPS in production environments
2. **Client Secrets**: Never expose client secrets in client-side code
3. **Token Validation**: Always validate JWT tokens on the server side
4. **Scope Limitation**: Request only the necessary OAuth2 scopes
5. **User Consent**: Ensure users understand what data you're requesting

## Troubleshooting

### Common Issues

1. **"Invalid redirect URI" error**

   - Ensure the redirect URI in your OAuth2 app configuration matches exactly
   - Check for trailing slashes or protocol mismatches

2. **"Client ID not found" error**

   - Verify your client ID and client secret are correct
   - Ensure the OAuth2 app is properly configured

3. **"Authorization code expired" error**

   - Authorization codes expire quickly (usually within 10 minutes)
   - Implement proper error handling and redirect users to try again

4. **Database migration errors**
   - Check that Liquibase is properly configured
   - Verify the database connection and permissions

### Debug Endpoints

Use the debug endpoint to troubleshoot authentication issues:

- `GET /api/auth/debug-token` - Check if the JWT token is being sent correctly

## Production Deployment

1. **Update redirect URIs** to use your production domain
2. **Use environment variables** for sensitive configuration
3. **Enable HTTPS** for all OAuth2 endpoints
4. **Monitor OAuth2 usage** and implement rate limiting if needed
5. **Set up proper logging** for OAuth2 authentication events

## Support

If you encounter issues:

1. Check the application logs for detailed error messages
2. Verify your OAuth2 app configuration
3. Test with the debug endpoints
4. Ensure all dependencies are properly configured

## Additional Resources

- [Spring Security OAuth2 Reference](https://docs.spring.io/spring-security/reference/servlet/oauth2/index.html)
- [Google OAuth2 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [GitHub OAuth2 Documentation](https://docs.github.com/en/developers/apps/building-oauth-apps)
