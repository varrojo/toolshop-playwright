# CI/CD Setup Walkthrough

Step-by-step checklist for getting this repo running on GitHub Actions. Written to follow in order — check off each step as it's done and verified, not just completed.

**Why now:** applying for an Automation Engineer role and want a working CI pipeline as part of the portfolio, ahead of the API testing track.

## Prerequisites

- [ ] Local repo is clean (`git status --short` shows nothing pending) before starting — commit or stash anything in progress first.
- [ ] `.env` exists locally with real values for all 6 vars in `.env.example` (used to confirm the same var names will be needed as GitHub secrets).

## Step 1 — Create the GitHub repository

- [ ] Create a new **empty** repo on GitHub (no README, no .gitignore, no license — this repo already has all of those; adding them on GitHub would conflict with the initial push).
- [ ] Note the remote URL (SSH or HTTPS).

## Step 2 — Connect and push

```bash
git remote add origin <remote-url>
git push -u origin main
```

- [ ] `git remote -v` shows `origin`.
- [ ] Push succeeds; commit history is visible on GitHub.
- [ ] Confirm `.env` did **not** get pushed (check the repo's file list on GitHub — only `.env.example` should be there).

## Step 3 — Add repository secrets

GitHub repo → **Settings → Secrets and variables → Actions → New repository secret**. Add each of these, matching the names in `.env.example` exactly:

- [ ] `ADMIN_EMAIL`
- [ ] `ADMIN_PASSWORD`
- [ ] `SEEDED_USER_EMAIL1`
- [ ] `SEEDED_USER_PASSWORD1`
- [ ] `SEEDED_USER_EMAIL2`
- [ ] `SEEDED_USER_PASSWORD2`

## Step 4 — Wire secrets into the workflow

`playwright.config.ts` calls `dotenv.config()` on a `.env` file that won't exist in CI — that's fine, dotenv silently no-ops if the file is missing, and `requireEnv()` will pick up whatever's already in `process.env`. So the workflow needs to inject the secrets as env vars on the test step in `.github/workflows/playwright.yml`:

```yaml
      - name: Run Playwright tests
        run: npx playwright test
        env:
          ADMIN_EMAIL: ${{ secrets.ADMIN_EMAIL }}
          ADMIN_PASSWORD: ${{ secrets.ADMIN_PASSWORD }}
          SEEDED_USER_EMAIL1: ${{ secrets.SEEDED_USER_EMAIL1 }}
          SEEDED_USER_PASSWORD1: ${{ secrets.SEEDED_USER_PASSWORD1 }}
          SEEDED_USER_EMAIL2: ${{ secrets.SEEDED_USER_EMAIL2 }}
          SEEDED_USER_PASSWORD2: ${{ secrets.SEEDED_USER_PASSWORD2 }}
```

- [ ] Workflow file updated with the `env:` block above.
- [ ] Change committed and pushed.

## Step 5 — Verify the run

- [ ] GitHub → **Actions** tab shows a run triggered by the push.
- [ ] Run passes (or investigate failures — see below).
- [ ] `playwright-report` artifact is attached to the run and downloadable.

## Step 6 — Troubleshoot common first-run failures

- **`requireEnv` throws / "missing env var"** → a secret name doesn't match exactly what `requireEnv()` looks up in `InvoicesPage.ts` — check spelling and case.
- **Tests time out on navigation/auth** → confirm the workflow doesn't need a `baseURL` override; `playwright.config.ts` already points at the live site, no local server to start.
- **Flaky `#order-confirmation` failures** → known, environmental (documented in `docs/scenarios/customer-invoices.md`), not CI-specific — don't chase this here.
- **Firefox/WebKit-only failures** → note whether the 3 browser projects behave differently in CI vs. local; CI runners may need more time — check `retries: 2` (already set for CI) is actually kicking in.

## Step 7 — Branch protection (optional, do after a few green runs)

- [ ] Require the Playwright Tests check to pass before merging to `main`, once there's a PR workflow in place.

## Done criteria

CI is "done" when: a push to `main` triggers a run, the run passes with real credentials from secrets (not just installs successfully), and a failing test would visibly fail the run — not just get swallowed.
