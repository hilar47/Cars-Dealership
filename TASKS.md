# Assignment checklist (Tasks 1–28)

Code for every feature is in this repo. Items marked **[you]** need evidence only your machine/accounts can produce
(screenshots, terminal output, your deployment). Save evidence in a `submission/` folder using the exact file names below.

## One-time setup
```bash
docker compose up --build -d                    # Mongo, Express API, sentiment service, Django
docker compose exec dealership python manage.py createsuperuser --username root --email root@example.com
```
(or follow "Run locally" in README.md). Open http://localhost:8000.

## Code tasks (already in the repo)
| Task | What | Where |
|------|------|-------|
| 1 | README with project name | `README.md` → GitHub URL `https://github.com/hilar47/Cars-Dealership/blob/main/README.md` |
| 3 | About Us page | `server/frontend/static/About.html` (CSS links, portraits, names, roles, details, emails) |
| 4 | Contact Us page | `server/frontend/static/Contact.html` (navbar active on *Contact Us*) |
| 7 | Sign-up page | `server/frontend/src/components/Register/Register.jsx` (5 fields + Register button) |

Submit the public GitHub URL of each file, e.g.
`https://github.com/hilar47/Cars-Dealership/blob/main/server/frontend/static/About.html`
(change `main` if your default branch differs).

## Terminal / cURL evidence (Tasks 2, 5, 6, 8–11, 14–16)
With everything running:
```bash
TEST_USER=root TEST_PASS='<root password>' ./scripts/generate_task_outputs.sh
```
This writes `submission/django_server`, `loginuser`, `logoutuser`, `getdealerreviews`, `getalldealers`,
`getdealerbyid`, `getdealersbyState` (Kansas), `getallcarmakes`, `analyzereview` ("Fantastic services").
If you already have `python manage.py runserver` running, use `START_SERVER=0` and copy that terminal output into
`submission/django_server` yourself. Open each file and check it before pasting.

## Screenshots **[you]**
| Task | File | How |
|------|------|-----|
| 12 | `admin_login.png` | http://localhost:8000/admin/ – log in as `root` and capture the admin home page |
| 13 | `admin_logout.png` | Log out of admin and capture the "Logged out" page |
| 17 | `get_dealers.png` | http://localhost:8000/ before logging in |
| 18 | `get_dealers_loggedin.png` | After login at `/login/`: shows username, **Review Dealer** column and address bar |
| 19 | `dealersbystate.png` | http://localhost:8000/dealers?state=Kansas (address bar visible) |
| 20 | `dealer_id_reviews.png` | e.g. http://localhost:8000/dealer/1 with its reviews (address bar visible) |
| 21 | `dealership_review_submission.png` | `/postreview/1` with the form filled in, before clicking *Post Review* |
| 22 | `added_review.png` | Dealer page after submitting, showing your new review |

## CI/CD **[you]** (Task 23)
1. Push the repo to GitHub (see below). The workflow `.github/workflows/main.yml` runs automatically.
2. Open the **Actions** tab, wait for a green run, then either copy the log text of each job into a file named
   `CICD`, or with the GitHub CLI: `gh run view --log > submission/CICD`.

## Deployment **[you]** (Tasks 24–28)
Pick one target.

**IBM Cloud Code Engine**
```bash
ibmcloud login --sso && ibmcloud target -g <resource-group>
ibmcloud ce project create --name dealership      # or: ibmcloud ce project select --name <existing>
# Build/push images (Container Registry) or use `ibmcloud ce build`; then:
ibmcloud ce application create --name sentiment   --image us.icr.io/<ns>/sentiment-analyzer:latest --port 5050
ibmcloud ce application create --name dealer-db   --image us.icr.io/<ns>/dealership-database:latest --port 3030 \
    --env MONGO_URL=<your mongo url>
ibmcloud ce application create --name dealership  --image us.icr.io/<ns>/dealership:latest --port 8000 \
    --env backend_url=https://<dealer-db url> --env sentiment_analyzer_url=https://<sentiment url> \
    --env DJANGO_SECRET_KEY=<secret> --env CSRF_TRUSTED_ORIGINS=https://<dealership url>
```
**Kubernetes** – edit the image names in `server/deployment.yaml`, then
`kubectl create secret generic dealership-secrets --from-literal=django-secret-key=<secret>` and
`kubectl apply -f server/deployment.yaml`.

Then:
- Task 24: put the public URL of the deployed app in a file named `deploymentURL`.
- Tasks 25–28: screenshots `deployed_landingpage`, `deployed_loggedin` (username visible), `deployed_dealer_detail`,
  `deployed_add_review`, taken from the deployed URL.

## Pushing this project to your repo
```bash
unzip Cars-Dealership.zip && cd Cars-Dealership
git init && git branch -M main
git remote add origin https://github.com/hilar47/Cars-Dealership.git
git add . && git commit -m "Cars Dealership full-stack capstone"
git push -u origin main
```
