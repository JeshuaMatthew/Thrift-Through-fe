import { useState, useEffect } from "react";
import { useAuth } from "../../Utils/Hooks/AuthProvider";
import { ThriftService, type Item } from "../../Services/ThriftsServices";
import ThriftForm from "../Components/ThriftForm";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Edit2, Search, X } from "lucide-react";
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
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const ITEMS_PER_PAGE = 12;

  const categories = [
    "All",
    "Pakaian",
    "Elektronik",
    "Furniture",
    "Otomotif",
    "Lainnya",
  ];

  const fetchMyThrifts = async () => {
    if (user?.userid) {
      setIsLoading(true);
      try {
        const thriftService = new ThriftService();
        await new Promise((resolve) => setTimeout(resolve, 600));
        const thrifts = await thriftService.getThriftsByUserId(user.userid);
        setMyThrifts(thrifts);
      } catch (error) {
        console.error("Failed to fetch thrifts:", error);
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyThrifts();
  }, [user]);

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

  const filteredThrifts = myThrifts.filter((item) => {
    const matchesSearch = item.itemname
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.max(
    1,
    Math.ceil(filteredThrifts.length / ITEMS_PER_PAGE),
  );
  const paginatedThrifts = filteredThrifts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

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
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-gasoek text-tx-primary mb-2">
              Jualanku
            </h1>
            <p className="text-tx-secondary font-questrial">
              Disini kamu bisa melihat barang barang apa saja yang sedang
              (telah) kamu jual.
            </p>
          </div>
          <button
            onClick={handleAddNew}
            className="flex items-center gap-2 bg-tx-primary hover:bg-black text-bg-clean px-6 py-3.5 rounded-2xl font-gasoek text-sm tracking-wide transition-all shadow-md group"
          >
            <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
            Tambah Barang Baru
          </button>
        </div>

        {/* Filters and Search */}
        <div className="mb-10 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative grow group">
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

        <div className="mt-6">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <ThriftSkeleton key={i} />
              ))}
            </div>
          ) : filteredThrifts.length === 0 ? (
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
              {paginatedThrifts.map((item) => (
                <div
                  key={item.itemid}
                  className="flex flex-col bg-bg-vermillion border border-bg-vermillion/50 rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:border-bg-vermillion transition-all duration-200 cursor-pointer"
                  onClick={() => setSelectedItem(item)}
                >
                  {/* Image Container */}
                  <div className="relative aspect-4/5 overflow-hidden bg-bg-vermillion shrink-0">
                    <img
                      src={item.itempicturl}
                      alt={item.itemname}
                      className="w-full h-full object-cover bg-white/20"
                    />
                    {/* Status Labels */}
                    <span
                      className={`absolute top-3 left-3 px-2 py-1 border border-white/20 text-[10px] font-bold uppercase tracking-wider rounded-lg whitespace-nowrap shadow-sm z-10 ${
                        item.itemstatus === "Tersedia"
                          ? "bg-bg-fresh text-tx-primary"
                          : "bg-tx-primary text-bg-clean"
                      }`}
                    >
                      {item.itemstatus}
                    </span>
                    <span className="absolute bottom-3 left-3 px-2 py-1 bg-tx-primary text-bg-clean text-[10px] font-questrial rounded-lg whitespace-nowrap shadow-sm z-10 flex items-center gap-1.5">
                      Sisa {item.itemquantity} unit
                    </span>
                  </div>

                  {/* Content */}
                  <div className="p-4 flex flex-col flex-1 bg-bg-vermillion">
                    <div className="mb-2">
                      <span className="text-[10px] font-bold text-tx-primary/60 uppercase tracking-widest">
                        {item.category}
                      </span>
                      <h3 className="text-base font-gasoek text-tx-primary line-clamp-1 leading-tight mt-1">
                        {item.itemname}
                      </h3>
                    </div>

                    <div className="mt-auto pt-3">
                      <div className="bg-bg-fresh px-3 py-2 rounded-xl shadow-sm border border-bg-fresh/50 text-center">
                        <span className="text-lg font-gasoek text-tx-primary">
                          Rp {item.itemprice.toLocaleString("id-ID")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-2 flex-wrap">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-tx-secondary font-questrial text-sm font-bold shadow-sm hover:border-bg-vermillion/50 hover:text-bg-vermillion transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Sebelumnya
            </button>
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
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-tx-secondary font-questrial text-sm font-bold shadow-sm hover:border-bg-vermillion/50 hover:text-bg-vermillion transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Selanjutnya
            </button>
          </div>
        )}
      </div>

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
                      handleEdit(selectedItem);
                    }}
                    className="flex items-center justify-center gap-1.5 py-3.5 bg-bg-fresh text-tx-primary hover:bg-white rounded-lg text-sm font-bold font-questrial transition-colors shadow-md"
                  >
                    <Edit2 size={18} />
                    Edit Barang
                  </button>
                  <button
                    onClick={() => {
                      setSelectedItem(null);
                      handleDelete(selectedItem.itemid);
                    }}
                    disabled={isDeleting === selectedItem.itemid}
                    className="flex items-center justify-center gap-1.5 py-3.5 bg-red-500 text-white hover:bg-red-600 rounded-lg text-sm font-bold font-questrial shadow-md transition-colors disabled:opacity-50"
                  >
                    {isDeleting === selectedItem.itemid ? (
                      <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Trash2 size={18} />
                    )}
                    Hapus Barang
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
