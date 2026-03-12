import { Outlet, useLocation } from 'react-router-dom'
import RootNavbar from '../Components/RootNavbar'

const RootLayout = () => {
  const location = useLocation();
  const isMapPage = location.pathname.startsWith('/map');

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200">
        <RootNavbar />
        {/* Padding top is required so content is not hidden behind the fixed navbar, except on map page */}
        <main className={`min-h-screen ${isMapPage ? '' : 'pt-28 md:pt-16'}`}>
          <Outlet/>
        </main>
    </div>
  )
}

export default RootLayout