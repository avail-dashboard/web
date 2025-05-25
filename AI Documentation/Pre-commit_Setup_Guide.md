# Pre-commit Setup Guide

## Overview

This project uses multiple pre-commit strategies to ensure code quality and consistency:

1. **Husky + lint-staged** (Current active setup)
2. **Pre-commit framework** (Alternative/future setup)

## Current Setup: Husky + lint-staged

### How it works

- Husky manages Git hooks
- lint-staged runs tools only on staged files
- Automatically formats and fixes issues before commit

### Configuration Files

- `.husky/pre-commit` - Main pre-commit hook
- `.husky/commit-msg` - Commit message validation hook
- `package.json` - lint-staged configuration
- `commitlint.config.js` - Commit message linting rules
- `.prettierrc` - Prettier formatting rules
- `eslint.config.mjs` - ESLint rules

### What runs on commit:

1. **lint-staged**: Formats and lints only staged files
2. **Type checking**: Full TypeScript type check
3. **Tests**: Complete test suite
4. **Commit message linting**: Validates commit message format (conventional commits)

### Available Scripts

```bash
npm run pre-commit-quick    # lint-staged + type-check (fast)
npm run pre-commit-full     # format + lint + type-check + tests (comprehensive)
npm run pre-commit-check    # format + lint + type-check (medium)
npm run commitlint-check    # check last commit message format
```

## Alternative Setup: Pre-commit Framework

### Installation (if switching)

```bash
# Install pre-commit
pip install pre-commit

# Install hooks
pre-commit install

# Run on all files
pre-commit run --all-files
```

### Configuration

- `.pre-commit-config.yaml` - Pre-commit framework configuration

### Benefits of pre-commit framework:

- Language agnostic
- Better caching
- More robust hook management
- Easier to share across different projects
- Better handling of dependencies

## Troubleshooting

### Common Issues

1. **Pre-commit hook fails after formatting**

   ```bash
   git add .
   git commit --amend --no-edit
   ```

2. **Skip pre-commit hooks (emergency)**

   ```bash
   git commit --no-verify -m "emergency commit"
   ```

3. **Update pre-commit hooks**
   ```bash
   pre-commit autoupdate  # for pre-commit framework
   # or
   npm update  # for npm-based tools
   ```

### Performance Optimization

1. **Faster commits**: Use `npm run pre-commit-quick` for development
2. **Skip tests**: Modify `.husky/pre-commit` to remove `npm run test:ci`
3. **Parallel execution**: lint-staged runs tools in parallel by default

## Conventional Commits

This project enforces conventional commit message format:

### Format

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Examples

```bash
feat: add user authentication
fix(api): resolve data fetching issue
docs: update README with setup instructions
style: format code with prettier
refactor(components): extract common button component
test: add unit tests for utils
chore: update dependencies
```

### Allowed Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `ci`: CI/CD changes
- `build`: Build system changes
- `revert`: Reverting changes

## Best Practices

1. **Run checks locally before pushing**

   ```bash
   npm run pre-commit-full
   ```

2. **Format code regularly**

   ```bash
   npm run format
   ```

3. **Fix linting issues**

   ```bash
   npm run lint -- --fix
   ```

4. **Check commit message format**
   ```bash
   npm run commitlint-check
   ```

## Migration Guide

### To switch to pre-commit framework:

1. Install pre-commit: `pip install pre-commit`
2. Install hooks: `pre-commit install`
3. Update `.husky/pre-commit` to use `pre-commit run`
4. Test with: `pre-commit run --all-files`

### To customize current setup:

1. Modify `lint-staged` config in `package.json`
2. Update `.husky/pre-commit` script
3. Add/remove npm scripts as needed

## Future Improvements

1. **Add commit message linting** (commitlint)
2. **Add security scanning** (npm audit)
3. **Add dependency checking** (depcheck)
4. **Add bundle size analysis**
5. **Add accessibility testing**

## Configuration Examples

### Minimal pre-commit (fast)

```bash
# .husky/pre-commit
#!/bin/sh
npx lint-staged
```

### Comprehensive pre-commit (thorough)

```bash
# .husky/pre-commit
#!/bin/sh
npx lint-staged
npm run type-check
npm run test:ci
npm audit --audit-level moderate
```

### Custom lint-staged config

```json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "prettier --write",
      "eslint --fix",
      "jest --findRelatedTests --passWithNoTests"
    ],
    "*.{json,css,md}": ["prettier --write"],
    "package.json": ["npm audit --audit-level moderate"]
  }
}
```
