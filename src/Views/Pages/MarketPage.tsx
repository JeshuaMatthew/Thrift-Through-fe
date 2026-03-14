import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Utils/Hooks/AuthProvider";
import { ThriftService, type Item } from "../../Services/ThriftsServices";
import { UserService } from "../../Services/UserServices";
import type { User } from "../../Types/User";
import { motion, AnimatePresence } from "framer-motion";
import { X, MessageSquare, ShoppingBag, Search } from "lucide-react";
import ThriftSkeleton from "../Components/ThriftSkeleton";

type MarketItem = Item & { seller?: User };

const MarketPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<MarketItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedItem, setSelectedItem] = useState<MarketItem | null>(null);
  const ITEMS_PER_PAGE = 12;

  const categories = [
    "All",
    "Pakaian",
    "Elektronik",
    "Furniture",
    "Otomotif",
    "Lainnya",
  ];

  const fetchMarketItems = async () => {
    if (user?.userid) {
      setIsLoading(true);
      try {
        const thriftService = new ThriftService();
        const userService = new UserService();
        // Artificial delay removed for better feel, or kept short
        await new Promise((resolve) => setTimeout(resolve, 600));
        const marketItems = await thriftService.getMarketThrifts(user.userid);

        const itemsWithSellers = await Promise.all(
          marketItems.map(async (item) => {
            const seller = await userService.getUserById(item.userid);
            return { ...item, seller: seller || undefined };
          }),
        );

        setItems(itemsWithSellers);
      } catch (error) {
        console.error("Failed to fetch market items:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchMarketItems();
  }, [user]);

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.itemname
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.max(
    1,
    Math.ceil(filteredItems.length / ITEMS_PER_PAGE),
  );
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  // Reset to page 1 when filter/search changes
  const handleSearch = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };
  const handleCategory = (cat: string) => {
    setSelectedCategory(cat);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-bg-clean text-tx-primary font-questrial relative pt-10 pb-20 overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-16">
        <div className="mb-10">
          <h1 className="text-4xl font-gasoek text-tx-primary mb-2">Pasar</h1>
          <p className="text-tx-secondary font-questrial">
            Disini kamu bisa melihat barang barang apa saja yang sedang
            dijajakan oleh pengguna lain.
          </p>
        </div>
        {/* Filters and Search */}
        <div className="mb-10 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-grow group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="w-5 h-5 text-tx-muted group-focus-within:text-bg-vermillion transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Cari barang impianmu..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full bg-bg-fresh border border-bg-fresh/50 rounded-2xl py-3.5 pl-12 pr-4 text-tx-primary placeholder-opacity-50 focus:outline-none focus:ring-2 focus:ring-tx-primary/30 focus:border-tx-primary/50 transition-all shadow-sm font-gasoek text-sm tracking-wide"
              />
            </div>

            {/* Category Pills */}
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategory(cat)}
                  className={`px-5 py-3 rounded-2xl text-sm tracking-wide whitespace-nowrap transition-all border font-gasoek ${
                    selectedCategory === cat
                      ? "bg-bg-fresh border-bg-fresh/50 text-tx-primary shadow-md"
                      : "bg-bg-vermillion border-bg-vermillion/50 text-tx-primary hover:bg-bg-vermillion/80 shadow-sm"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Item Grid */}
        <div>
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <ThriftSkeleton key={i} />
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="w-full py-24 flex flex-col items-center justify-center text-center bg-bg-vermillion rounded-xl border border-bg-vermillion/50 shadow-sm">
              <div className="w-25 h-25 mb-6 rounded-lg bg-bg-fresh flex items-center justify-center text-tx-primary ">
                <span className="text-3xl font-black font-questrial">
                  (´•︵•`)
                </span>
              </div>
              <h3 className="text-2xl font-gasoek text-tx-primary mb-3">
                Barang Tidak Ditemukan
              </h3>
              <p className="text-tx-primary font-questrial max-w-md px-6 bg-white/20 p-4 rounded-lg shadow-inner">
                Maaf, kami tidak menemukan barang yang sesuai. Coba kata kunci
                lain atau pilih kategori berbeda.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {paginatedItems.map((item) => (
                <div
                  key={item.itemid}
                  className="flex flex-col bg-bg-vermillion border border-bg-vermillion/50 rounded-xl overflow-hidden shadow-sm cursor-pointer hover:shadow-md hover:border-bg-vermillion transition-all duration-200"
                  onClick={() => setSelectedItem(item)}
                >
                  <div className="relative aspect-[4/5] overflow-hidden bg-bg-vermillion shrink-0">
                    <img
                      src={item.itempicturl}
                      alt={item.itemname}
                      className="w-full h-full object-cover bg-white/20"
                    />
                    <span className="absolute top-3 left-3 px-2 py-1 bg-bg-fresh text-tx-primary border border-bg-fresh/50 text-[10px] font-bold uppercase tracking-wider rounded-lg whitespace-nowrap shadow-sm z-10">
                      {item.category}
                    </span>
                    <span className="absolute bottom-3 left-3 px-2 py-1 bg-tx-primary text-bg-clean text-[10px] font-questrial rounded-lg whitespace-nowrap shadow-sm z-10 flex items-center gap-1.5">
                      Sisa {item.itemquantity} unit
                    </span>
                  </div>

                  {/* Card Info */}
                  <div className="p-4 flex flex-col flex-1 bg-bg-vermillion">
                    <h3 className="text-base font-gasoek text-tx-primary mb-3 line-clamp-1 leading-tight">
                      {item.itemname}
                    </h3>

                    <div className="mb-4 bg-bg-fresh px-3 py-2 rounded-xl shadow-sm border border-bg-fresh/50 text-center">
                      <span className="text-lg font-gasoek text-tx-primary">
                        Rp {item.itemprice.toLocaleString("id-ID")}
                      </span>
                    </div>

                    {/* Seller Info */}
                    {item.seller && (
                      <div
                        className="flex items-center gap-2 mt-auto cursor-pointer hover:bg-white/20 p-1.5 -ml-1.5 rounded-lg transition-colors border border-transparent hover:border-white/30"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedUser(item.seller!);
                        }}
                      >
                        <img
                          src={item.seller.profilepicturl}
                          alt={item.seller.fullname}
                          className="w-6 h-6 rounded-full border border-white/50 object-cover"
                        />
                        <span className="text-xs text-tx-primary font-questrial font-bold truncate">
                          {item.seller.fullname}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-2 flex-wrap">
            {/* Prev */}
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-tx-secondary font-questrial text-sm font-bold shadow-sm hover:border-bg-vermillion/50 hover:text-bg-vermillion transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <svg
                className="w-4 h-4"
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
              Sebelumnya
            </button>

            {/* Page numbers */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-10 h-10 rounded-xl text-sm font-gasoek transition-all border ${
                  currentPage === page
                    ? "bg-bg-vermillion border-bg-vermillion text-white shadow-md"
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
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-tx-secondary font-questrial text-sm font-bold shadow-sm hover:border-bg-vermillion/50 hover:text-bg-vermillion transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Selanjutnya
              <svg
                className="w-4 h-4"
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
        )}
      </div>

      {/* User Profile Modal Overlay */}
      <AnimatePresence>
        {selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm"
            onClick={(e) => {
              if (e.target === e.currentTarget) setSelectedUser(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-bg-vermillion border border-bg-vermillion/50 rounded-xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col"
            >
              <div
                className={`h-32 relative bg-cover bg-center shrink-0 ${!selectedUser.bannerimgurl ? "bg-linear-to-r from-bg-vermillion to-bg-fresh" : ""}`}
                style={
                  selectedUser.bannerimgurl
                    ? { backgroundImage: `url(${selectedUser.bannerimgurl})` }
                    : {}
                }
              >
                <div className="absolute inset-0 bg-black/20"></div>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="absolute top-4 right-4 p-1.5 bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors backdrop-blur-sm z-10"
                  title="Tutup"
                >
                  <X size={18} />
                </button>
                <div className="absolute -bottom-12 left-6 z-10">
                  <img
                    src={
                      selectedUser.profilepicturl ||
                      `https://ui-avatars.com/api/?name=${selectedUser.fullname}&background=random`
                    }
                    alt={selectedUser.fullname}
                    className="w-24 h-24 rounded-full border-4 border-bg-vermillion object-cover bg-white shadow-md"
                  />
                </div>
              </div>
              <div className="pt-14 px-6 pb-6 text-tx-primary bg-bg-vermillion flex-1 flex flex-col">
                <h3 className="text-xl font-gasoek leading-tight truncate text-tx-primary mb-1">
                  {selectedUser.fullname}
                </h3>
                <p className="text-sm font-questrial text-white/90 mb-4 bg-black/10 inline-block px-3 py-1 rounded-lg w-max shadow-inner">
                  @{selectedUser.username}
                </p>
                <div className="space-y-3 mb-6 bg-white/90 p-4 rounded-xl shadow-inner">
                  <p className="text-sm font-questrial text-tx-primary flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-tx-muted"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    {selectedUser.email}
                  </p>
                  <p className="text-sm font-questrial text-tx-primary flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-tx-muted"
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
                    {selectedUser.phonenum}
                  </p>
                </div>

                <div className="flex gap-4 mt-auto">
                  <div className="bg-white/90 px-4 py-3 rounded-xl flex-1 border border-white/50 flex flex-col items-center justify-center text-center shadow-sm">
                    <span className="text-xs font-questrial text-tx-muted font-bold mb-1 uppercase tracking-wider">
                      Peringkat
                    </span>
                    <span
                      className={`text-sm font-bold font-questrial ${selectedUser.userrank.toLowerCase() === "gold" ? "text-yellow-600" : selectedUser.userrank.toLowerCase() === "silver" ? "text-slate-500" : "text-amber-600"}`}
                    >
                      {selectedUser.userrank}
                    </span>
                  </div>
                  <div className="bg-bg-fresh px-4 py-3 rounded-xl flex-1 border border-bg-fresh/50 flex flex-col items-center justify-center text-center shadow-sm">
                    <span className="text-xs font-questrial text-tx-primary font-bold mb-1 uppercase tracking-wider">
                      Poin
                    </span>
                    <span className="text-sm font-bold font-questrial text-tx-primary">
                      {selectedUser.userpoint}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Item Profile Modal Overlay */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm"
            onClick={(e) => {
              if (e.target === e.currentTarget) setSelectedItem(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-bg-vermillion border border-bg-vermillion/50 rounded-xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="relative shrink-0">
                <img
                  src={selectedItem.itempicturl}
                  alt={selectedItem.itemname}
                  className="w-full h-56 object-cover bg-white/20"
                />
                <span className="absolute top-4 left-4 px-2.5 py-1 bg-bg-fresh text-tx-primary border border-bg-fresh/50 text-xs font-bold uppercase tracking-wider rounded-lg whitespace-nowrap shadow-sm z-10">
                  {selectedItem.category}
                </span>
                <span className="absolute bottom-4 left-4 px-2.5 py-1 bg-tx-primary text-bg-clean text-xs font-questrial rounded-lg whitespace-nowrap shadow-sm z-10 flex items-center gap-1.5">
                  Sisa {selectedItem.itemquantity} unit
                </span>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="absolute top-4 right-4 p-1.5 bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors backdrop-blur-sm z-10"
                  title="Tutup"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="p-6 text-tx-primary overflow-y-auto custom-scrollbar bg-bg-vermillion flex flex-col">
                <div className="mb-2">
                  <h3 className="text-xl font-gasoek leading-tight text-tx-primary mb-3">
                    {selectedItem.itemname}
                  </h3>
                </div>

                <div className="flex items-center justify-between mb-6">
                  <div className="bg-bg-fresh px-4 py-2 rounded-xl shadow-sm border border-bg-fresh/50 w-full text-center">
                    <p className="text-2xl font-gasoek text-tx-primary">
                      Rp {selectedItem.itemprice.toLocaleString("id-ID")}
                    </p>
                  </div>
                </div>

                <div className="mb-8 flex-1">
                  <p className="text-xs text-white/80 mb-2 uppercase tracking-wider font-bold">
                    Deskripsi Barang
                  </p>
                  <p className="text-sm text-tx-primary font-questrial leading-relaxed bg-white/90 p-4 rounded-lg shadow-inner">
                    {selectedItem.itemdescription || "Tidak ada deskripsi."}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-auto">
                  <button
                    onClick={() => {
                      setSelectedItem(null);
                      navigate(`/chats?userId=${selectedItem.userid}`);
                    }}
                    className="flex items-center justify-center gap-1.5 py-3.5 bg-bg-fresh text-tx-primary hover:bg-white rounded-lg text-sm font-bold font-questrial transition-colors shadow-md"
                  >
                    <MessageSquare size={18} />
                    Chat Penjual
                  </button>
                  <button className="flex items-center justify-center gap-1.5 py-3.5 bg-tx-primary hover:bg-black text-bg-clean rounded-lg text-sm font-bold font-questrial shadow-md transition-colors">
                    <ShoppingBag size={18} />
                    Beli Barang
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MarketPage;
