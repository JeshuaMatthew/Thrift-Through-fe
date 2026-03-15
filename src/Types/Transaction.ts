export interface Transaction {
    transactionid: number;
    itemid: number;
    buyerid: number;
    sellerid: number;
    transactiondate: Date;
    finalprice: number;
    transactiontype: string;
    status: string;
    longitude?: number;
    latitude?: number;
    item_pict_url?: string;
    item_name?: string;
    category?: string;
    seller_name?: string;
    seller_user_name?: string;
    seller_profile_pict?: string;
    seller_email?: string;
    seller_phone_num?: string;
    seller_banner_img?: string;
    buyer_name?: string;
    buyer_user_name?: string;
    buyer_profile_pict?: string;
    buyer_email?: string;
    buyer_phone_num?: string;
    buyer_banner_img?: string;
}