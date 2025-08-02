import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Menu, X, User, LogOut, Calendar } from 'lucide-react';
import { useUser } from '../../contexts/UserContext';
import LoginModal from '../auth/LoginModal';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const { user, isAuthenticated, logout } = useUser();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <div className="p-2 bg-[#1D6FA3]/80 rounded-lg">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-[#1E3A5F]">WaitlessOS</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link to="/symptoms" className="text-gray-700 hover:text-[#1D6FA3] hover:font-medium hover:underline hover:underline-offset-2 transition-colors">
                Find Care
              </Link>
              <Link to="/emergency" className="text-red-600 hover:text-red-800 font-bold hover:underline hover:underline-offset-2 transition-colors">
                Emergency
              </Link>
              
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <Link 
                    to="/dashboard" 
                    className="flex items-center space-x-1 text-gray-700 hover:text-[#1D6FA3] hover:underline hover:underline-offset-2 transition-colors"
                  >
                    <span>Dashboard</span>
                  </Link>
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-700">{user?.name}</span>
                    <button
                      onClick={handleLogout}
                      className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                      title="Logout"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setIsLoginOpen(true)}
                  className="bg-[#dbf6ff]/80 text-[#1E3A5F] font-medium px-4 py-2 rounded-lg hover:bg-[#8ba1a7] hover:text-white transition-colors"
                >
                  Sign In
                </button>
              )}
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200">
              <div className="flex flex-col space-y-3">
                <Link 
                  to="/symptoms" 
                  className="text-gray-700 hover:text-blue-600 transition-colors py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Find Care
                </Link>
                <Link 
                  to="/emergency" 
                  className="text-red-600 hover:text-red-700 font-medium transition-colors py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Emergency
                </Link>
                
                {isAuthenticated ? (
                  <>
                    <Link 
                      to="/dashboard" 
                      className="text-gray-700 hover:text-[#1D6FA3] hover:underline hover:underline-offset-2 transition-colors py-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <div className="py-2 border-t border-gray-200">
                      <p className="text-sm text-gray-600 mb-2">{user?.name}</p>
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsMenuOpen(false);
                        }}
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        Sign Out
                      </button>
                    </div>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      setIsLoginOpen(true);
                      setIsMenuOpen(false);
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-left"
                  >
                    Sign In
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      <LoginModal 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)} 
      />
    </>
  );
};

export default Header;