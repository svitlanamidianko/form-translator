# Form Translator

A Google Translate-style web application for translating between different form types. Built with Next.js, TypeScript, and Tailwind CSS.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Architecture

This project follows a modular component-based architecture with clear separation of concerns:

### 📁 Core Components (`src/components/`)

| Component | Purpose | Key Props |
|-----------|---------|-----------|
| **`Header.tsx`** | App header with logo and title | `title?: string` |
| **`ContentTabs.tsx`** | Tab navigation (text/images/websites) | `activeTab?: string`, `onTabChange?: (tabId: string) => void` |
| **`TranslationPanel.tsx`** | Reusable input/output panel | `type: 'input' \| 'output'`, `value: string`, `selectedForm: string` |
| **`DropdownSelector.tsx`** | Google Translate-style language selector | `value: string`, `options: Record<string, string>`, `isSourceSelector?: boolean` |
| **`LanguageSelector.tsx`** | Legacy language selector (being replaced by DropdownSelector) | Similar to DropdownSelector |
| **`MobileTranslationLayout.tsx`** | Mobile-optimized translation interface | All translation state props |
| **`TranslationHistory.tsx`** | Collapsible history list container | `isOpen: boolean`, `historyItems: TranslationHistoryItem[]` |
| **`HistoryItem.tsx`** | Individual translation history record | `item: TranslationHistoryItem`, `formOptions: Record<string, string>` |
| **`BottomActions.tsx`** | Action buttons (history toggle) | `onHistoryClick?: () => void` |
| **`EnvironmentIndicator.tsx`** | Development environment indicator | No props (auto-detects environment) |

### 🎣 Custom Hooks (`src/hooks/`)

| Hook | Purpose | Returns |
|------|---------|---------|
| **`useTranslation.ts`** | Main translation logic and state management | Complete translation state and actions |
| **`useClipboard.ts`** | Reusable clipboard operations | `copyToClipboard()`, `showCopiedMessage`, `isSupported` |

### 🔧 Services (`src/services/`)

| Service | Purpose | Key Functions |
|---------|---------|---------------|
| **`api.ts`** | HTTP client and API communication | `translateText()`, `getFormTypes()`, `getTranslationHistory()`, `updateTranslationStar()` |
| **`starService.ts`** | Hybrid browser + server star management | `toggleStar()`, `isStarred()`, `getGlobalStarCount()` |

### 📋 Types & Constants (`src/types/`, `src/constants/`)

#### Key Type Definitions (`src/types/index.ts`)
```typescript
// Core API Types
TranslationRequest { inputText, sourceForm, targetForm }
TranslationResponse { translatedText, sourceForm, targetForm }
FormsResponse { count, forms: Record<string, string> }

// UI State Types  
CustomFormState { isCustom: boolean, customText: string }
TranslationHistoryItem { id, inputText, targetText, sourceForm, targetForm, timestamp, starCount? }

// API Communication Types
StarRequest { translationId, action: 'star' | 'unstar' }
StarResponse { translationId, totalStars, success?, message? }
```

#### Application Constants (`src/constants/index.ts`)
```typescript
UI_CONSTANTS {
  MAX_TEXT_LENGTH: 5000,
  DEBOUNCE_DELAY: 1500,
  ANIMATION_DURATION: 200
}

LANGUAGE_DISPLAY {
  DETECT_KEY: 'detect',
  DETECT_LABEL: 'detect form',
  CUSTOM_KEY: 'custom', 
  CUSTOM_LABEL: 'custom form',
  MAX_VISIBLE_LANGUAGES: 4
}

ERROR_MESSAGES {
  NETWORK_ERROR, TRANSLATION_FAILED, 
  FORMS_LOAD_FAILED, GENERIC_ERROR
}
```

### ⚙️ Configuration (`src/config/`)

| File | Purpose | Key Exports |
|------|---------|-------------|
| **`environment.ts`** | Environment-specific configuration | `API_URL`, `ENVIRONMENT`, `isDevelopment()`, `isProduction()` |

### 🔄 Key State Variables

#### Translation State (from `useTranslation` hook)
- **`formOptions`**: `Record<string, string>` - Available form types from API
- **`sourceForm`** / **`targetForm`**: `string` - Selected form keys
- **`inputText`** / **`outputText`**: `string` - Translation input and result
- **`isTranslating`**: `boolean` - Loading state during translation
- **`sourceCustomForm`** / **`targetCustomForm`**: `CustomFormState` - Custom form definitions
- **`translationHistory`**: `TranslationHistoryItem[]` - Translation history from API
- **`isHistoryOpen`**: `boolean` - History panel visibility state

#### Component State Variables
- **`isDropdownOpen`**: `boolean` - Dropdown visibility (DropdownSelector)
- **`searchQuery`**: `string` - Form search filter (DropdownSelector)
- **`feedbackMessage`**: `string` - User feedback display (ContentTabs)
- **`showCopiedMessage`**: `boolean` - Clipboard success indicator (useClipboard)
- **`isStarred`**: `boolean` - Personal star status (HistoryItem)
- **`globalStarCount`**: `number` - Global star count from all users (HistoryItem)

### 🌐 API Endpoints

The app communicates with a backend API with these endpoints:
- **`POST /translate`** - Translate text between forms
- **`GET /forms`** - Get available form types
- **`GET /history`** - Get translation history
- **`POST /star`** - Star/unstar translations
- **`GET /star/{id}`** - Get star count for translation
- **`POST /interest`** - Track user interest in features

### 🎨 UI Architecture

- **Desktop**: Two-column layout with `TranslationPanel` components
- **Mobile**: Single-column stack using `MobileTranslationLayout`
- **Responsive**: Tailwind CSS with `lg:` breakpoints
- **Style**: Google Translate-inspired design with clean typography

### 🔍 Key Features

1. **Real-time Translation**: Auto-translates with debouncing (1.5s delay)
2. **Custom Forms**: Users can define their own form types
3. **Translation History**: Persistent history with star ratings
4. **Hybrid Storage**: Local browser storage + server synchronization
5. **Interest Tracking**: Tracks user interest in future features (images/websites)
6. **Environment Awareness**: Different configs for dev/production

### 🚀 Development Notes

- **State Management**: Uses React hooks, no external state library
- **API Client**: Custom fetch-based client with error handling
- **Styling**: Tailwind CSS with custom Google Translate-style components
- **TypeScript**: Fully typed with centralized type definitions
- **Environment**: Supports local development and production deployment

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
