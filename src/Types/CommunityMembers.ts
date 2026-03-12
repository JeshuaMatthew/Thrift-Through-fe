export interface CommunityMembers {
    CommunityMembersId: number;
    CommunityId: number;
    MemberId: number;
    Role: 'admin' | 'user';
    status: 'pending' | 'assigned';
}
