
/**
 * BACKEND SAMPLE CODE: Google OAuth2 Token Exchange & Verification
 * 
 * This file demonstrates how to handle the "Authorization Code Flow" on a Node.js backend.
 * It uses the official `google-auth-library` to exchange the auth code for tokens 
 * and verify the ID token's integrity.
 * 
 * Requirements:
 * - npm install google-auth-library express body-parser cors
 */

const express = require('express');
const { OAuth2Client } = require('google-auth-library');
const app = express();
const cors = require('cors');

app.use(cors());
app.use(express.json());

// CONFIGURATION
// 1. Get these from Google Cloud Console > APIs & Services > Credentials
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'YOUR_CLIENT_ID.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || 'YOUR_CLIENT_SECRET';
const REDIRECT_URI = 'postmessage'; // 'postmessage' is required for the popup flow used by GIS

const oAuth2Client = new OAuth2Client(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  REDIRECT_URI
);

/**
 * Route: POST /api/auth/google
 * Purpose: Exchange Auth Code for Access/Refresh/ID Tokens
 */
app.post('/api/auth/google', async (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ error: 'Authorization code is required' });
  }

  try {
    // 1. Exchange the code for tokens
    const { tokens } = await oAuth2Client.getToken(code);
    
    // tokens contains: access_token, refresh_token, scope, token_type, id_token, expiry_date
    console.log('Tokens received:', tokens);

    // 2. Verify the ID Token (Critical Security Step)
    const ticket = await oAuth2Client.verifyIdToken({
      idToken: tokens.id_token,
      audience: GOOGLE_CLIENT_ID, 
    });
    
    const payload = ticket.getPayload();
    // payload contains: sub, email, name, picture, etc.
    console.log('User verified:', payload.email);

    // 3. (Optional) Create your own session/JWT for your app
    // const sessionToken = createMySession(payload);

    res.json({
      success: true,
      user: {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture
      },
      // WARNING: Don't send refresh_token to client if not needed. Store it securely on backend.
      accessToken: tokens.access_token 
    });

  } catch (error) {
    console.error('Error verifying Google code:', error);
    res.status(401).json({ error: 'Invalid token or code' });
  }
});

/**
 * Route: POST /api/auth/verify-token
 * Purpose: Verify an ID Token sent from the frontend (Implicit Flow / Credential Response)
 */
app.post('/api/auth/verify-token', async (req, res) => {
  const { idToken } = req.body;

  try {
    const ticket = await oAuth2Client.verifyIdToken({
      idToken: idToken,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    
    res.json({ valid: true, email: payload.email });
  } catch (error) {
    res.status(401).json({ valid: false, error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend sample running on port ${PORT}`);
});
