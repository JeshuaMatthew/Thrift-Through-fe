import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Utils/Hooks/AuthProvider";
import { TransactionServices } from "../../Services/TransactionServices";
import type { Transaction } from "../../Types/Transaction";
import { ThriftService, type Item } from "../../Services/ThriftsServices";
import {
  Calendar,
  Package,
  MessageSquare,
  Search,
  Filter,
  ArrowUpDown,
  CheckCircle2,
  Clock,
  CreditCard,
  Map as MapIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import UserDetailPopup from "../Components/UserDetailPopup";
import ItemDetailPopup from "../Components/ItemDetailPopup";
import DirectionModal from "../Components/DirectionModal";
import type { User } from "../../Types/User";

export default function OrdersPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"sales" | "purchases">("sales");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("transaction_date");
  const [order, setOrder] = useState<"DESC" | "ASC">("DESC");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 6;

  // Directions state
  const [userLocation, setUserLocation] = useState<{ lng: number; lat: number } | null>(null);
  const [showDirections, setShowDirections] = useState(false);
  const [itemCoords, setItemCoords] = useState<{ lng: number; lat: number } | null>(null);
  const [itemNameToMap, setItemNameToMap] = useState("");

  const fetchTransactions = async () => {
    if (user?.userid) {
      setIsLoading(true);
      try {
        const transactionService = new TransactionServices();
        const params = {
          page: currentPage,
          limit: itemsPerPage,
          search: searchQuery,
          status: statusFilter,
          sortBy,
          order,
        };

        let result;
        if (activeTab === "sales") {
          result = await transactionService.getTransactionsAsSeller(params);
        } else {
          result = await transactionService.getTransactionsAsBuyer(params);
        }

        setTransactions(result.transactions || []);
        setTotalPages(result.meta?.totalPages || 1);
      } catch (error) {
        console.error("Failed to fetch transactions:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [user, activeTab, currentPage, searchQuery, statusFilter, sortBy, order]);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lng: position.coords.longitude,
            lat: position.coords.latitude,
          });
        },
        (error) => console.warn("GPS error:", error.message),
        { enableHighAccuracy: true }
      );
    }
  }, []);

  const handleUpdateStatus = async (transactionId: number, newStatus: string) => {
    try {
      const transactionService = new TransactionServices();
      const res = await transactionService.updateStatus(transactionId, newStatus);
      if (res.success) {
        fetchTransactions();
      } else {
        alert(res.message);
      }
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case "interested":
        return {
          label: "Tertarik",
          icon: <Clock size={14} />,
          className: "bg-amber-100 text-amber-700 border-amber-200",
        };
      case "accepted":
        return {
          label: "Diterima",
          icon: <CheckCircle2 size={14} />,
          className: "bg-blue-100 text-blue-700 border-blue-200",
        };
      case "paid":
      case "completed":
        return {
          label: "Dibayar",
          icon: <CreditCard size={14} />,
          className: "bg-bg-fresh text-tx-primary border-bg-fresh/50",
        };
      default:
        return {
          label: status,
          icon: <Clock size={14} />,
          className: "bg-gray-100 text-gray-700 border-gray-200",
        };
    }
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
        {/* Header Section */}
        <div className="mb-10">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-gasoek text-tx-primary mb-2"
          >
            Pesananku
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-tx-secondary font-questrial"
          >
            Kelola semua transaksi jual-beli kamu di sini. Pantau status pesanan dan proses transaksi dengan mudah.
          </motion.p>
        </div>

        {/* Filters and Search Row */}
        <div className="mb-10 space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            {/* Search Bar */}
            <div className="relative grow group w-full md:w-auto">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="w-5 h-5 text-tx-muted group-focus-within:text-bg-vermillion transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Cari nama barang atau pengguna..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-bg-fresh border border-bg-fresh/50 rounded-2xl py-3.5 pl-12 pr-4 text-tx-primary placeholder-opacity-50 focus:outline-none focus:ring-2 focus:ring-tx-primary/30 focus:border-tx-primary/50 transition-all shadow-sm font-gasoek text-sm tracking-wide"
              />
            </div>

            <div className="flex flex-wrap items-center gap-4">
              {/* Sort Selector */}
              <div className="flex items-center gap-2 bg-bg-vermillion/10 p-1.5 rounded-2xl border border-bg-vermillion/20">
                <span className="text-[10px] font-gasoek text-tx-muted uppercase px-2">
                  Urutkan:
                </span>
                {[
                  { label: "Terbaru", field: "transaction_date" },
                  { label: "Harga", field: "final_price" },
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

              {/* Status Filter */}
              <div className="relative flex items-center bg-bg-vermillion/10 p-1.5 rounded-2xl border border-bg-vermillion/20 h-[46px]">
                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-tx-muted pointer-events-none" />
                <select
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                  className="appearance-none bg-transparent h-full pl-10 pr-8 text-xs font-gasoek uppercase tracking-wider focus:outline-none transition-all text-tx-primary cursor-pointer"
                >
                  <option value="">Semua Status</option>
                  <option value="Interested">Tertarik</option>
                  <option value="Accepted">Diterima</option>
                  <option value="Paid">Dibayar</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <ArrowUpDown size={12} className="text-tx-muted" />
                </div>
              </div>
            </div>
          </div>

          {/* Tab Selection */}
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            <button
              onClick={() => { setActiveTab("sales"); setCurrentPage(1); }}
              className={`px-5 py-3 rounded-2xl text-sm tracking-wide whitespace-nowrap transition-all border font-gasoek ${
                activeTab === "sales"
                  ? "bg-bg-fresh border-bg-fresh/50 text-tx-primary shadow-md"
                  : "bg-bg-vermillion border-bg-vermillion/50 text-tx-primary hover:bg-bg-vermillion/80 shadow-sm"
              }`}
            >
              Pesanan Masuk
            </button>
            <button
              onClick={() => { setActiveTab("purchases"); setCurrentPage(1); }}
              className={`px-5 py-3 rounded-2xl text-sm tracking-wide whitespace-nowrap transition-all border font-gasoek ${
                activeTab === "purchases"
                  ? "bg-bg-fresh border-bg-fresh/50 text-tx-primary shadow-md"
                  : "bg-bg-vermillion border-bg-vermillion/50 text-tx-primary hover:bg-bg-vermillion/80 shadow-sm"
              }`}
            >
              Pembelianku
            </button>
          </div>
        </div>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse bg-bg-vermillion/20 h-64 rounded-4xl" />
              ))}
            </motion.div>
          ) : transactions.length > 0 ? (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {transactions.map((tx) => {
                const statusConfig = getStatusConfig(tx.status);
                const otherUser = {
                  userid: activeTab === "sales" ? tx.buyerid : tx.sellerid,
                  fullname: activeTab === "sales" ? (tx as any).buyer_name : (tx as any).seller_name,
                  email: activeTab === "sales" ? (tx as any).buyer_email : (tx as any).seller_email,
                  profilepicturl: activeTab === "sales" ? (tx as any).buyer_profile_pict : (tx as any).seller_profile_pict,
                };

                return (
                  <motion.div
                    layout
                    key={tx.transactionid}
                    className="group bg-bg-vermillion border border-bg-vermillion/50 rounded-xl p-6 transition-all duration-300 hover:shadow-md hover:border-bg-vermillion relative overflow-hidden flex flex-col h-full"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[10px] font-gasoek uppercase tracking-wider ${statusConfig.className}`}>
                          {statusConfig.icon}
                          {statusConfig.label}
                        </div>
                        <div className="px-3 py-1.5 rounded-lg bg-bg-fresh/50 border border-bg-fresh/50 text-[10px] font-gasoek uppercase tracking-wider text-tx-primary/60">
                          {tx.transactiontype}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] uppercase font-gasoek text-tx-muted tracking-widest leading-none">ID Transaksi</p>
                        <p className="text-xs font-gasoek text-tx-primary mt-1">#{tx.transactionid}</p>
                      </div>
                    </div>

                    <div className="flex gap-4 mb-6">
                      <div 
                        className="w-20 h-20 rounded-xl overflow-hidden shadow-sm border border-white/20 shrink-0 cursor-pointer"
                        onClick={async () => {
                          const thriftService = new ThriftService();
                          const det = await thriftService.getThriftDetailById(tx.itemid);
                          if (det) setSelectedItem(det);
                        }}
                      >
                        <img 
                          src={(tx as any).item_pict_url || "https://dummyimage.com/150x150/ddd/888&text=No+Image"} 
                          alt={(tx as any).item_name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex flex-col justify-center min-w-0">
                        <h3 className="text-lg font-gasoek text-tx-primary line-clamp-1 mb-1 leading-tight">{(tx as any).item_name}</h3>
                        <p className="text-tx-secondary text-xs font-questrial mb-2">{(tx as any).category}</p>
                        <div className="bg-bg-fresh/50 border border-bg-fresh/50 px-2 py-1 rounded-lg w-fit">
                          <p className="text-base font-gasoek text-tx-primary leading-none">
                            {tx.transactiontype === 'Barter' ? 'BARTER' : `Rp ${tx.finalprice.toLocaleString("id-ID")}`}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-auto pt-6 border-t border-white/20">
                      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div 
                          className="flex items-center gap-3 cursor-pointer group/user bg-white/10 rounded-xl p-2 w-full sm:w-auto"
                          onClick={() => setSelectedUser(otherUser as any)}
                        >
                          <img 
                            src={otherUser.profilepicturl || "https://dummyimage.com/100x100/ddd/888&text=?"} 
                            className="w-8 h-8 rounded-full border border-white/50 object-cover shadow-sm"
                            alt={otherUser.fullname}
                          />
                          <div className="min-w-0">
                            <p className="text-[9px] uppercase font-gasoek text-tx-muted tracking-widest leading-none mb-0.5">{activeTab === "sales" ? "Pembeli" : "Penjual"}</p>
                            <p className="text-xs font-bold font-questrial text-tx-primary truncate">{otherUser.fullname}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
                          <button
                            onClick={() => navigate(`/chats?userId=${otherUser.userid}`)}
                            className="p-3 bg-bg-fresh text-tx-primary rounded-xl hover:bg-white transition-all shadow-sm"
                            title="Chat"
                          >
                            <MessageSquare size={16} />
                          </button>
                          
                          {activeTab === "purchases" && tx.status === "Accepted" && tx.longitude && tx.latitude && (
                            <button
                              onClick={() => {
                                setItemCoords({ lng: Number(tx.longitude), lat: Number(tx.latitude) });
                                setItemNameToMap((tx as any).item_name);
                                setShowDirections(true);
                              }}
                              className="px-4 py-2 bg-bg-fresh text-tx-primary rounded-xl font-gasoek text-[10px] uppercase tracking-wider hover:bg-white transition-all shadow-sm flex items-center gap-2"
                            >
                              <MapIcon size={14} /> Lihat Arah
                            </button>
                          )}

                          {activeTab === "sales" && tx.status === "Interested" && (
                            <button
                              onClick={() => handleUpdateStatus(tx.transactionid, "Accepted")}
                              className="px-4 py-2 bg-tx-primary text-bg-clean rounded-xl font-gasoek text-[10px] uppercase tracking-wider hover:bg-black transition-all shadow-sm"
                            >
                              Terima
                            </button>
                          )}
                          {activeTab === "sales" && tx.status === "Accepted" && (
                            <button
                              onClick={() => handleUpdateStatus(tx.transactionid, "Paid")}
                              className="px-4 py-2 bg-bg-vermillion text-white rounded-xl font-gasoek text-[10px] uppercase tracking-wider hover:bg-bg-vermillion/80 transition-all shadow-sm"
                            >
                              Lunas
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between text-[9px] font-gasoek text-tx-muted uppercase tracking-widest">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={10} />
                          {new Date(tx.transactiondate).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Package size={10} />
                          Stock: Ready
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full py-24 flex flex-col items-center justify-center text-center bg-bg-vermillion rounded-xl border border-bg-vermillion/50 shadow-sm"
            >
              <div className="w-25 h-25 mb-6 rounded-lg bg-bg-fresh flex items-center justify-center text-tx-primary">
                <span className="text-3xl font-black font-questrial">
                  (´•︵•`)
                </span>
              </div>
              <h3 className="text-2xl font-gasoek text-tx-primary mb-3">
                {searchQuery || statusFilter ? "Pesanan Tidak Ditemukan" : "Belum Ada Pesanan"}
              </h3>
              <p className="text-tx-primary font-questrial max-w-md px-6 bg-white/20 p-4 rounded-lg shadow-inner">
                {searchQuery || statusFilter
                  ? "Coba gunakan kata kunci atau status filter lainnya."
                  : `Sepertinya kamu belum memiliki riwayat ${activeTab === "sales" ? "penjualan" : "pembelian"} saat ini.`}
              </p>
            </motion.div>
          )}
        </ AnimatePresence>

        {/* Pagination & Page Info */}
        {transactions.length > 0 && (
          <div className="mt-12 flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
            <div className="flex items-center justify-start gap-2 flex-wrap order-1 md:order-1">
              {/* Prev */}
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex items-center justify-center w-10 h-10 rounded-xl border border-slate-200 bg-white text-tx-secondary font-questrial shadow-sm hover:border-bg-vermillion/50 hover:text-bg-vermillion transition-all disabled:opacity-40 disabled:cursor-not-allowed group"
                title="Sebelumnya"
              >
                <svg className="w-5 h-5 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              {/* Page numbers */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
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
              ))}

              {/* Next */}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center justify-center w-10 h-10 rounded-xl border border-slate-200 bg-white text-tx-secondary font-questrial shadow-sm hover:border-bg-vermillion/50 hover:text-bg-vermillion transition-all disabled:opacity-40 disabled:cursor-not-allowed group"
                title="Selanjutnya"
              >
                <svg className="w-5 h-5 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            
            {/* Page Info Info */}
            <div className="text-[10px] font-gasoek text-tx-muted uppercase tracking-wider bg-bg-fresh px-4 py-2 rounded-full border border-bg-fresh/50 shadow-inner order-2 md:order-2">
              Halaman <span className="text-bg-vermillion">{currentPage}</span> dari <span className="text-tx-primary">{totalPages}</span>
            </div>
          </div>
        )}
      </div>

      {/* Popups */}
      <UserDetailPopup
        selectedUser={selectedUser}
        onClose={() => setSelectedUser(null)}
      />

      <ItemDetailPopup
        selectedItem={selectedItem}
        onClose={() => setSelectedItem(null)}
        footer={
          <div className="flex gap-4">
            <button
              onClick={() => {
                const sellerId = selectedItem?.userid;
                setSelectedItem(null);
                if (sellerId) navigate(`/chats?userId=${sellerId}`);
              }}
              className="flex-1 flex items-center justify-center gap-2 py-4 bg-bg-fresh text-tx-primary hover:bg-white rounded-2xl text-sm font-gasoek uppercase tracking-wider transition-all shadow-lg"
            >
              <MessageSquare size={18} />
              Tanya Penjual
            </button>
          </div>
        }
      />

      {itemCoords && (
        <DirectionModal
          isOpen={showDirections}
          onClose={() => setShowDirections(false)}
          userCoords={userLocation}
          itemCoords={itemCoords}
          itemName={itemNameToMap}
        />
      )}
    </div>
  );
}
