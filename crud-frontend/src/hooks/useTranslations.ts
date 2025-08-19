import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { notifications } from "@mantine/notifications";
import { useMemo, useCallback, useEffect } from "react";
import { useLocation } from "react-router-dom";

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
  const currentLanguage = useMemo(() => {
    console.log(
      `[useTranslations] Current language changed to: ${i18n.language}`
    );
    return i18n.language;
  }, [i18n.language]);

  // Monitor language changes
  useEffect(() => {
    console.log(
      `[useTranslations] Language effect triggered: ${currentLanguage}`
    );
  }, [currentLanguage]);

  // Get translations for current language - with better caching
  const { data: translations, isLoading: translationsLoading } = useQuery({
    queryKey: ["translations", currentLanguage],
    queryFn: async () => {
      console.log(
        `[useTranslations] Fetching translations for language: ${currentLanguage}`
      );

      try {
        const response = await axios.get(
          `http://localhost:8080/api/translations/language/${currentLanguage}/map`
        );
        console.log(
          `[useTranslations] Translations fetched successfully for: ${currentLanguage}`,
          response.data
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
      } catch (error) {
        console.error(
          `[useTranslations] Error fetching translations for ${currentLanguage}:`,
          error
        );
        throw error;
      }
    },
    enabled: !!currentLanguage,
    staleTime: 5 * 60 * 1000, // 5 minutes - reduced to ensure fresh data
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false, // Prevent refetch on window focus
    refetchOnMount: true, // Always refetch when component mounts
  });

  // Get current location to conditionally enable queries
  const location = useLocation();
  const isTranslationsPage = location.pathname === "/translations";

  // Get grouped translations by key for table display - only when on translations page
  const {
    data: groupedTranslations,
    isLoading: groupedTranslationsLoading,
    error: groupedTranslationsError,
  } = useQuery({
    queryKey: ["grouped-translations"],
    queryFn: async () => {
      console.log(
        "🔤 [useTranslations] Fetching grouped translations from API"
      );
      try {
        const response = await axios.get(
          "http://localhost:8080/api/translations/grouped"
        );
        console.log(
          "🔤 [useTranslations] Grouped translations fetched:",
          response.data
        );
        return response.data;
      } catch (error) {
        console.error(
          "🔤 [useTranslations] Error fetching grouped translations:",
          error
        );
        throw error;
      }
    },
    enabled: isTranslationsPage, // Only fetch when on translations page
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
    refetchOnWindowFocus: false,
    retry: 2,
  });

  // Memoize the create translation mutation
  const createTranslationMutation = useMutation({
    mutationFn: async (data: CreateTranslationRequest) => {
      const response = await axios.post(
        "http://localhost:8080/api/translations",
        data
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      // Invalidate translation queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["grouped-translations"] });
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
      const response = await axios.put(
        `http://localhost:8080/api/translations/${id}`,
        data
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      // Invalidate translation queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["grouped-translations"] });
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
      await axios.delete(`http://localhost:8080/api/translations/${id}`);
    },
    onSuccess: () => {
      // Invalidate translation queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["grouped-translations"] });
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
        `http://localhost:8080/api/translations/search?keyword=${encodeURIComponent(
          keyword
        )}`
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

          // Always change the language first
          await i18n.changeLanguage(language);

          // Always invalidate the language-specific query to force a fresh API call
          queryClient.invalidateQueries({
            queryKey: ["translations", language],
          });

          // Also invalidate grouped translations to refresh the table (only if on translations page)
          if (location.pathname === "/translations") {
            queryClient.invalidateQueries({
              queryKey: ["grouped-translations"],
            });
          }

          console.log(
            `[useTranslations] Language changed successfully to ${language} and queries invalidated`
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
    [i18n, queryClient, location.pathname]
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
      supportedLanguages: ["en", "ru", "uz"],

      // Data
      translations,
      groupedTranslations,
      translationsLoading,
      groupedTranslationsLoading,
      groupedTranslationsError,

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
      translations,
      groupedTranslations,
      translationsLoading,
      groupedTranslationsLoading,
      groupedTranslationsError,
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
