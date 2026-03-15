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
        userrank: data.user_rank || 'Bronze',
        userpoint: data.user_point || 0,
        profilepicturl: formatImageUrl(data.profile_pict_url),
        bannerimgurl: formatImageUrl(data.banner_img_url)
    };
};

export class UserService {
    /**
     * 1. GET ALL USERS IN COMMUNITY
     * Mengambil semua data user dari backend.
     */
    async getAllUsers(): Promise<User[]> {
        try {
            const response = await AxiosInstance.get("/users");
            if (Array.isArray(response.data)) {
                return response.data.map(mapUser);
            }
            return [];
        } catch (error) {
            console.error("Error fetching users:", error);
            return [];
        }
    }

    async getUserById(userId: number): Promise<User | null> {
        try {
            const response = await AxiosInstance.get(`/users/${userId}`);
            if (response.data) {
                return mapUser(response.data);
            }
            return null;
        } catch (error) {
            const allUsers = await this.getAllUsers();
            return allUsers.find(u => u.userid === userId) || null;
        }
    }

    /**
     * 3. DELETE USER own data
     */
    async deleteOwnData(_currentUserId: number): Promise<{ success: boolean; message: string }> {
        try {
            // Note: The backend deleteItem is for items. 
            // The userRoutes doesn't have a direct delete user yet, but assuming we might add it or use /users/me
            const response = await AxiosInstance.delete(`/users/me`);
            return { 
                success: true, 
                message: response.data.message || "Akun dan data Anda berhasil dihapus." 
            };
        } catch (error: any) {
            return { 
                success: false, 
                message: error.response?.data?.error || "Gagal menghapus akun." 
            };
        }
    }
}