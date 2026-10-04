# Best Cars Dealership

**Project name:** Best Cars Dealership – Full Stack Capstone
**Repository:** `Cars-Dealership`
**Role:** Full-stack developer for *Best Cars*, a national U.S. car retailer.

A responsive web application where users can browse dealerships (filter by state), read reviews with
sentiment analysis, and – after signing up and logging in – post their own review.

## Tech stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router, Bootstrap 5, static HTML pages (About / Contact) |
| App server | Django 5 (auth, admin, REST-style JSON proxy), SQLite, Gunicorn, WhiteNoise |
| Dealer/review API | Node.js + Express + MongoDB (Mongoose) |
| Sentiment analysis | Flask microservice using NLTK VADER |
| DevOps | Docker, Kubernetes, IBM Cloud Code Engine, GitHub Actions (CI) |

## Architecture

```
Browser ──► Django (8000) ──► Express + MongoDB (3030)   dealers & reviews
                │
                └──────────► Flask sentiment service (5050)
```

## Repository layout

```
.github/workflows/main.yml        CI: flake8, jshint, Django tests, React build, Docker build
docker-compose.yml                Run the full stack locally
scripts/generate_task_outputs.sh  Produces the cURL/terminal evidence files
TASKS.md                          Checklist mapping each assignment task to a file / command
server/
  manage.py, requirements.txt, Dockerfile, deployment.yaml
  djangoproj/                     Django project (settings, urls)
  djangoapp/                      Models, views, REST helpers, admin, tests
    microservices/                Flask sentiment analyzer (+ Dockerfile)
  database/                       Express + Mongo API, seed data (dealerships.json, reviews.json)
  frontend/
    static/About.html, Contact.html, style.css
    src/components/               Login, Register, Dealers, Dealer, PostReview, Header
```

## Run locally (no Docker)

```bash
# 1. Mongo + Express API  (needs a MongoDB on localhost:27017)
cd server/database && npm install && node app.js            # http://localhost:3030

# 2. Sentiment service
cd server/djangoapp/microservices && pip install -r requirements.txt && python app.py   # :5050

# 3. React build + Django
cd server/frontend && npm install && npm run build
cd .. && python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser --username root --email root@example.com
python manage.py runserver                                   # http://localhost:8000
```

## Run everything with Docker

```bash
docker compose up --build
docker compose exec dealership python manage.py createsuperuser --username root
```

## Main endpoints (Django, port 8000)

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/djangoapp/login` | Log in (`{"userName","password"}`) |
| GET | `/djangoapp/logout` | Log out |
| POST | `/djangoapp/register` | Sign up |
| GET | `/djangoapp/get_cars` | All car makes and models |
| GET | `/djangoapp/get_dealers` / `/djangoapp/get_dealers/<state>` | Dealers (optionally by state) |
| GET | `/djangoapp/dealer/<id>` | Dealer details |
| GET | `/djangoapp/reviews/dealer/<id>` | Reviews with sentiment |
| POST | `/djangoapp/add_review` | Post a review (login required) |

Sentiment service: `GET http://localhost:5050/analyze/<text>`.

Pages: `/` (dealers), `/dealers?state=Kansas`, `/dealer/<id>`, `/postreview/<id>`, `/login/`, `/register/`,
`/about/`, `/contact/`, `/admin/`.

## Deployment

See `TASKS.md` (Tasks 23–28) for the GitHub Actions and IBM Cloud Code Engine / Kubernetes steps.

## Environment variables

| Variable | Default | Used by |
|----------|---------|---------|
| `backend_url` | `http://localhost:3030` | Django → Express API |
| `sentiment_analyzer_url` | `http://localhost:5050` | Django → sentiment service |
| `DJANGO_SECRET_KEY` | dev key | Django (set a real one in production) |
| `DJANGO_DEBUG` | `True` (`False` in Docker image) | Django |
| `DJANGO_ALLOWED_HOSTS` | `*` | Django |
| `CSRF_TRUSTED_ORIGINS` | – | Django behind HTTPS proxies |
| `MONGO_URL` | `mongodb://localhost:27017` | Express API |
