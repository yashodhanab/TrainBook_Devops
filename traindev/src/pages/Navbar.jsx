import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => setOpen(!open);

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="nav-left">
        <Link to="/" className="brand">
          TrainBook
        </Link>
      </div>

      <div className={`nav-right ${open ? "open" : ""}`}>
        <Link to="/" className={isActive("/") ? "active" : ""}>
          Home
        </Link>
        <Link to="/login" className={isActive("/login") ? "active" : ""}>
          Login
        </Link>
        <Link to="/about" className={isActive("/about") ? "active" : ""}>
          About
        </Link>
        <Link to="/contact" className={isActive("/contact") ? "active" : ""}>
          Contact
        </Link>
      </div>

      <div className="hamburger" onClick={toggleMenu}>
        <div className="bar"></div>
        <div className="bar"></div>
        <div className="bar"></div>
      </div>
    </nav>
  );
}
