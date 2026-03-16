import { useState, useEffect } from "react";
import { useAuth } from "../../Utils/Hooks/AuthProvider";
import { ThriftService, type Item } from "../../Services/ThriftsServices";
import ThriftForm from "../Components/ThriftForm";
import ItemDetailPopup from "../Components/ItemDetailPopup";
import { Plus, Trash2, Edit2, Search } from "lucide-react";
import { motion } from "framer-motion";
import ThriftSkeleton from "../Components/ThriftSkeleton";

const ThriftPage = () => {
  const { user } = useAuth();
  const [myThrifts, setMyThrifts] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [sortBy, setSortBy] = useState("item_id");
  const [order, setOrder] = useState("DESC");

  const categories = [
    "All",
    "Gadget",
    "Perangkat Visual",
    "Perangkat Audio",
    "Perangkat Rumah Tangga",
    "Lainnya",
  ];

  const fetchMyThrifts = async () => {
    if (user?.userid) {
      setIsLoading(true);
      try {
        const thriftService = new ThriftService();
        const { items: thrifts, meta } = await thriftService.getMyItems({
          page: currentPage,
          limit: itemsPerPage,
          search: searchQuery,
          category: selectedCategory === "All" ? undefined : selectedCategory,
          sortBy,
          order,
        });
        setMyThrifts(thrifts);
        setTotalPages(meta?.totalPages || 1);
        return thrifts;
      } catch (error) {
        console.error("Failed to fetch thrifts:", error);
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
    return [];
  };

  useEffect(() => {
    fetchMyThrifts();
  }, [user, currentPage, itemsPerPage, selectedCategory, searchQuery, sortBy, order]);

  const handleAddNew = () => {
    setEditingItem(null);
    setIsFormOpen(true);
  };

  const handleEdit = (item: Item) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleDelete = async (itemId: number) => {
    if (
      !user ||
      !window.confirm("Apakah Anda yakin ingin menghapus barang ini?")
    )
      return;

    setIsDeleting(itemId);
    try {
      const thriftService = new ThriftService();
      const res = await thriftService.deleteThrift(itemId, user.userid);
      if (res.success) {
        await fetchMyThrifts();
      } else {
        alert(res.message);
      }
    } catch (error) {
      console.error("Failed to delete", error);
      alert("Gagal menghapus barang.");
    } finally {
      setIsDeleting(null);
    }
  };

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
        {/* Header & Button */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div className="grow">
            <h1 className="text-4xl font-gasoek text-tx-primary mb-2">
              Jualanku
            </h1>
            <p className="text-tx-secondary font-questrial">
              Disini kamu bisa melihat barang barang apa saja yang sedang
              (telah) kamu jual.
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAddNew}
            className="flex items-center justify-center gap-2 bg-tx-primary hover:bg-black text-bg-clean px-6 py-4 rounded-2xl font-gasoek text-sm tracking-wide transition-all shadow-md group shrink-0"
          >
            <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
            Tambah Barang Baru
          </motion.button>
        </div>

        {/* Filters, Search, and Pagination Limit (SAMA DENGAN MARKET PAGE) */}
        <div className="mb-10 space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            {/* Search */}
            <div className="relative grow group w-full md:w-auto">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="w-5 h-5 text-tx-muted group-focus-within:text-bg-vermillion transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Cari dalam koleksimu..."
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

          {/* Category Pills (DIPISAH DARI BARIS PENCARIAN SEPERTI MARKET PAGE) */}
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategory(cat)}
                className={`px-5 py-3 rounded-2xl text-sm tracking-wide whitespace-nowrap transition-all border font-gasoek ${
                  selectedCategory === cat
                    ? "bg-bg-fresh border-bg-fresh/50 text-tx-primary shadow-md scale-105 z-10"
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
          ) : myThrifts.length === 0 ? (
            <div className="w-full py-24 flex flex-col items-center justify-center text-center bg-bg-vermillion rounded-xl border border-bg-vermillion/50 shadow-sm">
              <div className="w-25 h-25 mb-6 rounded-lg bg-bg-fresh flex items-center justify-center text-tx-primary">
                <span className="text-3xl font-black font-questrial">
                  (´•︵•`)
                </span>
              </div>
              <h3 className="text-2xl font-gasoek text-tx-primary mb-3">
                {searchQuery || selectedCategory !== "All"
                  ? "Barang Tidak Ditemukan"
                  : "Belum Ada Barang"}
              </h3>
              <p className="text-tx-primary font-questrial max-w-md px-6 bg-white/20 p-4 rounded-lg shadow-inner">
                {searchQuery || selectedCategory !== "All"
                  ? "Coba gunakan kata kunci atau kategori lain."
                  : "Anda belum menambahkan koleksi apapun. Ayo mulai tambahkan barang pre-loved Anda sekarang!"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {myThrifts.map((item) => (
                <div
                  key={item.itemid}
                  className="flex flex-col bg-bg-vermillion border border-bg-vermillion/50 rounded-xl overflow-hidden shadow-sm cursor-pointer hover:shadow-md hover:border-bg-vermillion transition-all duration-200"
                  onClick={() => setSelectedItem(item)}
                >
                  {/* Image Container */}
                  <div className="relative aspect-4/5 overflow-hidden bg-bg-vermillion shrink-0">
                    <img
                      src={item.itempicturl}
                      alt={item.itemname}
                      className="w-full h-full object-cover bg-white/20"
                    />
                    {/* Tags */}
                    <span className="absolute top-3 left-3 px-2 py-1 bg-bg-fresh text-tx-primary border border-bg-fresh/50 text-[10px] font-bold uppercase tracking-wider rounded-lg whitespace-nowrap shadow-sm z-10 font-gasoek">
                      {item.category}
                    </span>
                    <span
                      className={`absolute top-3 right-3 px-2 py-1 border border-white/20 text-[10px] font-bold uppercase tracking-wider rounded-lg whitespace-nowrap shadow-sm z-10 ${
                        item.itemstatus === "Tersedia"
                          ? "bg-bg-clean text-tx-primary"
                          : "bg-tx-primary text-bg-clean"
                      }`}
                    >
                      {item.itemstatus}
                    </span>
                    <span className="absolute bottom-3 left-3 px-2 py-1 bg-tx-primary text-bg-clean text-[10px] font-questrial rounded-lg whitespace-nowrap shadow-sm z-10 flex items-center gap-1.5">
                      Sisa {item.itemquantity} unit
                    </span>
                  </div>

                  {/* Card Content */}
                  <div className="p-4 flex flex-col flex-1 bg-bg-vermillion">
                    <h3 className="text-base font-gasoek text-tx-primary mb-3 line-clamp-1 leading-tight">
                      {item.itemname}
                    </h3>

                    {/* Mt-auto is used here so the price is pushed to the bottom just like MarketPage */}
                    <div className="mt-auto">
                      <div
                        className={`${item.transaction_type === "Barter" ? "bg-bg-vermillion border-bg-vermillion/50" : "bg-bg-fresh border-bg-fresh/50"} px-3 py-2 rounded-xl shadow-sm border text-center`}
                      >
                        <span className="text-lg font-gasoek text-tx-primary">
                          {item.transaction_type === "Barter"
                            ? "BARTER"
                            : `Rp ${item.itemprice.toLocaleString("id-ID")}`}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination & Page Info */}
        {myThrifts.length > 0 && (
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

      <ItemDetailPopup
        selectedItem={selectedItem}
        onClose={() => setSelectedItem(null)}
        onRefresh={async () => {
          const updatedItems = await fetchMyThrifts();
          if (selectedItem && updatedItems) {
            const freshItem = updatedItems.find((i) => i.itemid === selectedItem.itemid);
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
                handleEdit(selectedItem!);
              }}
              className="flex items-center justify-center gap-1.5 py-3.5 bg-bg-fresh text-tx-primary hover:bg-white rounded-lg text-sm font-bold font-questrial transition-colors shadow-md"
            >
              <Edit2 size={18} />
              Edit Barang
            </button>
            <button
              onClick={() => {
                setSelectedItem(null);
                handleDelete(selectedItem!.itemid);
              }}
              disabled={isDeleting === selectedItem?.itemid}
              className="flex items-center justify-center gap-1.5 py-3.5 bg-red-500 text-white hover:bg-red-600 rounded-lg text-sm font-bold font-questrial shadow-md transition-colors disabled:opacity-50"
            >
              {isDeleting === selectedItem?.itemid ? (
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Trash2 size={18} />
              )}
              Hapus Barang
            </button>
          </div>
        }
      />

      <ThriftForm
        key={editingItem?.itemid || "new"}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={() => {
          fetchMyThrifts();
        }}
        initialData={editingItem}
      />
    </div>
  );
};

export default ThriftPage;
