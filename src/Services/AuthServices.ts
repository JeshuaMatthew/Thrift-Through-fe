import type { Login } from "../Types/Login";
import type { RegisterData } from "../Types/Register";
import type { User } from "../Types/User";
import AxiosInstance from "../Utils/AxiosInstance";
import { formatImageUrl } from "../Utils/FormatUrl";

// Helper function to map backend user data to frontend User interface
const mapUser = (data: any): User => {
    return {
        userid: data.user_id,
        fullname: data.full_name,
        username: data.user_name,
        email: data.email,
        phonenum: data.phone_num || '',
        profilepicturl: formatImageUrl(data.profile_pict_url),
        bannerimgurl: formatImageUrl(data.banner_img_url)
    };
};

export class AuthService {
    // 1. LOGIN
    async login(credentials: Login): Promise<{ success: boolean; message: string; data?: User }> {
        try {
            const response = await AxiosInstance.post("/users/login", {
                email: credentials.Email,
                password: credentials.Password
            });
            
            if (response.data.user) {
                return { 
                    success: true, 
                    message: response.data.message || "Login Berhasil.", 
                    data: mapUser(response.data.user)
                };
            }
            return { success: false, message: "Login Gagal." };
        } catch (error: any) {
            return { 
                success: false, 
                message: error.response?.data?.error || "Login Gagal: Email atau Password salah." 
            };
        }
    }

    // 1.b REGISTER
    async register(data: RegisterData): Promise<{ success: boolean; message: string }> {
        try {
            const formData = new FormData();
            formData.append('full_name', data.fullName);
            formData.append('user_name', data.userName);
            formData.append('email', data.email);
            formData.append('phone_num', data.phoneNum);
            if (data.password) formData.append('password', data.password);
            
            if (data.profilePict) {
                formData.append('image', data.profilePict);
            }
            if (data.bannerImg) {
                formData.append('banner', data.bannerImg);
            }

            const response = await AxiosInstance.post("/users", formData);
            
            return { 
                success: true, 
                message: response.data.message || "Registrasi Berhasil. Silakan login." 
            };
        } catch (error: any) {
            return { 
                success: false, 
                message: error.response?.data?.error || "Registrasi Gagal." 
            };
        }
    }

    // 2. GET ME (Check Cookies)
    async getMe(): Promise<{ isAuthenticated: boolean; user?: User }> {
        try {
            const response = await AxiosInstance.get("/users/me");
            if (response.data) {
                return { isAuthenticated: true, user: mapUser(response.data) };
            }
            return { isAuthenticated: false };
        } catch (error) {
            return { isAuthenticated: false };
        }
    }

    // 3. GET MY PROFILE
    async getMyProfile(): Promise<{ success: boolean; message: string; data?: User }> {
        try {
            const response = await AxiosInstance.get("/users/me");
            if (response.data) {
                return { 
                    success: true, 
                    message: "Profil berhasil diambil.", 
                    data: mapUser(response.data) 
                };
            }
            return { success: false, message: "Data pengguna tidak ditemukan." };
        } catch (error: any) {
            return { 
                success: false, 
                message: error.response?.data?.error || "Unauthorized. Silakan login terlebih dahulu." 
            };
        }
    }

    // 4. UPDATE PROFILE (Text Only)
    async updateProfile(updateData: { fullname?: string; username?: string; email?: string; phonenum?: string }): Promise<{ success: boolean; message: string; data?: User }> {
        try {
            const backendData: any = {};
            if (updateData.fullname) backendData.full_name = updateData.fullname;
            if (updateData.username) backendData.user_name = updateData.username;
            if (updateData.email) backendData.email = updateData.email;
            if (updateData.phonenum) backendData.phone_num = updateData.phonenum;

            const response = await AxiosInstance.put("/users/me", backendData);
            if (response.data) {
                return { 
                    success: true, 
                    message: "Profil berhasil diperbarui.", 
                    data: mapUser(response.data) 
                };
            }
            return { success: false, message: "Gagal memperbarui profil." };
        } catch (error: any) {
            return { 
                success: false, 
                message: error.response?.data?.error || "Gagal memperbarui profil." 
            };
        }
    }

    // 4.b UPLOAD PROFILE PICTURE
    async uploadProfilePic(file: File): Promise<{ success: boolean; message: string; data?: User }> {
        try {
            const formData = new FormData();
            formData.append('image', file);
            const response = await AxiosInstance.post("/users/profile-pic", formData);
            if (response.data.user) {
                return { success: true, message: response.data.message, data: mapUser(response.data.user) };
            }
            return { success: false, message: "Gagal upload foto profil." };
        } catch (error: any) {
            return { success: false, message: error.response?.data?.error || "Gagal upload foto profil." };
        }
    }

    // 4.c UPLOAD BANNER
    async uploadUserBanner(file: File): Promise<{ success: boolean; message: string; data?: User }> {
        try {
            const formData = new FormData();
            formData.append('banner', file);
            const response = await AxiosInstance.post("/users/banner", formData);
            if (response.data.user) {
                return { success: true, message: response.data.message, data: mapUser(response.data.user) };
            }
            return { success: false, message: "Gagal upload banner." };
        } catch (error: any) {
            return { success: false, message: error.response?.data?.error || "Gagal upload banner." };
        }
    }

    // 5. LOGOUT
    async logout(): Promise<{ success: boolean; message: string }> {
        try {
            // Backend should clear the cookie
            await AxiosInstance.post("/users/logout");
            return { success: true, message: "Logout berhasil. Sesi telah dihapus." };
        } catch (error) {
            // Even if request fails, we consider it logged out locally
            return { success: true, message: "Logout berhasil." };
        }
    }
}
