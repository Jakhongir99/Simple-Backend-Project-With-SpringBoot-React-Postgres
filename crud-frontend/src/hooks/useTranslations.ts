import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { notifications } from "@mantine/notifications";

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

  // Get translations for current language
  const { data: translations, isLoading: translationsLoading } = useQuery({
    queryKey: ["translations", i18n.language],
    queryFn: async () => {
      const response = await axios.get(
        `/api/translations/language/${i18n.language}/map`
      );
      return response.data;
    },
    enabled: !!i18n.language,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Get all translations (admin only)
  const { data: allTranslations, isLoading: allTranslationsLoading } = useQuery(
    {
      queryKey: ["all-translations"],
      queryFn: async () => {
        const response = await axios.get("/api/translations");
        return response.data;
      },
      enabled: false, // Only fetch when needed
    }
  );

  // Get available languages
  const { data: availableLanguages, isLoading: languagesLoading } = useQuery({
    queryKey: ["available-languages"],
    queryFn: async () => {
      const response = await axios.get("/api/translations/languages");
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Create translation
  const createTranslationMutation = useMutation({
    mutationFn: async (data: CreateTranslationRequest) => {
      const response = await axios.post("/api/translations", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["translations"] });
      queryClient.invalidateQueries({ queryKey: ["all-translations"] });
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

  // Update translation
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["translations"] });
      queryClient.invalidateQueries({ queryKey: ["all-translations"] });
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

  // Delete translation
  const deleteTranslationMutation = useMutation({
    mutationFn: async (id: number) => {
      await axios.delete(`/api/translations/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["translations"] });
      queryClient.invalidateQueries({ queryKey: ["all-translations"] });
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

  // Search translations
  const searchTranslations = async (keyword: string) => {
    try {
      const response = await axios.get(
        `/api/translations/search?keyword=${encodeURIComponent(keyword)}`
      );
      return response.data;
    } catch (error) {
      console.error("Error searching translations:", error);
      return [];
    }
  };

  // Enhanced translation function with fallback
  const translate = (key: string, fallback?: string, options?: any) => {
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
  };

  // Change language
  const changeLanguage = async (language: string) => {
    try {
      await i18n.changeLanguage(language);
      // Refresh translations for new language
      queryClient.invalidateQueries({ queryKey: ["translations", language] });
    } catch (error) {
      console.error("Error changing language:", error);
    }
  };

  return {
    // Translation functions
    t: translate,
    translate,

    // Language management
    currentLanguage: i18n.language,
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
  };
};
