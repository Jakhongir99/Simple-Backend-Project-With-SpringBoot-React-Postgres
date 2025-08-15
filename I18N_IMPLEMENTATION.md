# Internationalization (i18n) Implementation

This document describes the implementation of a comprehensive internationalization system using `react-i18next` with database-driven translations.

## Overview

The system has been completely refactored to use `react-i18next` instead of hardcoded translations. All translation data is now stored in the database and served through REST API endpoints.

## Architecture

### Backend Components

#### 1. Translation Entity

- **Location**: `src/main/java/com/example/translation/entity/Translation.java`
- **Purpose**: JPA entity for storing translation data
- **Fields**:
  - `id`: Primary key
  - `translationKey`: Unique key for the translation (e.g., "nav.dashboard")
  - `languageCode`: Language code (e.g., "en", "ru", "uz")
  - `translationValue`: The actual translated text
  - `description`: Optional description for the translation
  - `isActive`: Whether the translation is active
  - `createdAt`, `updatedAt`: Timestamps

#### 2. Translation Service

- **Location**: `src/main/java/com/example/translation/service/TranslationService.java`
- **Purpose**: Business logic for translation operations
- **Key Methods**:
  - `getTranslationsMapForLanguage(String languageCode)`: Returns Map<key, value> for a language
  - `bulkCreateTranslations()`: Creates multiple translations at once
  - `searchTranslations()`: Searches translations by keyword

#### 3. Translation Controller

- **Location**: `src/main/java/com/example/translation/controller/TranslationController.java`
- **Purpose**: REST API endpoints for translation management
- **Key Endpoints**:
  - `GET /api/translations/language/{code}/map`: Get all translations for a language
  - `POST /api/translations`: Create new translation
  - `PUT /api/translations/{id}`: Update translation
  - `DELETE /api/translations/{id}`: Delete translation

#### 4. Database Migration

- **Location**: `src/main/resources/db/changelog/changes/008-create-translations-table.xml`
- **Purpose**: Creates the translations table with initial data
- **Features**:
  - Creates table with proper indexes
  - Adds unique constraint on (translation_key, language_code)
  - Inserts initial navigation translations for EN, RU, UZ

### Frontend Components

#### 1. i18n Configuration

- **Location**: `crud-frontend/src/i18n/index.ts`
- **Purpose**: Configures react-i18next with HTTP backend
- **Features**:
  - HTTP backend pointing to `/api/translations/language/{{lng}}/map`
  - Language detection from localStorage, navigator, HTML
  - Fallback to English
  - Caching enabled

#### 2. Custom Hook

- **Location**: `crud-frontend/src/hooks/useTranslations.ts`
- **Purpose**: Provides translation functionality with React Query integration
- **Features**:
  - Automatic translation fetching from backend
  - CRUD operations for translations
  - Language switching
  - Search functionality
  - Fallback handling

#### 3. Translation Management Component

- **Location**: `crud-frontend/src/components/TranslationManagement.tsx`
- **Purpose**: Admin interface for managing translations
- **Features**:
  - View all translations
  - Create new translations
  - Edit existing translations
  - Delete translations
  - Search translations
  - Language switching
  - Pagination

## Database Schema

```sql
CREATE TABLE translations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    translation_key VARCHAR(255) NOT NULL,
    language_code VARCHAR(5) NOT NULL,
    translation_value TEXT NOT NULL,
    description VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    UNIQUE KEY uk_translations_key_language (translation_key, language_code)
);

-- Indexes for performance
CREATE INDEX idx_translations_key_lang ON translations(translation_key, language_code);
CREATE INDEX idx_translations_language ON translations(language_code);
CREATE INDEX idx_translations_active ON translations(is_active);
```

## Usage Examples

### 1. Using Translations in Components

```tsx
import { useTranslations } from "../hooks/useTranslations";

const MyComponent = () => {
  const { t, currentLanguage, changeLanguage } = useTranslations();

  return (
    <div>
      <h1>{t("nav.dashboard")}</h1>
      <p>Current language: {currentLanguage}</p>
      <button onClick={() => changeLanguage("ru")}>Switch to Russian</button>
    </div>
  );
};
```

### 2. Adding New Translations

```tsx
import { useTranslations } from "../hooks/useTranslations";

const TranslationForm = () => {
  const { createTranslation } = useTranslations();

  const handleSubmit = () => {
    createTranslation({
      translationKey: "welcome.message",
      languageCode: "en",
      translationValue: "Welcome to our application!",
      description: "Welcome message shown on homepage",
    });
  };

  return <button onClick={handleSubmit}>Add Translation</button>;
};
```

### 3. Language Switching

```tsx
const LanguageSelector = () => {
  const { currentLanguage, changeLanguage, supportedLanguages } =
    useTranslations();

  return (
    <select
      value={currentLanguage}
      onChange={(e) => changeLanguage(e.target.value)}
    >
      {supportedLanguages.map((lang) => (
        <option key={lang} value={lang}>
          {lang.toUpperCase()}
        </option>
      ))}
    </select>
  );
};
```

## API Endpoints

### Public Endpoints (No Authentication Required)

- `GET /api/translations/language/{code}/map` - Get translations for a language
- `GET /api/translations/key/{key}/language/{code}` - Get specific translation

### Admin Endpoints (Requires ADMIN Role)

- `GET /api/translations` - Get all translations
- `POST /api/translations` - Create new translation
- `PUT /api/translations/{id}` - Update translation
- `DELETE /api/translations/{id}` - Delete translation
- `GET /api/translations/search?keyword={keyword}` - Search translations
- `POST /api/translations/bulk` - Bulk create translations

## Configuration

### Backend Configuration

- **Database**: PostgreSQL with Liquibase migrations
- **Security**: Spring Security with role-based access control
- **Validation**: Bean Validation for DTOs
- **Logging**: SLF4J with Lombok

### Frontend Configuration

- **Build Tool**: Vite with React plugin
- **State Management**: React Query for server state
- **UI Library**: Mantine UI components
- **HTTP Client**: Axios with proxy configuration

### Vite Proxy Configuration

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
```

## Data Initialization

The system automatically initializes with sample translations when it starts:

1. **Navigation Items**: Dashboard, Users, Departments, Jobs, Employees, Languages
2. **Common Actions**: Create, Edit, Delete
3. **Language Names**: English, Russian, Uzbek in all three languages

## Benefits of This Implementation

1. **Dynamic**: Translations can be updated without code changes
2. **Scalable**: Easy to add new languages and translation keys
3. **Maintainable**: Centralized translation management
4. **Performance**: Caching and efficient database queries
5. **Admin-Friendly**: Web interface for managing translations
6. **Fallback Support**: Graceful degradation when translations are missing
7. **Search**: Full-text search across translation keys and values

## Migration from Old System

The old `LanguageContext` has been replaced with:

1. **react-i18next**: For translation framework
2. **useTranslations hook**: For translation operations
3. **Database storage**: For translation data
4. **TranslationManagement component**: For admin interface

## Troubleshooting

### Common Issues

1. **Translations not loading**: Check if backend is running and accessible
2. **CORS errors**: Ensure backend has proper CORS configuration
3. **Authentication errors**: Verify user has ADMIN role for management operations
4. **Database connection**: Check PostgreSQL connection and Liquibase migrations

### Debug Mode

Enable debug mode in development:

```typescript
// i18n/index.ts
debug: process.env.NODE_ENV === "development";
```

This will show detailed logging of translation loading and fallback behavior.

## Future Enhancements

1. **Translation Versioning**: Track changes to translations over time
2. **Bulk Import/Export**: CSV/JSON import/export for translations
3. **Translation Memory**: Suggest similar translations
4. **Machine Translation**: Integration with translation services
5. **Audit Trail**: Track who made changes to translations
6. **Approval Workflow**: Require approval for translation changes
7. **Multi-tenant Support**: Separate translations per organization
