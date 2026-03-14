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
} from "lucide-react";
import CommunityForm from "../Components/CommunityForm";
import ThriftSkeleton from "../Components/ThriftSkeleton";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

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
  const ITEMS_PER_PAGE = 12;

  const fetchCommunities = async () => {
    setIsLoading(true);
    try {
      const commService = new CommunityService();
      await new Promise((resolve) => setTimeout(resolve, 600));
      const allComms = await commService.getAllCommunities();
      const publicComms = allComms.filter((c) => c.isPublic !== false);
      setCommunities(publicComms);
    } catch (error) {
      console.error("Failed to fetch communities:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunities();
  }, [user]);

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

  const filteredCommunities = communities.filter(
    (comm) =>
      comm.communityname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (comm.description &&
        comm.description.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  const totalPages = Math.max(
    1,
    Math.ceil(filteredCommunities.length / ITEMS_PER_PAGE),
  );
  const paginatedCommunities = filteredCommunities.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const handleSearch = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-bg-clean text-tx-primary font-questrial relative pt-10 pb-20 overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-gasoek text-tx-primary mb-2">
              Komunitasku
            </h1>
            <p className="text-tx-secondary font-questrial">
              Disini kamu bisa melihat daftar komunitas yang kamu telah bentuk.
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

        {/* Search */}
        <div className="mb-10">
          <div className="relative group max-w-2xl">
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
        </div>

        {/* Grid Content */}
        <div>
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <ThriftSkeleton key={i} />
              ))}
            </div>
          ) : filteredCommunities.length === 0 ? (
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
                Maaf, kami tidak menemukan komunitas yang sesuai. Coba gunakan
                kata kunci lain.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {paginatedCommunities.map((comm) => {
                const fallBackPic = `https://ui-avatars.com/api/?name=${encodeURIComponent(comm.communityname)}&background=random`;

                return (
                  <div
                    key={comm.communityid}
                    className="flex flex-col bg-bg-vermillion border border-bg-vermillion/50 rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:border-bg-vermillion transition-all duration-200"
                  >
                    <div
                      className="relative aspect-video shrink-0 bg-bg-clean overflow-hidden cursor-pointer group"
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
                      <h3 className="text-lg font-gasoek text-tx-primary mb-3 line-clamp-1 leading-tight uppercase tracking-wide">
                        {comm.communityname}
                      </h3>
                      <div className="bg-bg-fresh/80 border border-bg-fresh p-3 rounded-xl shadow-inner flex-1">
                        <p className="text-xs text-tx-primary font-questrial line-clamp-4 opacity-90 leading-relaxed italic">
                          {comm.description || "Tidak ada deskripsi tersedia."}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-2 flex-wrap">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2.5 rounded-xl border border-bg-vermillion/50 bg-bg-vermillion text-tx-primary font-gasoek text-xs tracking-widest uppercase shadow-sm hover:bg-bg-fresh transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Prev
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-10 h-10 rounded-xl font-gasoek text-xs transition-all border ${
                  currentPage === i + 1
                    ? "bg-bg-fresh border-bg-fresh/50 text-tx-primary shadow-inner"
                    : "bg-bg-vermillion border-bg-vermillion/50 text-tx-primary hover:bg-white"
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2.5 rounded-xl border border-bg-vermillion/50 bg-bg-vermillion text-tx-primary font-gasoek text-xs tracking-widest uppercase shadow-sm hover:bg-bg-fresh transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
            </button>
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
              onClick={() => setSelectedCommunityForPopup(null)}
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
                <div className="absolute inset-0 bg-gradient-to-t from-bg-vermillion via-transparent to-transparent" />
                <button
                  onClick={() => setSelectedCommunityForPopup(null)}
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
                    <button
                      onClick={() => {
                        setSelectedCommunityForPopup(null);
                        navigate("/chats");
                      }}
                      className="flex-1 flex items-center justify-center gap-2 py-4 bg-tx-primary text-bg-clean rounded-xl cursor-pointer font-gasoek text-sm tracking-wide shadow-md hover:bg-bg-clean hover:text-tx-primary"
                    >
                      <MessageSquare size={18} />
                      Buka Komunitas
                    </button>

                    {user?.userid === selectedCommunityForPopup.userid && (
                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            const comm = selectedCommunityForPopup;
                            setSelectedCommunityForPopup(null);
                            handleEdit(comm);
                          }}
                          className="px-6 py-4 bg-bg-fresh text-tx-primary hover:bg-tx-primary hover:text-bg-fresh rounded-xl cursor-pointer font-gasoek text-sm shadow-md group"
                          title="Edit Komunitas"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => {
                            const commId =
                              selectedCommunityForPopup.communityid;
                            setSelectedCommunityForPopup(null);
                            handleDelete(commId);
                          }}
                          className="px-6 py-4 bg-red-500 text-bg-clean cursor-pointer rounded-xl font-gasoek text-sm hover:bg-bg-clean hover:text-red-500 "
                          title="Hapus Komunitas"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CommunityPage;
