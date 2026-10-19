# Recipe Sharing App: Docker setup

Based on RizeComputerScience/COMPSVIII-Assignment5, commit 3fe0784bbecbf9af4ea676a8b39b0aad2740e2df.

## Start the complete app

Open Docker Desktop, then open a terminal in this project folder:

```bash
docker compose up --build
```

Open http://localhost:3000 for the frontend and http://localhost:5000/api/recipes for the API. Port 8080 mentioned in the assignment is inconsistent with the starter backend, which uses 5000.

## Verify persistence

Add a recipe in the browser. In another terminal in the same folder:

```bash
docker compose down
docker compose up -d
```

Refresh the browser and verify that the recipe remains. The recipe_data volume preserves /app/data/recipes.db across container recreation. Do not use `down -v` if you want to retain recipes.

## Test individual images

Run the following from the project root. Stop the Compose services first so ports are available.

```bash
docker compose down
docker build -t recipe-backend ./backend
docker build -t recipe-frontend ./frontend
```

In one terminal:

```bash
docker run --rm -p 5000:5000 recipe-backend
```

In a second terminal:

```bash
docker run --rm -p 3000:80 recipe-frontend
```

Press Ctrl+C in each terminal when finished. Individual containers above are temporary; use Compose to test persistent storage.

## Changes

- Added both Dockerfiles, Compose configuration, and Docker ignore files.
- Moved the database into data/recipes.db and created that directory for local execution as well as Docker.
- Passed VITE_API_URL during the Vite build. The frontend environment entry is also retained to match the assignment, but nginx does not rebuild JavaScript at runtime.
- Corrected vite.congif.js to vite.config.js.
- Retained Node 18 and Compose version 3.8 as requested by the assignment. Recent Compose versions may warn that the version field is obsolete.

## Verification status

JavaScript syntax and configuration were checked. Docker builds, browser operation, and volume persistence must still be verified on a machine running Docker.

## Submit

Commit these files to your own GitHub copy and submit its repository URL. Retain the starter LICENSE.

