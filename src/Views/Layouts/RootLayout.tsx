import { Outlet, useLocation } from "react-router-dom";
import RootNavbar from "../Components/RootNavbar";
import Footer from "../Components/Footer";

const RootLayout = () => {
  const location = useLocation();
  const isMapPage = location.pathname.startsWith("/map");

  return (
    <div className="min-h-screen bg-bg-clean flex flex-col">
      <RootNavbar />
      {/* Padding top is required so content is not hidden behind the fixed navbar, except on map page */}
      <main className={`flex-1 ${isMapPage ? "" : "pt-28 md:pt-16"}`}>
        <Outlet />
      </main>
      {!isMapPage && <Footer />}
    </div>
  );
};

export default RootLayout;
