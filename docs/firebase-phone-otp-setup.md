# Setting Up Firebase for Mobile OTP Login

## Why

Mobile (phone number) OTP is used in three places:

- **Admin login** — "📱 Sign in with mobile OTP" on the admin login screen.
- **Admin profile → Update Mobile Number** — verify a new number by OTP before saving.
- (The **email** update uses the in-app email OTP, not Firebase.)

Until Firebase is configured, these features stay disabled and the UI shows
**"Mobile based login is not yet supported!"**. Nothing else in the app is
affected — username/password login keeps working.

How it works: the **frontend** uses the Firebase JS SDK to send the SMS and
collect the code, producing a signed **ID token**. The **backend** verifies that
ID token with the Firebase **Admin SDK**, extracts the verified phone number,
matches it to an admin account, and issues the app's own JWT.

You need to configure **two** things:

1. **Frontend web config** → `school-website-frontend/src/app/shared/firebase/firebase.config.ts`
2. **Backend service account** → env vars read by `FirebaseConfig.java`

---

## Step 1 — Create a Firebase project

1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add project** (or reuse an existing Google Cloud project).
3. Enter a project name (e.g. `school-website-saas`), continue.
4. Google Analytics is optional — you can disable it.
5. Click **Create project** and wait until it's ready.

---

## Step 2 — Enable Phone Authentication

1. In the project, open **Build → Authentication**.
2. Click **Get started** (first time only).
3. Go to the **Sign-in method** tab.
4. Under **Native providers**, click **Phone** → toggle **Enable** → **Save**.

> Phone Auth sends real SMS and may incur cost / regional limits. For testing,
> add **test phone numbers** with fixed codes under
> **Authentication → Sign-in method → Phone → Phone numbers for testing**.
> (e.g. `+91 90000 00000` → code `123456` — no real SMS is sent.)

---

## Step 3 — Register a Web App and copy the web config

1. In **Project settings** (gear icon, top-left) → **General** tab.
2. Scroll to **Your apps** → click the **Web** icon (`</>`).
3. Give it a nickname (e.g. `school-web`), **do not** enable Hosting, click **Register app**.
4. Firebase shows a `firebaseConfig` object. Copy those values.

Paste them into `school-website-frontend/src/app/shared/firebase/firebase.config.ts`,
replacing the `REPLACE_WITH_...` placeholders:

```ts
export const firebaseConfig = {
  apiKey: 'AIza....',                       // apiKey
  authDomain: 'your-project.firebaseapp.com',
  projectId: 'your-project-id',
  storageBucket: 'your-project.appspot.com',
  messagingSenderId: '1234567890',
  appId: '1:1234567890:web:abcdef123456'
};
```

> The `isFirebaseConfigured()` helper in that file auto-detects real values —
> once the placeholders are gone, the "not yet supported" notice disappears and
> the OTP buttons become active. The web `apiKey` is **not** a secret; it only
> identifies the project. Real security comes from Authorized domains (Step 4)
> and backend token verification (Step 6).

---

## Step 4 — Authorize your domains

Firebase only allows OTP from domains you list.

1. **Authentication → Settings → Authorized domains**.
2. Ensure these are present (add if missing):
   - `localhost` (for local dev)
   - your production domain(s) (e.g. `your-app.vercel.app`, custom domains)

If a domain isn't listed, OTP requests from it are rejected by reCAPTCHA.

---

## Step 5 — Download a service account (for the backend)

1. **Project settings → Service accounts** tab.
2. Click **Generate new private key** → **Generate key**.
3. A JSON file downloads (e.g. `school-website-saas-firebase-adminsdk-xxxx.json`).

> ⚠️ **This file is a secret.** It grants admin access to your Firebase project.
> Do **not** commit it to git. Keep it outside the repo (or in an ignored path)
> and inject its location via an environment variable.

---

## Step 6 — Point the backend at the service account

The backend reads these properties (see `application.properties`), each backed by
an environment variable:

| Property | Env var | Value |
|---|---|---|
| `firebase.enabled` | `FIREBASE_ENABLED` | `true` |
| `firebase.service-account-path` | `FIREBASE_SERVICE_ACCOUNT_PATH` | absolute path to the JSON from Step 5 |
| `firebase.project-id` | `FIREBASE_PROJECT_ID` | your project id (optional) |

### Local development

```bash
export FIREBASE_ENABLED=true
export FIREBASE_SERVICE_ACCOUNT_PATH="/absolute/path/to/service-account.json"
export FIREBASE_PROJECT_ID="your-project-id"
```

The project's `bootRun` also auto-loads a gitignored `.env` file, so you can add
the same lines to `school-website-backend/.env` instead of exporting them.

### Production (e.g. Render)

Render/most hosts don't have a persistent filesystem for the JSON. Two options:

- **Secret file:** upload the JSON as a **Secret File** and set
  `FIREBASE_SERVICE_ACCOUNT_PATH` to its mounted path.
- **Env-based path:** write the JSON to disk at startup from a base64 secret,
  then point `FIREBASE_SERVICE_ACCOUNT_PATH` at it.

When `FIREBASE_ENABLED` is not `true`, `FirebaseConfig` is skipped entirely and
the app boots normally with phone login disabled — so it's safe to deploy before
Firebase is fully set up.

---

## Step 7 — Link admin accounts to phone numbers

Phone login matches the **verified** phone number against the `phone_number`
column on `admin_users`. For an admin to log in by mobile:

1. Sign in normally (username/password).
2. Go to **My Profile → Update Mobile Number**, complete the OTP flow to store
   the number. (Or set `admin_users.phone_number` directly for seeding.)

The backend match is tolerant of format: a verified `+919876543210` will match a
stored `9876543210` (it compares the trailing 10 national digits as a fallback).

---

## Step 8 — Verify

1. Restart the backend with the env vars set; confirm the log line:
   `Firebase Admin SDK initialized from <path>`.
2. Rebuild/serve the frontend after editing `firebase.config.ts`.
3. On the admin login, click **📱 Sign in with mobile OTP**:
   - Enter a registered mobile number → **Send OTP**.
   - Enter the SMS code (or the test code from Step 2) → **Verify & sign in**.
4. You should be logged into the admin console.

---

## Troubleshooting

| Symptom | Likely cause / fix |
|---|---|
| UI still says "Mobile based login is not yet supported!" | `firebase.config.ts` still has `REPLACE_WITH_...` placeholders. |
| `auth/invalid-app-credential` or reCAPTCHA errors | Domain not in **Authorized domains** (Step 4), or Phone provider not enabled. |
| No SMS received | Use a **test phone number** (Step 2), or check regional SMS limits / billing. |
| Backend: `Phone OTP login is not enabled on this server` | `FIREBASE_ENABLED` is not `true`, or the Admin SDK failed to init. |
| Backend fails to start with Firebase error | `FIREBASE_SERVICE_ACCOUNT_PATH` is wrong/unreadable, or the JSON is invalid. |
| Login says "No administrator account is registered with this mobile number" | The verified number isn't stored on any `admin_users.phone_number` (Step 7). |

---

## Security notes

- **Never commit** the service-account JSON. Add it to `.gitignore` if it must
  live near the repo.
- The web `apiKey` in `firebase.config.ts` is safe to ship in the frontend
  bundle — it is a public project identifier, not a credential.
- All trust comes from the backend verifying the Firebase **ID token** server-side;
  the frontend never issues its own session.
