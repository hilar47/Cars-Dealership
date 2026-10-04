import json
import logging
from urllib.parse import quote

from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

from .models import CarMake, CarModel
from .populate import initiate
from .restapis import analyze_review_sentiments, get_request, post_review

logger = logging.getLogger(__name__)


def _json_body(request):
    try:
        data = json.loads(request.body)
    except (ValueError, TypeError):
        return None
    return data if isinstance(data, dict) else None


@csrf_exempt
def login_user(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST required"}, status=405)
    data = _json_body(request)
    if data is None:
        return JsonResponse({"error": "Invalid JSON body"}, status=400)
    username = data.get("userName")
    password = data.get("password")
    user = authenticate(username=username, password=password)
    if user is None:
        return JsonResponse({"userName": username, "status": "Failed"}, status=401)
    login(request, user)
    return JsonResponse({"userName": username, "status": "Authenticated"})


def logout_request(request):
    logout(request)
    return JsonResponse({"userName": ""})


@csrf_exempt
def registration(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST required"}, status=405)
    data = _json_body(request)
    if data is None:
        return JsonResponse({"error": "Invalid JSON body"}, status=400)
    username = data.get("userName")
    password = data.get("password")
    first_name = data.get("firstName", "")
    last_name = data.get("lastName", "")
    email = data.get("email", "")
    if not username or not password:
        return JsonResponse({"error": "userName and password are required"}, status=400)
    if User.objects.filter(username=username).exists():
        return JsonResponse({"userName": username, "error": "Already Registered"}, status=409)
    user = User.objects.create_user(
        username=username,
        password=password,
        first_name=first_name,
        last_name=last_name,
        email=email,
    )
    login(request, user)
    return JsonResponse({"userName": username, "status": "Authenticated"})


def get_cars(request):
    if not CarMake.objects.exists():
        initiate()
    cars = [
        {"CarModel": car.name, "CarMake": car.car_make.name}
        for car in CarModel.objects.select_related("car_make").order_by("car_make__name", "name")
    ]
    return JsonResponse({"CarModels": cars})


def get_dealerships(request, state="All"):
    endpoint = "/fetchDealers" if state == "All" else "/fetchDealers/" + quote(state, safe="")
    dealerships = get_request(endpoint)
    if dealerships is None:
        return JsonResponse({"status": 502, "message": "Dealer service unavailable"}, status=502)
    return JsonResponse({"status": 200, "dealers": dealerships})


def get_dealer_details(request, dealer_id):
    dealer = get_request(f"/fetchDealer/{dealer_id}")
    if dealer is None:
        return JsonResponse({"status": 502, "message": "Dealer service unavailable"}, status=502)
    return JsonResponse({"status": 200, "dealer": dealer})


def get_dealer_reviews(request, dealer_id):
    reviews = get_request(f"/fetchReviews/dealer/{dealer_id}")
    if reviews is None:
        return JsonResponse({"status": 502, "message": "Review service unavailable"}, status=502)
    for review in reviews:
        sentiment = analyze_review_sentiments(review.get("review", ""))
        review["sentiment"] = sentiment.get("sentiment", "neutral")
    return JsonResponse({"status": 200, "reviews": reviews})


@csrf_exempt
def add_review(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST required"}, status=405)
    if request.user.is_anonymous:
        return JsonResponse({"status": 403, "message": "Unauthorized"}, status=403)
    data = _json_body(request)
    if data is None:
        return JsonResponse({"status": 400, "message": "Invalid JSON body"}, status=400)
    response = post_review(data)
    if response is None:
        return JsonResponse({"status": 502, "message": "Error in posting review"}, status=502)
    return JsonResponse({"status": 200, "review": response})
