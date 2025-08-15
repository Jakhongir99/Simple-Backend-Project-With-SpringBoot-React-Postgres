import React from "react";
import { Select, Tooltip } from "@mantine/core";
import { IconLanguage } from "@tabler/icons-react";
import { useLanguage, Language } from "../contexts/LanguageContext";

const languageOptions = [
  { value: "en", label: "🇺🇸 English" },
  { value: "ru", label: "🇷🇺 Русский" },
  { value: "uz", label: "🇺🇿 O'zbekcha" },
];

export const LanguageSelector: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();

  const handleLanguageChange = (value: string | null) => {
    if (value) {
      setLanguage(value as Language);
    }
  };

  return (
    <Tooltip label={t("language.english")}>
      <Select
        value={language}
        onChange={handleLanguageChange}
        data={languageOptions}
        leftSection={<IconLanguage size={16} />}
        size="sm"
        w={140}
        styles={{
          input: {
            cursor: "pointer",
          },
        }}
      />
    </Tooltip>
  );
};
