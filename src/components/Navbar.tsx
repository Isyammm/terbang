import React, { useState, useRef, useEffect } from 'react';
import { Plane, Calendar, Ticket, LogOut, LogIn, ChevronDown } from 'lucide-react';
import { UserAccount } from './LoginModal';
import './Navbar.css';

interface NavbarProps {
  activeTab: 'home' | 'bookings';
  setActiveTab: (tab: 'home' | 'bookings') => void;
  resetApp: () => void;
  currentUser: UserAccount | null;
  onLoginClick: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  resetApp,
  currentUser,
  onLoginClick,
  onLogout,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setDropdownOpen(false);
    onLogout();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo" onClick={resetApp}>
          <div className="logo-icon-container">
            <Plane className="logo-icon" />
          </div>
          <span className="logo-text">Fly<span>Ease</span></span>
        </div>

        <div className="navbar-links">
          <button
            className={`navbar-link ${activeTab === 'home' ? 'active' : ''}`}
            onClick={() => setActiveTab('home')}
          >
            <Calendar size={18} />
            <span>Cari Tiket</span>
          </button>

          <button
            className={`navbar-link ${activeTab === 'bookings' ? 'active' : ''}`}
            onClick={() => setActiveTab('bookings')}
          >
            <Ticket size={18} />
            <span>Pesanan Saya</span>
          </button>
        </div>

        {/* Profile / Auth Section */}
        <div className="navbar-profile" ref={dropdownRef}>
          {currentUser ? (
            // Logged in: show avatar + dropdown
            <div className="profile-menu-wrapper">
              <button
                className="profile-badge profile-badge--active"
                onClick={() => setDropdownOpen(prev => !prev)}
                title="Menu Akun"
              >
                <div className="profile-avatar">
                  {getInitials(currentUser.name)}
                </div>
                <span className="profile-name">{currentUser.name}</span>
                <ChevronDown
                  size={14}
                  className={`profile-chevron ${dropdownOpen ? 'open' : ''}`}
                />
              </button>

              {dropdownOpen && (
                <div className="profile-dropdown animated-fade-in">
                  <div className="dropdown-user-info">
                    <div className="dropdown-avatar">{getInitials(currentUser.name)}</div>
                    <div>
                      <p className="dropdown-name">{currentUser.name}</p>
                      <p className="dropdown-email">{currentUser.email}</p>
                    </div>
                  </div>
                  <div className="dropdown-divider" />
                  <button
                    className="dropdown-item"
                    onClick={() => { setDropdownOpen(false); setActiveTab('bookings'); }}
                  >
                    <Ticket size={14} />
                    <span>Pesanan Saya</span>
                  </button>
                  <button className="dropdown-item dropdown-item--danger" onClick={handleLogout}>
                    <LogOut size={14} />
                    <span>Keluar dari Akun</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            // Not logged in: show Login button
            <button className="login-nav-btn" onClick={onLoginClick} id="navbar-login-btn">
              <LogIn size={16} />
              <span>Masuk / Daftar</span>
            </button>
          )}
        </div>

      </div>
    </nav>
  );
};
