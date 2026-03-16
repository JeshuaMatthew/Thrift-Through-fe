import { useState, useEffect } from "react";
import { useAuth } from "../../Utils/Hooks/AuthProvider";
import { CommunityService } from "../../Services/CommunitiesServices";
import type { Community } from "../../Types/Community";
import {
  Plus,
  Search,
  Trash2,
  Edit2,
  X,
  Globe,
  Lock,
  MessageSquare,
  Users,
  UserMinus,
  Check,
} from "lucide-react";
import CommunityForm from "../Components/CommunityForm";
import ThriftSkeleton from "../Components/ThriftSkeleton";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import UserDetailPopup from "../Components/UserDetailPopup";
import type { User } from "../../Types/User";

const CommunityPage = () => {
  const { user } = useAuth();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCommunity, setEditingCommunity] = useState<Community | null>(
    null,
  );
  const [selectedCommunityForPopup, setSelectedCommunityForPopup] =
    useState<Community | null>(null);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState("community_id");
  const [order, setOrder] = useState("DESC");
  const [members, setMembers] = useState<any[]>([]);
  const [isManagingMembers, setIsManagingMembers] = useState(false);
  const [selectedUserForDetail, setSelectedUserForDetail] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<"admin" | "active" | "pending">("admin");

  const fetchCommunities = async () => {
    setIsLoading(true);
    try {
      const commService = new CommunityService();
      let response;
      
      const commonParams = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchQuery,
        sortBy,
        order
      };

      if (activeTab === "admin") {
        response = await commService.getMyCommunities(commonParams);
      } else {
        response = await commService.getMyMemberships({
          ...commonParams,
          status: activeTab === "active" ? "Active" : "Pending"
        });
      }
      
      const { communities: allComms, meta } = response;
      setCommunities(allComms);
      setTotalPages(meta?.totalPages || 1);
    } catch (error) {
      console.error("Failed to fetch communities:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunities();
  }, [user, currentPage, itemsPerPage, searchQuery, sortBy, order, activeTab]);

  const fetchMembers = async (commId: number) => {
    try {
      const commService = new CommunityService();
      const data = await commService.getCommunityMembers(commId);
      setMembers(data);
    } catch (error) {
      console.error("Failed to fetch members:", error);
    }
  };


  const handleUpdateMember = async (memberEntryId: number, status: string) => {
    if (!selectedCommunityForPopup) return;
    try {
      const commService = new CommunityService();
      const res = await commService.updateMemberStatus(selectedCommunityForPopup.communityid, memberEntryId, status);
      if (res.success) {
        await fetchMembers(selectedCommunityForPopup.communityid);
      } else {
        alert(res.message);
      }
    } catch (error) {
      alert("Gagal mengubah status member");
    }
  };

  const handleAddNew = () => {
    setEditingCommunity(null);
    setIsFormOpen(true);
  };

  const handleEdit = (comm: Community) => {
    setEditingCommunity(comm);
    setIsFormOpen(true);
  };

  const handleDelete = async (commId: number) => {
    if (
      !user ||
      !window.confirm("Apakah Anda yakin ingin menghapus komunitas ini?")
    )
      return;

    try {
      const commService = new CommunityService();
      const res = await commService.deleteCommunity(commId, user.userid);
      if (res.success) {
        await fetchCommunities();
      } else {
        alert(res.message);
      }
    } catch (error) {
      console.error("Failed to delete", error);
    }
  };

  const handleSearch = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  const handleItemsPerPage = (val: number) => {
    setItemsPerPage(val);
    setCurrentPage(1);
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setOrder(order === "ASC" ? "DESC" : "ASC");
    } else {
      setSortBy(field);
      setOrder("DESC");
    }
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-bg-clean text-tx-primary font-questrial relative pt-10 pb-20 overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-gasoek text-tx-primary mb-2">
              Komunitas
            </h1>
            <p className="text-tx-secondary font-questrial">
              Akses dan kelola komunitas thrift andalanmu.
            </p>
          </div>
          <button
            onClick={handleAddNew}
            className="flex items-center gap-2 bg-tx-primary hover:bg-black text-bg-clean px-6 py-3.5 rounded-2xl font-gasoek text-sm tracking-wide transition-all shadow-md group"
          >
            <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
            Buat Komunitas Baru
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex gap-4 mb-8 bg-bg-vermillion/5 p-2 rounded-2xl border border-bg-vermillion/10 w-fit">
          {[
            { id: "admin", label: "Komunitasku", count: activeTab === "admin" ? communities.length : null },
            { id: "active", label: "Sudah Gabung", count: activeTab === "active" ? communities.length : null },
            { id: "pending", label: "Menunggu", count: activeTab === "pending" ? communities.length : null },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setCurrentPage(1);
              }}
              className={`px-6 py-3 rounded-xl font-gasoek text-sm transition-all flex items-center gap-2 ${
                activeTab === tab.id
                  ? "bg-bg-vermillion text-white shadow-lg scale-105"
                  : "text-tx-secondary hover:bg-bg-vermillion/10"
              }`}
            >
              {tab.label}
              {tab.count !== null && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === tab.id ? "bg-white text-bg-vermillion" : "bg-bg-vermillion text-white"}`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Filters, Search, and Pagination Limit */}
        <div className="mb-10 space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            {/* Search */}
            <div className="relative grow group w-full md:w-auto">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="w-5 h-5 text-tx-muted group-focus-within:text-bg-vermillion transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Cari nama atau deskripsi komunitas..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full bg-bg-fresh border border-bg-fresh/50 rounded-2xl py-3.5 pl-12 pr-4 text-tx-primary placeholder-opacity-50 focus:outline-none focus:ring-2 focus:ring-tx-primary/30 focus:border-tx-primary/50 transition-all shadow-sm font-gasoek text-sm tracking-wide"
              />
            </div>

            {/* Pagination Limit Selector */}
            <div className="flex items-center gap-2 bg-bg-vermillion/10 p-1.5 rounded-2xl border border-bg-vermillion/20">
              <span className="text-[10px] font-gasoek text-tx-muted uppercase px-2">
                Tampilkan:
              </span>
              {[8, 12, 16, 24].map((limit) => (
                <button
                  key={limit}
                  onClick={() => handleItemsPerPage(limit)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-gasoek transition-all ${
                    itemsPerPage === limit
                      ? "bg-bg-vermillion text-white shadow-md scale-105"
                      : "text-tx-secondary hover:bg-bg-vermillion/20"
                  }`}
                >
                  {limit}
                </button>
              ))}
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-2 bg-bg-vermillion/10 p-1.5 rounded-2xl border border-bg-vermillion/20">
              <span className="text-[10px] font-gasoek text-tx-muted uppercase px-2">
                Urutkan:
              </span>
              {[
                { label: "Terbaru", field: "community_id" },
                { label: "Nama", field: "community_name" },
              ].map((s) => (
                <button
                  key={s.field}
                  onClick={() => handleSort(s.field)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-gasoek transition-all flex items-center gap-1 ${
                    sortBy === s.field
                      ? "bg-bg-vermillion text-white shadow-md scale-105"
                      : "text-tx-secondary hover:bg-bg-vermillion/20"
                  }`}
                >
                  {s.label}
                  {sortBy === s.field && (
                    <span className="text-[8px]">
                      {order === "ASC" ? "▲" : "▼"}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Grid Content */}
        <div>
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(itemsPerPage)].map((_, i) => (
                <ThriftSkeleton key={i} />
              ))}
            </div>
          ) : communities.length === 0 ? (
            <div className="w-full py-24 flex flex-col items-center justify-center text-center bg-bg-vermillion rounded-xl border border-bg-vermillion/50 shadow-sm">
              <div className="w-25 h-25 mb-6 rounded-lg bg-bg-fresh flex items-center justify-center text-tx-primary">
                <span className="text-3xl font-black font-questrial">
                  (´•︵•`)
                </span>
              </div>
              <h3 className="text-2xl font-gasoek text-tx-primary mb-3">
                Komunitas Tidak Ditemukan
              </h3>
              <p className="text-tx-primary font-questrial max-w-md px-6 bg-white/20 p-4 rounded-lg shadow-inner">
                {activeTab === "pending" 
                  ? "Kamu tidak memiliki permintaan bergabung yang sedang menunggu."
                  : activeTab === "active"
                  ? "Kamu belum bergabung ke komunitas apapun."
                  : "Kamu belum membuat komunitas apapun."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {communities.map((comm) => {
                const fallBackPic = `https://ui-avatars.com/api/?name=${encodeURIComponent(comm.communityname)}&background=random`;

                return (
                  <div
                    key={comm.communityid}
                    className="flex flex-col bg-bg-vermillion border border-bg-vermillion/50 rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:border-bg-vermillion transition-all duration-200 group relative"
                  >
                    {activeTab === "pending" && (
                      <div className="absolute top-3 right-3 z-20 bg-tx-accent text-white text-[10px] font-gasoek px-3 py-1.5 rounded-full shadow-lg border border-white/20 uppercase tracking-wider animate-pulse">
                        Menunggu Persetujuan
                      </div>
                    )}
                    <div
                      className="relative aspect-video shrink-0 bg-bg-clean overflow-hidden cursor-pointer group-hover:brightness-95"
                      onClick={() => setSelectedCommunityForPopup(comm)}
                    >
                      <img
                        src={
                          comm.bannerurl || comm.profilepicturl || fallBackPic
                        }
                        alt={comm.communityname}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-bg-vermillion/80 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                    </div>

                    {/* Content */}
                    <div
                      className="p-5 flex flex-col flex-1 bg-bg-vermillion cursor-pointer"
                      onClick={() => setSelectedCommunityForPopup(comm)}
                    >
                      <h3 className="text-lg font-gasoek text-tx-primary mb-3 line-clamp-1 leading-tight uppercase tracking-wide group-hover:text-bg-clean transition-colors">
                        {comm.communityname}
                      </h3>
                      <div className="bg-bg-fresh/80 border border-bg-fresh p-3 rounded-xl shadow-inner flex-1 group-hover:bg-bg-fresh transition-colors">
                        <p className="text-xs text-tx-primary font-questrial line-clamp-4 opacity-90 leading-relaxed italic">
                          {comm.description || "Tidak ada deskripsi tersedia."}
                        </p>
                      </div>
                    </div>

                    {/* Admin Actions */}
                    {activeTab === "admin" && (
                      <div className="px-5 pb-5 pt-0 flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(comm);
                          }}
                          className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-bg-fresh hover:bg-white text-tx-primary rounded-xl text-xs font-gasoek uppercase tracking-wider transition-all border border-bg-fresh/50 shadow-sm"
                        >
                          <Edit2 size={14} />
                          Edit
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(comm.communityid);
                          }}
                          className="px-3 flex items-center justify-center bg-red-500 hover:bg-red-600 text-white rounded-xl transition-all shadow-sm"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pagination & Page Info */}
        {communities.length > 0 && (
          <div className="mt-12 flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
            <div className="flex items-center justify-start gap-2 flex-wrap order-1 md:order-1">
              {/* Prev */}
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex items-center justify-center w-10 h-10 rounded-xl border border-slate-200 bg-white text-tx-secondary font-questrial shadow-sm hover:border-bg-vermillion/50 hover:text-bg-vermillion transition-all disabled:opacity-40 disabled:cursor-not-allowed group"
                title="Sebelumnya"
              >
                <svg
                  className="w-5 h-5 transition-transform group-hover:-translate-x-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>

              {/* Page numbers */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-10 h-10 rounded-xl text-sm font-gasoek transition-all border ${
                      currentPage === page
                        ? "bg-bg-vermillion border-bg-vermillion text-white shadow-md scale-110 z-10"
                        : "bg-white border-slate-200 text-tx-secondary hover:border-bg-vermillion/40 hover:text-bg-vermillion shadow-sm"
                    }`}
                  >
                    {page}
                  </button>
                ),
              )}

              {/* Next */}
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="flex items-center justify-center w-10 h-10 rounded-xl border border-slate-200 bg-white text-tx-secondary font-questrial shadow-sm hover:border-bg-vermillion/50 hover:text-bg-vermillion transition-all disabled:opacity-40 disabled:cursor-not-allowed group"
                title="Selanjutnya"
              >
                <svg
                  className="w-5 h-5 transition-transform group-hover:translate-x-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>

            {/* Page Info Info */}
            <div className="text-[10px] font-gasoek text-tx-muted uppercase tracking-wider bg-bg-fresh px-4 py-2 rounded-full border border-bg-fresh/50 shadow-inner order-2 md:order-2">
              Halaman <span className="text-bg-vermillion">{currentPage}</span>{" "}
              dari <span className="text-tx-primary">{totalPages}</span>
            </div>
          </div>
        )}
      </div>

      <CommunityForm
        key={editingCommunity?.communityid || "new"}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={fetchCommunities}
        initialData={editingCommunity}
      />

      <AnimatePresence>
        {selectedCommunityForPopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setSelectedCommunityForPopup(null);
                setIsManagingMembers(false);
              }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-bg-vermillion border border-bg-vermillion/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            >
              {/* Banner */}
              <div className="relative h-48 bg-bg-clean">
                <img
                  src={
                    selectedCommunityForPopup.bannerurl ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedCommunityForPopup.communityname)}&background=random`
                  }
                  alt="Banner"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-t from-bg-vermillion via-transparent to-transparent" />
                <button
                  onClick={() => {
                    setSelectedCommunityForPopup(null);
                    setIsManagingMembers(false);
                  }}
                  className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Profile Pic & Title */}
              <div className="px-8 pb-6 relative">
                <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-10 mb-6">
                  <div className="h-24 w-24 rounded-2xl border-4 border-bg-vermillion overflow-hidden bg-bg-clean shadow-lg shrink-0">
                    <img
                      src={
                        selectedCommunityForPopup.profilepicturl ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedCommunityForPopup.communityname)}&background=random`
                      }
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0 pb-1">
                    <h2 className="text-2xl font-gasoek text-tx-primary leading-tight uppercase tracking-wide truncate">
                      {selectedCommunityForPopup.communityname}
                    </h2>
                    <div className="flex items-center gap-2 mt-1">
                      {selectedCommunityForPopup.isPublic ? (
                        <span className="flex items-center gap-1 text-lg font-bold text-bg-fresh">
                          <Globe size={12} /> Publik
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-lg font-bold text-tx-accent">
                          <Lock size={12} /> Privat
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {!isManagingMembers ? (
                    <>
                      <div className="bg-bg-clean p-4 rounded-xl border border-white/10 shadow-inner">
                        <h4 className="text-xs font-gasoek text-tx-secondary uppercase mb-2">
                          Tentang Komunitas
                        </h4>
                        <p className="text-sm text-tx-primary font-questrial leading-relaxed">
                          {selectedCommunityForPopup.description ||
                            "Tidak ada deskripsi tersedia."}
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        {activeTab !== "pending" && (
                          <button
                            onClick={() => {
                              const commId = selectedCommunityForPopup.communityid;
                              setSelectedCommunityForPopup(null);
                              navigate(`/chats?communityId=${commId}`);
                            }}
                            className="flex-1 flex items-center justify-center gap-2 py-4 bg-tx-primary text-bg-clean rounded-xl cursor-pointer font-gasoek text-sm tracking-wide shadow-md hover:bg-bg-clean hover:text-tx-primary"
                          >
                            <MessageSquare size={18} />
                            Buka Komunitas
                          </button>
                        )}

                        {activeTab === "admin" && (
                          <button
                            onClick={() => {
                              setIsManagingMembers(true);
                              fetchMembers(selectedCommunityForPopup.communityid);
                            }}
                            className="flex-1 flex items-center justify-center gap-2 py-4 bg-bg-fresh text-tx-primary rounded-xl cursor-pointer font-gasoek text-sm tracking-wide shadow-md hover:bg-tx-primary hover:text-bg-clean"
                          >
                            <Users size={18} />
                            Daftar Pengguna
                          </button>
                        )}
                        
                        {activeTab === "pending" && (
                          <div className="flex-1 py-4 bg-bg-vermillion/20 text-tx-primary rounded-xl font-gasoek text-sm text-center border border-bg-vermillion/30 italic">
                            Permintaan kamu sedang ditinjau oleh admin
                          </div>
                        )}
                      </div>

                      {user?.userid === selectedCommunityForPopup.userid && activeTab === "admin" && (
                        <div className="flex gap-3">
                          <button
                            onClick={() => {
                              const comm = selectedCommunityForPopup;
                              setSelectedCommunityForPopup(null);
                              handleEdit(comm);
                            }}
                            className="flex-1 py-4 bg-bg-fresh text-tx-primary hover:bg-white rounded-xl cursor-pointer font-gasoek text-sm shadow-md transition-all flex items-center justify-center gap-2"
                            title="Edit Komunitas"
                          >
                            <Edit2 size={16} /> Edit
                          </button>
                          <button
                            onClick={() => {
                              const commId =
                                selectedCommunityForPopup.communityid;
                              setSelectedCommunityForPopup(null);
                              handleDelete(commId);
                            }}
                            className="flex-1 py-4 bg-red-500 text-white hover:bg-red-600 cursor-pointer rounded-xl font-gasoek text-sm shadow-md transition-all flex items-center justify-center gap-2"
                            title="Hapus Komunitas"
                          >
                            <Trash2 size={16} /> Hapus
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-gasoek text-tx-secondary uppercase">
                          Daftar Pengguna
                        </h4>
                        <button 
                          onClick={() => setIsManagingMembers(false)}
                          className="text-xs text-tx-muted hover:text-tx-primary font-gasoek underline"
                        >
                          Kembali
                        </button>
                      </div>

                      {/* Members list */}
                      <div className="max-h-64 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                        {members.map(m => (
                          <div 
                            key={m.community_member_id} 
                            className="flex items-center justify-between p-3 bg-bg-clean border border-white/20 rounded-xl shadow-sm cursor-pointer hover:bg-bg-fresh/20 transition-colors"
                            onClick={() => setSelectedUserForDetail({
                              userid: m.user_id,
                              fullname: m.full_name,
                              username: m.user_name,
                              profilepicturl: m.profile_pict_url,
                              email: m.email,
                              phonenum: m.phone_num,
                              bannerimgurl: m.banner_img_url,
                            })}
                          >
                            <div className="flex items-center gap-3">
                              <img 
                                src={m.profile_pict_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.full_name)}&background=random`} 
                                className="w-8 h-8 rounded-lg object-cover"
                                alt=""
                              />
                              <div>
                                <p className="text-sm font-gasoek text-tx-primary leading-none uppercase tracking-tight">{m.full_name}</p>
                                <p className="text-[10px] text-tx-muted font-questrial">{m.role} • {m.status}</p>
                              </div>
                            </div>

                            {m.role !== 'Admin' && (
                              <div className="flex gap-1">
                                {m.status === 'Pending' && (
                                  <>
                                    <button 
                                      onClick={() => handleUpdateMember(m.community_member_id, 'Active')}
                                      className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg"
                                      title="Terima"
                                    >
                                      <Check size={16} />
                                    </button>
                                    <button 
                                      onClick={() => handleUpdateMember(m.community_member_id, 'Remove')}
                                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                                      title="Tolak"
                                    >
                                      <X size={16} />
                                    </button>
                                  </>
                                )}
                                <button 
                                  onClick={() => handleUpdateMember(m.community_member_id, 'Remove')}
                                  className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                                  title="Hapus"
                                >
                                  <UserMinus size={16} />
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <UserDetailPopup 
        selectedUser={selectedUserForDetail} 
        onClose={() => setSelectedUserForDetail(null)} 
      />
    </div>
  );
};

export default CommunityPage;
