// DELETE COMMUNITY
// GET COMMUNITY DETAIL BY ID (DESCRIPTION, FOTO, LIST OF USERS)
// GET ALL COMMUNITIES
// CREATE COMMUNITY 
// UPDATE COMMUNITY

import type {Community} from "../Types/Community";
import type {User} from "../Types/User";
import { CommunityMembersServices } from "./CommunityMembersServices";

// Interface balikan untuk Get Detail (Komunitas + Daftar Anggota Lengkap)
export interface CommunityDetail extends Community {
    members: User[];
}

// ==========================================
// SERVICE CLASS
// ==========================================
export class CommunityService {
    // 1. Data Simulasi Tabel Communities
    private communities: Community[] = [
        {
            communityid: 1,
            userid: 101,
            description: "Tempat ngumpulnya para pencari cuan dan peluang bisnis sampingan di area Jakarta Pusat.",
            profilepicturl: "https://example.com/images/com-cuan.jpg",
            communityname: "Komunitas Pencari Duid",
            longitude: 107.5750,
            latitude: -6.8000,
            isPublic: true
        },
        {
            communityid: 2,
            userid: 102,
            description: "Forum diskusi, jual beli part, dan berbagi tips seputar perbaikan stik konsol game.",
            profilepicturl: "https://example.com/images/com-xbox.jpg",
            communityname: "Komunitas Servis Stick Xbox",
            longitude: 107.5800,
            latitude: -6.8100,
            isPublic: false
        },
        {
            communityid: 3,
            userid: 103,
            description: "Grup online khusus bagi para kolektor barang antik dan retro di seluruh Nusantara.",
            profilepicturl: "https://example.com/images/com-retro.jpg",
            communityname: "Kolektor Barang Retro ID",
            isPublic: false
        }
    ];

    // 2. Data Simulasi Tabel Users (Menggunakan Interface User yang lengkap)
    private users: User[] = [
        {
            userid: 101,
            fullname: "Budi Santoso",
            username: "budisans99",
            profilepicturl: "https://i.pravatar.cc/150?u=budisans99",
            email: "budi.santoso@example.com",
            phonenum: "+6281234567890",
            userrank: "Gold",
            userpoint: 2500
        },
        {
            userid: 102,
            fullname: "Siti Aminah",
            username: "sitiaminah",
            profilepicturl: "https://i.pravatar.cc/150?u=sitiaminah",
            email: "siti.aminah@example.com",
            phonenum: "+6289876543210",
            userrank: "Silver",
            userpoint: 1250
        },
        {
            userid: 103,
            fullname: "Andi Darmawan",
            username: "andydrmwn",
            profilepicturl: "https://i.pravatar.cc/150?u=andydrmwn",
            email: "andi.darmawan@example.com",
            phonenum: "+6285555555555",
            userrank: "Bronze",
            userpoint: 450
        }
    ];


    // ==========================================
    // 1. GET ALL COMMUNITIES
    // ==========================================
    async getAllCommunities(): Promise<Community[]> {
        return [...this.communities];
    }

    /**
     * Helper Method: Rumus Haversine untuk menghitung jarak GPS (dalam Kilometer)
     */
    private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
        const R = 6371; // Radius bumi dalam kilometer
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; // Hasil dalam km
    }

    // ==========================================
    // 1.b GET COMMUNITIES IN AREA
    // ==========================================
    async getCommunitiesInArea(userLat: number, userLng: number, radiusKm: number): Promise<(Community & { distanceKm: number })[]> {
        const commsInArea = this.communities
            .filter(c => c.latitude !== undefined && c.longitude !== undefined)
            .map(c => {
                const distance = this.calculateDistance(userLat, userLng, c.latitude as number, c.longitude as number);
                return { ...c, distanceKm: distance };
            })
            .filter(c => c.distanceKm <= radiusKm);

        return commsInArea.sort((a, b) => a.distanceKm - b.distanceKm);
    }

    // ==========================================
    // 2. GET COMMUNITY DETAIL BY ID
    // ==========================================
    async getCommunityDetailById(communityId: number): Promise<CommunityDetail | null> {
        const community = this.communities.find(c => c.communityid === communityId);
        if (!community) return null;

        // Cari semua userid yang tergabung di komunitas ini melalui service anggota
        const memberService = new CommunityMembersServices();
        const allMembersData = await memberService.getMembersByCommunityId(communityId);
        
        // Hanya ambil yang statusnya sudah 'assigned' (bukan pending)
        const activeMemberIds = allMembersData
            .filter(m => m.status === 'assigned')
            .map(m => m.MemberId);

        // Ambil objek user secara utuh (termasuk email, rank, point, dll)
        const membersList = this.users.filter(u => activeMemberIds.includes(u.userid));

        return {
            ...community,
            members: membersList
        };
    }

    // ==========================================
    // 3. CREATE COMMUNITY
    // ==========================================
    async createCommunity(newCommunityData: Omit<Community, 'communityid'>): Promise<Community> {
        const newId = this.communities.length > 0 
            ? Math.max(...this.communities.map(c => c.communityid)) + 1 
            : 1;

        const newCommunity: Community = {
            communityid: newId,
            ...newCommunityData
        };

        this.communities.push(newCommunity);

        // (Harusnya dihubungkan: Otomatis memanggil memberService.joinCommunity sebagai admin)
        // Namun karena ini mock DB sederhana, akan sedikit rumit menyinkronkan data instance antar modul tanpa db beneran
        // Sementara create dibiarkan karena logic admin dan detail member dipindahkan.

        return newCommunity;
    }

    // ==========================================
    // 4. UPDATE COMMUNITY
    // ==========================================
    async updateCommunity(communityId: number, currentUserId: number, updateData: Partial<Community>): Promise<{ success: boolean; message: string; data?: Community }> {
        const index = this.communities.findIndex(c => c.communityid === communityId);

        if (index === -1) return { success: false, message: "Komunitas tidak ditemukan." };

        if (this.communities[index].userid !== currentUserId) {
            return { success: false, message: "Akses ditolak: Hanya admin yang dapat mengubah komunitas ini." };
        }

        delete updateData.communityid; // Cegah update ID komunitas
        delete updateData.userid;      // Cegah update ID kepemilikan admin

        this.communities[index] = { ...this.communities[index], ...updateData };

        return { success: true, message: "Komunitas diupdate.", data: this.communities[index] };
    }

    // ==========================================
    // 5. DELETE COMMUNITY
    // ==========================================
    async deleteCommunity(communityId: number, currentUserId: number): Promise<{ success: boolean; message: string }> {
        const index = this.communities.findIndex(c => c.communityid === communityId);

        if (index === -1) return { success: false, message: "Komunitas tidak ditemukan." };

        if (this.communities[index].userid !== currentUserId) {
            return { success: false, message: "Akses ditolak: Hanya admin yang dapat menghapus komunitas ini." };
        }

        // Hapus data komunitas
        this.communities.splice(index, 1);

        // Hapus data keanggotaan terkait (ideal: panggil CommunityMembersServices untuk menghapus semua relasi)

        return { success: true, message: "Komunitas berhasil dibubarkan." };
    }
}