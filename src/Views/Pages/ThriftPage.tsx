import { useState, useEffect } from "react";
import { useAuth } from "../../Utils/Hooks/AuthProvider";
import { ThriftService, type Item } from "../../Services/ThriftsServices";
import ThriftForm from "../Components/ThriftForm";

const ThriftPage = () => {
  const { user } = useAuth();
  const [myThrifts, setMyThrifts] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  const fetchMyThrifts = async () => {
    if (user?.userid) {
      setIsLoading(true);
      try {
        const thriftService = new ThriftService();
        await new Promise((resolve) => setTimeout(resolve, 800));
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

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white relative pt-10 pb-20">
      {/* Background Ornaments */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 mb-2">
              My Thrifts
            </h1>
            <p className="text-slate-400">
              Manage and view your collection of pre-loved items.
            </p>
          </div>
          <button
            onClick={handleAddNew}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-all shadow-lg shadow-indigo-500/25"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            Add New Item
          </button>
        </div>

        {myThrifts.length === 0 ? (
          <div className="w-full bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-3xl p-12 text-center flex flex-col items-center">
            <div className="w-24 h-24 mb-6 rounded-full bg-slate-800 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 text-slate-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              No Items Found
            </h3>
            <p className="text-slate-400 max-w-md">
              You haven't added any thrift items yet. Start adding your
              pre-loved goods to share them with the community.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {myThrifts.map((item) => (
              <div
                key={item.itemid}
                className="group flex flex-col bg-slate-900/40 backdrop-blur-sm border border-white/5 rounded-2xl overflow-hidden hover:bg-slate-800/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10"
              >
                {/* Image Container */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-800">
                  <img
                    src={item.itempicturl}
                    alt={item.itemname}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Action Row - Always Visible */}
                  <div className="absolute top-3 left-3 flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(item);
                      }}
                      className="p-2 bg-white/90 hover:bg-white text-indigo-600 rounded-lg transition-all shadow-sm flex items-center justify-center border border-white/20"
                      title="Edit Item"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(item.itemid);
                      }}
                      disabled={isDeleting === item.itemid}
                      className="p-2 bg-red-500/90 hover:bg-red-500 text-white rounded-lg transition-all shadow-sm flex items-center justify-center border border-red-500/20 disabled:opacity-50"
                      title="Delete Item"
                    >
                      {isDeleting === item.itemid ? (
                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </button>
                  </div>

                  <div className="absolute top-3 right-3 flex gap-2">
                    <span
                      className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg backdrop-blur-md border border-white/20 ${
                        item.itemstatus === "Tersedia"
                          ? "bg-emerald-500/80 text-white"
                          : "bg-red-500/80 text-white"
                      }`}
                    >
                      {item.itemstatus}
                    </span>
                  </div>

                  {/* Category Label - Bottom Left of Image */}
                  <div className="absolute bottom-3 left-3">
                    <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-slate-300">
                      {item.category}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-grow">
                  <div className="flex justify-between items-start mb-2 gap-2">
                    <h3 className="text-lg font-bold text-white line-clamp-2 leading-tight group-hover:text-indigo-300 transition-colors">
                      {item.itemname}
                    </h3>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 mb-4 flex-grow">
                    {item.itemdescription}
                  </p>

                  <div className="pt-4 border-t border-white/5 mt-auto">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-slate-500 mb-0.5">Price</p>
                        <p className="text-lg font-bold text-emerald-400">
                          Rp {item.itemprice.toLocaleString("id-ID")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-500 mb-0.5">Stock</p>
                        <p className="text-sm font-medium text-white">
                          {item.itemquantity} pcs
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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
