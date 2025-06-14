/**
 * Environment Variable Validation
 * 
 * This module validates all required environment variables at application startup.
 * If any required variables are missing, the application will exit immediately
 * with a clear error message.
 */

interface RequiredEnvVars {
  NEXT_PUBLIC_API_BASE_URL: string
  NEXT_PUBLIC_WS_URL: string
  NODE_ENV: string
}

// Optional environment variables (for future use)
// interface OptionalEnvVars {
//   NEXT_PUBLIC_NODE_ENV?: string
//   NEXT_PUBLIC_ANALYTICS_ID?: string
//   PORT?: string
//   HOSTNAME?: string
//   NEXT_TELEMETRY_DISABLED?: string
// }

/**
 * Validates that all required environment variables are present
 * @throws {Error} If any required environment variable is missing
 */
function validateRequiredEnvVars(): RequiredEnvVars {
  const missing: string[] = []
  
  const requiredVars = {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL,
    NODE_ENV: process.env.NODE_ENV,
  }

  // Check for missing required variables
  Object.entries(requiredVars).forEach(([key, value]) => {
    if (!value || value.trim() === '') {
      missing.push(key)
    }
  })

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:')
    missing.forEach(varName => {
      console.error(`   - ${varName}`)
    })
    console.error('\n💡 Please check your .env.local file or environment configuration.')
    console.error('   Required variables:')
    console.error('   - NEXT_PUBLIC_API_BASE_URL: Backend API endpoint')
    console.error('   - NEXT_PUBLIC_WS_URL: WebSocket server URL')
    console.error('   - NODE_ENV: Environment mode (development/production)')
    
    process.exit(1)
  }

  return requiredVars as RequiredEnvVars
}

/**
 * Validates environment variable formats
 */
function validateEnvVarFormats(envVars: RequiredEnvVars): void {
  // Validate API URL format
  try {
    new URL(envVars.NEXT_PUBLIC_API_BASE_URL)
  } catch {
    console.error(`❌ Invalid NEXT_PUBLIC_API_BASE_URL format: ${envVars.NEXT_PUBLIC_API_BASE_URL}`)
    console.error('   Expected format: http://localhost:3001/api or https://api.example.com/api')
    process.exit(1)
  }

  // Validate WebSocket URL format
  if (!envVars.NEXT_PUBLIC_WS_URL.startsWith('ws://') && !envVars.NEXT_PUBLIC_WS_URL.startsWith('wss://')) {
    console.error(`❌ Invalid NEXT_PUBLIC_WS_URL format: ${envVars.NEXT_PUBLIC_WS_URL}`)
    console.error('   Expected format: ws://localhost:3001 or wss://api.example.com')
    process.exit(1)
  }

  // Validate NODE_ENV
  if (!['development', 'production', 'test'].includes(envVars.NODE_ENV)) {
    console.error(`❌ Invalid NODE_ENV value: ${envVars.NODE_ENV}`)
    console.error('   Expected values: development, production, or test')
    process.exit(1)
  }
}

/**
 * Main validation function - call this at application startup
 */
export function validateEnvironment(): RequiredEnvVars {
  console.log('🔍 Validating environment variables...')
  
  const envVars = validateRequiredEnvVars()
  validateEnvVarFormats(envVars)
  
  console.log('✅ Environment variables validated successfully')
  console.log(`   - API URL: ${envVars.NEXT_PUBLIC_API_BASE_URL}`)
  console.log(`   - WebSocket URL: ${envVars.NEXT_PUBLIC_WS_URL}`)
  console.log(`   - Environment: ${envVars.NODE_ENV}`)
  
  return envVars
}

/**
 * Get validated environment variables (assumes validation has already run)
 */
export function getEnvVars(): RequiredEnvVars {
  return {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL!,
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL!,
    NODE_ENV: process.env.NODE_ENV!,
  }
}

// Export individual variables for convenience
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL!
export const WS_URL = process.env.NEXT_PUBLIC_WS_URL!
export const NODE_ENV = process.env.NODE_ENV! 