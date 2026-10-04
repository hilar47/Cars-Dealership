import React, { useState } from "react";
import Header from "../Header/Header";

const Login = () => {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const login = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("/djangoapp/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ userName, password }),
      });
      const json = await res.json();
      if (json.status === "Authenticated") {
        sessionStorage.setItem("username", json.userName);
        window.location.href = "/";
      } else {
        setError("The username or password is incorrect.");
      }
    } catch (err) {
      setError("Unable to reach the server. Please try again.");
    }
  };

  return (
    <div>
      <Header />
      <div className="page" style={{ maxWidth: 420 }}>
        <form className="card-panel" onSubmit={login}>
          <h3 className="mb-3">Login</h3>
          {error && <div className="alert alert-danger">{error}</div>}
          <div className="mb-3">
            <label className="form-label" htmlFor="username">Username</label>
            <input
              id="username"
              className="form-control"
              type="text"
              required
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              id="password"
              className="form-control"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button className="btn btn-primary w-100" type="submit">Login</button>
          <p className="mt-3 mb-0 text-center">
            New here? <a href="/register/">Create an account</a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
