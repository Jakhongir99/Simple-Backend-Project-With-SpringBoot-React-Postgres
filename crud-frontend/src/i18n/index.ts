import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import HttpBackend from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";

i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "en",
    debug: import.meta.env.DEV,

    // HTTP Backend configuration - OPTIMIZED to prevent duplicate API calls
    // We'll use both i18next and React Query, but with better coordination
    backend: {
      loadPath: "/api/translations/language/{{lng}}/map",
      addPath: "/api/translations",
      parse: (data: string) => {
        try {
          return JSON.parse(data);
        } catch (e) {
          return {};
        }
      },
      parsePayload: (namespace: string, key: string, fallbackValue: string) => {
        return {
          translationKey: key,
          languageCode: i18n.language,
          translationValue: fallbackValue,
          description: `Auto-generated translation for ${key}`,
        };
      },
      reloadInterval: false,
      crossDomain: false,
      withCredentials: false,
      requestOptions: {
        mode: "cors",
        credentials: "same-origin",
        cache: "default",
      },
      // OPTIMIZE: Only load when language actually changes
      load: (
        languages: string[],
        namespaces: string[],
        options: any,
        callback: (error: Error | null, data: any) => void
      ) => {
        // Check if we already have this language loaded
        if (i18n.hasResourceBundle(languages[0], namespaces[0])) {
          console.log(
            `[i18n] Language ${languages[0]} already loaded, skipping API call`
          );
          callback(null, i18n.getResourceBundle(languages[0], namespaces[0]));
          return;
        }

        // Only make API call if language is not already loaded
        console.log(`[i18n] Loading language ${languages[0]} from API`);
        const xhr = new XMLHttpRequest();
        xhr.open("GET", `/api/translations/language/${languages[0]}/map`, true);
        xhr.onload = function () {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const data = JSON.parse(xhr.responseText);
              callback(null, data);
            } catch (e) {
              callback(e as Error, null);
            }
          } else {
            callback(new Error("Failed to load translations"), null);
          }
        };
        xhr.onerror = function () {
          callback(new Error("Network error"), null);
        };
        xhr.send();
      },
    },

    // Language detection
    detection: {
      order: ["localStorage", "navigator", "htmlTag"],
      caches: ["localStorage"],
      lookupLocalStorage: "i18nextLng",
      lookupQuerystring: "lng",
      lookupCookie: "i18next",
      lookupSessionStorage: "i18nextLng",
      lookupFromPathIndex: 0,
      lookupFromSubdomainIndex: 0,
    },

    // Interpolation
    interpolation: {
      escapeValue: false,
    },

    // React i18next
    react: {
      useSuspense: false,
    },

    // Default namespaces
    ns: ["translation"],
    defaultNS: "translation",

    // Supported languages
    supportedLngs: ["en", "ru", "uz"],

    // Load resources on demand
    load: "languageOnly",

    // Cache
    cache: {
      enabled: true,
      expirationTime: 7 * 24 * 60 * 60 * 1000, // 7 days
    },

    // Prevent unnecessary reloads
    initImmediate: false,
    partialBundledLanguages: true,
    resources: {
      en: {},
      ru: {},
      uz: {},
    },

    // Additional optimizations
    saveMissing: false, // Don't save missing keys to avoid unnecessary API calls
    missingKeyHandler: (lng, ns, key, fallbackValue) => {
      // Just return the key if no translation found, don't make API calls
      return key;
    },
  });

export default i18n;
