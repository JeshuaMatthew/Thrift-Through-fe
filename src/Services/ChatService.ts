import { io, Socket } from "socket.io-client";
import type { Chat } from "../Types/Chat";
import AxiosInstance from "../Utils/AxiosInstance";

// Real-time listener callback type
type MessageListener = (chat: Chat) => void;
type EditListener = (chat: Chat) => void;
type DeleteListener = (data: { chat_id: number }) => void;

// Backend Socket.io URL (Match with your BE .env/port)
const SOCKET_URL = "http://localhost:3000"; // Corrected to match backend port

export class ChatService {
    private socket: Socket | null = null;
    private currentUserId: number | null = null;
    private messageListeners: MessageListener[] = [];
    private editListeners: EditListener[] = [];
    private deleteListeners: DeleteListener[] = [];

    // ==========================================
    // 1. CONNECT & DISCONNECT
    // ==========================================
    connect(userId: number): void {
        this.currentUserId = userId;
        if (this.socket) return;

        this.socket = io(SOCKET_URL, {
            withCredentials: true
        });

        this.socket.on("connect", () => {
            console.log("[WS] Connected to Chat Server");
        });

        // Listen for new messages
        this.socket.on("receive_message", (data: any) => {
            const chat: Chat = {
                chatId: Number(data.chat_id),
                communityId: Number(data.community_id),
                userId: Number(data.user_id),
                chatText: data.chat_text,
                dateSent: new Date(data.date_sent)
            };
            this.messageListeners.forEach(listener => listener(chat));
        });

        // Listen for edited messages
        this.socket.on("message_edited", (data: any) => {
            const chat: Chat = {
                chatId: Number(data.chat_id),
                communityId: Number(data.community_id),
                userId: Number(data.user_id),
                chatText: data.chat_text,
                dateSent: new Date(data.date_sent)
            };
            this.editListeners.forEach(listener => listener(chat));
        });

        // Listen for deleted messages
        this.socket.on("message_deleted", (data: any) => {
            this.deleteListeners.forEach(listener => listener(data));
        });

        this.socket.on("error", (err: any) => {
            console.error("[WS] Socket Error:", err);
        });

        this.socket.on("disconnect", () => {
            console.log("[WS] Disconnected from Chat Server");
        });
    }

    disconnect(): void {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
        this.currentUserId = null;
        this.messageListeners = [];
        this.editListeners = [];
        this.deleteListeners = [];
    }

    // ==========================================
    // 2. ROOM MANAGEMENT
    // ==========================================
    async joinCommunityRoom(communityId: number): Promise<Chat[]> {
        if (!this.socket) throw new Error("Socket not connected.");
        
        // Join room in WebSocket
        this.socket.emit("join_room", communityId);

        // Fetch history from REST API
        try {
            const response = await AxiosInstance.get(`/chats/${communityId}`);
            if (response.data && Array.isArray(response.data)) {
                return response.data.map((c: any) => ({
                    chatId: Number(c.chat_id),
                    communityId: Number(c.community_id),
                    userId: Number(c.user_id),
                    chatText: c.chat_text,
                    dateSent: new Date(c.date_sent)
                }));
            }
        } catch (error) {
            console.error("[WS] Error loading history:", error);
        }
        return [];
    }

    // ==========================================
    // 3. LISTEN TO EVENTS
    // ==========================================
    onReceiveMessage(callback: MessageListener): void {
        this.messageListeners.push(callback);
    }

    onMessageEdited(callback: EditListener): void {
        this.editListeners.push(callback);
    }

    onMessageDeleted(callback: DeleteListener): void {
        this.deleteListeners.push(callback);
    }

    clearListeners(): void {
        this.messageListeners = [];
        this.editListeners = [];
        this.deleteListeners = [];
    }

    // ==========================================
    // 4. EMIT EVENTS
    // ==========================================
    sendMessage(communityId: number, chattext: string): void {
        if (!this.socket || !this.currentUserId) {
            console.error("[WS] Not connected.");
            return;
        }

        this.socket.emit("send_message", {
            community_id: communityId,
            user_id: this.currentUserId,
            chat_text: chattext
        });
    }

    editMessage(chatId: number, communityId: number, newText: string): void {
        if (!this.socket || !this.currentUserId) return;
        
        this.socket.emit("edit_message", {
            chat_id: chatId,
            community_id: communityId,
            new_text: newText,
            user_id: this.currentUserId
        });
    }

    deleteMessages(chatIds: number[], communityId: number): void {
        if (!this.socket || !this.currentUserId) return;
        
        chatIds.forEach(id => {
            this.socket?.emit("delete_message", {
                chat_id: id,
                community_id: communityId,
                user_id: this.currentUserId
            });
        });
    }

    // ==========================================
    // 5. API CALLS
    // ==========================================
    async getMyChatList(): Promise<any[]> {
        try {
            const response = await AxiosInstance.get("/chats/my-chats");
            return response.data;
        } catch (error) {
            console.error("Error fetching chat list:", error);
            return [];
        }
    }

    async searchMyChats(keyword: string): Promise<Chat[]> {
        try {
            const response = await AxiosInstance.get("/chats/search", {
                params: { keyword }
            });
            if (response.data && Array.isArray(response.data.messages)) {
                return response.data.messages.map((c: any) => ({
                    chatId: Number(c.chat_id),
                    communityId: Number(c.community_id),
                    userId: Number(c.user_id),
                    chatText: c.chat_text,
                    dateSent: new Date(c.date_sent)
                }));
            }
            return [];
        } catch (error) {
            return [];
        }
    }
}