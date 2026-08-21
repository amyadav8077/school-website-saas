/**
 * Firebase web configuration.
 *
 * PLACEHOLDER VALUES — replace with your real Firebase project's web config
 * (Firebase console → Project settings → General → Your apps → SDK setup).
 * Until real values are in place, phone-OTP login/updates will not work and the
 * UI keeps username/password as the working default.
 *
 * Also enable Phone Authentication under Firebase console → Authentication →
 * Sign-in method, and add your domains (localhost, prod) to Authorized domains.
 */
export const firebaseConfig = {
  apiKey: 'REPLACE_WITH_FIREBASE_API_KEY',
  authDomain: 'REPLACE_WITH_PROJECT.firebaseapp.com',
  projectId: 'REPLACE_WITH_PROJECT_ID',
  storageBucket: 'REPLACE_WITH_PROJECT.appspot.com',
  messagingSenderId: 'REPLACE_WITH_SENDER_ID',
  appId: 'REPLACE_WITH_APP_ID'
};

/** True once the placeholders above have been replaced with real values. */
export const isFirebaseConfigured = (): boolean =>
  !Object.values(firebaseConfig).some((v) => typeof v === 'string' && v.startsWith('REPLACE_WITH'));
