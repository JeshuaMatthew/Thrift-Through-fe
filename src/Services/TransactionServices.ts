import type { Transaction } from "../Types/Transaction";
import AxiosInstance from "../Utils/AxiosInstance";
import { formatImageUrl } from "../Utils/FormatUrl";

// Helper to map backend transaction to frontend Transaction interface
const mapTransaction = (data: any): Transaction => {
    return {
        ...data,
        transactionid: data.transaction_id,
        itemid: data.item_id,
        buyerid: data.buyer_id,
        sellerid: data.seller_id,
        transactiondate: new Date(data.transaction_date),
        finalprice: parseFloat(data.final_price),
        transactiontype: data.transaction_type,
        status: data.status,
        item_pict_url: formatImageUrl(data.item_pict_url),
        seller_name: data.seller_name,
        seller_user_name: data.seller_user_name,
        seller_profile_pict: formatImageUrl(data.seller_profile_pict),
        seller_email: data.seller_email,
        seller_phone_num: data.seller_phone_num,
        seller_banner_img: formatImageUrl(data.seller_banner_img),
        buyer_name: data.buyer_name,
        buyer_user_name: data.buyer_user_name,
        buyer_profile_pict: formatImageUrl(data.buyer_profile_pict),
        buyer_email: data.buyer_email,
        buyer_phone_num: data.buyer_phone_num,
        buyer_banner_img: formatImageUrl(data.buyer_banner_img),
        item_name: data.item_name,
        category: data.category
    };
};

export class TransactionServices {
    // ==========================================
    // 1. GET ALL TRANSACTIONS (Combining Sales & Purchases)
    // ==========================================
    async getAllTransactions(): Promise<Transaction[]> {
        try {
            const [salesRes, purchasesRes] = await Promise.all([
                AxiosInstance.get("/transactions/sales"),
                AxiosInstance.get("/transactions/purchases")
            ]);
            
            const sales = Array.isArray(salesRes.data) ? salesRes.data.map(mapTransaction) : [];
            const purchases = Array.isArray(purchasesRes.data) ? purchasesRes.data.map(mapTransaction) : [];
            
            return [...sales, ...purchases].sort((a, b) => 
                b.transactiondate.getTime() - a.transactiondate.getTime()
            );
        } catch (error) {
            console.error("Error fetching transactions:", error);
            return [];
        }
    }

    // ==========================================
    // 2. GET TRANSACTIONS BY ITEM ID
    // ==========================================
    async getTransactionsByItemId(itemId: number): Promise<Transaction[]> {
        const all = await this.getAllTransactions();
        return all.filter(t => t.itemid === itemId);
    }

    // ==========================================
    // 3. GET TRANSACTIONS AS SELLER
    // ==========================================
    async getTransactionsAsSeller(params?: any): Promise<{ transactions: Transaction[]; meta: any }> {
        try {
            const response = await AxiosInstance.get("/transactions/sales", { params });
            if (response.data && Array.isArray(response.data.transactions)) {
                return {
                    transactions: response.data.transactions.map(mapTransaction),
                    meta: response.data.meta
                };
            }
            return { transactions: [], meta: {} };
        } catch (error) {
            return { transactions: [], meta: {} };
        }
    }

    // ==========================================
    // 4. GET TRANSACTIONS AS BUYER
    // ==========================================
    async getTransactionsAsBuyer(params?: any): Promise<{ transactions: Transaction[]; meta: any }> {
        try {
            const response = await AxiosInstance.get("/transactions/purchases", { params });
            if (response.data && Array.isArray(response.data.transactions)) {
                return {
                    transactions: response.data.transactions.map(mapTransaction),
                    meta: response.data.meta
                };
            }
            return { transactions: [], meta: {} };
        } catch (error) {
            return { transactions: [], meta: {} };
        }
    }

    // ==========================================
    // 5. BUY ITEM
    // ==========================================
    async buyItem(itemId: number, finalPrice: number, transactionType: 'Uang' | 'Barter'): Promise<{ success: boolean; message: string }> {
        try {
            const response = await AxiosInstance.post(`/transactions/buy/${itemId}`, {
                final_price: finalPrice,
                transaction_type: transactionType
            });
            return { success: true, message: response.data.message || "Pembelian berhasil!" };
        } catch (error: any) {
            return { 
                success: false, 
                message: error.response?.data?.error || "Gagal melakukan pembelian." 
            };
        }
    }

    // ==========================================
    // 6. UPDATE STATUS
    // ==========================================
    async updateStatus(transactionId: number, status: string): Promise<{ success: boolean; message: string }> {
        try {
            const response = await AxiosInstance.put(`/transactions/${transactionId}/status`, { status });
            return { success: true, message: response.data.message || "Status transaksi diupdate." };
        } catch (error: any) {
            return { 
                success: false, 
                message: error.response?.data?.error || "Gagal mengupdate status transaksi." 
            };
        }
    }
}
