export interface Community{
    communityid: number;
    userid : number;
    description: string;
    profilepicturl: string;
    communityname: string;
    longitude?: number;
    latitude?: number;
    isPublic: boolean;
}