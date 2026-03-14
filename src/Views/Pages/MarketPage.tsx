import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Utils/Hooks/AuthProvider";
import { ThriftService, type Item } from "../../Services/ThriftsServices";
import { UserService } from "../../Services/UserServices";
import type { User } from "../../Types/User";
import { Search, MessageSquare, ShoppingBag } from "lucide-react";
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

      <UserDetailPopup
        selectedUser={selectedUser}
        onClose={() => setSelectedUser(null)}
      />
      <ItemDetailPopup
        selectedItem={selectedItem}
        onClose={() => setSelectedItem(null)}
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
            <button className="flex items-center justify-center gap-1.5 py-3.5 bg-tx-primary hover:bg-black text-bg-clean rounded-lg text-sm font-bold font-questrial shadow-md transition-colors">
              <ShoppingBag size={18} />
              Beli Barang
            </button>
          </div>
        }
      />
    </div>
  );
};

export default MarketPage;
