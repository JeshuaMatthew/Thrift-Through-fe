import type { Community } from "../Types/Community";
import type { User } from "../Types/User";
import AxiosInstance from "../Utils/AxiosInstance";
import { formatImageUrl } from "../Utils/FormatUrl";

// Interface balikan untuk Get Detail (Komunitas + Daftar Anggota Lengkap)
export interface CommunityDetail extends Community {
    members: User[];
}

// Helper to map backend community to frontend Community interface
const mapCommunity = (data: any): Community => {
    return {
        communityid: data.community_id,
        communityname: data.community_name,
        description: data.description,
        profilepicturl: formatImageUrl(data.profile_pict_url) || '',
        bannerurl: formatImageUrl(data.banner_img_url),
        longitude: data.longitude ? parseFloat(data.longitude) : undefined,
        latitude: data.latitude ? parseFloat(data.latitude) : undefined,
        isPublic: data.is_public,
        userid: data.created_by // Note: Backend schema might vary, assuming created_by if available
    };
};

// Helper to map backend user to frontend User interface (Reused)
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

export class CommunityService {
    // ==========================================
    // 1. GET ALL COMMUNITIES
    // ==========================================
    async getAllCommunities(params?: any): Promise<{ communities: Community[]; meta: any }> {
        try {
            const response = await AxiosInstance.get("/communities", { params });
            if (response.data && Array.isArray(response.data.communities)) {
                return {
                    communities: response.data.communities.map(mapCommunity),
                    meta: response.data.meta
                };
            }
            return { communities: [], meta: {} };
        } catch (error) {
            console.error("Error fetching communities:", error);
            return { communities: [], meta: {} };
        }
    }

    async getMyCommunities(params?: any): Promise<{ communities: Community[]; meta: any }> {
        try {
            const response = await AxiosInstance.get("/communities/my-communities", { params });
            if (response.data && Array.isArray(response.data.communities)) {
                return {
                    communities: response.data.communities.map(mapCommunity),
                    meta: response.data.meta
                };
            }
            return { communities: [], meta: {} };
        } catch (error) {
            console.error("Error fetching my communities:", error);
            return { communities: [], meta: {} };
        }
    }

    async getCommunityMembers(id: number): Promise<any[]> {
        try {
            const response = await AxiosInstance.get(`/communities/${id}/members`);
            return response.data;
        } catch (error) {
            console.error("Error fetching members:", error);
            return [];
        }
    }

    async addMemberByEmail(id: number, email: string): Promise<{ success: boolean; message: string }> {
        try {
            const response = await AxiosInstance.post(`/communities/${id}/members`, { email });
            return response.data;
        } catch (error: any) {
            return { success: false, message: error.response?.data?.error || "Gagal menambah anggota" };
        }
    }

    async updateMemberStatus(communityId: number, memberId: number, status: string): Promise<{ success: boolean; message: string }> {
        try {
            const response = await AxiosInstance.put(`/communities/${communityId}/members/${memberId}`, { status });
            return response.data;
        } catch (error: any) {
            return { success: false, message: error.response?.data?.error || "Gagal mengubah status" };
        }
    }

    // ==========================================
    // 1.b GET COMMUNITIES IN AREA
    // ==========================================
    async getCommunitiesInArea(lat: number, lng: number, radius: number): Promise<(Community & { distanceKm: number })[]> {
        try {
            const response = await AxiosInstance.get("/communities/nearby", {
                params: { lat, lng, radius }
            });
            if (response.data && Array.isArray(response.data.communities)) {
                return response.data.communities.map((c: any) => ({
                    ...mapCommunity(c),
                    distanceKm: parseFloat(c.distance) || 0
                }));
            }
            return [];
        } catch (error) {
            console.error("Error fetching nearby communities:", error);
            return [];
        }
    }

    // ==========================================
    // 2. GET COMMUNITY DETAIL BY ID
    // ==========================================
    async getCommunityDetailById(communityId: number): Promise<CommunityDetail | null> {
        try {
            const response = await AxiosInstance.get(`/communities/${communityId}`);
            if (!response.data) return null;
            
            const community = mapCommunity(response.data);
            let members: User[] = [];
            try {
                const membersResponse = await AxiosInstance.get(`/communities/${communityId}/members`);
                if (Array.isArray(membersResponse.data)) {
                    members = membersResponse.data.map(mapUser);
                }
            } catch (e) {
                console.warn("Could not fetch members for community", communityId);
            }

            return {
                ...community,
                members
            };
        } catch (error) {
            return null;
        }
    }

    // ==========================================
    // 3. CREATE COMMUNITY
    // ==========================================
    async createCommunity(newCommunityData: Omit<Community, 'communityid'>): Promise<Community | null> {
        try {
            const backendData = {
                community_name: newCommunityData.communityname,
                description: newCommunityData.description,
                longitude: newCommunityData.longitude,
                latitude: newCommunityData.latitude,
                is_public: newCommunityData.isPublic,
                profilepicturl: newCommunityData.profilepicturl,
                bannerurl: newCommunityData.bannerurl,
                community_type: (newCommunityData as any).community_type
            };
            const response = await AxiosInstance.post("/communities", backendData);
            if (response.data && response.data.community) {
                return mapCommunity(response.data.community);
            }
            return null;
        } catch (error) {
            return null;
        }
    }

    // ==========================================
    // 4. UPDATE COMMUNITY
    // ==========================================
    async updateCommunity(communityId: number, _currentUserId: number, updateData: Partial<Community>): Promise<{ success: boolean; message: string; data?: Community }> {
        try {
            const backendData: any = {};
            if (updateData.communityname) backendData.community_name = updateData.communityname;
            if (updateData.description) backendData.description = updateData.description;
            if (updateData.isPublic !== undefined) backendData.is_public = updateData.isPublic;
            if (updateData.profilepicturl) backendData.profilepicturl = updateData.profilepicturl;
            if (updateData.bannerurl) backendData.bannerurl = updateData.bannerurl;

            const response = await AxiosInstance.put(`/communities/${communityId}`, backendData);
            if (response.data) {
                return { 
                    success: true, 
                    message: "Komunitas diupdate.", 
                    data: mapCommunity(response.data) 
                };
            }
            return { success: false, message: "Gagal mengupdate komunitas." };
        } catch (error: any) {
            return { 
                success: false, 
                message: error.response?.data?.error || "Gagal mengupdate komunitas." 
            };
        }
    }

    // ==========================================
    // 5. DELETE COMMUNITY
    // ==========================================
    async deleteCommunity(communityId: number, _currentUserId: number): Promise<{ success: boolean; message: string }> {
        try {
            await AxiosInstance.delete(`/communities/${communityId}`);
            return { success: true, message: "Komunitas berhasil dibubarkan." };
        } catch (error: any) {
            return { 
                success: false, 
                message: error.response?.data?.error || "Gagal menghapus komunitas." 
            };
        }
    }

    async getOrCreateDM(targetUserId: number): Promise<{ message: string; community_id: number } | null> {
        try {
            const response = await AxiosInstance.post("/communities/dm/start", { targetUserId });
            return response.data;
        } catch (error) {
            console.error("Error creating DM:", error);
            return null;
        }
    }
}