import React from "react";

const Header = () => {
  const username = sessionStorage.getItem("username");

  const logout = async () => {
    try {
      await fetch("/djangoapp/logout", { credentials: "same-origin" });
    } finally {
      sessionStorage.removeItem("username");
      window.location.href = "/";
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-3">
      <a className="navbar-brand fw-bold" href="/">
        Best Cars
      </a>
      <ul className="navbar-nav me-auto flex-row gap-3">
        <li className="nav-item">
          <a className="nav-link active" href="/">Home</a>
        </li>
        <li className="nav-item">
          <a className="nav-link" href="/about/">About Us</a>
        </li>
        <li className="nav-item">
          <a className="nav-link" href="/contact/">Contact Us</a>
        </li>
      </ul>
      <div className="d-flex align-items-center gap-3">
        {username ? (
          <>
            <span className="text-white fw-semibold" data-testid="logged-in-user">
              {username}
            </span>
            <button className="btn btn-outline-light btn-sm" onClick={logout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <a className="btn btn-outline-light btn-sm" href="/login/">Login</a>
            <a className="btn btn-primary btn-sm" href="/register/">Register</a>
          </>
        )}
      </div>
    </nav>
  );
};

export default Header;
