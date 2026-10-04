# ---- Stage 1: build the React frontend ----
FROM node:18-alpine AS frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# ---- Stage 2: Django application ----
FROM python:3.12-slim
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    DJANGO_DEBUG=False
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . /app
COPY --from=frontend /app/frontend/build /app/frontend/build
RUN python manage.py collectstatic --noinput
EXPOSE 8000
CMD ["/bin/bash", "/app/entrypoint.sh"]
