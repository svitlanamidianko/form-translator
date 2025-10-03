# Environment Setup Guide

This guide explains how to configure your Form Translator application for different environments (local development and production).

## Environment Configuration

The application uses a TypeScript-based configuration system located in `src/config/environment.ts`. This is similar to how you might use environment variables in Python with `os.environ`.

### Current Environments

#### 1. Development (Local)
- **API URL**: `http://localhost:7777`
- **Used when**: Running `npm run dev`
- **Features**: 
  - Debug logging enabled
  - Environment indicator visible in top-right corner
  - Detailed error messages
  - Dynamic form loading from API

#### 2. Production (Fly.io)
- **API URL**: `https://your-app-name.fly.dev` (update this!)
- **Used when**: Running `npm run build` and `npm run start`
- **Features**:
  - Optimized for performance
  - No debug logging
  - Clean error messages

## How to Update for Your Backend

### Step 1: Update Production URL
When you deploy your backend to Fly.io, update the production URL in `src/config/environment.ts`:

```typescript
production: {
  apiUrl: 'https://YOUR-ACTUAL-FLY-APP-NAME.fly.dev', // Replace this!
  environment: 'production',
  debug: false,
},
```

### Step 2: Verify Your Backend Endpoints
The frontend expects these endpoints on your backend:

- `POST /translate` - Main translation endpoint
- `GET /forms` - Get available form types (required for dynamic form loading)
- `GET /health` - Health check endpoint (optional)

### Step 3: Test the Connection

#### Local Development
1. Make sure your backend is running on `http://localhost:7777`
2. Run your frontend: `npm run dev`
3. You should see a yellow indicator in the top-right showing "DEVELOPMENT - http://localhost:7777"
4. The form dropdowns should populate with 39 different form types from your API

#### Production Testing
1. Deploy your backend to Fly.io
2. Update the production URL in the config
3. Build and test: `npm run build && npm run start`

## API Integration

### Forms Endpoint
The frontend fetches available forms from:
```
GET /forms
```

Expected response:
```json
{
  "count": 27,
  "forms": {
    "analytical": {
      "category": null,
      "description": "analytical - Logical; Structured reasoning with premises → inference → conclusion; define variables, compare hypotheses, note edge cases."
    },
    "formal": {
      "category": null,
      "description": "formal - High register, complete sentences, impersonal voice; precise vocabulary; no slang; tidy paragraphing."
    },
    "buddhism": {
      "category": "religion",
      "description": "buddhism - Four Noble Truths/8-fold path vocabulary; impermanence, not-self, dukkha; calm, precise, practice-oriented tone."
    }
    // ... more form types
  },
  "note": "User-submitted custom forms are excluded from this list",
  "source": "Google Sheet",
  "timestamp": "2025-10-03T15:35:52.947121"
}
```

### Translation Endpoint
The frontend sends translation requests in this format:

```json
// POST /translate
{
  "inputText": "I am writing to inform you that the project has been completed successfully.",
  "sourceForm": "formal",
  "targetForm": "poetic"
}
```

Expected response:
```typescript
{
  "translatedText": "Greetings, universe of wonder",
  "sourceForm": "affirmations", 
  "targetForm": "poetic",
  "confidence": 0.95  // optional
}
```

## Troubleshooting

### Common Issues

1. **CORS Errors**: Make sure your backend allows requests from your frontend domain
2. **Connection Refused**: Verify your backend is running on the correct port
3. **404 Errors**: Check that your backend endpoints match what the frontend expects

### Debug Mode
In development, you'll see detailed logs in the browser console. Look for:
- 🌐 API Request logs
- ✅ API Response logs  
- ❌ Error details

### Environment Indicator
In development mode, you'll see a yellow indicator in the top-right corner showing:
- Current environment (DEVELOPMENT/PRODUCTION)
- Current API URL being used

This helps you confirm which backend you're connecting to.

## Next Steps

1. ✅ Environment configuration is set up
2. ✅ API service layer is ready
3. ✅ Frontend is integrated
4. 🔄 Test with your local backend
5. ⏳ Deploy backend to Fly.io and update production URL
6. ⏳ Test production deployment

## Python Developers Note

If you're more comfortable with Python, think of this setup like:

```python
# This is like having different config files
import os

if os.environ.get('NODE_ENV') == 'production':
    API_URL = 'https://your-app.fly.dev'
else:
    API_URL = 'http://localhost:8000'
```

The TypeScript version just gives us better type safety and IDE support!
