"""Helpers that talk to the Express/Mongo backend and the sentiment microservice."""
import logging
import os
from urllib.parse import quote

import requests

logger = logging.getLogger(__name__)

TIMEOUT = 10


def backend_url():
    return os.environ.get("backend_url", "http://localhost:3030").rstrip("/")


def sentiment_analyzer_url():
    return os.environ.get("sentiment_analyzer_url", "http://localhost:5050").rstrip("/")


def get_request(endpoint, **kwargs):
    """GET <backend_url><endpoint>; returns parsed JSON or None on failure."""
    try:
        response = requests.get(backend_url() + endpoint, params=kwargs, timeout=TIMEOUT)
        response.raise_for_status()
        return response.json()
    except (requests.RequestException, ValueError):
        logger.exception("GET %s failed", endpoint)
        return None


def analyze_review_sentiments(text):
    """Return {"sentiment": "positive|neutral|negative"}; falls back to neutral on error."""
    url = sentiment_analyzer_url() + "/analyze/" + quote(text, safe="")
    try:
        response = requests.get(url, timeout=TIMEOUT)
        response.raise_for_status()
        return response.json()
    except (requests.RequestException, ValueError):
        logger.exception("Sentiment analysis failed")
        return {"sentiment": "neutral"}


def post_review(data_dict):
    """POST a review to the backend; returns parsed JSON or None on failure."""
    try:
        response = requests.post(backend_url() + "/insert_review", json=data_dict, timeout=TIMEOUT)
        response.raise_for_status()
        return response.json()
    except (requests.RequestException, ValueError):
        logger.exception("POST /insert_review failed")
        return None
