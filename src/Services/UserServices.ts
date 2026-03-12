// DELETE USER own data 
// GET USER DETAIL BY ID
// GET ALL USERS IN COMMUNITY

import type { User } from "../Types/User";

export class UserService {
    // Simulasi Database / State menggunakan data JSON yang Anda berikan
    private users: User[] = [
        {
            "userid": 101,
            "fullname": "Budi Santoso",
            "username": "budisans99",
            "profilepicturl": "https://i.pravatar.cc/150?u=budisans99",
            "email": "budi.santoso@example.com",
            "phonenum": "+6281234567890",
            "userrank": "Gold",
            "userpoint": 2500,
            "bannerimgurl": "https://images.unsplash.com/photo-1542496658-e33a6d0d50f6"
        },
        {
            "userid": 102,
            "fullname": "Siti Aminah",
            "username": "sitiaminah",
            "profilepicturl": "https://i.pravatar.cc/150?u=sitiaminah",
            "email": "siti.aminah@example.com",
            "phonenum": "+6289876543210",
            "userrank": "Silver",
            "userpoint": 1250,
            "bannerimgurl": "https://images.unsplash.com/photo-1557683316-973673baf926"
        },
        {
            "userid": 103,
            "fullname": "Andi Darmawan",
            "username": "andydrmwn",
            "profilepicturl": "https://i.pravatar.cc/150?u=andydrmwn",
            "email": "andi.darmawan@example.com",
            "phonenum": "+6285555555555",
            "userrank": "Bronze",
            "userpoint": 450,
            "bannerimgurl": "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d"
        }
    ];

    /**
     * 1. GET ALL USERS IN COMMUNITY
     * Mengambil semua data user.
     * (Catatan: Karena di JSON belum ada field 'community_id', asumsinya 
     * semua user di dalam array ini adalah satu komunitas).
     */
    async getAllUsersInCommunity(): Promise<User[]> {
        // Mengembalikan duplikat array agar data asli terlindungi dari mutasi langsung
        return [...this.users]; 
    }

    /**
     * 2. GET USER DETAIL BY ID
     * Mencari detail user berdasarkan userid.
     */
    async getUserById(userId: number): Promise<User | null> {
        const user = this.users.find(u => u.userid === userId);
        return user ? user : null;
    }

    /**
     * 3. DELETE USER own data
     * Menghapus data akun sendiri. Dalam praktiknya, `currentUserId` 
     * biasanya didapat dari session atau token JWT yang sedang login.
     */
    async deleteOwnData(currentUserId: number): Promise<{ success: boolean; message: string }> {
        const userIndex = this.users.findIndex(u => u.userid === currentUserId);

        if (userIndex === -1) {
            return { 
                success: false, 
                message: "Aksi ditolak: User tidak ditemukan." 
            };
        }

        // Menghapus 1 user dari array berdasarkan index
        this.users.splice(userIndex, 1);
        
        return { 
            success: true, 
            message: "Akun dan data Anda berhasil dihapus dari komunitas." 
        };
    }
}