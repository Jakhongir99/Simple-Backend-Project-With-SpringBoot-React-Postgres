import React from "react";
import { useTranslations } from "../hooks/useTranslations";
import { Button, Group, Text, Paper } from "@mantine/core";

export const TranslationTest: React.FC = () => {
  const {
    currentLanguage,
    changeLanguage,
    supportedLanguages,
    translations,
    translationsLoading,
  } = useTranslations();

  const handleLanguageChange = (language: string) => {
    console.log(
      `[TranslationTest] User requested language change to: ${language}`
    );
    changeLanguage(language);
  };

  return (
    <Paper p="md" withBorder>
      <Text size="lg" fw={500} mb="md">
        Translation API Test Component
      </Text>

      <Text size="sm" mb="xs">
        Current Language: <strong>{currentLanguage}</strong>
      </Text>

      <Text size="sm" mb="xs">
        Translations Loaded: <strong>{translations ? "Yes" : "No"}</strong>
      </Text>

      <Text size="sm" mb="xs">
        Loading: <strong>{translationsLoading ? "Yes" : "No"}</strong>
      </Text>

      <Text size="sm" mb="md">
        Translation Keys:{" "}
        <strong>{translations ? Object.keys(translations).length : 0}</strong>
      </Text>

      <Group>
        {supportedLanguages.map((lang) => (
          <Button
            key={lang}
            variant={currentLanguage === lang ? "filled" : "outline"}
            onClick={() => handleLanguageChange(lang)}
            size="sm"
          >
            {lang.toUpperCase()}
          </Button>
        ))}
      </Group>

      <Text size="xs" c="dimmed" mt="md">
        Check console for API call logs. You should see:
        <br />
        • Only one API call per language per session
        <br />
        • Smart caching between i18next and React Query
        <br />• No duplicate API calls when switching languages
      </Text>
    </Paper>
  );
};
