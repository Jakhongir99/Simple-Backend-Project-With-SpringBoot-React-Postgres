import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import api from "../utils/api";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "en",
    debug: import.meta.env.DEV,

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
    supportedLngs: ["en", "ru", "uz"] as const,

    // Load translations from backend
    load: "all",
    partialBundledLanguages: true,
    resources: {
      en: { translation: {} },
      ru: { translation: {} },
      uz: { translation: {} },
    },

    // Cache
    cache: {
      enabled: true,
      expirationTime: 7 * 24 * 60 * 60 * 1000, // 7 days
    },

    // Enable immediate initialization
    initImmediate: true,

    // Enable missing key saving
    saveMissing: false,
    saveMissingTo: "all", // Save to all languages
    missingKeyHandler: async (lng, ns, key, fallbackValue) => {
      console.log(
        `Missing translation key: ${key} for language: ${lng}, fallback: ${fallbackValue}`
      );

      try {
        // Get current token for authentication
        const token = localStorage.getItem("token");
        console.log("🔑 Token check for missing key:", {
          hasToken: !!token,
          tokenLength: token?.length,
          tokenPreview: token ? `${token.substring(0, 20)}...` : "none",
        });

        if (!token) {
          console.warn(
            "No token available, cannot save missing translation key"
          );
          return fallbackValue || key;
        }

        // Create translation entries for all supported languages
        const supportedLanguages = ["en", "ru", "uz"] as const;
        const translations = supportedLanguages.map((lang) => ({
          translationKey: key,
          languageCode: lang,
          translationValue:
            lang === (lng as unknown as string) ? fallbackValue || key : key, // Use fallback for current lang, key for others
          isActive: true,
          description: `Auto-generated translation for key: ${key}`, // Add description to avoid validation issues
        }));

        // Filter out translations that might already exist to avoid constraint violations
        const newTranslations = translations.filter((translation) => {
          // For now, we'll try to create all translations and let the backend handle duplicates
          // The backend should now skip existing translations instead of throwing errors
          return true;
        });

        try {
          // Use bulk endpoint to create all translations at once
          console.log("🚀 Making bulk API call for missing key:", {
            url: "http://localhost:8080/api/translations/bulk",
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token?.substring(20)}...`,
            },
            data: newTranslations,
          });

          const response = await fetch(
            "http://localhost:8080/api/translations/bulk",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
              },
              body: JSON.stringify(newTranslations),
            }
          );

          if (response.ok) {
            const responseData = await response.json();
            console.log(
              `✅ Successfully processed translations for key: ${key}`,
              {
                translations: newTranslations,
                response: responseData,
                status: response.status,
              }
            );

            // Log different messages based on what actually happened
            if (responseData.created > 0) {
              console.log(
                `🆕 Created ${responseData.created} new translations for key: ${key}`
              );
            }
            if (responseData.skipped > 0) {
              console.log(
                `⏭️ Skipped ${responseData.skipped} existing translations for key: ${key}`
              );
            }
          } else {
            let responseData = null;
            try {
              responseData = await response.json();
            } catch {
              // If response is not JSON, try to get text
              responseData = await response.text();
            }

            console.error(
              `❌ Failed to create translations for key: ${key} - Status: ${response.status}`,
              {
                response: responseData,
                translations: newTranslations,
                responseHeaders: Object.fromEntries(response.headers.entries()),
                responseStatus: response.status,
                responseStatusText: response.statusText,
              }
            );

            // Log the exact request that failed for debugging
            console.error("🔍 Failed request details:", {
              url: "http://localhost:8080/api/translations/bulk",
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token?.substring(0, 20)}...`,
                Accept: "application/json",
              },
              body: JSON.stringify(translations, null, 2),
            });
          }
        } catch (error) {
          console.error(`Failed to create translations for key: ${key}`, error);
        }
      } catch (error) {
        console.error("Error saving missing translation key:", error);
      }

      return fallbackValue || key;
    },
  });

export default i18n;
