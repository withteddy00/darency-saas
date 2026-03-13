# Adding a New Locale to Darency SaaS

This guide explains how to add a new locale (language) to the application.

## Supported Locales

Currently supported:
- **French (fr)** - Default
- **Arabic (ar)** - RTL support

## Prerequisites

To add a new locale, you need:
1. A locale code (ISO 639-1, e.g., 'en', 'es', 'de')
2. Translation file with all keys

## Step-by-Step Guide

### Step 1: Create Translation File

Create a new folder and translation file:

```bash
mkdir -p lib/locales/{locale}/translation.json
```

Example for English (`en`):
```bash
mkdir -p lib/locales/en
```

### Step 2: Add Translations

Copy the French translation file as a template:
```bash
cp lib/locales/fr/translation.json lib/locales/en/translation.json
```

Then translate all values to the new language.

### Step 3: Update i18n Configuration

Edit `lib/i18n/config.ts`:

```typescript
export const i18n = {
  defaultLocale: 'fr',
  locales: ['fr', 'ar', 'en'] as const,  // Add your locale
  
  localeConfig: {
    fr: { /* existing */ },
    ar: { /* existing */ },
    en: {  // Add new locale config
      name: 'English',
      nativeName: 'English',
      direction: 'ltr',  // or 'rtl' for right-to-left languages
      currency: 'MAD',
      dateFormat: 'MM/DD/YYYY',
    },
  } as const,
}
```

### Step 4: Update Middleware

Edit `middleware.ts`:

```typescript
const locales = ['fr', 'ar', 'en']  // Add your locale

// Also update publicRoutes array:
const publicRoutes = ['/', '/fr', '/ar', '/en', '/fr/subscribe', ...]
```

### Step 5: Update Hook (if needed)

The hook dynamically loads translations, so no changes needed for the hook itself.

However, if you have type issues, update the hook in `hooks/use-translations.tsx`.

### Step 6: Verify Build

Run the build to check for errors:
```bash
npm run build
```

## File Structure

After adding a new locale, the structure should be:

```
lib/
├── i18n/
│   ├── config.ts        # Locale definitions
│   ├── dictionary.ts    # Translation loading
│   └── index.ts        # Exports
└── locales/
    ├── fr/
    │   └── translation.json
    ├── ar/
    │   └── translation.json
    └── en/              # New locale
        └── translation.json
```

## Translation Keys

The translation files use nested JSON structure:

```json
{
  "common": {
    "appName": "Darency",
    "save": "Save",
    "cancel": "Cancel"
  },
  "nav": {
    "dashboard": "Dashboard",
    "settings": "Settings"
  },
  "pages": {
    "dashboard": {
      "title": "Dashboard",
      "welcome": "Welcome"
    }
  }
}
```

Access in code: `t('common.save')` or `t('pages.dashboard.title')`

## RTL Support

For right-to-left languages (Arabic, Hebrew, etc.):

1. Set `direction: 'rtl'` in locale config
2. The TranslationProvider automatically sets:
   - `document.documentElement.dir = 'rtl'`
   - `document.documentElement.lang = locale`

## Common Issues

### Missing Translation Key
If a key is missing, the function returns the key itself.

### Type Errors
If you get TypeScript errors, update the locale array type:
```typescript
locales: ['fr', 'ar', 'en'] as const
```

## Best Practices

1. **Always provide fallback**: The hook handles missing keys gracefully
2. **Use consistent key naming**: Use dot notation for nesting
3. **Keep translations in sync**: When adding new keys, add to all locales
4. **Test RTL**: If adding RTL language, test all pages thoroughly

## Server-Side Rendering

For server components, import translations directly:

```typescript
import { getTranslations, getTranslation } from '@/lib/i18n'

// In your page/component:
const translations = getTranslations('fr')
const title = getTranslation('fr', 'pages.dashboard.title')
```

## Notes

- The default locale is `fr` (French)
- Translation files are loaded at build time for performance
- The system supports any number of locales
- No runtime locale switching overhead (static loading)
