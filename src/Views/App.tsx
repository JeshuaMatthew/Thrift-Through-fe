import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";

// Layouts
import RootLayout from "./Layouts/RootLayout";
import BaseLayout from "./Layouts/BaseLayout";

// Auth / Route Guards
import PrivateRoute from "../Utils/PrivateRoute";
import PublicRoute from "../Utils/PublicRoute";

// Pages
import HomePage from "./Pages/HomePage";
import LoginPage from "./Pages/LoginPage";
import MapPage from "./Pages/MapPage";
import ThriftPage from "./Pages/ThriftPage";
import CommunityPage from "./Pages/CommunityPage";
import ChatPage from "./Pages/ChatPage";
import ProfilePage from "./Pages/ProfilePage";
import MarketPage from "./Pages/MarketPage";
import OrdersPage from "./Pages/OrdersPage";
import { AuthProvider } from "../Utils/Hooks/AuthProvider";

function App() {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <>
        {/* Protected Routes (Requires Login) */}
        <Route
          element={
            <PrivateRoute>
              <RootLayout />
            </PrivateRoute>
          }
        >
          <Route path="/market" element={<MarketPage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/thrifts" element={<ThriftPage />} />
          <Route path="/communities" element={<CommunityPage />} />
          <Route path="/chats" element={<ChatPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/orders" element={<OrdersPage />} />
        </Route>

        {/* Public Routes (Accessible only if NOT logged in) */}
        <Route
          element={
            <PublicRoute>
              <BaseLayout />
            </PublicRoute>
          }
        >
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
        </Route>
      </>,
    ),
  );

  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;
