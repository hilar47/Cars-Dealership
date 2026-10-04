#!/usr/bin/env bash
# Generates the evidence files for the cURL / terminal tasks into ./submission
#
# Prerequisites (all running): MongoDB + Express API (:3030), sentiment service (:5050),
# and a Django user you can log in with (e.g. the `root` superuser).
#
#   TEST_USER=root TEST_PASS='your-password' ./scripts/generate_task_outputs.sh
#
# The password is used for the request but is masked in the saved files.
set -u

BASE="${BASE_URL:-http://localhost:8000}"
SENT="${SENTIMENT_URL:-http://localhost:5050}"
OUT="${OUT_DIR:-submission}"
USER_NAME="${TEST_USER:?Set TEST_USER}"
PASS="${TEST_PASS:?Set TEST_PASS}"
DEALER_ID="${DEALER_ID:-15}"
JAR="$OUT/cookies.txt"

mkdir -p "$OUT"
rm -f "$JAR"

# save <file> <displayed command> <actual command>
save() {
  local file="$1" shown="$2" actual="$3"
  {
    echo "\$ $shown"
    eval "$actual"
    echo
  } > "$OUT/$file" 2>&1
  echo "wrote $OUT/$file"
}

# Task 2: Django server output
if [ "${START_SERVER:-1}" = "1" ]; then
  (cd server && python manage.py runserver 8000 --noreload > "../$OUT/django_server" 2>&1 &
   echo $! > "../$OUT/.server_pid")
  sleep 5
fi

# Task 5: login
save loginuser \
  "curl -s -X POST $BASE/djangoapp/login -H 'Content-Type: application/json' -d '{\"userName\":\"$USER_NAME\",\"password\":\"********\"}'" \
  "curl -s -c '$JAR' -X POST '$BASE/djangoapp/login' -H 'Content-Type: application/json' -d '{\"userName\":\"$USER_NAME\",\"password\":\"$PASS\"}'"

# Task 6: logout (uses the session cookie from the login above)
save logoutuser \
  "curl -s -b cookies.txt $BASE/djangoapp/logout" \
  "curl -s -b '$JAR' '$BASE/djangoapp/logout'"

# Task 8: reviews for a dealer
save getdealerreviews "curl -s $BASE/djangoapp/reviews/dealer/$DEALER_ID" "curl -s '$BASE/djangoapp/reviews/dealer/$DEALER_ID'"
# Task 9: all dealers
save getalldealers "curl -s $BASE/djangoapp/get_dealers" "curl -s '$BASE/djangoapp/get_dealers'"
# Task 10: dealer by id
save getdealerbyid "curl -s $BASE/djangoapp/dealer/$DEALER_ID" "curl -s '$BASE/djangoapp/dealer/$DEALER_ID'"
# Task 11: dealers in Kansas
save getdealersbyState "curl -s $BASE/djangoapp/get_dealers/Kansas" "curl -s '$BASE/djangoapp/get_dealers/Kansas'"
# Tasks 14 & 15: car makes and models
save getallcarmakes "curl -s $BASE/djangoapp/get_cars" "curl -s '$BASE/djangoapp/get_cars'"
# Task 16: sentiment analysis
save analyzereview "curl -s $SENT/analyze/Fantastic%20services" "curl -s '$SENT/analyze/Fantastic%20services'"

rm -f "$JAR"
if [ -f "$OUT/.server_pid" ]; then kill "$(cat "$OUT/.server_pid")" 2>/dev/null; rm -f "$OUT/.server_pid"; fi
echo "Done. Review the files in $OUT/ before submitting."
