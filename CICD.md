# Recipe Sharing testing and deployment

The pipeline tests the API and React frontend, builds both Docker images, and then uses the existing Cloud Build configuration to deploy to Cloud Run. The deployment job requires both earlier jobs to succeed. Pull requests and the `unit10-cicd` feature branch do not deploy; pushes to `main` or `cloud-run-deployment` do.

## Run checks locally

```bash
npm ci --prefix backend
npm ci --prefix frontend
npm test --prefix backend -- --runInBand
npm test --prefix frontend
npm run build --prefix frontend
```

The supplied backend API tests are from [COMPSVIII Assignment7](https://github.com/RizeComputerScience/COMPSVIII-Assignment7). They cover listing, creating, retrieving and deleting recipes, invalid input, missing records, and health status. Tests use a separate in-memory SQLite database, wait for its sample data, and close it afterward. The production server continues to use the existing SQLite file. Cloud Run's container filesystem remains temporary; this assignment does not add durable cloud database storage.

The supplied frontend utility tests are retained. Two additional component tests render the actual app, load recipes, submit a new recipe, and verify the refreshed list. The supplied test setup file is enabled and its Testing Library dependencies are installed. Lockfiles make `npm ci` reproducible.

## Configure deployment authentication

Repository Settings → Secrets and variables → Actions → New repository secret:

| Secret | Value |
| --- | --- |
| `GCP_SA_KEY` | The complete JSON key of the dedicated deployment service account, entered only in GitHub Secrets |
| `GCP_PROJECT_ID` | `recipe-sharing-513502` |
| `GCP_REGION` | `us-central1` |

The project and region also have these defaults in the workflow. Authentication has no default. Never commit a service-account key. `.gitignore` and `.gcloudignore` exclude the temporary credential file created by the authentication action.

Use the course's GCP Deployment Authentication Setup resource for service-account creation and permissions. The GitHub deployment identity submits and monitors Cloud Build jobs and uploads their source. The Cloud Build execution identity builds/pushes Artifact Registry images and deploys the two Cloud Run services, including permission to use their runtime service account. Grant only the roles these operations require; do not grant Owner. The existing Artifact Registry repository is `us-central1/recipe-images`.

After configuring authentication, merge into `cloud-run-deployment` to trigger deployment. Existing Cloud Build triggers should remain manual: an independent push trigger could deploy without waiting for GitHub tests. The workflow builds images for validation, then Cloud Build rebuilds the same checked-out source to push and deploy with its own build ID.

## Demonstrate a failed test

The intentional failure changes the health test's expected HTTP status from 200 to 503 on `unit10-cicd`. The server is not changed. The backend test must fail, and the dependent build and deployment jobs must be skipped. Restore the expected status to 200 in a new commit. Keep the failed run in Actions as evidence; never change its status or screenshot.

## Notifications

In GitHub Settings → Notifications → Actions, enable Email and save. Leave “Only notify for failed workflows” unchecked to receive completion notices for successes and failures. Watch this repository's Actions activity. These are account settings and must be verified in the signed-in GitHub account.

## Deployment URLs

- Frontend: https://recipe-frontend-140340177725.us-central1.run.app
- Backend: https://recipe-backend-140340177725.us-central1.run.app/api/recipes

## Documentation

- [GitHub job dependencies](https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/use-jobs)
- [Google Cloud authentication action](https://github.com/google-github-actions/auth)
- [GitHub Actions notification settings](https://docs.github.com/en/subscriptions-and-notifications/how-tos/managing-github-actions-notifications)
- [Jenkins administration](https://www.jenkins.io/doc/book/managing/)
