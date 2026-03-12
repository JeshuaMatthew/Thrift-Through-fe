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
  Check,
} from "lucide-react";

type ChatListItem = {
  id: string; // "comm_1" or "user_2"
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
  const [selectedUserProfile, setSelectedUserProfile] = useState<User | null>(
    null,
  );
  const [selectedCommunityProfile, setSelectedCommunityProfile] =
    useState<CommunityDetail | null>(null);

  const [messages, setMessages] = useState<Chat[]>([]);
  const [inputText, setInputText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();
  const [editingChatId, setEditingChatId] = useState<number | null>(null);
  const [editInputText, setEditInputText] = useState("");
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedChats, setSelectedChats] = useState<Set<number>>(new Set());

  const chatServiceRef = useRef<ChatService | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchSidebarData = async () => {
      const commService = new CommunityService();
      const allComms = await commService.getAllCommunities();
      const userService = new UserService();
      const allUsers = await userService.getAllUsersInCommunity();
      setUsers(allUsers);

      const formattedComms: ChatListItem[] = allComms.map((c) => ({
        id: `comm_${c.communityid}`,
        name: c.communityname,
        type: "community",
        picture:
          c.profilepicturl ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(c.communityname)}&background=random`,
        communityId: c.communityid,
      }));

      // In a real app we'd fetch users we've chatted with too. We'll simulate one user for demo purposes:
      const defaultUsers: ChatListItem[] = [
        {
          id: "user_102",
          name: "Siti Aminah",
          type: "user",
          picture: "https://i.pravatar.cc/150?u=sitiaminah",
        }
      ];

      // Check URL parameters for direct chat initiation
      const queryParams = new URLSearchParams(location.search);
      const targetUserIdStr = queryParams.get("userId");
      
      let targetUserItem: ChatListItem | null = null;
      
      if (targetUserIdStr) {
        const targetUserId = parseInt(targetUserIdStr, 10);
        // Avoid adding yourself
        if (targetUserId !== user?.userid) {
           const targetUserObj = allUsers.find(u => u.userid === targetUserId);
           if (targetUserObj) {
              const checkExt = defaultUsers.find(u => u.id === `user_${targetUserId}`);
              if (!checkExt) {
                // Determine if they already have a 1-on-1 community (simplified logic, usually needs backend support)
                // For this request: "jika chatnya baru, gunakan communities services untuk menambah communities baru"
                const newCommName = `Chat: ${user?.fullname} & ${targetUserObj.fullname}`;
                const fallbackPic = `https://ui-avatars.com/api/?name=${encodeURIComponent(targetUserObj.fullname)}&background=random`;
                
                // Create new community
                const newComm = await commService.createCommunity({
                   userid: user?.userid || 999,
                   description: "Personal Chat Room",
                   profilepicturl: targetUserObj.profilepicturl || fallbackPic,
                   communityname: newCommName,
                   isPublic: false
                });

                // Add to chat list as a "user" to appear as a Private Chat in UI
                targetUserItem = {
                  id: `user_${targetUserId}`, // Important: use user ID so it's treated as direct message UI
                  name: targetUserObj.fullname,
                  type: "user",
                  picture: targetUserObj.profilepicturl || fallbackPic,
                  communityId: newComm.communityid // Store the community ID for fetching messages!
                };
                defaultUsers.push(targetUserItem);

              } else {
                targetUserItem = checkExt;
              }
           }
        }
      }

      setChatList([...formattedComms, ...defaultUsers]);
      
      if (targetUserItem) {
        setActiveChat(targetUserItem);
      }
    };

    fetchSidebarData();

    // Setup ChatService Singleton
    if (!chatServiceRef.current) {
      chatServiceRef.current = new ChatService();
    }

    // Connect on mount
    if (!(chatServiceRef.current as any).isConnected) {
      chatServiceRef.current.connect(user?.userid || 999);
    }

    return () => {
      if (chatServiceRef.current) {
        chatServiceRef.current.disconnect();
      }
    };
  }, [user]);

  // Load chat history when switching rooms
  useEffect(() => {
    // Reset selection and edit mode when switching rooms
    setIsSelectMode(false);
    setSelectedChats(new Set());
    setEditingChatId(null);
    setEditInputText("");

    if (!activeChat || !chatServiceRef.current) return;

    if (activeChat.type === "community" && activeChat.communityId) {
      const history = chatServiceRef.current.joinCommunityRoom(
        activeChat.communityId,
      );
      setMessages(history);

      const handleNewMessage = (newChat: Chat) => {
        if (newChat.communityid === activeChat.communityId) {
          setMessages((prev) => [...prev, newChat]);
        }
      };

      chatServiceRef.current.onReceiveMessage(handleNewMessage);
    } else if (activeChat.type === "user" && activeChat.communityId) {
      // It's a User chat, but backed by a Community room
      const history = chatServiceRef.current.joinCommunityRoom(
        activeChat.communityId,
      );
      setMessages(history);

      const handleNewMessage = (newChat: Chat) => {
        if (newChat.communityid === activeChat.communityId) {
          setMessages((prev) => [...prev, newChat]);
        }
      };

      chatServiceRef.current.onReceiveMessage(handleNewMessage);
    } else {
      // Mock direct messages history for legacy User mock without communityId
      setMessages([
        {
          chatid: 901,
          communityid: 0,
          userid: 102,
          chattext: "Halo kak, barang thriftnya masih ada?",
          datesent: new Date(),
        },
      ]);

      const handleNewMessage = (newChat: Chat) => {
        if (newChat.communityid === 0)
          setMessages((prev) => [...prev, newChat]);
      };
      chatServiceRef.current.onReceiveMessage(handleNewMessage);
    }
  }, [activeChat]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeChat || !chatServiceRef.current) return;

    if (activeChat.type === "community" && activeChat.communityId) {
      chatServiceRef.current.sendMessage(activeChat.communityId, inputText);
      setInputText("");
      chatServiceRef.current.simulateReplyFromOtherUser(
        activeChat.communityId,
        102,
        "Membalas pesan Anda di grup...",
      );
    } else if (activeChat.type === "user" && activeChat.communityId) {
      chatServiceRef.current.sendMessage(activeChat.communityId, inputText);
      setInputText("");
      const otherUserId = parseInt(activeChat.id.replace("user_", ""), 10);
      chatServiceRef.current.simulateReplyFromOtherUser(
        activeChat.communityId,
        otherUserId || 102,
        "Baik kak, nanti saya info ya.",
      );
    } else {
      // Direct message mock (legacy without communityId)
      const newMsg: Chat = {
        chatid: Math.random(),
        communityid: 0,
        userid: user?.userid || 999,
        chattext: inputText,
        datesent: new Date(),
      };
      setMessages((prev) => [...prev, newMsg]);
      setInputText("");

      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            chatid: Math.random(),
            communityid: 0,
            userid: 102,
            chattext: "Baik kak, nanti saya info ya.",
            datesent: new Date(),
          },
        ]);
      }, 1500);
    }
  };

  return (
    <div className="pt-20 px-4 md:px-8 max-w-7xl mx-auto h-dvh flex flex-col pb-6">
      <div className="flex-1 bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden flex min-h-0">
        {/* ================= LEFT SIDEBAR (CHAT LIST) ================= */}
        <div
          className={`w-full md:w-80 lg:w-96 flex flex-col border-r border-slate-200 bg-slate-50 transition-all ${activeChat ? "hidden md:flex" : "flex"}`}
        >
          <div className="p-4 border-b border-slate-200 bg-white">
            <h1 className="text-xl font-bold text-slate-800">My Chats</h1>
            <div className="mt-3 relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={16}
              />
              <input
                type="text"
                placeholder="Cari obrolan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-100 border-transparent focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 rounded-xl text-sm transition-all outline-none"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
            {chatList
              .filter((item) => {
                // If search is empty, show everything
                if (!searchQuery.trim()) return true;

                // Match by chat name
                if (
                  item.name.toLowerCase().includes(searchQuery.toLowerCase())
                ) {
                  return true;
                }

                // Or check if the user has a matching message in the chat history
                if (chatServiceRef.current) {
                  const matchedHistory = chatServiceRef.current.searchMyChats(
                    searchQuery,
                    user?.userid || 999,
                  );

                  // If the matched history belongs to this community, show the chat list
                  const matchesCommunity = matchedHistory.some(
                    (m) => m.communityid === item.communityId,
                  );

                  // Or if it's a direct message (communityid is 0) and the item id matches the user id
                  const isDirectMessageMatch = matchedHistory.some(
                    (m) =>
                      m.communityid === 0 &&
                      m.userid === parseInt(item.id.replace("user_", "")),
                  );

                  return (
                    matchesCommunity ||
                    (item.type === "user" && isDirectMessageMatch)
                  );
                }

                return false;
              })
              .map((item) => (
                <div
                  key={item.id}
                  onClick={() => setActiveChat(item)}
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all mb-1 select-none ${
                    activeChat?.id === item.id
                      ? "bg-indigo-50 border border-indigo-100 shadow-sm"
                      : "hover:bg-slate-200/50 border border-transparent"
                  }`}
                >
                  <div className="relative shrink-0">
                    <img
                      src={item.picture}
                      alt={item.name}
                      className="w-12 h-12 rounded-full object-cover bg-slate-100"
                    />
                    {item.type === "community" && (
                      <div className="absolute -bottom-1 -right-1 bg-indigo-500 text-white p-1 rounded-full border-2 border-white">
                        <Hash size={10} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-800 truncate text-sm">
                      {item.name}
                    </h3>
                    <p className="text-xs text-slate-500 truncate">
                      {item.type === "community"
                        ? "Room Komunitas"
                        : "Personal Chat"}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* ================= RIGHT PANEL (ACTIVE CHAT) ================= */}
        <div
          className={`flex-1 flex flex-col bg-slate-50 relative ${!activeChat ? "hidden md:flex" : "flex"}`}
        >
          {!activeChat ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center bg-white">
              <div className="w-24 h-24 mb-6 rounded-full bg-slate-50 flex items-center justify-center border-4 border-slate-100 shadow-inner">
                <MessageSquare size={40} className="text-slate-300" />
              </div>
              <h2 className="text-xl font-semibold text-slate-600 mb-2">
                Pilih Obrolan
              </h2>
              <p className="max-w-xs text-sm">
                Pilih komunitas atau pengguna di panel kiri untuk mulai membaca
                dan membalas pesan.
              </p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="h-[72px] border-b border-slate-200 flex items-center px-4 md:px-6 bg-white shrink-0 z-10 shadow-sm relative">
                <button
                  className="mr-3 p-2 -ml-2 rounded-full hover:bg-slate-100 md:hidden text-slate-600 transition-colors"
                  onClick={() => setActiveChat(null)}
                >
                  <ArrowLeft size={20} />
                </button>
                <div
                  className="flex items-center cursor-pointer hover:bg-slate-50 p-1.5 -ml-1.5 rounded-xl transition-colors"
                  onClick={async () => {
                    if (activeChat.type === "user") {
                      const matchUser = users.find(
                        (u) => `user_${u.userid}` === activeChat.id,
                      );
                      if (matchUser) setSelectedUserProfile(matchUser);
                    } else if (
                      activeChat.type === "community" &&
                      activeChat.communityId
                    ) {
                      const commService = new CommunityService();
                      const commDetail =
                        await commService.getCommunityDetailById(
                          activeChat.communityId,
                        );
                      if (commDetail) setSelectedCommunityProfile(commDetail);
                    }
                  }}
                  title="Lihat Profil"
                >
                  <img
                    src={activeChat.picture}
                    alt="Avatar"
                    className="w-10 h-10 rounded-full object-cover mr-3 bg-slate-100"
                  />
                  <div>
                    <h2 className="font-bold text-slate-800 leading-tight">
                      {activeChat.name}
                    </h2>
                    <p className="text-xs text-slate-500 font-medium">
                      {activeChat.type === "community"
                        ? "Community Chat"
                        : "Direct Message"}
                    </p>
                  </div>
                </div>

                <div className="flex-1 flex justify-end items-center gap-1.5 ml-auto">
                  {isSelectMode ? (
                    <>
                      {selectedChats.size > 0 && (
                        <span className="text-xs text-slate-500 font-medium mr-2 hidden md:inline">
                          {selectedChats.size} pesat terpilih
                        </span>
                      )}
                      <button
                        onClick={() => {
                          if (selectedChats.size > 0 && user) {
                            chatServiceRef.current?.deleteMessages(
                              Array.from(selectedChats),
                              user.userid,
                            );
                            setMessages((prev) =>
                              prev.map((m) =>
                                selectedChats.has(m.chatid)
                                  ? {
                                      ...m,
                                      chattext:
                                        "pesan ini dihapus oleh pengguna",
                                    }
                                  : m,
                              ),
                            );
                          }
                          setIsSelectMode(false);
                          setSelectedChats(new Set());
                        }}
                        className={`p-2 rounded-full transition-colors flex items-center justify-center ${selectedChats.size > 0 ? "hover:bg-red-50 text-red-500" : "text-slate-300 cursor-not-allowed"}`}
                        title="Hapus Terpilih"
                        disabled={selectedChats.size === 0}
                      >
                        <Trash2 size={18} />
                      </button>
                      <button
                        onClick={() => {
                          setIsSelectMode(false);
                          setSelectedChats(new Set());
                        }}
                        className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
                        title="Batal"
                      >
                        <XCircle size={18} />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setIsSelectMode(true)}
                      className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
                      title="Pilih Pesan"
                    >
                      <CheckSquare size={18} />
                    </button>
                  )}
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#F8FAFC] custom-scrollbar flex flex-col gap-4">
                {messages.length === 0 ? (
                  <div className="m-auto text-slate-400 text-sm bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100">
                    Belum ada pesan. Mulai sapa sekarang!
                  </div>
                ) : (
                  messages.map((msg, idx) => {
                    const isMe = msg.userid === (user?.userid || 999);
                    const msgUser = users.find((u) => u.userid === msg.userid);
                    const msgUserName =
                      msgUser?.fullname || `User ${msg.userid}`;
                    const msgUserAvatar =
                      msgUser?.profilepicturl ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(msgUserName)}&background=random`;

                    return (
                      <div
                        key={idx}
                        className={`flex max-w-[85%] md:max-w-[75%] ${isMe ? "self-end" : "self-start"}`}
                      >
                        <div
                          className={`flex flex-col gap-1 ${isMe ? "items-end" : "items-start"}`}
                        >
                          {!isMe && activeChat.type === "community" && (
                            <div
                              className="flex items-center gap-1.5 mb-0.5 px-1 cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() =>
                                msgUser ? setSelectedUserProfile(msgUser) : null
                              }
                              title="Lihat Profil"
                            >
                              <img
                                src={msgUserAvatar}
                                alt={msgUserName}
                                className="w-5 h-5 rounded-full object-cover bg-slate-200"
                              />
                              <span className="text-[11px] font-semibold text-slate-500">
                                {msgUserName}
                              </span>
                            </div>
                          )}
                          <div
                            className={`flex items-center gap-2 group ${isMe ? "flex-row-reverse" : "flex-row"}`}
                          >
                            {isSelectMode &&
                              isMe &&
                              msg.chattext !==
                                "pesan ini dihapus oleh pengguna" && (
                                <input
                                  type="checkbox"
                                  checked={selectedChats.has(msg.chatid)}
                                  onChange={(e) => {
                                    const newSet = new Set(selectedChats);
                                    if (e.target.checked)
                                      newSet.add(msg.chatid);
                                    else newSet.delete(msg.chatid);
                                    setSelectedChats(newSet);
                                  }}
                                  className="w-4 h-4 ml-2 mr-1 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 shrink-0 cursor-pointer"
                                />
                              )}

                            <div
                              className={`px-4 py-2.5 rounded-2xl relative ${
                                msg.chattext ===
                                "pesan ini dihapus oleh pengguna"
                                  ? "bg-slate-100 border border-slate-200 text-slate-400 italic rounded-bl-sm shadow-sm"
                                  : isMe
                                    ? "bg-indigo-600 text-white rounded-br-sm shadow-md shadow-indigo-600/20"
                                    : "bg-white border border-slate-200 text-slate-700 rounded-bl-sm shadow-sm"
                              }`}
                            >
                              {editingChatId === msg.chatid ? (
                                <div className="flex items-center gap-2 min-w-[200px]">
                                  <input
                                    autoFocus
                                    className="flex-1 bg-white/20 text-white placeholder-white/60 border border-white/40 focus:border-white focus:outline-none rounded px-2 py-1 text-[14px]"
                                    value={editInputText}
                                    onChange={(e) =>
                                      setEditInputText(e.target.value)
                                    }
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        if (editInputText.trim() && user) {
                                          chatServiceRef.current?.editMessage(
                                            msg.chatid,
                                            user.userid,
                                            editInputText,
                                          );
                                          setMessages((prev) =>
                                            prev.map((m) =>
                                              m.chatid === msg.chatid
                                                ? {
                                                    ...m,
                                                    chattext: editInputText,
                                                  }
                                                : m,
                                            ),
                                          );
                                          setEditingChatId(null);
                                        }
                                      } else if (e.key === "Escape") {
                                        setEditingChatId(null);
                                      }
                                    }}
                                  />
                                  <button
                                    onClick={() => {
                                      if (editInputText.trim() && user) {
                                        chatServiceRef.current?.editMessage(
                                          msg.chatid,
                                          user.userid,
                                          editInputText,
                                        );
                                        setMessages((prev) =>
                                          prev.map((m) =>
                                            m.chatid === msg.chatid
                                              ? {
                                                  ...m,
                                                  chattext: editInputText,
                                                }
                                              : m,
                                          ),
                                        );
                                        setEditingChatId(null);
                                      }
                                    }}
                                    className="p-1 hover:bg-white/20 rounded-full transition-colors"
                                  >
                                    <Check
                                      size={14}
                                      className="text-emerald-300"
                                    />
                                  </button>
                                  <button
                                    onClick={() => setEditingChatId(null)}
                                    className="p-1 hover:bg-white/20 rounded-full transition-colors"
                                  >
                                    <X size={14} className="text-red-300" />
                                  </button>
                                </div>
                              ) : (
                                <p className="text-[15px] leading-relaxed wrap-break-word whitespace-pre-wrap">
                                  {msg.chattext}
                                </p>
                              )}
                            </div>

                            {!isSelectMode &&
                              isMe &&
                              editingChatId !== msg.chatid &&
                              msg.chattext !==
                                "pesan ini dihapus oleh pengguna" && (
                                <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity px-1 shrink-0">
                                  <button
                                    onClick={() => {
                                      setEditingChatId(msg.chatid);
                                      setEditInputText(msg.chattext);
                                    }}
                                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full"
                                    title="Edit Pesan"
                                  >
                                    <Edit2 size={14} />
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (user) {
                                        chatServiceRef.current?.deleteMessages(
                                          [msg.chatid],
                                          user.userid,
                                        );
                                        setMessages((prev) =>
                                          prev.map((m) =>
                                            m.chatid === msg.chatid
                                              ? {
                                                  ...m,
                                                  chattext:
                                                    "pesan ini dihapus oleh pengguna",
                                                }
                                              : m,
                                          ),
                                        );
                                      }
                                    }}
                                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full"
                                    title="Hapus Pesan"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              )}
                          </div>
                          <span className="text-[10px] text-slate-400 font-medium px-1">
                            {new Date(msg.datesent).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-3 md:p-4 bg-white border-t border-slate-200 shrink-0 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                <form
                  onSubmit={handleSendMessage}
                  className="flex gap-2 items-end max-w-4xl mx-auto"
                >
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
                    className="flex-1 bg-slate-100/80 border border-transparent focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 rounded-2xl text-[15px] transition-all outline-none py-3 px-4 resize-none max-h-32 min-h-[48px] custom-scrollbar"
                    rows={1}
                  />
                  <button
                    type="submit"
                    disabled={!inputText.trim()}
                    className="h-12 w-12 rounded-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white flex items-center justify-center shrink-0 transition-all shadow-lg shadow-indigo-600/30 disabled:shadow-none hover:scale-105 active:scale-95 disabled:hover:scale-100"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div
              className={`h-24 relative bg-cover bg-center ${!selectedUserProfile.bannerimgurl ? "bg-linear-to-r from-indigo-500 to-purple-500" : ""}`}
              style={
                selectedUserProfile.bannerimgurl
                  ? {
                      backgroundImage: `url(${selectedUserProfile.bannerimgurl})`,
                    }
                  : {}
              }
            >
              <button
                onClick={() => setSelectedUserProfile(null)}
                className="absolute top-4 right-4 p-1.5 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors"
              >
                <X size={18} />
              </button>
              <div className="absolute -bottom-10 left-6">
                <img
                  src={
                    selectedUserProfile.profilepicturl ||
                    `https://ui-avatars.com/api/?name=${selectedUserProfile.fullname}&background=random`
                  }
                  alt={selectedUserProfile.fullname}
                  className="w-20 h-20 rounded-full border-4 border-white object-cover bg-white shadow-md"
                />
              </div>
            </div>
            <div className="pt-12 px-6 pb-6">
              <h3 className="text-xl font-bold text-slate-800 leading-tight">
                {selectedUserProfile.fullname}
              </h3>
              <p className="text-sm text-slate-500 mb-1">
                @{selectedUserProfile.username}
              </p>
              <p className="text-sm text-slate-500 mb-1 flex items-center gap-1.5">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-slate-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                {selectedUserProfile.email}
              </p>
              <p className="text-sm text-slate-500 mb-4 flex items-center gap-1.5">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-slate-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                {selectedUserProfile.phonenum}
              </p>

              <div className="flex gap-4">
                <div className="bg-slate-50 px-4 py-3 rounded-2xl flex-1 border border-slate-100 flex flex-col items-center">
                  <span className="text-xs text-slate-500 font-medium mb-1">
                    Rank
                  </span>
                  <span
                    className={`text-sm font-bold ${
                      selectedUserProfile.userrank.toLowerCase() === "gold"
                        ? "text-yellow-600"
                        : selectedUserProfile.userrank.toLowerCase() ===
                            "silver"
                          ? "text-slate-500"
                          : "text-orange-700"
                    }`}
                  >
                    {selectedUserProfile.userrank}
                  </span>
                </div>
                <div className="bg-indigo-50 px-4 py-3 rounded-2xl flex-1 border border-indigo-100 flex flex-col items-center">
                  <span className="text-xs text-indigo-500 font-medium mb-1">
                    Points
                  </span>
                  <span className="text-sm font-bold text-indigo-700">
                    {selectedUserProfile.userpoint}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Community Profile Modal Overlay */}
      {selectedCommunityProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="h-28 bg-linear-to-r from-emerald-500 to-teal-500 relative flex justify-center items-center">
              <button
                onClick={() => setSelectedCommunityProfile(null)}
                className="absolute top-4 right-4 p-1.5 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors"
              >
                <X size={18} />
              </button>
              <div className="absolute -bottom-10 shadow-lg p-1 bg-white rounded-2xl">
                <img
                  src={
                    selectedCommunityProfile.profilepicturl ||
                    `https://ui-avatars.com/api/?name=${selectedCommunityProfile.communityname}&background=random`
                  }
                  alt={selectedCommunityProfile.communityname}
                  className="w-20 h-20 rounded-xl object-cover"
                />
              </div>
            </div>
            <div className="pt-14 px-6 pb-6 text-center">
              <h3 className="text-xl font-bold text-slate-800 leading-tight">
                {selectedCommunityProfile.communityname}
              </h3>
              <p className="text-sm text-slate-500 mb-4 px-2">
                {selectedCommunityProfile.description}
              </p>

              <div className="flex gap-4">
                <div className="bg-slate-50 px-4 py-3 rounded-2xl flex-1 border border-slate-100 flex flex-col items-center">
                  <span className="text-xs text-slate-500 font-medium mb-1">
                    Anggota
                  </span>
                  <span className="text-sm font-bold text-slate-700 flex items-center gap-1">
                    <Hash size={14} className="text-slate-400" />
                    {selectedCommunityProfile.members.length}
                  </span>
                </div>
                <div className="bg-emerald-50 px-4 py-3 rounded-2xl flex-1 border border-emerald-100 flex flex-col items-center">
                  <span className="text-xs text-emerald-600 font-medium mb-1">
                    Status Akses
                  </span>
                  <span className="text-xs font-bold text-emerald-700 mt-0.5">
                    {selectedCommunityProfile.isPublic ? "Publik" : "Privat"}
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={async () => {
                    if (!user?.userid) return;
                    const memberService = new CommunityMembersServices();
                    const result = await memberService.leaveCommunity(
                      selectedCommunityProfile.communityid,
                      user.userid,
                    );

                    if (result.success) {
                      alert(result.message);
                      setSelectedCommunityProfile(null);
                      // Remove from chat list
                      setChatList((prev) =>
                        prev.filter(
                          (c) =>
                            c.communityId !==
                            selectedCommunityProfile.communityid,
                        ),
                      );
                      // Clear active chat if we just left it
                      if (
                        activeChat?.communityId ===
                        selectedCommunityProfile.communityid
                      ) {
                        setActiveChat(null);
                      }
                    } else {
                      alert(result.message);
                    }
                  }}
                  className="w-full py-2.5 px-4 bg-red-50 text-red-600 hover:bg-red-100 border border-red-100 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                  </svg>
                  Keluar Komunitas
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
