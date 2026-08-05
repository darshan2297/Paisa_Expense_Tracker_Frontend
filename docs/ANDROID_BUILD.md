# Android standalone build (free, personal use)

Build a real Paisa APK with Expo EAS, install it on your phone (no Play Store,
no Apple fee). The APK talks to your production API on Render.

## One-time setup

### 1. Node 22 + tools

```bash
source ~/.nvm/nvm.sh && nvm use 22
cd frontend
npm install
npm install -g eas-cli   # or: npx eas-cli …
```

### 2. Expo account (free)

1. Create an account at https://expo.dev/signup
2. In the terminal:

```bash
eas login
eas init
```

`eas init` links this folder to an Expo project and **writes** `extra.eas.projectId`
(and usually `owner`) into `app.json`. Commit that change.

### 3. Android credentials (auto)

On the first build, EAS will ask to generate a keystore — choose **yes** / let
EAS manage it. Keep that Expo project; losing the keystore means you can’t
update the same installed app later.

### 4. Push notifications (optional but recommended)

Standalone Android push needs a free Firebase project:

1. https://console.firebase.google.com → create project → add an **Android** app  
   with package name `com.paisa.expense`
2. Download `google-services.json` (optional locally)
3. In Expo: https://expo.dev → your project → **Credentials** → Android →  
   upload **FCM V1** service account JSON  
   (Firebase → Project settings → Service accounts → Generate new private key)

Without FCM, the APK still runs; device push may fail until FCM is linked.
In-app notification bell still works via the API.

## Build production APK (cloud — not local)

This is **not** `npm start` / Metro / Expo Go. EAS builds a release APK on
Expo’s servers, with the **production Render API** baked in.

```bash
source ~/.nvm/nvm.sh && nvm use 22
cd frontend

# Production APK (default)
npm run build:android
# same as: eas build -p android --profile production
```

Wait for the cloud build (often 10–20 minutes). Then:

```bash
eas build:list
# or open the build URL printed in the terminal and Download
```

## Install on your phone

1. Copy the `.apk` to the phone (Download link, Drive, USB, etc.)
2. Open the file → allow **Install unknown apps** for that source
3. Install → open **Paisa**
4. Log in (your Render / production user)
5. Allow notifications when prompted
6. Confirm a real token in DB:

```sql
SELECT expo_push_token, device_label, created_at
FROM push_tokens
ORDER BY created_at DESC;
```

You should see something like `ExponentPushToken[…]` (not the local placeholder).

## Update the app later

Bump `android.versionCode` in `app.json` (1 → 2 → 3…), then rebuild:

```bash
npm run build:android
```

Install the new APK over the old one (same package + same keystore).

## Profiles (`eas.json`)

| Profile          | Output         | Use                                       |
| ---------------- | -------------- | ----------------------------------------- |
| **`production`** | **APK**        | **Default — personal production install** |
| `play-store`     | AAB            | Only if you later publish to Google Play  |
| `preview`        | APK            | Optional test channel                     |
| `development`    | Dev-client APK | Native debugging (not for daily use)      |

All release profiles bake in:

`EXPO_PUBLIC_API_URL=https://paisa-expense-tracker-backend.onrender.com/api/v1`

Change that in `eas.json` if your Render URL changes, then rebuild.

## Cost

| Item                         | Cost                                             |
| ---------------------------- | ------------------------------------------------ |
| Expo account + EAS free tier | Free (monthly build limits)                      |
| Sideload APK                 | Free                                             |
| Firebase FCM (Spark)         | Free                                             |
| Google Play publish          | $25 one-time — **not required** for personal use |
