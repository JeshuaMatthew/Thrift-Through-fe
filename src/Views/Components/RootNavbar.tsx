import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../Utils/Hooks/AuthProvider";

const RootNavbar = () => {
  const location = useLocation();
  const { logout, user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Pasar", path: "/market" },
    { name: "Jualanku", path: "/thrifts" },
    { name: "Peta", path: "/map" },
    { name: "Komunitasku", path: "/communities" },
    { name: "Pesanan", path: "/orders" },
    { name: "Chatku", path: "/chats" },
  ];

  const isMapPage = location.pathname.startsWith("/map");

  const navBgClass = isMapPage
    ? "bg-bg-clean/95 backdrop-blur-md border border-bg-vermillion/20 rounded-full shadow-xl px-2"
    : isScrolled
      ? "bg-bg-clean/95 backdrop-blur-xl border-b border-bg-vermillion/30 shadow-sm"
      : "bg-bg-clean/95 backdrop-blur-xl border-b border-bg-vermillion/30 shadow-sm";

  const textColorClass = "text-tx-primary";

  return (
    <>
      <nav
        className={`z-40 transition-all duration-300 ${
          isMapPage
            ? `absolute top-4 left-1/2 -translate-x-1/2 w-[90%] md:w-max max-w-7xl ${navBgClass}`
            : `fixed top-0 left-0 right-0 ${navBgClass}`
        }`}
      >
        <div
          className={`mx-auto px-4 sm:px-6 lg:px-8 ${isMapPage ? "w-full" : "max-w-7xl"}`}
        >
          <div
            className={`flex items-center justify-between transition-all duration-300 ${isMapPage ? "h-12 gap-4 md:gap-8" : "h-16"}`}
          >
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link to="/thrifts" className="flex items-center group">
                <img
                  src="/src/Assets/def/logo-large.webp"
                  alt="ThriftThrough Logo"
                  className={`object-contain transition-all duration-300  ${
                    isMapPage ? "h-7" : "h-10"
                  }`}
                />
              </Link>
            </div>

            {/* Navigation Links */}
            <div
              className={`hidden md:flex items-center space-x-1 ${isMapPage ? "scale-90 origin-left" : ""}`}
            >
              {navLinks.map((link) => {
                const isActive = location.pathname.startsWith(link.path);
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`px-3 py-1.5 rounded-xl text-sm font-gasoek tracking-wide transition-all duration-300 ${
                      isActive
                        ? "bg-bg-fresh text-tx-primary shadow-sm border border-bg-fresh"
                        : "text-tx-secondary hover:text-tx-primary hover:bg-tx-muted/10"
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </div>

            {/* Right Section (User Profile & Hamburger) */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Mobile Menu Hamburger Button */}
              <div className="md:hidden flex items-center">
                <button
                  onClick={() => setIsMobileMenuOpen(true)}
                  className={`${textColorClass} opacity-80 hover:opacity-100 p-1.5 focus:outline-none focus:ring-2 focus:ring-bg-vermillion rounded-lg transition-colors`}
                  aria-label="Toggle menu"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 6h16M4 12h16M4 18h16"
                    ></path>
                  </svg>
                </button>
              </div>

              <div
                className={`hidden sm:flex items-center gap-2 pl-3 border-l border-bg-vermillion/30 ${isMapPage ? "scale-90 origin-right" : ""}`}
              >
                <Link
                  to="/profile"
                  className="flex items-center gap-2 p-1 rounded-xl hover:bg-tx-muted/10 transition-all group"
                >
                  <div className="text-right">
                    <p className="text-xs font-gasoek tracking-wide text-tx-primary leading-tight group-hover:text-bg-vermillion transition-colors">
                      {user?.fullname || "User"}
                    </p>
                    {!isMapPage && (
                      <p className="text-[10px] text-bg-vermillion font-questrial">
                        {user?.userrank || "Member"}
                      </p>
                    )}
                  </div>
                  <div
                    className={`rounded-full bg-bg-clean border-2 border-bg-vermillion/50 overflow-hidden flex-shrink-0 group-hover:border-bg-vermillion transition-colors relative cursor-pointer ${isMapPage ? "w-7 h-7" : "w-8 h-8"}`}
                  >
                    <img
                      src={
                        user?.profilepicturl ||
                        `https://ui-avatars.com/api/?name=${user?.fullname || "User"}&background=95c079&color=fff`
                      }
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </Link>

                <button
                  onClick={logout}
                  className="ml-1 p-1 rounded-lg text-tx-muted hover:text-red-500 hover:bg-red-500/10 transition-colors"
                  title="Logout"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Grid Menu Overlay - Moved outside <nav> to escape width constraints */}
      <div
        className={`md:hidden fixed inset-0 z-[100] bg-tx-primary/95 backdrop-blur-2xl transition-all duration-300 transform ${
          isMobileMenuOpen
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-full pointer-events-none"
        }`}
        style={{
          height: "100vh",
          top: "0",
          paddingTop: "env(safe-area-inset-top)",
        }}
      >
        <div className="px-5 py-6 h-full flex flex-col overflow-y-auto">
          {/* Header inside popup with close button */}
          <div className="flex justify-between items-center mb-8">
            <span className="text-xl font-gasoek tracking-wide text-bg-fresh">
              Menu
            </span>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-white/50 hover:text-white p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </button>
          </div>

          <h3 className="text-white/40 text-sm font-questrial tracking-widest mb-6 uppercase">
            Navigation
          </h3>
          <hr className="border-t border-white/10 mb-6" />

          <div className="grid grid-cols-2 gap-4 pb-8">
            {/* Profile Button added to grid */}
            <Link
              to="/profile"
              onClick={() => setIsMobileMenuOpen(false)}
              className="col-span-2 flex items-center justify-between p-4 jagged-y bg-white/5 hover:bg-white/10 transition-all mb-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full border-2 border-white/20 overflow-hidden flex-shrink-0">
                  <img
                    src={
                      user?.profilepicturl ||
                      `https://ui-avatars.com/api/?name=${user?.fullname || "User"}&background=95c079&color=fff`
                    }
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-left">
                  <p className="text-base font-gasoek text-white tracking-wide">
                    {user?.fullname || "User"}
                  </p>
                  <p className="text-xs font-questrial text-white/50">
                    View Profile
                  </p>
                </div>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-white/40"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
            {navLinks.map((link) => {
              const isActive = location.pathname.startsWith(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex flex-col items-center justify-center p-6 jagged-y transition-all ${
                    isActive
                      ? "bg-bg-vermillion/30 shadow-[0_0_15px_rgba(149,192,121,0.2)]"
                      : "bg-white/5 hover:bg-white/10"
                  }`}
                >
                  <span
                    className={`text-lg font-gasoek tracking-wide ${isActive ? "text-white" : "text-slate-300"}`}
                  >
                    {link.name}
                  </span>
                  {isActive && (
                    <span className="w-8 h-1 bg-bg-vermillion rounded-full mt-3"></span>
                  )}
                </Link>
              );
            })}

            {/* Added a logout button to the grid since the desktop one is hidden */}
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                logout();
              }}
              className="flex items-center justify-center gap-2 p-4 jagged-y bg-red-500/10 hover:bg-red-500/20 transition-all group"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              <span className="text-lg font-gasoek text-red-400">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default RootNavbar;
