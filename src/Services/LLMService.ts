import AxiosInstance from "../Utils/AxiosInstance";

export class LLMService {
    // ==========================================
    // 1. ANALYZE PRICE
    // ==========================================
    async analyzePrice(itemId: number): Promise<{ success: boolean; analysis?: any; message: string }> {
        try {
            const response = await AxiosInstance.post("/ai/analyze-price", { item_id: itemId });
            return { 
                success: true, 
                analysis: response.data.analysis, 
                message: "Analisis harga berhasil." 
            };
        } catch (error: any) {
            return { 
                success: false, 
                message: error.response?.data?.error || "Gagal menganalisis harga." 
            };
        }
    }

    // ==========================================
    // 2. ANALYZE CARBON
    // ==========================================
    async analyzeCarbon(itemId: number): Promise<{ success: boolean; analysis?: any; message: string }> {
        try {
            const response = await AxiosInstance.post("/ai/analyze-carbon", { item_id: itemId });
            return { 
                success: true, 
                analysis: response.data.analysis, 
                message: "Analisis jejak karbon berhasil." 
            };
        } catch (error: any) {
            return { 
                success: false, 
                message: error.response?.data?.error || "Gagal menganalisis jejak karbon." 
            };
        }
    }
}