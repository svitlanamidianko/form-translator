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
    apiUrl: 'http://localhost:7777',
    environment: 'development',
    debug: true,
  },
  production: {
    apiUrl: 'https://your-app-name.fly.dev', // You'll update this when you deploy to Fly.io
    environment: 'production',
    debug: false,
  },
};

// This function determines which environment we're in
// Similar to checking if __name__ == '__main__' in Python
function getCurrentEnvironment(): string {
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
