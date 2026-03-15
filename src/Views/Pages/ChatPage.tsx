import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import {
  CommunityService,
  type CommunityDetail,
} from "../../Services/CommunitiesServices";
import { ChatService } from "../../Services/ChatService";
import { UserService } from "../../Services/UserServices";
import { CommunityMembersServices } from "../../Services/CommunityMembersServices";
import type { Chat } from "../../Types/Chat";
import type { User } from "../../Types/User";
import { useAuth } from "../../Utils/Hooks/AuthProvider";
import {
  Send,
  Hash,
  Search,
  ArrowLeft,
  MessageSquare,
  X,
  Trash2,
  XCircle,
  CheckSquare,
  Edit2,
  Check
} from "lucide-react";
import { formatImageUrl } from "../../Utils/FormatUrl";

type ChatListItem = {
  id: string;
  name: string;
  type: "community" | "user";
  picture: string;
  lastMessage?: string;
  communityId?: number;
};

const ChatPage = () => {
  const { user } = useAuth();
  const [chatList, setChatList] = useState<ChatListItem[]>([]);
  const [activeChat, setActiveChat] = useState<ChatListItem | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserProfile, setSelectedUserProfile] = useState<User | null>(null);
  const [selectedCommunityProfile, setSelectedCommunityProfile] = useState<CommunityDetail | null>(null);

  const [messages, setMessages] = useState<Chat[]>([]);
  const [inputText, setInputText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();
  const [editingChatId, setEditingChatId] = useState<number | null>(null);
  const [editInputText, setEditInputText] = useState("");
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedChats, setSelectedChats] = useState<Set<number>>(new Set());

  const chatServiceRef = useRef<ChatService | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const quickReplies = [
    "Bisa dijemput sekarang?",
    "Lokasi sesuai titik map ya.",
    "Apakah barang masih ada?",
    "Saya otw ke lokasi."
  ];

  useEffect(() => {
    const fetchSidebarData = async () => {
      if (!chatServiceRef.current) chatServiceRef.current = new ChatService();

      const [allChats, allUsers] = await Promise.all([
        chatServiceRef.current.getMyChatList(),
        new UserService().getAllUsers()
      ]);

      setUsers(allUsers || []);

      const rawFormattedChats: ChatListItem[] = (allChats || []).map((c: any) => {
        const itemType: "user" | "community" = c.community_type === 'directchat' ? "user" : "community";
        if (itemType === 'user') {
          return {
            id: `user_${c.target_user_id}`,
            name: c.target_full_name || "Unknown User",
            type: itemType,
            picture: formatImageUrl(c.target_profile_pic) || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.target_full_name || "U")}&background=f6ed6c&color=183020`,
            communityId: Number(c.community_id),
            lastMessage: c.last_message
          };
        } else {
          return {
            id: `comm_${c.community_id}`,
            name: c.community_name,
            type: itemType,
            picture: formatImageUrl(c.community_pic) || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.community_name)}&background=f6ed6c&color=183020`,
            communityId: Number(c.community_id),
            lastMessage: c.last_message
          };
        }
      });

      // Deduplicate formattedChats
      const uniqueFormattedChatsMap = new Map();
      rawFormattedChats.forEach(chat => {
        if (!uniqueFormattedChatsMap.has(chat.id)) {
          uniqueFormattedChatsMap.set(chat.id, chat);
        }
      });
      const formattedChats = Array.from(uniqueFormattedChatsMap.values());

      setChatList(formattedChats);

      // Handle targeted user or community from URL
      const queryParams = new URLSearchParams(location.search);
      const targetUserIdStr = queryParams.get("userId");
      const targetCommIdStr = queryParams.get("communityId");

      if (targetCommIdStr) {
        const targetCommId = Number(targetCommIdStr);
        const existing = formattedChats.find(c => Number(c.communityId) === targetCommId);
        if (existing) {
          setActiveChat(existing);
        } else {
          // If not in sidebar, maybe it's a new community or one not in recent chats
          const commService = new CommunityService();
          const detail = await commService.getCommunityDetailById(targetCommId);
          if (detail) {
            const newChat: ChatListItem = {
              id: `comm_${detail.communityid}`,
              name: detail.communityname,
              type: "community",
              picture: detail.profilepicturl || `https://ui-avatars.com/api/?name=${encodeURIComponent(detail.communityname)}&background=f6ed6c&color=183020`,
              communityId: Number(detail.communityid)
            };
            setChatList(prev => {
              const exists = prev.some(c => Number(c.communityId) === Number(newChat.communityId));
              return exists ? prev : [newChat, ...prev];
            });
            setActiveChat(newChat);
          }
        }
      } else if (targetUserIdStr && user) {
        const targetUserId = Number(targetUserIdStr);
        if (targetUserId !== Number(user.userid)) {
          const commService = new CommunityService();
          const dm = await commService.getOrCreateDM(targetUserId);
          if (dm && dm.community_id) {
            const dmCommId = Number(dm.community_id);
            const existing = formattedChats.find(c => Number(c.communityId) === dmCommId);
            if (existing) {
              setActiveChat(existing);
            } else {
              // Refresh if new DM created
              const refreshedChatsData = await chatServiceRef.current.getMyChatList();
              const refreshedChats: ChatListItem[] = (refreshedChatsData || []).map((c: any) => ({
                id: c.community_type === 'directchat' ? `user_${c.target_user_id}` : `comm_${c.community_id}`,
                name: c.community_type === 'directchat' ? c.target_full_name : c.community_name,
                type: (c.community_type === 'directchat' ? "user" : "community") as "user" | "community",
                picture: formatImageUrl(c.community_type === 'directchat' ? c.target_profile_pic : c.community_pic) || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.community_type === 'directchat' ? c.target_full_name : c.community_name)}&background=f6ed6c&color=183020`,
                communityId: Number(c.community_id),
                lastMessage: c.last_message
              }));

              // Deduplicate chats based on ID
              const uniqueChatsMap = new Map();
              refreshedChats.forEach(chat => {
                if (!uniqueChatsMap.has(chat.id)) {
                  uniqueChatsMap.set(chat.id, chat);
                }
              });
              const uniqueChats = Array.from(uniqueChatsMap.values());

              setChatList(uniqueChats);
              const newActive = uniqueChats.find((c: any) => Number(c.communityId) === dmCommId);
              if (newActive) setActiveChat(newActive);
            }
          }
        }
      }
    };

    fetchSidebarData();

    if (!chatServiceRef.current) {
      chatServiceRef.current = new ChatService();
    }
    chatServiceRef.current.connect(user?.userid || 0);

    return () => {
      chatServiceRef.current?.disconnect();
    };
  }, [user, location.search]);

  useEffect(() => {
    setIsSelectMode(false);
    setSelectedChats(new Set());
    setEditingChatId(null);
    setEditInputText("");

    if (!activeChat || !chatServiceRef.current) return;

    chatServiceRef.current.clearListeners();

    const handleNewMessage = (newChat: Chat) => {
      if (Number(newChat.communityId) === (activeChat.communityId || 0)) {
        setMessages((prev) => [...prev, newChat]);
      }
    };

    const handleMessageEdited = (editedChat: Chat) => {
      if (Number(editedChat.communityId) === (activeChat.communityId || 0)) {
        setMessages((prev) => prev.map(m => Number(m.chatId) === Number(editedChat.chatId) ? editedChat : m));
      }
    };

    const handleMessageDeleted = (data: { chat_id: number }) => {
      setMessages((prev) => prev.map(m => Number(m.chatId) === Number(data.chat_id) ? { ...m, chatText: "Pesan ini telah dihapus" } : m));
    };

    chatServiceRef.current.onReceiveMessage(handleNewMessage);
    chatServiceRef.current.onMessageEdited(handleMessageEdited);
    chatServiceRef.current.onMessageDeleted(handleMessageDeleted);

    const loadHistory = async () => {
      if (activeChat.communityId) {
        const history = await chatServiceRef.current!.joinCommunityRoom(activeChat.communityId);
        setMessages(history);
      }
    };

    loadHistory();

    return () => {
      if (chatServiceRef.current) {
        chatServiceRef.current.clearListeners();
      }
    };
  }, [activeChat]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }

    // Scroll active sidebar item into view
    if (activeChat) {
      setTimeout(() => {
        const activeElem = document.getElementById(`chat-item-${activeChat.id}`);
        if (activeElem) {
          activeElem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 100);
    }
  }, [messages, activeChat]);

  const handleSendMessage = (e: React.FormEvent | string) => {
    if (typeof e !== 'string') e.preventDefault();
    const textToSend = typeof e === 'string' ? e : inputText;
    if (!textToSend.trim() || !activeChat?.communityId || !chatServiceRef.current) return;
    chatServiceRef.current.sendMessage(activeChat.communityId, textToSend);
    setInputText("");
  };

  const handleEditMessage = (chatId: number, newText: string) => {
    if (!activeChat?.communityId || !chatServiceRef.current) return;

    // Optimistic update
    setMessages((prev) => prev.map(m => Number(m.chatId) === chatId ? { ...m, chatText: newText } : m));

    chatServiceRef.current.editMessage(chatId, activeChat.communityId, newText);
    setEditingChatId(null);
  };

  const handleDeleteMessages = (chatIds: number[]) => {
    if (!activeChat?.communityId || !chatServiceRef.current) return;

    // Optimistic update
    setMessages((prev) => prev.map(m => chatIds.includes(Number(m.chatId)) ? { ...m, chatText: "Pesan ini telah dihapus" } : m));

    chatServiceRef.current.deleteMessages(chatIds, activeChat.communityId);
    setIsSelectMode(false);
    setSelectedChats(new Set());
  };

  return (
    <div className="pt-5 px-4 md:px-8 max-w-7xl flex flex-col mx-auto h-dvh pb-6 font-questrial">
      <div className="flex-1 bg-bg-clean rounded-2xl shadow-sm border border-bg-vermillion/50 overflow-hidden flex max-h-[calc(100vh-6rem)]">

        {/* ================= LEFT SIDEBAR (CHAT LIST) ================= */}
        <div className={`w-full md:w-80 lg:w-96 flex flex-col border-r border-bg-vermillion/50 bg-bg-clean transition-all ${activeChat ? "hidden md:flex" : "flex"}`}>
          <div className="p-4 border-b border-bg-vermillion/50 bg-bg-vermillion/10">
            <h1 className="text-xl font-gasoek text-tx-primary tracking-wide">Pesan</h1>
            <div className="mt-3 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-tx-primary" size={16} />
              <input
                type="text"
                placeholder="Cari obrolan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-3 bg-bg-fresh border border-bg-fresh/50 focus:bg-white focus:border-tx-primary/50 focus:ring-2 focus:ring-tx-primary/30 rounded-2xl text-sm font-questrial font-bold text-tx-primary transition-all shadow-sm outline-none"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
            {chatList
              .filter((item) => {
                if (!searchQuery.trim()) return true;
                return item.name.toLowerCase().includes(searchQuery.toLowerCase());
              })
              .map((item) => (
                <div
                  key={item.id}
                  id={`chat-item-${item.id}`}
                  onClick={() => setActiveChat(item)}
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all mb-1 select-none ${activeChat?.id === item.id
                    ? "bg-bg-vermillion border border-bg-vermillion/50 shadow-sm"
                    : "hover:bg-bg-vermillion/10 border border-transparent"
                    }`}
                >
                  <div className="relative shrink-0">
                    <img
                      src={item.picture}
                      alt={item.name}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (item.type === "user") {
                          const targetUserId = parseInt(item.id.replace("user_", ""), 10);
                          const matchUser = users.find(u => u.userid === targetUserId);
                          if (matchUser) setSelectedUserProfile(matchUser);
                        } else if (item.communityId) {
                          new CommunityService().getCommunityDetailById(item.communityId).then(d => setSelectedCommunityProfile(d));
                        }
                      }}
                      className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm hover:scale-105 transition-transform"
                    />
                    {item.type === "community" && (
                      <div className="absolute -bottom-1 -right-1 bg-tx-secondary text-white p-1 rounded-full border-2 border-white">
                        <Hash size={10} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="font-questrial font-bold text-tx-primary tracking-wide truncate text-sm flex-1">
                        {item.name}
                      </h3>
                    </div>
                    <p className="text-xs text-tx-secondary font-questrial truncate">
                      {item.lastMessage || (item.type === "community" ? "Room Komunitas" : "Personal Chat")}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* ================= RIGHT PANEL (ACTIVE CHAT) ================= */}
        <div className={`flex-1 flex flex-col bg-bg-clean relative ${!activeChat ? "hidden md:flex" : "flex"}`}>
          {!activeChat ? (
            <div className="flex-1 flex flex-col items-center justify-center text-tx-primary p-8 text-center bg-bg-clean">
              <div className="w-24 h-24 mb-6 rounded-2xl bg-bg-vermillion flex items-center justify-center border border-bg-vermillion/50 shadow-sm text-tx-primary">
                <MessageSquare size={40} />
              </div>
              <h2 className="text-2xl font-gasoek text-tx-primary mb-2">Pilih Obrolan</h2>
              <p className="max-w-xs text-sm font-questrial px-4 bg-white/40 p-3 rounded-xl shadow-inner border border-bg-vermillion/20">
                Pilih komunitas atau pengguna di panel kiri untuk mulai negosiasi.
              </p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="border-b border-bg-vermillion/50 bg-bg-vermillion/5 shrink-0 z-10 shadow-[0_2px_4px_-2px_rgba(0,0,0,0.05)] relative">
                <div className="h-[72px] flex items-center px-4 md:px-6">
                  <button
                    className="mr-3 p-2 -ml-2 rounded-full hover:bg-bg-clean md:hidden text-tx-secondary transition-colors"
                    onClick={() => setActiveChat(null)}
                  >
                    <ArrowLeft size={20} />
                  </button>
                  <div
                    className="flex items-center cursor-pointer hover:bg-bg-clean p-1.5 -ml-1.5 rounded-xl transition-colors"
                    onClick={async () => {
                      if (activeChat.type === "user") {
                        const targetUserId = parseInt(activeChat.id.replace("user_", ""), 10);
                        const matchUser = users.find((u) => u.userid === targetUserId);
                        if (matchUser) setSelectedUserProfile(matchUser);
                        else {
                          const fetched = await new UserService().getUserById(targetUserId);
                          if (fetched) setSelectedUserProfile(fetched);
                        }
                      } else if (activeChat.type === "community" && activeChat.communityId) {
                        const commService = new CommunityService();
                        const commDetail = await commService.getCommunityDetailById(activeChat.communityId);
                        if (commDetail) setSelectedCommunityProfile(commDetail);
                      }
                    }}
                  >
                    <img
                      src={activeChat.picture}
                      alt="Avatar"
                      className="w-10 h-10 rounded-full object-cover mr-3 bg-bg-fresh shadow-sm border border-white"
                    />
                    <div>
                      <h2 className="font-bold text-tx-primary leading-tight">
                        {activeChat.name}
                      </h2>
                      <p className="text-xs text-tx-secondary font-questrial font-bold">
                        {activeChat.type === "community" ? "Community Chat" : "Pengepul Terverifikasi"}
                      </p>
                    </div>
                  </div>

                  <div className="flex-1 flex justify-end items-center gap-1.5 ml-auto">
                    {isSelectMode ? (
                      <>
                        {selectedChats.size > 0 && (
                          <span className="text-xs text-tx-muted font-bold mr-2 hidden md:inline">
                            {selectedChats.size} pesan terpilih
                          </span>
                        )}
                        <button
                          onClick={() => handleDeleteMessages(Array.from(selectedChats))}
                          className={`p-2 rounded-full transition-colors flex items-center justify-center ${selectedChats.size > 0 ? "hover:bg-tx-accent/10 text-tx-accent" : "text-tx-muted cursor-not-allowed"}`}
                          disabled={selectedChats.size === 0}
                        >
                          <Trash2 size={18} />
                        </button>
                        <button
                          onClick={() => {
                            setIsSelectMode(false);
                            setSelectedChats(new Set());
                          }}
                          className="p-2 hover:bg-bg-clean rounded-full transition-colors text-tx-secondary"
                        >
                          <XCircle size={18} />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setIsSelectMode(true)}
                        className="p-2 hover:bg-bg-clean rounded-full transition-colors text-tx-secondary"
                      >
                        <CheckSquare size={18} />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto p-4 md:p-6 bg-bg-clean custom-scrollbar flex flex-col gap-4 relative"
              >
                {messages.length === 0 ? (
                  <div className="m-auto text-tx-primary text-sm font-questrial bg-bg-vermillion/10 px-6 py-3 rounded-full shadow-inner border border-bg-vermillion/20">
                    Belum ada pesan. Mulai sapa sekarang!
                  </div>
                ) : (
                  messages.map((msg, idx) => {
                    const isMe = Number(msg.userId) === Number(user?.userid || 999);
                    const msgUser = users.find((u) => Number(u.userid) === Number(msg.userId));
                    const msgUserName = msgUser?.fullname || `User ${msg.userId}`;
                    const msgUserAvatar = formatImageUrl(msgUser?.profilepicturl) || `https://ui-avatars.com/api/?name=${encodeURIComponent(msgUserName)}&background=f6ed6c&color=183020`;

                    return (
                      <div key={idx} className={`flex max-w-[85%] md:max-w-[75%] ${isMe ? "self-end" : "self-start"}`}>
                        <div className={`flex flex-col gap-1 ${isMe ? "items-end" : "items-start"}`}>
                          {!isMe && activeChat.type === "community" && (
                            <div
                              className="flex items-center gap-1.5 mb-0.5 px-1 cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() => msgUser ? setSelectedUserProfile(msgUser) : null}
                            >
                              <img src={msgUserAvatar} alt={msgUserName} className="w-5 h-5 rounded-full object-cover border border-bg-vermillion/30 shadow-xs" />
                              <span className="text-[11px] font-bold font-questrial text-tx-secondary">{msgUserName}</span>
                            </div>
                          )}
                          <div className={`flex items-center gap-2 group ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                            {isSelectMode && isMe && msg.chatText !== "Pesan ini telah dihapus" && (
                              <input
                                type="checkbox"
                                checked={selectedChats.has(msg.chatId)}
                                onChange={(e) => {
                                  const newSet = new Set(selectedChats);
                                  if (e.target.checked) newSet.add(msg.chatId);
                                  else newSet.delete(msg.chatId);
                                  setSelectedChats(newSet);
                                }}
                                className="w-4 h-4 ml-2 mr-1 rounded border-tx-muted text-tx-secondary focus:ring-tx-secondary shrink-0 cursor-pointer"
                              />
                            )}

                            <div
                              className={`px-4 py-2.5 rounded-2xl relative shadow-sm border ${msg.chatText === "Pesan ini telah dihapus"
                                ? "bg-bg-clean border-bg-vermillion/30 text-tx-muted italic rounded-bl-sm"
                                : isMe
                                  ? "bg-bg-vermillion border-bg-vermillion/50 text-tx-primary rounded-br-sm shadow-md"
                                  : "bg-bg-fresh border-bg-fresh/50 text-tx-primary rounded-bl-sm shadow-sm"
                                }`}
                            >
                              {editingChatId === msg.chatId ? (
                                <div className="flex items-center gap-2 min-w-[200px]">
                                  <input
                                    autoFocus
                                    className="flex-1 bg-white/40 text-tx-primary placeholder-tx-primary/60 border border-white/50 focus:border-white focus:outline-none rounded-lg px-3 py-1.5 text-[14px] font-questrial shadow-inner"
                                    value={editInputText}
                                    onChange={(e) => setEditInputText(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter" && editInputText.trim()) {
                                        handleEditMessage(msg.chatId, editInputText);
                                      } else if (e.key === "Escape") setEditingChatId(null);
                                    }}
                                  />
                                  <div className="flex gap-1 shrink-0">
                                    <button onClick={() => handleEditMessage(msg.chatId, editInputText)} className="p-1.5 hover:bg-white/40 rounded-full transition-colors">
                                      <Check size={16} className="text-bg-fresh" />
                                    </button>
                                    <button onClick={() => setEditingChatId(null)} className="p-1.5 hover:bg-white/40 rounded-full transition-colors">
                                      <X size={16} className="text-tx-accent" />
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <p className="text-[14px] md:text-[15px] leading-relaxed wrap-break-word whitespace-pre-wrap font-questrial font-bold tracking-wide">
                                  {msg.chatText}
                                </p>
                              )}
                            </div>

                            {!isSelectMode && isMe && editingChatId !== msg.chatId && msg.chatText !== "Pesan ini telah dihapus" && (
                              <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity px-1 shrink-0">
                                <button
                                  onClick={() => { setEditingChatId(msg.chatId); setEditInputText(msg.chatText); }}
                                  className="p-1.5 text-tx-muted hover:text-tx-secondary hover:bg-white rounded-full transition-all shadow-xs"
                                >
                                  <Edit2 size={13} />
                                </button>
                                <button
                                  onClick={() => handleDeleteMessages([msg.chatId])}
                                  className="p-1.5 text-tx-muted hover:text-tx-accent hover:bg-white rounded-full transition-all shadow-xs"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            )}
                          </div>
                          <span className="text-[9px] md:text-[10px] text-tx-primary font-bold font-questrial px-1 opacity-60">
                            {new Date(msg.dateSent).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Input Area & Quick Replies */}
              <div className="bg-bg-clean border-t border-bg-vermillion/50 shrink-0 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                {/* Quick Replies */}
                <div className="flex gap-2 overflow-x-auto custom-scrollbar px-4 pt-3 pb-1">
                  {quickReplies.map((reply, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(reply)}
                      className="whitespace-nowrap px-3 py-1.5 bg-bg-fresh hover:bg-bg-vermillion text-tx-primary text-[10px] uppercase tracking-wider font-questrial font-bold rounded-xl border border-bg-vermillion/40 transition-colors shadow-sm"
                    >
                      {reply}
                    </button>
                  ))}
                </div>

                {/* Form Input */}
                <form onSubmit={handleSendMessage} className="flex gap-2 items-end max-w-4xl mx-auto p-3 md:p-4">
                  <div className="flex gap-1 pb-1 shrink-0">
                  </div>

                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                      }
                    }}
                    placeholder="Ketik pesan..."
                    className="flex-1 bg-white border border-bg-vermillion/50 focus:bg-white focus:border-tx-primary/50 focus:ring-2 focus:ring-tx-primary/30 rounded-2xl text-[14px] md:text-[15px] font-questrial font-bold text-tx-primary transition-all outline-none py-3 px-4 resize-none max-h-32 min-h-[48px] custom-scrollbar shadow-sm"
                    rows={1}
                  />
                  <button
                    type="submit"
                    disabled={!inputText.trim()}
                    className="h-12 w-12 rounded-full bg-bg-vermillion hover:bg-bg-fresh disabled:bg-bg-clean disabled:text-tx-muted text-tx-primary hover:text-tx-primary flex items-center justify-center shrink-0 transition-all shadow-md disabled:shadow-none hover:scale-105 active:scale-95 disabled:hover:scale-100"
                  >
                    <Send size={20} className="ml-1" />
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>

      {/* User Profile Modal Overlay */}
      {selectedUserProfile && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-tx-primary/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-bg-vermillion/30">
            <div
              className={`h-24 relative bg-cover bg-center ${!selectedUserProfile.bannerimgurl ? "bg-bg-fresh" : ""}`}
              style={selectedUserProfile.bannerimgurl ? { backgroundImage: `url(${selectedUserProfile.bannerimgurl})` } : {}}
            >
              <button
                onClick={() => setSelectedUserProfile(null)}
                className="absolute top-4 right-4 p-1.5 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors"
              >
                <X size={18} />
              </button>
              <div className="absolute -bottom-10 left-6">
                <img
                  src={formatImageUrl(selectedUserProfile.profilepicturl) || `https://ui-avatars.com/api/?name=${selectedUserProfile.fullname}&background=f6ed6c&color=183020`}
                  alt={selectedUserProfile.fullname}
                  className="w-20 h-20 rounded-full border-4 border-white object-cover bg-white shadow-md"
                />
              </div>
            </div>
            <div className="pt-12 px-6 pb-6">
              <h3 className="text-xl gasoek-one-regular text-tx-primary leading-tight">
                {selectedUserProfile.fullname}
              </h3>
              <p className="text-sm text-tx-secondary font-bold mb-1">@{selectedUserProfile.username}</p>

            </div>
          </div>
        </div>
      )}

      {/* Community Profile Modal Overlay */}
      {selectedCommunityProfile && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-tx-primary/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-bg-vermillion/30">
            <div className="h-28 bg-bg-vermillion relative flex justify-center items-center">
              <button
                onClick={() => setSelectedCommunityProfile(null)}
                className="absolute top-4 right-4 p-1.5 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors"
              >
                <X size={18} />
              </button>
              <div className="absolute -bottom-10 shadow-lg p-1 bg-white rounded-2xl">
                <img
                  src={formatImageUrl(selectedCommunityProfile.profilepicturl) || `https://ui-avatars.com/api/?name=${selectedCommunityProfile.communityname}&background=f6ed6c&color=183020`}
                  alt={selectedCommunityProfile.communityname}
                  className="w-20 h-20 rounded-xl object-cover"
                />
              </div>
            </div>
            <div className="pt-14 px-6 pb-6 text-center">
              <h3 className="text-xl gasoek-one-regular text-tx-primary leading-tight">
                {selectedCommunityProfile.communityname}
              </h3>
              <p className="text-sm text-tx-secondary font-bold mb-4 px-2">
                {selectedCommunityProfile.description}
              </p>

              <div className="flex gap-4">
                <div className="bg-bg-clean px-4 py-3 rounded-2xl flex-1 border border-bg-vermillion/30 flex flex-col items-center">
                  <span className="text-xs text-tx-primary font-questrial font-bold mb-1">Anggota</span>
                  <span className="text-sm font-bold text-tx-primary flex items-center gap-1">
                    <Hash size={14} className="text-tx-secondary" />
                    {selectedCommunityProfile.members?.length || 0}
                  </span>
                </div>
                <div className="bg-bg-fresh/20 px-4 py-3 rounded-2xl flex-1 border border-bg-vermillion/30 flex flex-col items-center">
                  <span className="text-xs text-tx-secondary font-bold mb-1">Status Akses</span>
                  <span className="text-xs font-bold text-tx-primary mt-0.5">
                    {selectedCommunityProfile.isPublic ? "Publik" : "Privat"}
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={async () => {
                    if (!user?.userid) return;
                    const memberService = new CommunityMembersServices();
                    const result = await memberService.leaveCommunity(selectedCommunityProfile.communityid, user.userid);
                    if (result.success) {
                      alert(result.message);
                      setSelectedCommunityProfile(null);
                      setChatList((prev) => prev.filter((c) => c.communityId !== selectedCommunityProfile.communityid));
                      if (activeChat?.communityId === selectedCommunityProfile.communityid) setActiveChat(null);
                    } else alert(result.message);
                  }}
                  className="w-full py-2.5 px-4 bg-tx-accent/10 text-tx-accent hover:bg-tx-accent hover:text-white border border-tx-accent/20 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 size={16} /> Keluar Komunitas
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPage;