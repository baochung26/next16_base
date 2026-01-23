# Git Workflow Guide

Quy trình làm việc với Git cho project.

## 📋 Mục lục

- [Branch Strategy](#branch-strategy)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)
- [Code Review Guidelines](#code-review-guidelines)

## 🌿 Branch Strategy

### Main Branches

- **`main`**: Production-ready code
- **`develop`**: Development branch (optional)

### Feature Branches

Tạo branch cho mỗi feature:

```bash
# Feature branch
git checkout -b feature/user-profile

# Bug fix branch
git checkout -b fix/login-error

# Hotfix branch
git checkout -b hotfix/critical-bug
```

### Branch Naming Convention

- **Features**: `feature/feature-name`
- **Bug fixes**: `fix/bug-description`
- **Hotfixes**: `hotfix/issue-description`
- **Chores**: `chore/task-description`

Examples:

```
feature/user-authentication
fix/login-redirect-issue
hotfix/security-patch
chore/update-dependencies
```

## 💬 Commit Messages

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, etc.)
- **refactor**: Code refactoring
- **perf**: Performance improvements
- **test**: Adding/updating tests
- **chore**: Maintenance tasks

### Examples

```bash
# Feature
feat(auth): add Google OAuth login

# Bug fix
fix(dashboard): fix user table pagination

# Documentation
docs(readme): update setup instructions

# Refactoring
refactor(api): simplify error handling

# Style
style(components): format code with Prettier
```

### Commit Message Best Practices

1. **Use imperative mood**: "add" not "added" or "adds"
2. **Keep subject line under 50 characters**
3. **Capitalize first letter**
4. **No period at end**
5. **Reference issues**: `Closes #123`

```bash
# ✅ Good
feat(auth): add password reset functionality

# ❌ Bad
feat(auth): added password reset functionality
feat(auth): Add password reset functionality.
feat(auth): This commit adds password reset functionality which allows users to reset their passwords
```

## 🔄 Workflow

### Daily Workflow

1. **Pull latest changes**

   ```bash
   git checkout main
   git pull origin main
   ```

2. **Create feature branch**

   ```bash
   git checkout -b feature/your-feature
   ```

3. **Make changes and commit**

   ```bash
   git add .
   git commit -m "feat(auth): add login form validation"
   ```

4. **Push branch**

   ```bash
   git push origin feature/your-feature
   ```

5. **Create Pull Request**

### Before Committing

Chạy các checks:

```bash
# Format code
npm run format

# Check types
npm run type-check

# Lint code
npm run lint

# Fix lint errors
npm run lint:fix
```

### Commit Checklist

- [ ] Code follows coding standards
- [ ] No console.logs
- [ ] No commented code
- [ ] Code formatted
- [ ] Types checked
- [ ] Linting passed
- [ ] Tests pass (if applicable)

## 🔀 Pull Request Process

### Creating a PR

1. **Push your branch**

   ```bash
   git push origin feature/your-feature
   ```

2. **Create PR on GitHub/GitLab**
   - Title: Clear description
   - Description: What, why, how
   - Link related issues

3. **Wait for review**

4. **Address feedback**

   ```bash
   # Make changes
   git add .
   git commit -m "fix: address review feedback"
   git push origin feature/your-feature
   ```

5. **After approval, merge**

### PR Title Format

```
<type>: <description>
```

Examples:

```
feat: Add user profile page
fix: Resolve login redirect issue
docs: Update API documentation
```

### PR Description Template

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Changes Made

- Change 1
- Change 2
- Change 3

## Testing

- [ ] Manual testing completed
- [ ] Unit tests added/updated
- [ ] No breaking changes

## Screenshots (if applicable)

[Add screenshots here]

## Related Issues

Closes #123
```

## 👀 Code Review Guidelines

### For Reviewers

1. **Be constructive**: Provide helpful feedback
2. **Be respectful**: Use professional language
3. **Be timely**: Review within 24-48 hours
4. **Focus on code**: Not personal preferences
5. **Approve when ready**: Don't block on minor issues

### Review Checklist

- [ ] Code follows standards
- [ ] No obvious bugs
- [ ] Proper error handling
- [ ] Security considerations
- [ ] Performance implications
- [ ] Documentation updated
- [ ] Tests added (if needed)

### For Authors

1. **Be open to feedback**: Accept constructive criticism
2. **Respond to comments**: Address all feedback
3. **Ask questions**: If unclear about feedback
4. **Keep PRs small**: Easier to review

## 🚫 What NOT to Commit

- **Never commit**:
  - `.env` files
  - `node_modules/`
  - Build artifacts (`.next/`, `dist/`)
  - IDE settings (`.vscode/`, `.idea/`)
  - Log files
  - Temporary files

- **Use `.gitignore`**:
  ```gitignore
  .env
  .env.local
  node_modules/
  .next/
  dist/
  *.log
  ```

## 🔧 Useful Git Commands

### Basic Commands

```bash
# Status
git status

# Add files
git add .
git add <file>

# Commit
git commit -m "message"

# Push
git push origin <branch>

# Pull
git pull origin <branch>
```

### Branch Commands

```bash
# List branches
git branch

# Create branch
git checkout -b <branch>

# Switch branch
git checkout <branch>

# Delete branch
git branch -d <branch>
```

### Undo Commands

```bash
# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes)
git reset --hard HEAD~1

# Undo staged changes
git reset HEAD <file>

# Undo file changes
git checkout -- <file>
```

### Stash Commands

```bash
# Save changes temporarily
git stash

# List stashes
git stash list

# Apply stash
git stash apply

# Drop stash
git stash drop
```

## 📚 Resources

- [Git Documentation](https://git-scm.com/doc)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [GitHub Flow](https://guides.github.com/introduction/flow/)
