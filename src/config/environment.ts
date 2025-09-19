// Environment Configuration
// This is like having a config.py file in Python where you manage different environments

export interface EnvironmentConfig {
  apiUrl: string;
  environment: 'development' | 'production';
  debug?: boolean;
}

// Think of this like a Python dictionary with different configurations
const environments: Record<string, EnvironmentConfig> = {
  development: {
    apiUrl: process.env.NEXT_PUBLIC_DEV_API_URL || 'http://localhost:7777',
    environment: 'development',
    debug: process.env.NEXT_PUBLIC_DEBUG === 'true' || true,
  },
  production: {
    apiUrl: process.env.NEXT_PUBLIC_PROD_API_URL || 'https://form-translator-backend.fly.dev', // Your Fly.io backend API
    environment: 'production',
    debug: process.env.NEXT_PUBLIC_DEBUG === 'true' || false,
  },
};

// This function determines which environment we're in
// Similar to checking if __name__ == '__main__' in Python
function getCurrentEnvironment(): string {
  // Allow manual override of environment (useful for testing)
  if (process.env.NEXT_PUBLIC_FORCE_ENVIRONMENT) {
    return process.env.NEXT_PUBLIC_FORCE_ENVIRONMENT;
  }
  
  // In Next.js, NODE_ENV is automatically set by the framework
  // 'development' when running npm run dev
  // 'production' when running npm run build/start
  return process.env.NODE_ENV || 'development';
}

// Export the current environment configuration
// This is like having a get_config() function in Python
export const config: EnvironmentConfig = environments[getCurrentEnvironment()];

// Helper function to check if we're in development
export const isDevelopment = () => config.environment === 'development';

// Helper function to check if we're in production  
export const isProduction = () => config.environment === 'production';

// Export individual config values for convenience
export const API_URL = config.apiUrl;
export const ENVIRONMENT = config.environment;
export const DEBUG = config.debug;
