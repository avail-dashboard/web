# Environment Variable Centralization

## Overview

This document describes the solution for centralizing environment variables in the Avail Explorer project to avoid configuration duplication across multiple files.

## Problem

Previously, environment variables were defined in multiple places:

- `docker-compose.yml` (build args with defaults)
- `Dockerfile` (build args and environment variables)
- `next.config.js` (environment variable configuration with fallbacks)

This led to:

- Configuration duplication
- Maintenance overhead
- Risk of inconsistencies
- Difficulty in managing different environments

## Solution

### 1. Centralized Configuration File

**File**: `.env.production`

- Contains all environment variables for production
- Single source of truth for configuration
- Ignored by git for security

### 2. Updated Docker Configuration

**docker-compose.yml changes**:

- Added `env_file: .env.production` to load variables from file
- Build args now reference variables from `.env.production`
- Removed hardcoded default values

**Dockerfile changes**:

- Uses ARG declarations with default fallback values
- Converts build args to environment variables for the build process
- Maintains backward compatibility

### 3. Next.js Configuration

**next.config.js**:

- Kept existing fallback logic for development
- Environment variables from `.env.production` take precedence

## File Structure

```
.
├── .env.production              # Main configuration file (git-ignored)
├── env.production.template      # Template for .env.production
├── setup-env.sh               # Setup script
├── docker-compose.yml         # Updated to use env_file
├── Dockerfile                 # Updated to use build args
└── next.config.js             # Unchanged (has fallbacks)
```

## Environment Variables

| Variable                   | Description               | Default Value                       |
| -------------------------- | ------------------------- | ----------------------------------- |
| `NEXT_PUBLIC_API_BASE_URL` | API base URL              | `https://api.avail.naxatar.com/api` |
| `NEXT_PUBLIC_WS_URL`       | WebSocket URL             | `wss://api.avail.naxatar.com`       |
| `NEXT_PUBLIC_NODE_ENV`     | Node environment          | `production`                        |
| `NODE_ENV`                 | Node environment          | `production`                        |
| `PORT`                     | Application port          | `3000`                              |
| `HOSTNAME`                 | Application hostname      | `0.0.0.0`                           |
| `NEXT_TELEMETRY_DISABLED`  | Disable Next.js telemetry | `1`                                 |
| `FRONTEND_PORT`            | Docker port mapping       | `3000`                              |

## Setup Instructions

### Quick Setup

1. Run the setup script:

   ```bash
   ./setup-env.sh
   ```

2. Review and modify `.env.production` if needed

3. Build and run with Docker Compose:
   ```bash
   docker-compose up --build
   ```

### Manual Setup

1. Create `.env.production` from template:

   ```bash
   cp env.production.template .env.production
   ```

2. Edit `.env.production` with your values

3. Set appropriate permissions:
   ```bash
   chmod 600 .env.production
   ```

## How It Works

### Build Process

1. Docker Compose reads `.env.production`
2. Variables are passed as build args to Dockerfile
3. Dockerfile converts build args to environment variables
4. Next.js build uses these environment variables
5. Built application includes the configuration

### Runtime Process

1. Docker Compose loads `.env.production` via `env_file`
2. Container starts with environment variables set
3. Application uses runtime environment variables

## Benefits

✅ **Single Source of Truth**: All configuration in one file
✅ **No Duplication**: Variables defined once, used everywhere
✅ **Easy Maintenance**: Update values in one place
✅ **Environment Specific**: Different files for different environments
✅ **Secure**: Environment files are git-ignored
✅ **Backward Compatible**: Fallback values still work

## Best Practices

### Security

- Never commit `.env.production` to git
- Use restrictive file permissions (600)
- Use different files for different environments

### Maintenance

- Keep the template file updated
- Document any new environment variables
- Use meaningful variable names and descriptions

### Development

- Use `.env.local` for local development
- Keep fallback values in `next.config.js` for development
- Test configuration changes in staging first

## Troubleshooting

### Common Issues

1. **Variables not loading**: Check file permissions and syntax
2. **Build failures**: Ensure all required variables are set
3. **Runtime errors**: Verify environment file is loaded correctly

### Validation

Check if variables are loaded correctly:

```bash
# Check Docker Compose configuration
docker-compose config

# Check environment in running container
docker exec avail-frontend env | grep NEXT_PUBLIC
```

## Future Improvements

1. **Environment Validation**: Add schema validation for environment variables
2. **Multiple Environments**: Support for staging, development, etc.
3. **Secret Management**: Integration with secret management systems
4. **Configuration UI**: Web interface for managing configuration

## Migration Notes

### From Previous Setup

The migration maintains backward compatibility:

- Default values are preserved in Dockerfile
- Next.js config fallbacks remain unchanged
- Docker Compose structure is similar

### Breaking Changes

None. The solution is designed to be backward compatible.

## Related Files

- `docker-compose.yml`: Docker service configuration
- `Dockerfile`: Container build configuration
- `next.config.js`: Next.js environment configuration
- `.gitignore`: Ensures environment files are not committed
- `setup-env.sh`: Automated setup script
