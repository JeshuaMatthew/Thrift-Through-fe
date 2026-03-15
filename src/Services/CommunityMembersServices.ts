import type { CommunityMembers } from '../Types/CommunityMembers';
import AxiosInstance from '../Utils/AxiosInstance';

export class CommunityMembersServices {
    // ==========================================
    // 1. GET ALL MEMBERS IN A COMMUNITY
    // ==========================================
    async getMembersByCommunityId(communityId: number): Promise<CommunityMembers[]> {
        try {
            // Note: Backend might need a new endpoint for this.
            // Assuming /communities/:id/members exists or we return empty list.
            const response = await AxiosInstance.get(`/communities/${communityId}/members`);
            if (Array.isArray(response.data)) {
                return response.data.map((m: any) => ({
                    CommunityMembersId: m.community_member_id,
                    CommunityId: m.community_id,
                    MemberId: m.member_id,
                    Role: m.role?.toLowerCase() || 'user',
                    status: m.status?.toLowerCase() || 'assigned'
                }));
            }
            return [];
        } catch (error) {
            console.error("Error fetching community members:", error);
            return [];
        }
    }

    // ==========================================
    // 2. JOIN COMMUNITY
    // ==========================================
    async joinCommunity(communityId: number, _memberId: number): Promise<{ success: boolean; message: string; data?: CommunityMembers }> {
        try {
            const response = await AxiosInstance.post(`/communities/${communityId}/join`);
            return { 
                success: true, 
                message: response.data.message || "Berhasil bergabung ke komunitas." 
            };
        } catch (error: any) {
            return { 
                success: false, 
                message: error.response?.data?.error || "Gagal bergabung ke komunitas." 
            };
        }
    }

    // ==========================================
    // 3. APPROVE MEMBER (Admin Only)
    // ==========================================
    async approveMember(communityMembersId: number, _adminMemberId: number): Promise<{ success: boolean; message: string }> {
        try {
            // Placeholder: Backend might not have this specific endpoint yet
            const response = await AxiosInstance.put(`/community-members/${communityMembersId}/approve`);
            return { success: true, message: response.data.message || "Pengguna berhasil disetujui bergabung." };
        } catch (error: any) {
            return { success: false, message: error.response?.data?.error || "Aksi ditolak." };
        }
    }

    // ==========================================
    // 4. REMOVE/REJECT MEMBER (Admin Only or Self)
    // ==========================================
    async removeMember(communityMembersId: number, _currentUserId: number): Promise<{ success: boolean; message: string }> {
        try {
            await AxiosInstance.delete(`/community-members/${communityMembersId}`);
            return { success: true, message: "Berhasil dikeluarkan dari komunitas." };
        } catch (error: any) {
            return { success: false, message: error.response?.data?.error || "Aksi ditolak." };
        }
    }

    // ==========================================
    // 5. LEAVE COMMUNITY
    // ==========================================
    async leaveCommunity(communityId: number, _currentUserId: number): Promise<{ success: boolean; message: string }> {
        try {
            // Note: If backend doesn't have a specific leave endpoint, maybe use removeMember or similar
            await AxiosInstance.post(`/communities/${communityId}/leave`);
            return { success: true, message: "Berhasil keluar dari komunitas." };
        } catch (error: any) {
            return { success: false, message: error.response?.data?.error || "Gagal keluar dari komunitas." };
        }
    }
}
