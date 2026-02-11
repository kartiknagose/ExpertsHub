# Team Development Workflow Guide

## Overview
This document outlines the Git workflow for UrbanPro V2 team development. Follow these steps to keep the mainline safe and enable parallel development.

---

## 1. Main Branches

```
main (production-ready code only)
  ↓
develop (integration branch for features)
  ↓
feature/* branches (individual team members)
```

### Branch Purposes:
- **main**: Production-ready code, merged from develop when stable
- **develop**: Integration branch where all features come together
- **feature/**: Individual feature branches for each team member

---

## 2. Create Feature Branches (Each Team Member)

### Step 1: Update Your Local Develop
```bash
git checkout develop
git pull origin develop
```

### Step 2: Create Your Feature Branch
```bash
git checkout -b feature/your-task-name
```

### Branch Naming Convention:
```
feature/what-you-are-doing
bugfix/what-you-are-fixing
```

### Examples:
- `feature/auth-email-verification`
- `feature/customer-registration-page`
- `feature/worker-registration-page`
- `feature/email-verification-ui`
- `bugfix/login-error-handling`

---

## 3. Working on Your Feature Branch

### Make Changes
Edit files, add features, fix bugs as needed.

### Commit Regularly (Best Practice)
```bash
git add .
git commit -m "Add mobile field to User model"
git commit -m "Create EmailVerification migration"
git commit -m "Add email verification service logic"
```

**Commit Message Guidelines:**
- Be descriptive and concise
- Start with action verb: Add, Update, Fix, Remove
- Example: ✅ `Add email verification token logic` vs ❌ `fixed stuff`

### Push to Remote Regularly
```bash
git push origin feature/your-task-name
```

This ensures your work is backed up and visible to the team.

---

## 4. Pull Request & Code Review

### Step 1: Create Pull Request
1. Go to GitHub/GitLab
2. Create a Pull Request with:
   - **Base branch**: `develop`
   - **Compare branch**: `feature/your-task-name`
   - **Title**: Brief description of changes
   - **Description**: What you changed and why

### Step 2: Request Review
- Assign team members to review
- Everyone should review each other's code

### Step 3: Address Feedback
- Make changes based on review comments
- Commit and push updates
- PR updates automatically

### Step 4: Merge After Approval
- Merge only AFTER approval
- Delete the feature branch after merging
- ```bash
  git checkout develop
  git pull origin develop
  git branch -d feature/your-task-name
  ```

---

## 5. Rules to Keep Mainline Safe

### ✅ DO:
- Create feature branches for every task
- Make small, logical commits
- Push regularly (don't lose work)
- Use Pull Requests for every change
- Review code before merging
- Pull latest `develop` before starting new work
- Delete feature branch after merging

### ❌ DON'T:
- Commit directly to `main` or `develop`
- Force push to shared branches (`git push -f`)
- Merge your own PRs without review
- Work on the same file simultaneously without coordination
- Use vague commit messages

---

## 6. Daily Workflow Checklist

### Start of Day:
```bash
git checkout develop
git pull origin develop
git checkout -b feature/new-task
```

### During Work:
```bash
# Make changes
git add .
git commit -m "Descriptive message"
git push origin feature/new-task
```

### End of Day:
```bash
git push origin feature/new-task  # Backup your work
```

### When Task is Done:
```bash
# Create Pull Request on GitHub
# Wait for review
# Address feedback if any
# Merge to develop
git checkout develop
git pull origin develop
git branch -d feature/task-name
```

---

## 7. Handling Conflicts

### If Your Feature Branch Falls Behind Develop:
```bash
git fetch origin
git rebase origin/develop
```

Or use merge:
```bash
git fetch origin
git merge origin/develop
```

### If You Have Merge Conflicts:
1. Open conflicted files
2. Look for `<<<<<<<`, `=======`, `>>>>>>>`
3. Manually resolve or ask team for help
4. ```bash
   git add .
   git commit -m "Resolve merge conflicts"
   git push origin feature/your-task-name
   ```

---

## 8. Team Member Setup (First Time)

### Clone Repository:
```bash
git clone <repository-url>
cd UrbanPro\ V2
```

### Configure Git:
```bash
git config user.name "Your Name"
git config user.email "your.email@example.com"
```

### Verify Setup:
```bash
git branch -a          # List all branches
git remote -v          # Verify remote URL
```

---

## 9. Current Parallel Tasks

### Backend (Main Dev - You)
```
Branch: feature/auth-email-verification
Tasks:
  - Add mobile field to User model
  - Create EmailVerification table
  - Add email verification logic
  - Add verification endpoints
  - Update registration functions
```

### Frontend (Team Member - Customer Registration)
```
Branch: feature/customer-registration-page
Tasks:
  - Create RegisterCustomer.jsx form
  - Validate: name, email, password, mobile
  - Call POST /api/auth/register-customer (when ready)
  - Show success/error messages
```

### Frontend (Team Member - Worker Registration)
```
Branch: feature/worker-registration-page
Tasks:
  - Create RegisterWorker.jsx form
  - Validate: name, email, password, mobile, bio, skills, hourlyRate, serviceAreas
  - Call POST /api/auth/register-worker (when ready)
  - Show success/error messages
```

### Frontend (Team Member - Email Verification)
```
Branch: feature/email-verification-ui
Tasks:
  - Create VerifyEmailPage.jsx
  - Add OTP/token input field
  - Call POST /api/auth/verify-email (when ready)
  - Redirect to dashboard after verification
```

---

## 10. Communication

### Before Starting Work:
- Mention which branch you're working on
- Check if someone is already working on similar feature

### While Working:
- Update team on progress
- Ask questions in chat/Slack if unclear

### When Reviewing:
- Be constructive and helpful
- Comment with suggestions, not demands
- Approve after all issues are resolved

### When Done:
- Announce PR ready for review
- Tag reviewers if needed

---

## 11. Troubleshooting

### I accidentally committed to develop:
```bash
git reset --soft HEAD~1  # Undo last commit, keep changes
git checkout -b feature/my-task
git commit -m "My changes"
git push origin feature/my-task
# Then create PR
```

### I want to see what changed in my branch:
```bash
git diff develop..feature/my-task
```

### I want to start over on a branch:
```bash
git reset --hard origin/develop  # Warning: This deletes all local changes!
```

### I want to delete a local branch:
```bash
git branch -d feature/my-task
```

### I want to delete a remote branch:
```bash
git push origin --delete feature/my-task
```

---

## 12. Best Practices Summary

1. **One feature per branch** - Keep branches focused
2. **Small PRs** - Easy to review, faster merge
3. **Frequent commits** - Easier to track changes
4. **Clear messages** - Help team understand intent
5. **Always review** - Code quality matters
6. **Communicate** - Tell team what you're doing
7. **Pull often** - Stay in sync with develop
8. **Delete old branches** - Keep repository clean

---

## 13. Quick Reference Commands

```bash
# List all branches
git branch -a

# Create and checkout new branch
git checkout -b feature/task-name

# Switch branch
git checkout develop

# See status
git status

# Add changes
git add .
git add src/file.js          # Specific file

# Commit
git commit -m "Commit message"

# Push to remote
git push origin feature/task-name

# Pull latest from develop
git pull origin develop

# Rebase on develop
git rebase origin/develop

# View commits in your branch
git log develop..feature/task-name

# Delete local branch
git branch -d feature/task-name

# Delete remote branch
git push origin --delete feature/task-name
```

---

## Questions?
Ask your team lead before committing to main or develop!
