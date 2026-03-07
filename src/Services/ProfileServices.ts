import AxiosInstance from "../Utils/AxiosInstance";

// untuk cek apakah sudah login (cookies) atau belum
export const getMe = async() => {
  return AxiosInstance.get("/api/me");
};

// update profile
// Login
// Logout
// Get my profile