// DELETE THRIFT
// GET THRIFT DETAIL BY ID
// GET ALL THRIFTS IN AREA -- (ADA PARAMETER BESAR AREA)
// CREATE THRIFT
// UPDATE THRIFT



// GET ALL THRIFTS IN COMMUNITY -- GK TAU PERLU ATO NGGAK


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
}

export class ThriftService {
    // Simulasi Database
    private get items(): Item[] {
        // Force a data reset for v3 to ensure proper statuses are loaded
        const isV3 = localStorage.getItem('thriftsDB_v3');
        if (!isV3) {
            localStorage.removeItem('thriftsDB');
            localStorage.setItem('thriftsDB_v3', 'true');
        }

        const data = localStorage.getItem('thriftsDB');
        if (data) return JSON.parse(data);
        
        const defaultData: Item[] = [
            {
                "itemid": 1001,
                "itemname": "Samsung Galaxy S23 Ultra Bekas",
                "itemprice": 12000000,
                "itempicturl": "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?q=80&w=600&auto=format&fit=crop",
                "marketprice": "15000000",
                "lastupdatedPrice": "2023-11-10T08:00:00.000Z",
                "category": "Elektronik",
                "longitude": 107.5714,
                "latitude": -6.7984,
                "userid": 101, // Jeshua
                "itemstatus": "Tersedia",
                "itemdescription": "Kondisi 95% mulus, pemakaian wajar, garansi resmi masih aktif 3 bulan.",
                "itemquantity": 1
            },
            {
                "itemid": 1002,
                "itemname": "Kemeja Flanel Kotak-kotak Uniqlo",
                "itemprice": 150000,
                "itempicturl": "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?q=80&w=600&auto=format&fit=crop",
                "category": "Pakaian",
                "longitude": 107.5843,
                "latitude": -6.8041,
                "userid": 101, // Jeshua
                "itemstatus": "Terjual",
                "itemdescription": "Ukuran L, sudah kekecilan. Baru dipakai 2 kali. Warna masih pekat.",
                "itemquantity": 0
            },
            {
                "itemid": 1003,
                "itemname": "Meja Kerja Minimalis IKEA",
                "itemprice": 850000,
                "itempicturl": "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?q=80&w=600&auto=format&fit=crop",
                "marketprice": "1200000",
                "lastupdatedPrice": "2023-11-15T10:30:00.000Z",
                "category": "Furniture",
                "longitude": 107.5900,
                "latitude": -6.8150,
                "userid": 103, // Other User
                "itemstatus": "Tersedia",
                "itemdescription": "Dijual cepat karena mau pindahan kos. Ada lecet sedikit di pojok kanan bawah.",
                "itemquantity": 2
            }
        ];
        
        localStorage.setItem('thriftsDB', JSON.stringify(defaultData));
        return defaultData;
    }

    private set items(data: Item[]) {
        localStorage.setItem('thriftsDB', JSON.stringify(data));
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
    // 1. GET ALL THRIFTS IN AREA
    // ==========================================
    async getAllThriftsInArea(userLat: number, userLng: number, radiusKm: number): Promise<(Item & { distanceKm: number })[]> {
        const itemsInArea = this.items.map(item => {
            const distance = this.calculateDistance(userLat, userLng, item.latitude, item.longitude);
            return { ...item, distanceKm: distance };
        }).filter(item => item.distanceKm <= radiusKm);

        // Opsional: Urutkan dari yang paling dekat
        return itemsInArea.sort((a, b) => a.distanceKm - b.distanceKm);
    }

    // ==========================================
    // 1.b GET AVAILABLE THRIFTS IN AREA
    // ==========================================
    async getAvailableThriftsInArea(userLat: number, userLng: number, radiusKm: number): Promise<(Item & { distanceKm: number })[]> {
        const itemsInArea = this.items.map(item => {
            const distance = this.calculateDistance(userLat, userLng, item.latitude, item.longitude);
            return { ...item, distanceKm: distance };
        }).filter(item => item.distanceKm <= radiusKm && item.itemstatus === 'Tersedia' && item.itemquantity > 0);

        return itemsInArea.sort((a, b) => a.distanceKm - b.distanceKm);
    }

    // ==========================================
    // X. GET THRIFTS BY USER ID
    // ==========================================
    async getThriftsByUserId(userId: number): Promise<Item[]> {
        return this.items.filter(item => item.userid === userId);
    }

    // ==========================================
    // X. GET MARKET THRIFTS (Not belongs to user & available)
    // ==========================================
    async getMarketThrifts(currentUserId: number): Promise<Item[]> {
        return this.items.filter(item => 
            item.userid !== currentUserId && 
            item.itemstatus === 'Tersedia' && 
            item.itemquantity > 0
        );
    }

    // ==========================================
    // 2. GET THRIFT DETAIL BY ID
    // ==========================================
    async getThriftDetailById(itemId: number): Promise<Item | null> {
        const item = this.items.find(i => i.itemid === itemId);
        return item || null;
    }

    // ==========================================
    // 3. CREATE THRIFT
    // ==========================================
    // Menggunakan Omit untuk membuang 'itemid' dari input karena ID akan digenerate otomatis
    async createThrift(newItemData: Omit<Item, 'itemid'>): Promise<Item> {
        const generatedId = Math.floor(1000 + Math.random() * 9000); // Generate ID acak: 1234
        
        const newItem: Item = {
            itemid: generatedId,
            ...newItemData
        };

        this.items = [...this.items, newItem];
        return newItem;
    }

    // ==========================================
    // 4. UPDATE THRIFT
    // ==========================================
    // Menggunakan Partial karena user mungkin hanya mengupdate 1 atau 2 field (misal harganya saja)
    async updateThrift(itemId: number, userId: number, updateData: Partial<Item>): Promise<{ success: boolean; data?: Item; message: string }> {
        const index = this.items.findIndex(i => i.itemid === itemId);

        if (index === -1) return { success: false, message: "Barang tidak ditemukan." };
        
        // Cek otorisasi (hanya pemilik barang yang boleh update)
        if (this.items[index].userid !== userId) {
            return { success: false, message: "Akses ditolak: Anda bukan pemilik barang ini." };
        }

        // Update data
        const dbItems = this.items;
        dbItems[index] = { ...dbItems[index], ...updateData };

        // Update waktu harga jika harga diubah
        if (updateData.itemprice) {
            dbItems[index].lastupdatedPrice = new Date().toISOString();
        }

        this.items = dbItems;
        return { success: true, data: dbItems[index], message: "Barang berhasil diupdate." };
    }

    // ==========================================
    // 5. DELETE THRIFT
    // ==========================================
    async deleteThrift(itemId: number, userId: number): Promise<{ success: boolean; message: string }> {
        const index = this.items.findIndex(i => i.itemid === itemId);

        if (index === -1) return { success: false, message: "Barang tidak ditemukan." };

        // Cek otorisasi (hanya pemilik barang yang boleh hapus)
        if (this.items[index].userid !== userId) {
            return { success: false, message: "Akses ditolak: Anda bukan pemilik barang ini." };
        }

        const dbItems = this.items;
        dbItems.splice(index, 1);
        this.items = dbItems;
        
        return { success: true, message: "Barang berhasil dihapus." };
    }
}