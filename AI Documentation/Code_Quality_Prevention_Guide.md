# Code Quality Prevention Guide

## Avoiding Formatting Issues in Commits

This guide helps prevent the formatting issues that can block commits and provides strategies for maintaining code quality.

## 1. Editor Setup (Recommended - One-time setup)

### VS Code Configuration

The project now includes `.vscode/settings.json` with:

- **Auto-format on save**: Automatically formats code when you save files
- **ESLint auto-fix**: Fixes linting issues automatically
- **Prettier as default formatter**: Ensures consistent formatting

### Required Extensions

Install these VS Code extensions (recommended in `.vscode/extensions.json`):

- **Prettier - Code formatter** (`esbenp.prettier-vscode`)
- **ESLint** (`dbaeumer.vscode-eslint`)
- **Tailwind CSS IntelliSense** (`bradlc.vscode-tailwindcss`)
- **TypeScript Importer** (`ms-vscode.vscode-typescript-next`)

## 2. Pre-commit Workflow Options

### Option A: Manual Check Before Commit

```bash
# Run this before committing to catch issues early
npm run pre-commit-check
```

### Option B: Format Only Staged Files

```bash
# Format only the files you're about to commit
npm run format:staged
```

### Option C: Full Project Format

```bash
# Format the entire project
npm run format
```

## 3. Updated Pre-commit Hook Behavior

The pre-commit hook now:

1. **Auto-fixes formatting** instead of just checking
2. **Alerts you** if changes were made
3. **Provides clear instructions** on how to proceed

If formatting changes are made during pre-commit:

```bash
# The hook will suggest this command:
git add . && git commit --amend --no-edit
```

## 4. Daily Development Best Practices

### Before Starting Work

- Ensure VS Code extensions are installed
- Verify auto-format on save is working

### During Development

- Save files frequently (triggers auto-format)
- Run `npm run lint` periodically to catch issues early
- Use `npm run type-check` for TypeScript errors

### Before Committing

- Review your changes: `git diff`
- Optional: Run `npm run pre-commit-check` manually
- Commit with confidence knowing the hook will catch remaining issues

## 5. Team Collaboration

### For New Team Members

1. Clone the repository
2. Run `npm install`
3. Install recommended VS Code extensions
4. Verify auto-format works by making a small change and saving

### For Code Reviews

- Focus on logic and architecture rather than formatting
- Formatting should be consistent thanks to automated tools

## 6. Troubleshooting

### If Auto-format Isn't Working

1. Check VS Code settings: `Cmd/Ctrl + ,` → search "format on save"
2. Verify Prettier extension is installed and enabled
3. Check file associations in VS Code settings

### If Pre-commit Hook Fails

1. Read the error message carefully
2. Run the suggested commands
3. For persistent issues, run `npm run format` manually

### If ESLint Errors Persist

1. Run `npm run lint` to see all errors
2. Many can be auto-fixed with `npm run lint -- --fix`
3. Address remaining errors manually

## 7. Benefits of This Setup

✅ **Prevents formatting-related commit failures**
✅ **Maintains consistent code style across the team**
✅ **Reduces time spent on code review formatting discussions**
✅ **Catches issues early in development**
✅ **Provides clear guidance when issues occur**

## 8. Future Improvements

Consider adding:

- **lint-staged** for faster pre-commit checks (only lint changed files)
- **commitlint** for consistent commit message format
- **GitHub Actions** for additional CI/CD quality checks
- **Husky commit-msg** hook for commit message validation
