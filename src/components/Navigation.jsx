import React from 'react';
import { Link } from 'react-router-dom';

const Navigation = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#E14E68] shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
                <img
                    src="https://diosamuel.github.io/Frame%2055(1).png"
                    className="px-3 py-1 bg-white w-32 rounded-full"
                    alt="Logo"
                />
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/"
                className="border-transparent text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Map
              </Link>
              <Link
                to="/about"
                className="border-transparent text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                About
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation; 