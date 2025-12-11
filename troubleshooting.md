
# Google Sign-In Troubleshooting Guide

If you are seeing "Access Blocked: Your app needs to be verified" or "Error 400: redirect_uri_mismatch", follow these steps.

## 1. Configure "Authorized JavaScript Origins" (Critical for Web)

For the "Continue with Google" button (Popup flow), the **Origin** is what matters, not the Redirect URI.

1.  Go to [Google Cloud Console > Credentials](https://console.cloud.google.com/apis/credentials).
2.  Click the **pencil icon** next to your Web Client ID.
3.  Under **Authorized JavaScript origins**, add **ALL** the URLs where your app runs:
    *   `http://localhost` (if running on port 80/default)
    *   `http://localhost:3000` (or your specific dev port)
    *   `https://your-production-app.com`
4.  **IMPORTANT**: Do **NOT** add a trailing slash (e.g., use `http://localhost:3000`, NOT `http://localhost:3000/`).
5.  Click **Save**. Changes can take 5-10 minutes to propagate.

## 2. Configure "Authorized Redirect URIs" (For Backend Flow)

If you are using the Backend flow (`initCodeClient`) or `ux_mode: 'redirect'`:
1.  Under **Authorized redirect URIs**, add your callback URL.
2.  For local testing with the popup flow + backend exchange, Google often expects `postmessage` as the redirect URI in some libraries, but usually, you just need the Origin set correctly for the popup to open.

## 3. "Access Blocked: App has not completed the Google verification process"

This happens if your app is in "Testing" mode and the user is not added to the test list.

1.  Go to [OAuth Consent Screen](https://console.cloud.google.com/apis/credentials/consent).
2.  Check **Publishing Status**. If it says **Testing**:
    *   Scroll down to **Test Users**.
    *   Click **+ Add Users**.
    *   Add the email address of the account you are trying to log in with.
3.  Alternatively, click **Publish App** to push to production (requires verification for sensitive scopes).

## 4. SHA-1 Fingerprint (Android/iOS only)

If you are using this code in a Capacitor/Cordova wrapper:
1.  You must create separate **Android** and **iOS** OAuth Client IDs.
2.  For **Android**: Run `keytool -list -v -keystore your_keystore.jks` to get the SHA-1 fingerprint and add it to the Android Client in GCP.

## 5. React Native Specifics

If moving this code to React Native:
1.  You cannot use the Web `gsi/client` directly.
2.  Use `@react-native-google-signin/google-signin`.
3.  Requires `offlineAccess: true` to get a code for backend exchange.
