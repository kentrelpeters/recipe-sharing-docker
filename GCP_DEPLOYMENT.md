# Deploy Recipe Sharing to Google Cloud Run

This is a classroom demo with a React frontend and an Express/SQLite backend.
The existing frontend Dockerfile already accepts VITE_API_URL before running the Vite build.
The existing backend listens on 0.0.0.0 and uses Cloud Run's PORT variable.

## 1. Prepare your Google Cloud project

Create or select your own project and complete billing/free-trial setup in Google Cloud.
Do not enter card information into GitHub or this repository.

Enable these APIs:
- Cloud Build (cloudbuild.googleapis.com)
- Cloud Run Admin (run.googleapis.com)
- Artifact Registry (artifactregistry.googleapis.com)
- Cloud Resource Manager (cloudresourcemanager.googleapis.com)

Container Registry has shut down. These files use Artifact Registry instead.
Google's gcr.io builder images still work; your own images go to pkg.dev.

Open Artifact Registry and create a repository:
- Name: recipe-images
- Format: Docker
- Mode: Standard
- Location type: Region
- Region: us-central1

## 2. Connect GitHub and set build permissions

Open Cloud Build > Repositories (or Triggers > Connect repository).
Connect kentrelpeters/recipe-sharing-docker through the offered GitHub connection flow.
Authorize access to this repository.

Choose the service account your build triggers will use. Do not assume its email address.
Give that build account:
- Cloud Run Admin on the project (deploy services and configure public access).
- Artifact Registry Writer on recipe-images.
- Logs Writer on the project.
- Service Account User on the runtime service account selected for Cloud Run.
Also ensure the account can read the source/staging bucket used by your build, if one is used.

The person creating/running triggers also needs permission to use the build service account.
Do not grant Owner or Editor simply to work around an error. Read the failed build's permission message.

## 3. Deploy the backend first

Create a manual Cloud Build trigger:
- Name: deploy-recipe-backend
- Repository: recipe-sharing-docker
- Build configuration: cloudbuild-backend.yaml
- Service account: the build account configured above.

Run it against the branch containing these files (main after merging this change).
Open Cloud Build > History to watch the build.
After it succeeds, open Cloud Run > recipe-backend and copy its service URL.

Open that URL with /api/health and then /api/recipes appended.
The first should return a healthy status; the second should return recipe JSON.
If public access fails, check the service's authentication settings and organization policy.

## 4. Deploy the frontend

Create a second manual trigger:
- Name: deploy-recipe-frontend
- Build configuration: cloudbuild-frontend.yaml
- Service account: the same configured build account.
- Substitution: _BACKEND_URL = your backend service URL.

Use only the backend origin, such as https://recipe-backend-EXAMPLE-uc.a.run.app.
Do not include /api/recipes or a trailing slash. The frontend adds the API path itself.
The build will stop with an explanation when this setting is missing or malformed.

Run the frontend trigger against the same branch.
Open Cloud Run > recipe-frontend and copy its service URL.
Verify the page loads, sample recipes appear, and you can add a recipe and refresh the page.
If you change the backend URL, update the trigger substitution and rebuild the frontend.
Vite stores this URL at build time; changing only the frontend runtime environment will not update it.

## 5. Monitoring and budget screenshot

Visit Cloud Run > each service > Metrics/Observability.
Load the site several times and inspect request count, latency, and container instances.
Metrics can take time to appear.

Open Billing > Budgets & alerts > Create budget.
- Name: Recipe Sharing class project.
- Scope: only this project.
- Period: Monthly.
- Choose a small amount you are comfortable monitoring, for example $5.
- Add actual-spend notifications at 50%, 90%, and 100%.
- Enable email notifications and verify the recipients.
- Consider the credits settings: including trial credits can hide gross resource usage.
Save and take a real screenshot showing the project, budget, and alert thresholds.
Crop out payment details or unrelated personal information before submitting.

An alerts-only budget is a notification, NOT a spending cap.
The instance limits in these files also do not guarantee zero charges.
Cloud Build, image storage, network traffic, and other services can have costs.
Review the account's current terms and usage, and delete demo resources when no longer needed.

## 6. Submit

- The actual recipe-frontend Cloud Run URL.
- Your real billing-budget screenshot.
- A 150–200 word reflection based on what you personally observed.
  Discuss cloud vs local setup, Cloud Run vs Docker Compose, and real-world advantages.
  Mention any actual errors or surprises rather than claiming steps you have not completed.

## Data limitation

This app stores SQLite in /app/data inside the backend container.
Docker Compose uses a named volume locally, but that volume does not transfer to Cloud Run.
On Cloud Run, saved recipes can disappear when an instance stops or is replaced.
Different instances/revisions can have separate data, even with a low instance limit.
The existing sample recipes are seeded into each new database.
Use this setup as a temporary class demonstration, not a durable production recipe service.
A production version needs an external persistent database and appropriate user authorization.

## Validation performed before cloud deployment

The build files were checked for YAML structure, matching image names, deployment ports,
and correct Vite build argument wiring against the repository source.
No cloud build, Docker image build, or deployment has been run from this environment.
Perform the live checks above before submitting.

## Official references

- https://docs.cloud.google.com/build/docs/deploying-builds/deploy-cloud-run
- https://docs.cloud.google.com/artifact-registry/docs/transition/transition-from-gcr
- https://docs.cloud.google.com/run/docs/container-contract
- https://docs.cloud.google.com/billing/docs/how-to/budgets
