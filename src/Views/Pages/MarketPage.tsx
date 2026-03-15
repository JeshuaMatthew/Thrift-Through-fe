import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Utils/Hooks/AuthProvider";
import { ThriftService, type Item } from "../../Services/ThriftsServices";
import { UserService } from "../../Services/UserServices";
import { TransactionServices } from "../../Services/TransactionServices";
import type { User } from "../../Types/User";
import { Search, MessageSquare, ShoppingBag, Loader2 } from "lucide-react";
import ThriftSkeleton from "../Components/ThriftSkeleton";
import UserDetailPopup from "../Components/UserDetailPopup";
import ItemDetailPopup from "../Components/ItemDetailPopup";

type MarketItem = Item & { seller?: User };

const MarketPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<MarketItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedItem, setSelectedItem] = useState<MarketItem | null>(null);
  const [sortBy, setSortBy] = useState("item_id");
  const [order, setOrder] = useState("DESC");
  const [isBuying, setIsBuying] = useState(false);

  const categories = [
    "All",
    "Gadget",
    "Perangkat Visual",
    "Perangkat Audio",
    "Perangkat Rumah Tangga",
    "Lainnya",
  ];

  const handleBuyItem = async (item: MarketItem) => {
    if (!item || isBuying) return;

    const confirmed = window.confirm(
      `Kamu yakin ingin membeli "${item.itemname}"? Penjual akan mendapatkan notifikasi dan bisa menerima atau menolak permintaanmu.`
    );
    if (!confirmed) return;

    setIsBuying(true);
    try {
      const transactionService = new TransactionServices();
      const res = await transactionService.buyItem(
        item.itemid,
        item.itemprice,
        (item.transaction_type as 'Uang' | 'Barter') || 'Uang'
      );
      if (res.success) {
        setSelectedItem(null);
        alert("Permintaan pembelian berhasil dikirim! Lihat status di halaman Pesananku.");
        navigate("/orders?tab=purchases");
      } else {
        alert(res.message);
      }
    } catch (error) {
      alert("Terjadi kesalahan saat melakukan pembelian.");
    } finally {
      setIsBuying(false);
    }
  };

  const fetchMarketItems = async () => {
    if (user?.userid) {
      setIsLoading(true);
      try {
        const thriftService = new ThriftService();
        const { items: marketItems, meta } = await thriftService.getOtherItems({
          page: currentPage,
          limit: itemsPerPage,
          search: searchQuery,
          category: selectedCategory === "All" ? undefined : selectedCategory,
          sortBy,
          order,
        });
        setItems(marketItems);
        setTotalPages(meta?.totalPages || 1);
        return marketItems;
      } catch (error) {
        console.error("Failed to fetch market items:", error);
      } finally {
        setIsLoading(false);
      }
    }
    return [];
  };

  const handleSellerClick = async (userId: number) => {
    try {
      const userService = new UserService();
      const seller = await userService.getUserById(userId);
      if (seller) {
        setSelectedUser(seller);
      }
    } catch (error) {
      console.error("Failed to fetch seller details:", error);
    }
  };

  useEffect(() => {
    fetchMarketItems();
  }, [user, currentPage, itemsPerPage, searchQuery, selectedCategory, sortBy, order]);

  // Reset to page 1 when filter/search changes
  const handleSearch = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };
  const handleCategory = (cat: string) => {
    setSelectedCategory(cat);
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
        <div className="mb-10">
          <h1 className="text-4xl font-gasoek text-tx-primary mb-2">Pasar</h1>
          <p className="text-tx-secondary font-questrial">
            Disini kamu bisa melihat barang barang apa saja yang sedang
            dijajakan oleh pengguna lain.
          </p>
        </div>
        {/* Filters, Search, and Pagination Limit */}
        <div className="mb-10 space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            {/* Search */}
            <div className="relative grow group w-full md:w-auto">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="w-5 h-5 text-tx-primary group-focus-within:text-bg-vermillion transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Cari barang impianmu..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full bg-bg-fresh border border-bg-fresh/50 rounded-2xl py-3.5 pl-12 pr-4 text-tx-primary placeholder-opacity-50 focus:outline-none focus:ring-2 focus:ring-tx-primary/30 focus:border-tx-primary/50 transition-all shadow-sm font-gasoek text-sm tracking-wide"
              />
            </div>

            {/* Pagination Limit Selector */}
            <div className="flex items-center gap-2 bg-bg-vermillion/10 p-1.5 rounded-2xl border border-bg-vermillion/20">
              <span className="text-[10px] font-questrial text-tx-primary uppercase px-2">
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
              <span className="text-[10px] font-questrial text-tx-primary uppercase px-2">
                Urutkan:
              </span>
              {[
                { label: "Terbaru", field: "item_id" },
                { label: "Harga", field: "price" },
                { label: "Nama", field: "item_name" },
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
                {cat === "All" ? "Semua" : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Item Grid */}
        <div>
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(itemsPerPage)].map((_, i) => (
                <ThriftSkeleton key={i} />
              ))}
            </div>
          ) : items.length === 0 ? (
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
              {items.map((item) => (
                <div
                  key={item.itemid}
                  className="flex flex-col bg-bg-vermillion border border-bg-vermillion/50 rounded-xl overflow-hidden shadow-sm cursor-pointer hover:shadow-md hover:border-bg-vermillion transition-all duration-200"
                  onClick={() => setSelectedItem(item)}
                >
                  <div className="relative aspect-4/5 overflow-hidden bg-bg-vermillion shrink-0">
                    <img
                      src={item.itempicturl}
                      alt={item.itemname}
                      className="w-full h-full object-cover bg-white/20"
                    />
                    <span className="absolute top-3 left-3 px-2 py-1 bg-bg-fresh text-tx-primary border border-bg-fresh/50 text-[10px] font-bold font-questrial uppercase tracking-wider rounded-lg whitespace-nowrap shadow-sm z-10">
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

                    <div className={`mb-4 ${item.transaction_type === 'Barter' ? 'bg-bg-vermillion border-bg-vermillion/50' : 'bg-bg-fresh border-bg-fresh/50'} px-3 py-2 rounded-xl shadow-sm border text-center`}>
                      <span className="text-lg font-gasoek text-tx-primary">
                        {item.transaction_type === 'Barter' ? 'BARTER' : `Rp ${item.itemprice.toLocaleString("id-ID")}`}
                      </span>
                    </div>

                    {/* Seller Info Trigger */}
                    <div
                      className="flex items-center gap-2 mt-auto cursor-pointer hover:bg-white/20 p-1.5 -ml-1.5 rounded-lg transition-colors border border-transparent hover:border-white/30"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSellerClick(item.userid);
                      }}
                    >
                      <img
                        src={
                          item.seller_profile_pict ||
                          `https://ui-avatars.com/api/?name=${item.seller_name}&background=random`
                        }
                        alt={item.seller_name}
                        className="w-6 h-6 rounded-full border border-white/50 object-cover bg-white"
                      />
                      <span className="text-xs text-tx-primary font-questrial font-bold truncate">
                        {item.seller_name || "Lihat Penjual"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination & Page Info */}
        {items.length > 0 && (
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
            <div className="text-[10px] font-questrial text-tx-primary uppercase tracking-wider bg-bg-fresh px-4 py-2 rounded-full border border-bg-fresh/50 shadow-inner order-2 md:order-2">
              Halaman <span className="text-bg-vermillion">{currentPage}</span> dari <span className="text-tx-primary">{totalPages}</span>
            </div>
          </div>
        )}
      </div>

      <UserDetailPopup
        selectedUser={selectedUser}
        onClose={() => setSelectedUser(null)}
      />
      <ItemDetailPopup
        selectedItem={selectedItem}
        onClose={() => setSelectedItem(null)}
        onRefresh={async () => {
          const updatedItems = await fetchMarketItems();
          // After fetching, find the updated item in the newly fetched items to update selectedItem
          if (selectedItem) {
            const freshItem = updatedItems.find(i => i.itemid === selectedItem.itemid);
            if (freshItem) {
              setSelectedItem(freshItem);
            }
          }
        }}
        footer={
          <div className="grid grid-cols-2 gap-3 mt-auto">
            <button
              onClick={() => {
                setSelectedItem(null);
                navigate(`/chats?userId=${selectedItem?.userid}`);
              }}
              className="flex items-center justify-center gap-1.5 py-3.5 bg-bg-fresh text-tx-primary hover:bg-white rounded-lg text-sm font-bold font-questrial transition-colors shadow-md"
            >
              <MessageSquare size={18} />
              Chat Penjual
            </button>
            <button
              onClick={() => selectedItem && handleBuyItem(selectedItem)}
              disabled={isBuying}
              className="flex items-center justify-center gap-1.5 py-3.5 bg-tx-primary hover:bg-black text-bg-clean rounded-lg text-sm font-bold font-questrial shadow-md transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isBuying ? <Loader2 size={18} className="animate-spin" /> : <ShoppingBag size={18} />}
              {isBuying ? "Memproses..." : "Beli Barang"}
            </button>
          </div>
        }
      />
    </div>
  );
};

export default MarketPage;
