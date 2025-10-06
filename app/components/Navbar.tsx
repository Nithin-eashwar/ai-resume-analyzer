import React from "react";
import { Link } from "react-router";

const Navbar = () => {
  return (
    <nav className="navbar">
      <Link to="/">RESUMIND</Link>
      <Link to="/upload" className="primary-button w-fit">
        Upload Resume
      </Link>
    </nav>
  );
};

export default Navbar;
