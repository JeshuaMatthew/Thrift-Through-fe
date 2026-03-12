import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../Utils/Hooks/AuthProvider";

const RootNavbar = () => {
  const location = useLocation();
  const { logout, user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: "Market", path: "/market" },
    { name: "My Thrifts", path: "/thrifts" },
    { name: "Map", path: "/map" },
    { name: "Community", path: "/communities" },
    { name: "Orders", path: "/orders" },
    { name: "My Chats", path: "/chats" },
  ];

  const isMapPage = location.pathname.startsWith("/map");

  return (
    <>
      <nav
        className={`z-40 transition-all duration-300 ${
          isMapPage
            ? "absolute top-4 left-1/2 -translate-x-1/2 w-[90%] md:w-max max-w-7xl bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-full shadow-xl px-2"
            : "fixed top-0 left-0 right-0 bg-slate-900/80 backdrop-blur-xl border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)]"
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
              <Link to="/thrifts" className="flex items-center gap-2 group">
                <div
                  className={`rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:shadow-indigo-500/50 transition-all duration-300 ${isMapPage ? "w-6 h-6" : "w-8 h-8"}`}
                >
                  <span
                    className={`text-white font-bold leading-none ${isMapPage ? "text-sm" : "text-xl"}`}
                  >
                    T
                  </span>
                </div>
                <span
                  className={`font-bold font-moirai tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 ${isMapPage ? "text-lg hidden sm:block" : "text-xl"}`}
                >
                  Thrift<span className="text-indigo-400">Through</span>
                </span>
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
                    className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-300 relative ${
                      isActive
                        ? "text-white bg-white/5 shadow-inner border border-white/5"
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {link.name}
                    {isActive && (
                      <span className="absolute -bottom-[2px] left-1/2 -translate-x-1/2 w-1/2 h-[2px] bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.8)]"></span>
                    )}
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
                  className="text-slate-400 hover:text-white p-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-lg transition-colors"
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
                className={`hidden sm:flex items-center gap-2 pl-3 border-l border-slate-700/50 ${isMapPage ? "scale-90 origin-right" : ""}`}
              >
                <Link
                  to="/profile"
                  className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-800/80 transition-all group"
                >
                  <div className="text-right">
                    <p className="text-xs font-semibold text-white leading-tight group-hover:text-indigo-300 transition-colors">
                      {user?.fullname || "User"}
                    </p>
                    {!isMapPage && (
                      <p className="text-[10px] text-indigo-400">
                        {user?.userrank || "Member"}
                      </p>
                    )}
                  </div>
                  <div
                    className={`rounded-full bg-slate-800 border-2 border-indigo-400/50 overflow-hidden flex-shrink-0 group-hover:border-indigo-400 transition-colors relative cursor-pointer ${isMapPage ? "w-7 h-7" : "w-8 h-8"}`}
                  >
                    <img
                      src={
                        user?.profilepicturl ||
                        `https://ui-avatars.com/api/?name=${user?.fullname || "User"}&background=4f46e5&color=fff`
                      }
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </Link>

                <button
                  onClick={logout}
                  className="ml-1 p-1 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-colors"
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
        className={`md:hidden fixed inset-0 z-[100] bg-slate-900/95 backdrop-blur-2xl transition-all duration-300 transform ${
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
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              Menu
            </span>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-slate-400 hover:text-white p-2 bg-slate-800/50 rounded-full transition-colors"
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

          <h3 className="text-white/50 text-sm font-semibold mb-6 uppercase tracking-wider">
            Navigation
          </h3>

          <div className="grid grid-cols-2 gap-4 pb-8">
            {/* Profile Button added to grid */}
            <Link
              to="/profile"
              onClick={() => setIsMobileMenuOpen(false)}
              className="col-span-2 flex items-center justify-between p-4 rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 hover:from-indigo-500/20 hover:to-purple-500/20 transition-all mb-2"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-slate-800 border-2 border-indigo-400 overflow-hidden flex-shrink-0">
                  <img
                    src={
                      user?.profilepicturl ||
                      `https://ui-avatars.com/api/?name=${user?.fullname || "User"}&background=4f46e5&color=fff`
                    }
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-left">
                  <p className="text-base font-bold text-white">
                    {user?.fullname || "User"}
                  </p>
                  <p className="text-xs text-indigo-400">View Profile</p>
                </div>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-indigo-400"
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
                  className={`flex flex-col items-center justify-center p-6 rounded-2xl border transition-all ${
                    isActive
                      ? "bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.2)]"
                      : "bg-slate-800/50 border-white/5 hover:bg-slate-800"
                  }`}
                >
                  <span
                    className={`text-lg font-bold ${isActive ? "text-white" : "text-slate-300"}`}
                  >
                    {link.name}
                  </span>
                  {isActive && (
                    <span className="w-8 h-1 bg-indigo-500 rounded-full mt-3"></span>
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
              className="flex flex-col items-center justify-center p-6 rounded-2xl border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 transition-all"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-red-400 mb-2"
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
              <span className="text-lg font-bold text-red-400">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default RootNavbar;
