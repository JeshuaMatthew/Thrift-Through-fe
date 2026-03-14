import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../Utils/Hooks/AuthProvider";
import { LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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

  const textColorClass = "text-tx-primary";

  return (
    <>
      <motion.nav
        layout
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={`z-40 ${
          isMapPage
            ? `absolute top-4 left-1/2 -translate-x-1/2 w-[90%] md:w-max max-w-7xl bg-bg-clean/95 backdrop-blur-md border border-bg-vermillion/20 rounded-full shadow-xl px-2`
            : `fixed top-0 left-0 right-0 bg-bg-clean/95 backdrop-blur-xl border-b border-bg-vermillion/30 shadow-sm`
        }`}
      >
        <motion.div
          layout
          className={`mx-auto px-4 sm:px-6 lg:px-8 ${isMapPage ? "w-full" : "max-w-7xl"}`}
        >
          <motion.div
            layout
            className={`flex items-center justify-between ${isMapPage ? "h-12 gap-4 md:gap-8" : "h-16"}`}
          >
            {/* Logo */}
            <motion.div layout className="flex-shrink-0">
              <Link to="/thrifts" className="flex items-center group">
                <motion.img
                  layout
                  src="/src/Assets/def/logo-large.webp"
                  alt="ThriftThrough Logo"
                  className={`object-contain ${
                    isMapPage ? "h-7" : "h-10"
                  }`}
                />
              </Link>
            </motion.div>

            {/* Navigation Links */}
            {!isMapPage && (
              <div
                className="hidden md:flex items-center space-x-1"
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
            )}

            {/* Right Section (User Profile & Hamburger) */}
            <motion.div layout className="flex items-center gap-2 sm:gap-4">
              {/* Mobile Menu Hamburger Button */}
              <div className={`${isMapPage ? "flex" : "md:hidden"} items-center`}>
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className={`${textColorClass} opacity-80 hover:opacity-100 p-2 focus:outline-none focus:ring-2 focus:ring-bg-vermillion rounded-lg transition-colors`}
                  aria-label="Toggle menu"
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={isMobileMenuOpen ? "close" : "open"}
                      initial={{ opacity: 0, rotate: -90 }}
                      animate={{ opacity: 1, rotate: 0 }}
                      exit={{ opacity: 0, rotate: 90 }}
                      transition={{ duration: 0.2 }}
                    >
                      {isMobileMenuOpen ? (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                      ) : (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                        </svg>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </button>
              </div>

              <AnimatePresence>
                {!isMapPage && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="hidden sm:flex items-center gap-2 pl-3 border-l border-bg-vermillion/30"
                  >
                    <Link
                      to="/profile"
                      className="flex items-center gap-2 p-1 rounded-xl hover:bg-tx-muted/10 transition-all group"
                    >
                      <div className="text-right">
                        <p className="text-xs font-gasoek tracking-wide text-tx-primary leading-tight group-hover:text-bg-vermillion transition-colors">
                          {user?.fullname || "User"}
                        </p>
                        <p className="text-[10px] text-bg-vermillion font-questrial">
                          {user?.userrank || "Member"}
                        </p>
                      </div>
                      <div className="rounded-full bg-bg-clean border-2 border-bg-vermillion/50 overflow-hidden flex-shrink-0 group-hover:border-bg-vermillion transition-colors relative cursor-pointer w-8 h-8">
                        <img
                          src={user?.profilepicturl || `https://ui-avatars.com/api/?name=${user?.fullname || "User"}&background=95c079&color=fff`}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </Link>

                    <button
                      onClick={logout}
                      className="ml-1 p-1 rounded-lg text-tx-primary hover:text-bg-fresh hover:bg-red-500/50 cursor-pointer transition-all group"
                      title="Logout"
                    >
                      <LogOut />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.nav>

      {/* Mobile Grid Menu Overlay */}
      <div
        className={`${isMapPage ? "" : "md:hidden"} fixed inset-0 z-[100] bg-tx-primary transition-all duration-300 transform ${
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
            {/* Logo */}
            <div className="shrink-0">
              <Link
                onClick={() => setIsMobileMenuOpen(false)}
                to="/"
                className="flex items-center"
              >
                <img
                  src="/src/Assets/def/logo-large.webp"
                  alt="ThriftThrough Logo"
                  className={`h-10 object-contain transition-all duration-300 brightness-[4]`}
                />
              </Link>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-bg-clean hover:text-white p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
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

          <h3 className="text-bg-fresh text-lg font-gasoek mb-6">Menu</h3>
          <hr className="border-t border-white/10 mb-6" />

          <div className="grid grid-cols-2 gap-4 pb-8">
            {/* Profile Button added to grid */}
            <Link
              to="/profile"
              onClick={() => setIsMobileMenuOpen(false)}
              className="col-span-2 flex items-center justify-between p-4 rounded-lg bg-bg-fresh transition-all mb-2"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full border-2 border-tx-primary/20 overflow-hidden flex-shrink-0">
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
                  <p className="text-base font-gasoek text-tx-primary tracking-wide">
                    {user?.fullname || "User"}
                  </p>
                  <p className="text-xs font-questrial text-tx-primary/60">
                    View Profile
                  </p>
                </div>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-tx-primary/60"
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
                  className={`flex rounded-lg flex-col items-center justify-center p-6 transition-all ${
                    isActive ? "bg-bg-clean" : "bg-bg-fresh"
                  }`}
                >
                  <span
                    className={`text-lg font-questrial tracking-wide ${isActive ? "text-bg-vermillion font-bold" : "text-tx-primary"}`}
                  >
                    {link.name}
                  </span>
                </Link>
              );
            })}

            {/* Added a logout button to the grid since the desktop one is hidden */}
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                logout();
              }}
              className="col-span-2 mt-2 flex items-center justify-center gap-2 p-4 rounded-lg text-bg-fresh bg-red-500 hover:bg-bg-fresh hover:text-red-500 cursor-pointer transition-all group"
            >
              <LogOut className="w-6 h-6" />
              <span className="text-lg font-questrial tracking-wide font-bold ">
                Logout
              </span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default RootNavbar;
