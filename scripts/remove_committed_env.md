## Remove committed `.env.local` safely

This document provides commands to stop tracking `Wealth-Bridge/.env.local` and options to purge it from git history.

1) Stop tracking the file (keeps local copy):

```powershell
git rm --cached Wealth-Bridge/.env.local
git commit -m "chore: remove committed env file"
git push origin HEAD
```

2) Recommended: purge the secret from history **(choose one)**

- Using `git filter-repo` (recommended):

```powershell
# install: pip install git-filter-repo
git filter-repo --invert-paths --path Wealth-Bridge/.env.local
git push --force
```

- Using BFG Repo-Cleaner:

```powershell
# download BFG jar: https://rtyley.github.io/bfg-repo-cleaner/
java -jar bfg.jar --delete-files .env.local
git reflog expire --expire=now --all
git gc --prune=now --aggressive
git push --force
```

Notes:
- Rewriting history requires force-pushing and coordination with collaborators.
- After history rewrite, all collaborators must re-clone or run `git fetch` + reset.
- Keep your local copy of `Wealth-Bridge/.env.local` safe; do not re-commit it.

3) Verify `.gitignore` includes env files. The repository already includes patterns for `.env` and `.env*.local`. To be explicit you can add `/Wealth-Bridge/.env.local` to the root `.gitignore`.

If you want me to apply the `.gitignore` change and add a small PowerShell helper to run step (1), say so and I'll patch the repo.
