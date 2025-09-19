# Deployment Guide

## Environment Configuration

This application supports automatic environment switching between development and production.

### How It Works (Like Python's Config Pattern)

Just like in Python where you might have:
```python
import os

config = {
    'development': {
        'api_url': 'http://localhost:7777',
        'debug': True
    },
    'production': {
        'api_url': 'https://form-translator-backend.fly.dev',
        'debug': False
    }
}

current_config = config[os.environ.get('ENVIRONMENT', 'development')]
```

Our TypeScript configuration in `src/config/environment.ts` works similarly:
- **Development**: Uses `http://localhost:7777` (your local backend)
- **Production**: Uses `https://form-translator-backend.fly.dev` (your Fly.io backend)

### Environment Variables

The app supports these environment variables:

- `NODE_ENV`: Automatically set by Next.js (`development` or `production`)
- `NEXT_PUBLIC_DEV_API_URL`: Override development API URL (optional)
- `NEXT_PUBLIC_PROD_API_URL`: Override production API URL (optional)
- `NEXT_PUBLIC_FORCE_ENVIRONMENT`: Force specific environment (optional)
- `NEXT_PUBLIC_DEBUG`: Enable debug logging (optional)

### Local Development Setup

1. **Run your backend locally** (port 7777):
   ```bash
   # Your Python backend should be running on http://localhost:7777
   ```

2. **Run the frontend**:
   ```bash
   npm run dev
   # This automatically sets NODE_ENV=development
   # The app will use http://localhost:7777 for API calls
   ```

### Vercel Deployment

1. **Connect your repository to Vercel**

2. **Environment Variables in Vercel**:
   - `NODE_ENV`: `production` (automatically set)
   - `NEXT_PUBLIC_PROD_API_URL`: `https://form-translator-backend.fly.dev`

3. **Deploy**:
   - Vercel will automatically detect it's a Next.js app
   - It will use the production configuration
   - API calls will go to your Fly.io backend

### Testing Environment Switching

You can test the environment switching locally:

1. **Force production mode locally**:
   ```bash
   # Create .env.local file
   echo "NEXT_PUBLIC_FORCE_ENVIRONMENT=production" > .env.local
   npm run dev
   # Now it will use the Fly.io backend even in development
   ```

2. **Check the environment indicator**:
   - In development: Shows "DEV" badge in the top-right corner
   - In production: No badge shown

### Troubleshooting

1. **API calls failing?**
   - Check the environment indicator to see which mode you're in
   - Open browser dev tools and check the Network tab
   - Look for console logs showing API requests (only in development)

2. **Wrong API URL being used?**
   - Check environment variables in Vercel dashboard
   - Verify `src/config/environment.ts` has correct URLs

3. **Environment not switching?**
   - Clear browser cache
   - Check that `NODE_ENV` is set correctly
   - Use `NEXT_PUBLIC_FORCE_ENVIRONMENT` for testing

### Backend Requirements

Your Fly.io backend should support these endpoints:
- `POST /translate` - Translation requests
- `GET /forms` - Available form types
- `GET /history` - Translation history
- `GET /health` - Health check

### CORS Configuration

The backend needs to allow requests from your Vercel domain:
```python
# In your Python backend
ALLOWED_ORIGINS = [
    "http://localhost:3000",  # Development
    "https://your-app.vercel.app",  # Production
]
```
