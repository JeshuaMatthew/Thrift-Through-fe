import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const BaseNavbar = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const isHomePage = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Login', path: '/login' },
  ];

  // Determine navbar styles based on route and scroll state
  // Transparent on homepage when top, solid everywhere else or when scrolled
  const isTransparent = isHomePage && !isScrolled;
  const navBgClass = isTransparent 
    ? "bg-transparent border-transparent" 
    : "bg-bg-clean/95 backdrop-blur-xl border-b border-bg-vermillion/30 shadow-sm";
  const textColorClass = isTransparent ? "text-white" : "text-tx-primary";

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navBgClass}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="shrink-0">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-linear-to-br from-bg-vermillion to-bg-fresh flex items-center justify-center shadow-lg shadow-bg-vermillion/30">
                <span className="text-tx-primary font-bold text-xl leading-none tracking-tighter">T</span>
              </div>
              <span className={`text-xl tracking-wide font-moirai ${textColorClass}`}>
                Thrift<span className={isTransparent ? "text-bg-fresh" : "text-tx-accent"}>Through</span>
              </span>
            </Link>
          </div>

          {/* Navigation Links (Desktop) */}
          <div className="hidden md:flex items-center space-x-1 sm:space-x-4">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              // Active state can use the fresh color if scrolled, otherwise a semi transparent white
              const activeClass = isTransparent 
                ? 'bg-white/20 text-white border border-white/30 backdrop-blur-md'
                : 'bg-bg-fresh text-tx-primary shadow-sm border border-bg-fresh';
              const inactiveClass = isTransparent
                ? 'text-white/80 hover:text-white hover:bg-white/10'
                : 'text-tx-secondary hover:text-tx-primary hover:bg-tx-muted/10';

              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
                    isActive ? activeClass : inactiveClass
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Mobile Menu Hamburger Button */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`${textColorClass} opacity-80 hover:opacity-100 p-2 focus:outline-none focus:ring-2 focus:ring-bg-vermillion rounded-lg transition-colors`}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Grid Menu Overlay */}
      <div 
        className={`md:hidden fixed inset-0 z-100 bg-slate-900/95 backdrop-blur-2xl transition-all duration-300 transform ${
          isMobileMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'
        }`}
        style={{ height: '100vh', top: '0', paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="px-5 py-6 h-full flex flex-col overflow-y-auto">
          {/* Header inside popup with close button */}
          <div className="flex justify-between items-center mb-8">
            <span className="text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-white to-slate-400">
                Menu
            </span>
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-slate-400 hover:text-white p-2 bg-slate-800/50 rounded-full transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>

          <h3 className="text-white/50 text-sm font-semibold mb-6 uppercase tracking-wider">Navigation</h3>
          
          <div className="grid grid-cols-2 gap-4 pb-8">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex flex-col items-center justify-center p-6 rounded-2xl border transition-all ${
                    isActive
                      ? 'bg-linear-to-br from-indigo-500/20 to-purple-500/20 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.2)]'
                      : 'bg-slate-800/50 border-white/5 hover:bg-slate-800'
                  }`}
                >
                  <span className={`text-lg font-bold ${isActive ? 'text-white' : 'text-slate-300'}`}>
                    {link.name}
                  </span>
                  {isActive && (
                    <span className="w-8 h-1 bg-indigo-500 rounded-full mt-3"></span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default BaseNavbar;
