import React from 'react';
import { Plane, Calendar, User, Ticket } from 'lucide-react';
import './Navbar.css';

interface NavbarProps {
  activeTab: 'home' | 'bookings';
  setActiveTab: (tab: 'home' | 'bookings') => void;
  resetApp: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, resetApp }) => {
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
        
        <div className="navbar-profile">
          <div className="profile-badge">
            <User size={16} className="profile-icon" />
            <span className="profile-name">Adrian Wijaya</span>
          </div>
        </div>
      </div>
    </nav>
  );
};
