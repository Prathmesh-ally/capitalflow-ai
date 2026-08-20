import React from 'react';

export default function Navbar() {
  return (
        <nav className="navbar navbar-dark mb-4 py-3 shadow-sm">
        <div className="container d-flex justify-content-between align-items-center">
            
            {/* Left Side: Brand Logo */}
            <span className="navbar-brand mb-0 h1 fw-bold fs-4">
            CapitalFlow AI <span className="text-primary">Agent</span>
            </span>

            {/* Right Side: Status Badge */}
            <span className="badge bg-success px-3 py-2 rounded-pill shadow-sm fs-6">
            System Online
            </span>

        </div>
        </nav>
  );
}