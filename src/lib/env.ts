export const env = {
  isDev: import.meta.env.DEV,
  isTest: import.meta.env.MODE === "test",
  appName: import.meta.env.VITE_APP_NAME,
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_ID,
  measurementId: import.meta.env.VITE_MEASUREMENT_ID,
  diaryImageModel: import.meta.env.VITE_DIARY_IMAGE_MODEL,
  diaryImageSize: import.meta.env.VITE_DIARY_IMAGE_SIZE,
  recaptchaEnterpriseSiteKey: import.meta.env
    .VITE_RECAPTCHA_ENTERPRISE_SITE_KEY,
};
