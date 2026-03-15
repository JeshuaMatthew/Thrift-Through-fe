import AxiosInstance from "../Utils/AxiosInstance";
import { formatImageUrl } from "../Utils/FormatUrl";

export interface Item {
    itemid: number;
    itemname: string;
    itemprice: number;
    itempicturl: string;
    marketprice?: string;
    lastupdatedPrice?: string;
    category: string;
    longitude: number;
    latitude: number;
    userid: number;
    itemstatus: string;
    itemdescription: string;
    itemquantity: number;
    transaction_type: string;
    // New seller info
    seller_name?: string;
    seller_profile_pict?: string;
    // New analysis fields
    ai_price_analysis?: any;
    ai_price_analysis_text?: string;
    ai_carbon_analysis?: any;
    ai_carbon_analysis_text?: string;
    last_price_analysis?: string;
    last_carbon_analysis?: string;
}

// Helper to map backend item to frontend Item interface
const mapItem = (data: any): Item => {
    return {
        itemid: data.item_id,
        itemname: data.item_name,
        itemprice: data.price,
        itempicturl: formatImageUrl(data.item_pict_url) || '',
        marketprice: data.market_price,
        lastupdatedPrice: data.last_updated_price || data.last_price_analysis,
        category: data.category,
        longitude: parseFloat(data.longitude),
        latitude: parseFloat(data.latitude),
        userid: data.user_id,
        itemstatus: data.item_status,
        itemdescription: data.item_description,
        itemquantity: data.item_quantity,
        transaction_type: data.transaction_type,
        // Seller info mapping
        seller_name: data.user_name,
        seller_profile_pict: formatImageUrl(data.profile_pict_url),
        // Analysis fields mapping
        ai_price_analysis: data.ai_price_analysis,
        ai_price_analysis_text: data.ai_price_analysis_text,
        ai_carbon_analysis: data.ai_carbon_analysis,
        ai_carbon_analysis_text: data.ai_carbon_analysis_text,
        last_price_analysis: data.last_price_analysis,
        last_carbon_analysis: data.last_carbon_analysis
    };
};

export class ThriftService {
    // ==========================================
    // 1. GET ALL THRIFTS IN AREA
    // ==========================================
    async getAllThriftsInArea(userLat: number, userLng: number, radiusKm: number): Promise<(Item & { distanceKm: number })[]> {
        try {
            const response = await AxiosInstance.get("/items/nearby", {
                params: { lat: userLat, lng: userLng, radius: radiusKm }
            });
            
            if (response.data && Array.isArray(response.data.items)) {
                return response.data.items.map((item: any) => ({
                    ...mapItem(item),
                    distanceKm: item.distance // Backend returns 'distance'
                }));
            }
            return [];
        } catch (error) {
            console.error("Error fetching nearby items:", error);
            return [];
        }
    }

    // ==========================================
    // 1.b GET AVAILABLE THRIFTS IN AREA
    // ==========================================
    async getAvailableThriftsInArea(userLat: number, userLng: number, radiusKm: number): Promise<(Item & { distanceKm: number })[]> {
        const items = await this.getAllThriftsInArea(userLat, userLng, radiusKm);
        return items.filter(item => item.itemstatus === 'Available' && item.itemquantity > 0);
    }

    // ==========================================
    // X. GET MY ITEMS (Currently logged-in user)
    // ==========================================
    async getMyItems(params?: any): Promise<{ items: Item[]; meta: any }> {
        try {
            const response = await AxiosInstance.get("/items/my-items", { params });
            if (response.data && Array.isArray(response.data.items)) {
                return {
                    items: response.data.items.map(mapItem),
                    meta: response.data.meta
                };
            }
            return { items: [], meta: {} };
        } catch (error) {
            console.error("Error fetching my items:", error);
            return { items: [], meta: {} };
        }
    }

    // ==========================================
    // X. GET OTHER PEOPLE'S ITEMS (For Market)
    // ==========================================
    async getOtherItems(params?: any): Promise<{ items: Item[]; meta: any }> {
        try {
            const response = await AxiosInstance.get("/items/other", { params });
            if (response.data && Array.isArray(response.data.items)) {
                return {
                    items: response.data.items.map(mapItem),
                    meta: response.data.meta
                };
            }
            return { items: [], meta: {} };
        } catch (error) {
            console.error("Error fetching other items:", error);
            return { items: [], meta: {} };
        }
    }

    // ==========================================
    // X. GET THRIFTS BY USER ID (General query)
    // ==========================================
    async getThriftsByUserId(userId: number): Promise<Item[]> {
        try {
            const response = await AxiosInstance.get("/items");
            if (response.data && Array.isArray(response.data.items)) {
                return response.data.items
                    .filter((item: any) => item.user_id === userId)
                    .map(mapItem);
            }
            return [];
        } catch (error) {
            return [];
        }
    }

    // ==========================================
    // 2. GET THRIFT DETAIL BY ID
    // ==========================================
    async getThriftDetailById(itemId: number): Promise<Item | null> {
        try {
            const response = await AxiosInstance.get(`/items/${itemId}`);
            if (response.data) {
                return mapItem(response.data);
            }
            return null;
        } catch (error) {
            return null;
        }
    }

    // ==========================================
    // 3. CREATE THRIFT
    // ==========================================
    async createThrift(newItemData: Omit<Item, 'itemid'>, imageFile?: File): Promise<Item | null> {
        try {
            const formData = new FormData();
            formData.append('item_name', newItemData.itemname);
            formData.append('price', newItemData.itemprice.toString());
            formData.append('category', newItemData.category);
            formData.append('longitude', newItemData.longitude.toString());
            formData.append('latitude', newItemData.latitude.toString());
            formData.append('item_description', newItemData.itemdescription);
            formData.append('item_quantity', newItemData.itemquantity.toString());
            formData.append('transaction_type', newItemData.transaction_type);
            
            if (imageFile) {
                formData.append('image', imageFile);
            }
            
            const response = await AxiosInstance.post("/items", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            if (response.data) {
                return mapItem(response.data);
            }
            return null;
        } catch (error) {
            console.error("Error creating item:", error);
            return null;
        }
    }

    // ==========================================
    // 4. UPDATE THRIFT
    // ==========================================
    async updateThrift(itemId: number, _userId: number, updateData: Partial<Item>): Promise<{ success: boolean; data?: Item; message: string }> {
        try {
            const backendData: any = {};
            if (updateData.itemname) backendData.item_name = updateData.itemname;
            if (updateData.itemprice) backendData.price = updateData.itemprice;
            if (updateData.itemstatus) backendData.item_status = updateData.itemstatus;
            if (updateData.itemdescription) backendData.item_description = updateData.itemdescription;
            if (updateData.itemquantity !== undefined) backendData.item_quantity = updateData.itemquantity;
            if (updateData.transaction_type) backendData.transaction_type = updateData.transaction_type;

            const response = await AxiosInstance.put(`/items/${itemId}`, backendData);
            if (response.data) {
                return { 
                    success: true, 
                    data: mapItem(response.data), 
                    message: "Barang berhasil diupdate." 
                };
            }
            return { success: false, message: "Gagal mengupdate barang." };
        } catch (error: any) {
            return { 
                success: false, 
                message: error.response?.data?.error || "Akses ditolak atau barang tidak ditemukan." 
            };
        }
    }

    // ==========================================
    // 5. DELETE THRIFT
    // ==========================================
    async deleteThrift(itemId: number, _userId: number): Promise<{ success: boolean; message: string }> {
        try {
            await AxiosInstance.delete(`/items/${itemId}`);
            return { success: true, message: "Barang berhasil dihapus." };
        } catch (error: any) {
            return { 
                success: false, 
                message: error.response?.data?.error || "Gagal menghapus barang." 
            };
        }
    }
}