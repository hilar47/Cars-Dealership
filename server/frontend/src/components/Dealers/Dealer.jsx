import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Header from "../Header/Header";

const SENTIMENT_EMOJI = { positive: "😊", neutral: "😐", negative: "☹️" };

const Dealer = () => {
  const { id } = useParams();
  const [dealer, setDealer] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState("");
  const loggedIn = Boolean(sessionStorage.getItem("username"));

  useEffect(() => {
    fetch(`/djangoapp/dealer/${id}`)
      .then((res) => res.json())
      .then((json) => {
        const d = Array.isArray(json.dealer) ? json.dealer[0] : json.dealer;
        if (json.status === 200 && d) {
          setDealer(d);
        } else {
          setError("Dealer not found.");
        }
      })
      .catch(() => setError("Could not load dealer."));

    fetch(`/djangoapp/reviews/dealer/${id}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.status === 200) {
          setReviews(json.reviews);
        }
      })
      .catch(() => {});
  }, [id]);

  return (
    <div>
      <Header />
      <div className="page">
        {error && <div className="alert alert-danger">{error}</div>}
        {dealer && (
          <div className="card-panel mb-4">
            <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
              <div>
                <h2>{dealer.full_name}</h2>
                <p className="text-muted mb-0">
                  {dealer.address}, {dealer.city}, {dealer.state} {dealer.zip}
                </p>
              </div>
              {loggedIn && (
                <a className="btn btn-primary" href={`/postreview/${dealer.id}`}>
                  Post Review
                </a>
              )}
            </div>
          </div>
        )}
        <h4 className="mb-3">Reviews</h4>
        {reviews.length === 0 && !error && <p>No reviews yet.</p>}
        {reviews.map((r) => (
          <div key={r.id} className={`card-panel review-card mb-3 ${r.sentiment}`}>
            <div className="d-flex justify-content-between">
              <strong>{r.name}</strong>
              <span title={r.sentiment}>
                {SENTIMENT_EMOJI[r.sentiment] || SENTIMENT_EMOJI.neutral} {r.sentiment}
              </span>
            </div>
            <p className="my-2">{r.review}</p>
            {r.car_make && (
              <small className="text-muted">
                {r.car_make} {r.car_model} {r.car_year}
              </small>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dealer;
