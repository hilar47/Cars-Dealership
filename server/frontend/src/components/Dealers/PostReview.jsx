import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Header from "../Header/Header";

const PostReview = () => {
  const { id } = useParams();
  const [dealerName, setDealerName] = useState("");
  const [cars, setCars] = useState([]);
  const [review, setReview] = useState("");
  const [purchased, setPurchased] = useState(false);
  const [date, setDate] = useState("");
  const [car, setCar] = useState("");
  const [year, setYear] = useState("");
  const [error, setError] = useState("");
  const username = sessionStorage.getItem("username");

  useEffect(() => {
    fetch(`/djangoapp/dealer/${id}`)
      .then((res) => res.json())
      .then((json) => {
        const d = Array.isArray(json.dealer) ? json.dealer[0] : json.dealer;
        if (d) {
          setDealerName(d.full_name);
        }
      })
      .catch(() => {});
    fetch("/djangoapp/get_cars")
      .then((res) => res.json())
      .then((json) => setCars(json.CarModels || []))
      .catch(() => {});
  }, [id]);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!username) {
      setError("Please log in to post a review.");
      return;
    }
    const [carMake, carModel] = car ? car.split("|") : ["", ""];
    const payload = {
      name: username,
      dealership: parseInt(id, 10),
      review,
      purchase: purchased,
      purchase_date: purchased ? date : "",
      car_make: purchased ? carMake : "",
      car_model: purchased ? carModel : "",
      car_year: purchased && year ? parseInt(year, 10) : null,
    };
    try {
      const res = await fetch("/djangoapp/add_review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.status === 200) {
        window.location.href = `/dealer/${id}`;
      } else {
        setError(json.message || "Could not post the review.");
      }
    } catch (err) {
      setError("Unable to reach the server. Please try again.");
    }
  };

  return (
    <div>
      <Header />
      <div className="page" style={{ maxWidth: 720 }}>
        <form className="card-panel" onSubmit={submit}>
          <h3 className="mb-3">{dealerName || `Dealer ${id}`}</h3>
          {error && <div className="alert alert-danger">{error}</div>}
          <div className="mb-3">
            <label className="form-label" htmlFor="review">Write your review</label>
            <textarea
              id="review"
              className="form-control"
              rows="5"
              required
              value={review}
              onChange={(e) => setReview(e.target.value)}
            />
          </div>
          <div className="form-check mb-3">
            <input
              id="purchased"
              className="form-check-input"
              type="checkbox"
              checked={purchased}
              onChange={(e) => setPurchased(e.target.checked)}
            />
            <label className="form-check-label" htmlFor="purchased">
              I purchased a car from this dealer
            </label>
          </div>
          {purchased && (
            <>
              <div className="mb-3">
                <label className="form-label" htmlFor="date">Purchase date</label>
                <input
                  id="date"
                  className="form-control"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <label className="form-label" htmlFor="car">Car make and model</label>
                <select
                  id="car"
                  className="form-select"
                  value={car}
                  onChange={(e) => setCar(e.target.value)}
                >
                  <option value="" disabled>Choose car make and model</option>
                  {cars.map((c) => (
                    <option key={`${c.CarMake}|${c.CarModel}`} value={`${c.CarMake}|${c.CarModel}`}>
                      {c.CarMake} {c.CarModel}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label" htmlFor="year">Car year</label>
                <input
                  id="year"
                  className="form-control"
                  type="number"
                  min="2010"
                  max="2030"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                />
              </div>
            </>
          )}
          <button className="btn btn-primary" type="submit">Post Review</button>
        </form>
      </div>
    </div>
  );
};

export default PostReview;
