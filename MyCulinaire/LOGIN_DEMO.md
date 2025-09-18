# MyCulinairee Login Demo

## Demo Credentials

### Existing User (Login)
- **Email:** test@example.com
- **Password:** password123

### New User (Registration)
You can create a new account using any email and password. The system will store it locally for the session.

## Features Implemented

1. **Login Page**: Beautiful, responsive login interface that appears when the app is first opened
2. **Registration**: Users can create new accounts with username, email, and password
3. **Authentication**: Secure login/logout functionality with session persistence
4. **Main App**: Only accessible after successful authentication
5. **Logout**: Available in the profile dropdown menu

## How to Test

1. Start the server: `npm start`
2. Open http://localhost:3001 in your browser
3. You'll see the login page first
4. Use the demo credentials above or create a new account
5. After login, you'll see the main MyCulinairee app
6. Click on your profile in the top-right corner to access the logout option

## Technical Details

- **Frontend**: Pure JavaScript with localStorage for session management
- **Backend**: Express.js server (optional - works with local fallback)
- **Security**: Basic password hashing (demo purposes only)
- **Responsive**: Works on desktop and mobile devices
- **Session**: Persists login state across browser refreshes

## Notes

- This is a demo implementation with basic security
- In production, use proper password hashing (bcrypt) and server-side authentication
- The app gracefully falls back to local authentication if the server is not available
