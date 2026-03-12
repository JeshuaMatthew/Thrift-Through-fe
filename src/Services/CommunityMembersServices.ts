import type { CommunityMembers } from '../Types/CommunityMembers';
import { CommunityService } from './CommunitiesServices';

export class CommunityMembersServices {
    // Simulasi Database
    private get members(): CommunityMembers[] {
        const data = localStorage.getItem('communityMembersDB');
        if (data) return JSON.parse(data);
        
        // Data default (mock)
        const defaultData: CommunityMembers[] = [
            { CommunityMembersId: 1, CommunityId: 1, MemberId: 101, Role: 'admin', status: 'assigned' },
            { CommunityMembersId: 2, CommunityId: 1, MemberId: 102, Role: 'user', status: 'assigned' },
            { CommunityMembersId: 3, CommunityId: 2, MemberId: 102, Role: 'admin', status: 'assigned' },
            { CommunityMembersId: 4, CommunityId: 3, MemberId: 103, Role: 'admin', status: 'assigned' },
            // Simulasi user pending
            { CommunityMembersId: 5, CommunityId: 1, MemberId: 103, Role: 'user', status: 'pending' }, 
        ];
        
        localStorage.setItem('communityMembersDB', JSON.stringify(defaultData));
        return defaultData;
    }

    private set members(data: CommunityMembers[]) {
        localStorage.setItem('communityMembersDB', JSON.stringify(data));
    }

    // ==========================================
    // 1. GET ALL MEMBERS IN A COMMUNITY
    // ==========================================
    async getMembersByCommunityId(communityId: number): Promise<CommunityMembers[]> {
        return this.members.filter(m => m.CommunityId === communityId);
    }

    // ==========================================
    // 2. JOIN COMMUNITY
    // ==========================================
    async joinCommunity(communityId: number, memberId: number): Promise<{ success: boolean; message: string; data?: CommunityMembers }> {
        // Cek apakah user sudah join atau pending
        const isExist = this.members.find(m => m.CommunityId === communityId && m.MemberId === memberId);
        
        if (isExist) {
            return { success: false, message: `Anda sudah berstatus ${isExist.status} di komunitas ini.` };
        }

        // Cek pengaturan verifikasi komunitas (isPublic)
        const communityService = new CommunityService();
        const community = await communityService.getCommunityDetailById(communityId);
        
        if (!community) {
             return { success: false, message: "Komunitas tidak ditemukan." };
        }

        // Jika public, langsung assigned, jika private (butuh verifikasi), statusnya pending
        const newStatus = community.isPublic ? 'assigned' : 'pending';

        const newId = this.members.length > 0 
            ? Math.max(...this.members.map(m => m.CommunityMembersId)) + 1 
            : 1;

        const newMember: CommunityMembers = {
            CommunityMembersId: newId,
            CommunityId: communityId,
            MemberId: memberId,
            Role: 'user',
            status: newStatus
        };

        this.members = [...this.members, newMember];

        const message = newStatus === 'assigned' 
            ? "Berhasil bergabung ke komunitas." 
            : "Permintaan bergabung terkirim, menunggu persetujuan Admin.";

        return { success: true, message, data: newMember };
    }

    // ==========================================
    // 3. APPROVE MEMBER (Admin Only)
    // ==========================================
    async approveMember(communityMembersId: number, adminMemberId: number): Promise<{ success: boolean; message: string }> {
        const index = this.members.findIndex(m => m.CommunityMembersId === communityMembersId);
        if (index === -1) return { success: false, message: "Pendaftar tidak ditemukan." };

        const communityId = this.members[index].CommunityId;

        // Cek apakah user yang mengeksekusi ini adalah admin di komunitas tersebut
        const isAdmin = this.members.find(m => m.CommunityId === communityId && m.MemberId === adminMemberId && m.Role === 'admin');
        if (!isAdmin) {
            return { success: false, message: "Akses ditolak: Anda bukan admin komunitas ini." };
        }

        const dbMembers = this.members;
        dbMembers[index].status = 'assigned';
        this.members = dbMembers;

        return { success: true, message: "Pengguna berhasil disetujui bergabung." };
    }

    // ==========================================
    // 4. REMOVE/REJECT MEMBER (Admin Only or Self)
    // ==========================================
    async removeMember(communityMembersId: number, currentUserId: number): Promise<{ success: boolean; message: string }> {
        const index = this.members.findIndex(m => m.CommunityMembersId === communityMembersId);
        if (index === -1) return { success: false, message: "Data tidak ditemukan." };

        const memberData = this.members[index];

        // Bisa dilakukan jika dia admin, ATAU jika dia ingin keluar sendiri (self-leave)
        const isAdmin = this.members.find(m => m.CommunityId === memberData.CommunityId && m.MemberId === currentUserId && m.Role === 'admin');
        const isSelf = memberData.MemberId === currentUserId;

        if (!isAdmin && !isSelf) {
            return { success: false, message: "Akses ditolak." };
        }

        const dbMembers = this.members;
        dbMembers.splice(index, 1);
        this.members = dbMembers;
        
        return { success: true, message: "Berhasil dikeluarkan dari komunitas." };
    }

    // ==========================================
    // 5. LEAVE COMMUNITY
    // ==========================================
    async leaveCommunity(communityId: number, currentUserId: number): Promise<{ success: boolean; message: string }> {
        const index = this.members.findIndex(m => m.CommunityId === communityId && m.MemberId === currentUserId);
        if (index === -1) return { success: false, message: "Anda bukan anggota dari komunitas ini." };

        const dbMembers = this.members;
        dbMembers.splice(index, 1);
        this.members = dbMembers;
        
        return { success: true, message: "Berhasil keluar dari komunitas." };
    }
}
