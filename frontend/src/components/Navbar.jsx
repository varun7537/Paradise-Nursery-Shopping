import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Bell, Menu, X, ShoppingCart, ChevronDown, LogOut, User, Settings, Package } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useAuth } from '../context/Authcontext';
import { selectCartCount } from '../store/cartSlice';
const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [notificationCount] = useState(3);
  const dropdownRef = useRef(null);
  const hoverTimeoutRef = useRef(null);

  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const cartCount = useSelector(selectCartCount)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cleanup hover timeout on unmount
  useEffect(() => () => clearTimeout(hoverTimeoutRef.current), []);

  const handleMouseEnter = () => {
    clearTimeout(hoverTimeoutRef.current);
    setIsDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    // Small delay so moving between trigger and dropdown doesn't close it
    hoverTimeoutRef.current = setTimeout(() => setIsDropdownOpen(false), 150);
  };

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
    setIsMenuOpen(false);
    navigate('/login');
  };

  const navLinks = [
    { to: '/',          text: 'Home'       },
    { to: '/about',     text: 'About'      },
    { to: '/products',  text: 'Products'   },
    { to: '/contactus', text: 'Contact Us' },
  ];

  // Get initials for avatar fallback
  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <nav className="bg-green-600 text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">

          {/* ── Logo ─────────────────────────────────────────────────────── */}
          <NavLink to="/" className="flex items-center space-x-3" aria-label="Paradise Nursery Home">
            <img
              src="../images/paradise-nursery-logo.png"
              alt="Paradise Nursery Logo"
              className="w-12 h-12 rounded-full border-2 border-white object-cover"
            />
          </NavLink>

          {/* ── Desktop Nav Links ─────────────────────────────────────────── */}
          <div className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    isActive ? 'bg-green-800 text-white' : 'hover:bg-green-700'
                  }`
                }
              >
                {link.text}
              </NavLink>
            ))}
          </div>

          {/* ── Right Section ─────────────────────────────────────────────── */}
          <div className="flex items-center space-x-2">

            {/* Cart */}
            <NavLink
              to="/cart"
              className="hover:bg-green-700 p-2 rounded-full transition-colors relative"
              aria-label="Go to Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </NavLink>

            {/* Notifications */}
            <button
              className="hover:bg-green-700 p-2 rounded-full relative transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                  {notificationCount}
                </span>
              )}
            </button>

            {/* ── Auth: logged out → Login button ─────────────────────────── */}
            {!user ? (
              <NavLink
                to="/login"
                className="bg-white text-green-700 px-4 py-1.5 rounded-md text-sm font-semibold hover:bg-green-50 transition-colors duration-200"
                aria-label="Login"
              >
                Login
              </NavLink>
            ) : (
              /* ── Auth: logged in → Profile dropdown ───────────────────── */
              <div
                ref={dropdownRef}
                className="relative"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                {/* Avatar trigger button */}
                <button
                  onClick={() => setIsDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-2 bg-green-700 hover:bg-green-800 px-3 py-1.5 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-green-600"
                  aria-haspopup="true"
                  aria-expanded={isDropdownOpen}
                  aria-label="User menu"
                >
                  {/* Avatar circle with initials */}
                  <div className="w-7 h-7 rounded-full bg-white text-green-700 flex items-center justify-center text-xs font-bold select-none">
                    {getInitials(user.fullName)}
                  </div>
                  <span className="hidden sm:block text-sm font-medium max-w-[120px] truncate">
                    {user.fullName?.split(' ')[0] || 'Account'}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {/* Dropdown panel */}
                {isDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50"
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    role="menu"
                    aria-label="User menu options"
                  >
                    {/* User info header */}
                    <div className="px-4 py-3 bg-green-50 border-b border-green-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center text-sm font-bold shrink-0">
                          {getInitials(user.fullName)}
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {user.fullName || 'User'}
                          </p>
                          <p className="text-xs text-gray-500 truncate" title={user.email}>
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Menu items */}
                    <div className="py-1" role="none">
                      <NavLink
                        to="/profile"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        role="menuitem"
                      >
                        <User className="w-4 h-4 text-green-600" />
                        My Profile
                      </NavLink>

                      <NavLink
                        to="/orderhistory"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        role="menuitem"
                      >
                        <Package className="w-4 h-4 text-green-600" />
                        Order History
                      </NavLink>

                      {/* Show Admin Dashboard link only for admins */}
                      {(user.role === 'admin' || user.isAdmin) && (
                        <NavLink
                          to="/admindashboard"
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          role="menuitem"
                        >
                          <Settings className="w-4 h-4 text-green-600" />
                          Admin Dashboard
                        </NavLink>
                      )}

                      <div className="border-t border-gray-100 mt-1 pt-1">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          role="menuitem"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign out
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className="lg:hidden hover:bg-green-700 p-2 rounded-full transition-colors"
              aria-label="Toggle Mobile Menu"
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* ── Mobile Nav Menu ───────────────────────────────────────────────── */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-green-500 py-3 space-y-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `block px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${
                    isActive ? 'bg-green-800' : 'hover:bg-green-700'
                  }`
                }
                onClick={() => setIsMenuOpen(false)}
              >
                {link.text}
              </NavLink>
            ))}

            {/* Mobile auth section */}
            {user ? (
              <div className="mt-2 pt-2 border-t border-green-500 space-y-1">
                {/* User info row in mobile */}
                <div className="px-4 py-2 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white text-green-700 flex items-center justify-center text-xs font-bold">
                    {getInitials(user.fullName)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{user.fullName}</p>
                    <p className="text-xs text-green-200">{user.email}</p>
                  </div>
                </div>
                <NavLink to="/profile"      onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-4 py-2 rounded-md text-sm hover:bg-green-700 transition-colors">
                  <User    className="w-4 h-4" /> My Profile
                </NavLink>
                <NavLink to="/orderhistory" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-4 py-2 rounded-md text-sm hover:bg-green-700 transition-colors">
                  <Package className="w-4 h-4" /> Order History
                </NavLink>
                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2 rounded-md text-sm text-red-300 hover:bg-green-700 transition-colors">
                  <LogOut  className="w-4 h-4" /> Sign out
                </button>
              </div>
            ) : (
              <NavLink
                to="/login"
                onClick={() => setIsMenuOpen(false)}
                className="block mt-2 mx-2 text-center bg-white text-green-700 px-4 py-2 rounded-md text-sm font-semibold hover:bg-green-50 transition-colors"
              >
                Login
              </NavLink>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;