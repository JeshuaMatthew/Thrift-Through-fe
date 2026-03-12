// yang ini websocket

import type { Chat } from "../Types/Chat";


// Tipe untuk callback listener (Saat ada pesan masuk)
type MessageListener = (chat: Chat) => void;

// ==========================================
// SERVICE CLASS (WEBSOCKET STYLE DUMMY)
// ==========================================
export class ChatService {
    // 1. DUMMY DATABASE
    // Catatan: datesent diubah dari string ISO menjadi object Date() agar sesuai dengan Interface
    private chats: Chat[] = [
        {
            chatid: 1,
            communityid: 1,
            userid: 101,
            chattext: "Halo teman-teman! Ada info kopdar minggu ini?",
            datesent: new Date("2023-11-20T08:30:00.000Z")
        },
        {
            chatid: 2,
            communityid: 1,
            userid: 102,
            chattext: "Hai mas Budi, rencana di cafe biasa hari Sabtu jam 4 sore.",
            datesent: new Date("2023-11-20T08:35:12.000Z")
        },
        {
            chatid: 3,
            communityid: 1,
            userid: 101,
            chattext: "Sip, makasih infonya. Nanti saya usahakan merapat.",
            datesent: new Date("2023-11-20T08:40:05.000Z")
        },
        {
            chatid: 4,
            communityid: 2,
            userid: 103,
            chattext: "Misi numpang nanya, tempat servis stik PS terdekat daerah Selatan di mana ya?",
            datesent: new Date("2023-11-20T09:15:00.000Z")
        }
    ];

    // 2. WEBSOCKET STATE (Simulasi)
    private currentUserId: number | null = null;
    private isConnected: boolean = false;
    private joinedRooms: Set<number> = new Set(); // Menyimpan ID komunitas yang sedang dibuka user
    private messageListeners: MessageListener[] = []; // Daftar fungsi yang dipanggil saat pesan masuk

    // ==========================================
    // 1. CONNECT & DISCONNECT (Simulasi Socket.io)
    // ==========================================
    connect(userId: number): void {
        this.currentUserId = userId;
        this.isConnected = true;
        console.log(`[WS] Socket Connected untuk UserID: ${userId}`);
    }

    disconnect(): void {
        this.currentUserId = null;
        this.isConnected = false;
        this.joinedRooms.clear();
        this.messageListeners = [];
        console.log(`[WS] Socket Disconnected.`);
    }

    // ==========================================
    // 2. ROOM MANAGEMENT (Simulasi socket.join)
    // ==========================================
    // Biasanya saat masuk room, kita juga me-load history chat sebelumnya
    joinCommunityRoom(communityId: number): Chat[] {
        if (!this.isConnected) throw new Error("Socket belum terhubung.");
        
        this.joinedRooms.add(communityId);
        console.log(`[WS] Berhasil join room Komunitas: ${communityId}`);

        // Return history chat untuk komunitas ini
        return this.chats.filter(c => c.communityid === communityId);
    }

    leaveCommunityRoom(communityId: number): void {
        this.joinedRooms.delete(communityId);
        console.log(`[WS] Meninggalkan room Komunitas: ${communityId}`);
    }

    // ==========================================
    // 3. LISTEN TO EVENTS (Simulasi socket.on('receive_message'))
    // ==========================================
    onReceiveMessage(callback: MessageListener): void {
        this.messageListeners.push(callback);
    }

    // ==========================================
    // 4. EMIT EVENTS (Simulasi socket.emit('send_message'))
    // ==========================================
    sendMessage(communityId: number, chattext: string): void {
        if (!this.isConnected || !this.currentUserId) {
            console.error("[WS] Error: Tidak bisa mengirim pesan. Socket terputus.");
            return;
        }

        // Buat objek pesan baru
        const newChat: Chat = {
            chatid: this.chats.length + 1,
            communityid: communityId,
            userid: this.currentUserId,
            chattext: chattext,
            datesent: new Date() // Waktu saat ini
        };

        // Simpan ke database
        this.chats.push(newChat);

        // --- BROADCAST SIMULATION ---
        // Jika user sedang berada di room komunitas tersebut, trigger event/callback
        if (this.joinedRooms.has(communityId)) {
            this.messageListeners.forEach(listener => listener(newChat));
        }
    }

    // --- HELPER DUMMY ---
    // Fungsi ini murni untuk simulasi saja, seolah-olah ada orang lain (User 102) membalas pesan.
    simulateReplyFromOtherUser(communityId: number, otherUserId: number, text: string) {
        setTimeout(() => {
            const replyChat: Chat = {
                chatid: this.chats.length + 1,
                communityid: communityId,
                userid: otherUserId,
                chattext: text,
                datesent: new Date()
            };
            this.chats.push(replyChat);

            // Jika user kita sedang ada di room tersebut, dia akan menerima notifikasi pesan masuk
            if (this.joinedRooms.has(communityId)) {
                this.messageListeners.forEach(listener => listener(replyChat));
            }
        }, 2000); // Delay 2 detik agar terasa seperti real-time typing
    }

    // ==========================================
    // 5. SEARCH MY CHATS
    // ==========================================
    // As ChatService mock only stores pure message data, "searching my chats" 
    // Usually means filtering the list of community rooms/users by a search term.
    // In our context on ChatPage, we filter the `ChatListItem`s.
    // Here is a generic service method to search across chat history as well.
    searchMyChats(searchTerm: string, userId: number): Chat[] {
        const lowerTerm = searchTerm.toLowerCase();
        return this.chats.filter(c => 
            (c.userid === userId || this.joinedRooms.has(c.communityid)) &&
            c.chattext.toLowerCase().includes(lowerTerm)
        );
    }

    // ==========================================
    // 6. EDIT & DELETE CHATS
    // ==========================================
    editMessage(chatId: number, userId: number, newText: string): boolean {
        const chatIndex = this.chats.findIndex(c => c.chatid === chatId && c.userid === userId);
        if (chatIndex !== -1) {
            this.chats[chatIndex].chattext = newText;
            // Di environment nyata, kita akan membroadcast bahwa pesan di-edit ke semua user di room tersebut
            return true;
        }
        return false;
    }

    deleteMessages(chatIds: number[], userId: number): boolean {
        let anyDeleted = false;
        this.chats.forEach(chat => {
            if (chatIds.includes(chat.chatid) && chat.userid === userId) {
                chat.chattext = "pesan ini dihapus oleh pengguna";
                anyDeleted = true;
            }
        });
        return anyDeleted;
    }
}