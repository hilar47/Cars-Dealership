import React, { useState } from "react";
import Header from "../Header/Header";

const Register = () => {
  const [userName, setUserName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const register = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("/djangoapp/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ userName, password, firstName, lastName, email }),
      });
      const json = await res.json();
      if (json.status === "Authenticated") {
        sessionStorage.setItem("username", json.userName);
        window.location.href = "/";
      } else {
        setError(json.error || "Registration failed.");
      }
    } catch (err) {
      setError("Unable to reach the server. Please try again.");
    }
  };

  return (
    <div>
      <Header />
      <div className="page" style={{ maxWidth: 480 }}>
        <form className="card-panel" onSubmit={register}>
          <h3 className="mb-3">Sign Up</h3>
          {error && <div className="alert alert-danger">{error}</div>}
          <div className="mb-3">
            <label className="form-label" htmlFor="userName">Username</label>
            <input
              id="userName"
              name="userName"
              className="form-control"
              type="text"
              placeholder="Username"
              required
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label className="form-label" htmlFor="firstName">First Name</label>
            <input
              id="firstName"
              name="firstName"
              className="form-control"
              type="text"
              placeholder="First Name"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label className="form-label" htmlFor="lastName">Last Name</label>
            <input
              id="lastName"
              name="lastName"
              className="form-control"
              type="text"
              placeholder="Last Name"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label className="form-label" htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              className="form-control"
              type="email"
              placeholder="name@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              className="form-control"
              type="password"
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button className="btn btn-primary w-100" type="submit">Register</button>
          <p className="mt-3 mb-0 text-center">
            Already registered? <a href="/login/">Login</a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;
