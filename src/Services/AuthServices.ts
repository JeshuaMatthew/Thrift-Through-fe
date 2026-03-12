import type { Login } from "../Types/Login";
import type { User } from "../Types/User";
import AxiosInstance from "../Utils/AxiosInstance";

// untuk cek apakah sudah login (cookies) atau belum
// export const getMe = async() => {
//   return AxiosInstance.get("/api/me");
// };

// update profile
// Login
// Logout
// Get my profile

// ==========================================
// INTERFACES
// ==========================================


// Interface internal untuk simulasi Database (Menyimpan password)
interface UserDB extends User {
    password: string;
}

// ==========================================
// SERVICE CLASS
// ==========================================
export class AuthService {
    // 1. Simulasi Database User beserta Password-nya
    private get usersDB(): UserDB[] {
        const data = localStorage.getItem('usersDB');
        if (data) return JSON.parse(data);
        
        const defaultData: UserDB[] = [
            {
                userid: 101,
                fullname: "Jeshua Matthew",
                username: "Eeimmors",
                profilepicturl: "https://i.pravatar.cc/150?u=budisans99",
                email: "matthew@gmail.com",
                phonenum: "+6281234567890",
                userrank: "Gold",
                userpoint: 2500,
                password: "12345678" // Password simulasi
            },
            {
                userid: 102,
                fullname: "Siti Aminah",
                username: "sitiaminah",
                profilepicturl: "https://i.pravatar.cc/150?u=sitiaminah",
                email: "siti.aminah@example.com",
                phonenum: "+6289876543210",
                userrank: "Silver",
                userpoint: 1250,
                password: "siti secure" // Password simulasi
            }
        ];
        localStorage.setItem('usersDB', JSON.stringify(defaultData));
        return defaultData;
    }

    private set usersDB(data: UserDB[]) {
        localStorage.setItem('usersDB', JSON.stringify(data));
    }

    // 2. Simulasi Cookies / Token JWT (Jika null berarti belum login)
    private get currentSessionUserId(): number | null {
        const id = sessionStorage.getItem('currentSessionUserId');
        return id ? parseInt(id, 10) : null;
    }

    private set currentSessionUserId(id: number | null) {
        if (id !== null) {
            sessionStorage.setItem('currentSessionUserId', id.toString());
        } else {
            sessionStorage.removeItem('currentSessionUserId');
        }
    }

    // ==========================================
    // 1. LOGIN
    // ==========================================
    async login(credentials: Login): Promise<{ success: boolean; message: string; data?: User }> {
        // Cari user berdasarkan Email dan Password
        const user = this.usersDB.find(u => u.email === credentials.Email && u.password === credentials.Password);

        if (!user) {
            return { success: false, message: "Login Gagal: Email atau Password salah." };
        }

        // SET COOKIES / SESSION (Simulasi)
        this.currentSessionUserId = user.userid;

        // Hilangkan password dari balikan data demi keamanan (Destructuring)
        const { password, ...userWithoutPassword } = user;

        return { success: true, message: "Login Berhasil.", data: userWithoutPassword };
    }

    // ==========================================
    // 2. GET ME (Check Cookies)
    // ==========================================
    // Fungsi ini biasanya dipanggil saat web di-refresh untuk mengecek apakah user masih punya session/cookie aktif
    async getMe(): Promise<{ isAuthenticated: boolean; userid?: number }> {
        if (this.currentSessionUserId !== null) {
            return { isAuthenticated: true, userid: this.currentSessionUserId };
        }
        return { isAuthenticated: false };
    }

    // ==========================================
    // 3. GET MY PROFILE
    // ==========================================
    async getMyProfile(): Promise<{ success: boolean; message: string; data?: User }> {
        // Cek Auth
        if (!this.currentSessionUserId) {
            return { success: false, message: "Unauthorized. Silakan login terlebih dahulu." };
        }

        const user = this.usersDB.find(u => u.userid === this.currentSessionUserId);

        if (!user) return { success: false, message: "Data pengguna tidak ditemukan." };

        const { password, ...userProfile } = user;
        return { success: true, message: "Profil berhasil diambil.", data: userProfile };
    }

    // ==========================================
    // 4. UPDATE PROFILE
    // ==========================================
    // Menggunakan Partial untuk membolehkan update sebagian field.
    // Omit digunakan agar user tidak bisa iseng mengubah Rank, Point, atau UserID mereka sendiri.
    async updateProfile(updateData: Partial<Omit<User, 'userid' | 'userrank' | 'userpoint'>>): Promise<{ success: boolean; message: string; data?: User }> {
        // Cek Auth
        if (!this.currentSessionUserId) {
            return { success: false, message: "Unauthorized. Silakan login terlebih dahulu." };
        }

        const db = this.usersDB;
        const index = db.findIndex(u => u.userid === this.currentSessionUserId);

        if (index === -1) return { success: false, message: "User tidak ditemukan." };

        // Gabungkan data lama dengan data baru
        db[index] = { ...db[index], ...updateData };
        this.usersDB = db;

        const { password, ...updatedProfile } = db[index];

        return { success: true, message: "Profil berhasil diperbarui.", data: updatedProfile };
    }

    // ==========================================
    // 5. LOGOUT
    // ==========================================
    async logout(): Promise<{ success: boolean; message: string }> {
        // CLEAR COOKIES / SESSION
        this.currentSessionUserId = null;
        return { success: true, message: "Logout berhasil. Sesi telah dihapus." };
    }
}