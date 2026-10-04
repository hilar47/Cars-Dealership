import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "../Header/Header";

const Dealers = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedState = searchParams.get("state") || "All";
  const [dealers, setDealers] = useState([]);
  const [states, setStates] = useState([]);
  const [error, setError] = useState("");
  const loggedIn = Boolean(sessionStorage.getItem("username"));

  // Load all dealers once to build the list of states
  useEffect(() => {
    fetch("/djangoapp/get_dealers")
      .then((res) => res.json())
      .then((json) => {
        if (json.status === 200) {
          setStates([...new Set(json.dealers.map((d) => d.state))].sort());
        }
      })
      .catch(() => {});
  }, []);

  // Load dealers for the selected state
  useEffect(() => {
    const url =
      selectedState === "All"
        ? "/djangoapp/get_dealers"
        : `/djangoapp/get_dealers/${encodeURIComponent(selectedState)}`;
    setError("");
    fetch(url)
      .then((res) => res.json())
      .then((json) => {
        if (json.status === 200) {
          setDealers(json.dealers);
        } else {
          setError("Could not load dealers.");
        }
      })
      .catch(() => setError("Could not load dealers."));
  }, [selectedState]);

  const onStateChange = (e) => {
    const value = e.target.value;
    setSearchParams(value === "All" ? {} : { state: value });
  };

  return (
    <div>
      <Header />
      <div className="page">
        <div className="card-panel">
          <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
            <h3 className="m-0">Dealerships</h3>
            <select
              className="form-select w-auto"
              value={selectedState}
              onChange={onStateChange}
              aria-label="Filter by state"
            >
              <option value="All">All States</option>
              {states.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          {error && <div className="alert alert-danger">{error}</div>}
          <div className="table-responsive">
            <table className="table table-striped align-middle">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Dealer Name</th>
                  <th>City</th>
                  <th>Address</th>
                  <th>Zip</th>
                  <th>State</th>
                  {loggedIn && <th>Review Dealer</th>}
                </tr>
              </thead>
              <tbody>
                {dealers.map((d) => (
                  <tr key={d.id}>
                    <td>{d.id}</td>
                    <td><a href={`/dealer/${d.id}`}>{d.full_name}</a></td>
                    <td>{d.city}</td>
                    <td>{d.address}</td>
                    <td>{d.zip}</td>
                    <td>{d.state}</td>
                    {loggedIn && (
                      <td>
                        <a className="btn btn-sm btn-outline-primary" href={`/postreview/${d.id}`}>
                          Review Dealer
                        </a>
                      </td>
                    )}
                  </tr>
                ))}
                {dealers.length === 0 && !error && (
                  <tr><td colSpan={loggedIn ? 7 : 6}>No dealerships found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dealers;
