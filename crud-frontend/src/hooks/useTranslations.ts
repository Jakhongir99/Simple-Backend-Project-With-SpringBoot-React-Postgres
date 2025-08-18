import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { notifications } from "@mantine/notifications";
import { useMemo, useCallback } from "react";

// Types for translation data
export interface Translation {
  id: number;
  translationKey: string;
  languageCode: string;
  translationValue: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTranslationRequest {
  translationKey: string;
  languageCode: string;
  translationValue: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateTranslationRequest {
  translationKey?: string;
  languageCode?: string;
  translationValue?: string;
  description?: string;
  isActive?: boolean;
}

// Custom hook for translations
export const useTranslations = () => {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();

  // Memoize the current language to prevent unnecessary re-renders
  const currentLanguage = useMemo(() => i18n.language, [i18n.language]);

  // Get translations for current language - with better caching
  const { data: translations, isLoading: translationsLoading } = useQuery({
    queryKey: ["translations", currentLanguage],
    queryFn: async () => {
      // Check if i18next already has the translations loaded
      if (i18n.hasResourceBundle(currentLanguage, "translation")) {
        console.log(
          `[useTranslations] Language ${currentLanguage} already loaded in i18next, using cached data`
        );
        return i18n.getResourceBundle(currentLanguage, "translation");
      }

      console.log(
        `[useTranslations] Fetching translations for language: ${currentLanguage}`
      );
      const response = await axios.get(
        `/api/translations/language/${currentLanguage}/map`
      );
      console.log(
        `[useTranslations] Translations fetched successfully for: ${currentLanguage}`
      );

      // Also add the translations to i18next to prevent duplicate API calls
      i18n.addResourceBundle(
        currentLanguage,
        "translation",
        response.data,
        true,
        true
      );

      return response.data;
    },
    enabled: !!currentLanguage,
    staleTime: 10 * 60 * 1000, // 10 minutes - increased from 5
    gcTime: 30 * 60 * 1000, // 30 minutes - increased from 10
    refetchOnWindowFocus: false, // Prevent refetch on window focus
    refetchOnMount: false, // Only refetch if data is stale
  });

  // Get all translations (admin only) - with better caching
  const { data: allTranslations, isLoading: allTranslationsLoading } = useQuery(
    {
      queryKey: ["all-translations"],
      queryFn: async () => {
        const response = await axios.get("/api/translations");
        return response.data;
      },
      enabled: false, // Only fetch when needed
      staleTime: 15 * 60 * 1000, // 15 minutes
      gcTime: 60 * 60 * 1000, // 1 hour
    }
  );

  // Get available languages - with better caching
  const { data: availableLanguages, isLoading: languagesLoading } = useQuery({
    queryKey: ["available-languages"],
    queryFn: async () => {
      const response = await axios.get("/api/translations/languages");
      return response.data;
    },
    staleTime: 30 * 60 * 1000, // 30 minutes - increased from 10
    gcTime: 60 * 60 * 1000, // 1 hour
    refetchOnWindowFocus: false,
  });

  // Memoize the create translation mutation
  const createTranslationMutation = useMutation({
    mutationFn: async (data: CreateTranslationRequest) => {
      const response = await axios.post("/api/translations", data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      // Only invalidate specific queries, not all translations
      queryClient.invalidateQueries({ queryKey: ["all-translations"] });
      // Invalidate the specific language translations
      queryClient.invalidateQueries({
        queryKey: ["translations", variables.languageCode],
      });
      notifications.show({
        title: "Success",
        message: "Translation created successfully",
        color: "green",
      });
    },
    onError: (error: any) => {
      notifications.show({
        title: "Error",
        message:
          error.response?.data?.message || "Failed to create translation",
        color: "red",
      });
    },
  });

  // Memoize the update translation mutation
  const updateTranslationMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: UpdateTranslationRequest;
    }) => {
      const response = await axios.put(`/api/translations/${id}`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      // Only invalidate specific queries
      queryClient.invalidateQueries({ queryKey: ["all-translations"] });
      // Invalidate the specific language translations if language changed
      if (variables.data.languageCode) {
        queryClient.invalidateQueries({
          queryKey: ["translations", variables.data.languageCode],
        });
      }
      notifications.show({
        title: "Success",
        message: "Translation updated successfully",
        color: "green",
      });
    },
    onError: (error: any) => {
      notifications.show({
        title: "Error",
        message:
          error.response?.data?.message || "Failed to update translation",
        color: "red",
      });
    },
  });

  // Memoize the delete translation mutation
  const deleteTranslationMutation = useMutation({
    mutationFn: async (id: number) => {
      await axios.delete(`/api/translations/${id}`);
    },
    onSuccess: () => {
      // Only invalidate specific queries
      queryClient.invalidateQueries({ queryKey: ["all-translations"] });
      // Invalidate current language translations
      queryClient.invalidateQueries({
        queryKey: ["translations", currentLanguage],
      });
      notifications.show({
        title: "Success",
        message: "Translation deleted successfully",
        color: "green",
      });
    },
    onError: (error: any) => {
      notifications.show({
        title: "Error",
        message:
          error.response?.data?.message || "Failed to delete translation",
        color: "red",
      });
    },
  });

  // Memoize the search translations function
  const searchTranslations = useCallback(async (keyword: string) => {
    try {
      const response = await axios.get(
        `/api/translations/search?keyword=${encodeURIComponent(keyword)}`
      );
      return response.data;
    } catch (error) {
      console.error("Error searching translations:", error);
      return [];
    }
  }, []);

  // Enhanced translation function with fallback - memoized
  const translate = useCallback(
    (key: string, fallback?: string, options?: any) => {
      // First try to get from i18next
      const translation = t(key, options);

      // If translation is the same as key, it means no translation found
      if (translation === key && translations && translations[key]) {
        return translations[key];
      }

      // If still no translation, return fallback or key
      if (translation === key) {
        return fallback || key;
      }

      return translation;
    },
    [t, translations]
  );

  // Change language - optimized to prevent unnecessary invalidations
  const changeLanguage = useCallback(
    async (language: string) => {
      try {
        // Only change language if it's different
        if (i18n.language !== language) {
          console.log(
            `[useTranslations] Changing language from ${i18n.language} to ${language}`
          );

          // Check if the new language is already loaded in i18next
          if (i18n.hasResourceBundle(language, "translation")) {
            console.log(
              `[useTranslations] Language ${language} already loaded in i18next, no API call needed`
            );
            await i18n.changeLanguage(language);
            // No need to invalidate queries since data is already available
            return;
          }

          // Language not loaded, change it and let i18next handle the loading
          await i18n.changeLanguage(language);
          // Only invalidate the specific language query if we need to fetch it
          queryClient.invalidateQueries({
            queryKey: ["translations", language],
          });
          console.log(
            `[useTranslations] Language changed successfully to ${language}`
          );
        } else {
          console.log(
            `[useTranslations] Language already set to ${language}, skipping change`
          );
        }
      } catch (error) {
        console.error("Error changing language:", error);
      }
    },
    [i18n, queryClient]
  );

  // Memoize the return value to prevent unnecessary re-renders
  const result = useMemo(
    () => ({
      // Translation functions
      t: translate,
      translate,

      // Language management
      currentLanguage,
      changeLanguage,
      supportedLanguages: availableLanguages || ["en", "ru", "uz"],

      // Data
      translations,
      allTranslations,
      translationsLoading,
      allTranslationsLoading,
      availableLanguages,
      languagesLoading,

      // Mutations
      createTranslation: createTranslationMutation.mutate,
      updateTranslation: updateTranslationMutation.mutate,
      deleteTranslation: deleteTranslationMutation.mutate,

      // Search
      searchTranslations,

      // Status
      isCreating: createTranslationMutation.isPending,
      isUpdating: updateTranslationMutation.isPending,
      isDeleting: deleteTranslationMutation.isPending,
    }),
    [
      translate,
      currentLanguage,
      changeLanguage,
      availableLanguages,
      translations,
      allTranslations,
      translationsLoading,
      allTranslationsLoading,
      languagesLoading,
      createTranslationMutation.mutate,
      updateTranslationMutation.mutate,
      deleteTranslationMutation.mutate,
      searchTranslations,
      createTranslationMutation.isPending,
      updateTranslationMutation.isPending,
      deleteTranslationMutation.isPending,
    ]
  );

  return result;
};
