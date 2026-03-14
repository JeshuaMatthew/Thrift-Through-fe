import { Outlet } from "react-router-dom"
import BaseNavbar from "../Components/BaseNavbar"
import Footer from "../Components/Footer"

const BaseLayout = () => {
  return (
    <div className="min-h-screen bg-white text-tx-primary relative">
        <BaseNavbar />
        {/* Removed padding top to allow content to sit behind navbar */}
        <main className="min-h-screen">
          <Outlet/>   
        </main>
        <Footer />
    </div>
  )
}

export default BaseLayout