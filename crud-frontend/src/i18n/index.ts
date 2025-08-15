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
    debug: process.env.NODE_ENV === "development",

    // HTTP Backend configuration
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
      checkWhitelist: true,
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
  });

export default i18n;
