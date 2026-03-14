import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Utils/Hooks/AuthProvider";
import { TransactionServices } from "../../Services/TransactionServices";
import type { Transaction } from "../../Types/Transaction";
import { ThriftService, type Item } from "../../Services/ThriftsServices";
import { UserService } from "../../Services/UserServices";
import type { User } from "../../Types/User";
import {
  Calendar,
  DollarSign,
  User as UserIcon,
  Package,
  MessageSquare,
  Search,
} from "lucide-react";
import UserDetailPopup from "../Components/UserDetailPopup";
import ItemDetailPopup from "../Components/ItemDetailPopup";

interface TransactionWithDetails extends Transaction {
  itemDetail?: Item | null;
  otherUser?: User | null;
}

export default function OrdersPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"sales" | "purchases">("sales");
  const [transactions, setTransactions] = useState<TransactionWithDetails[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const fetchTransactions = async () => {
    if (user?.userid) {
      setIsLoading(true);
      try {
        const transactionService = new TransactionServices();
        await new Promise((resolve) => setTimeout(resolve, 600));

        let txData: Transaction[] = [];
        if (activeTab === "sales") {
          txData = await transactionService.getTransactionsAsSeller(
            user.userid,
          );
        } else {
          txData = await transactionService.getTransactionsAsBuyer(user.userid);
        }

        const thriftService = new ThriftService();
        const userService = new UserService();

        const detailedTx = await Promise.all(
          txData.map(async (tx) => {
            const itemDetail = await thriftService
              .getThriftDetailById(tx.itemid)
              .catch(() => null);
            const otherUserId =
              activeTab === "sales" ? tx.buyerid : tx.sellerid;
            const otherUser = await userService
              .getUserById(otherUserId)
              .catch(() => null);
            return {
              ...tx,
              itemDetail,
              otherUser,
            };
          }),
        );

        setTransactions(detailedTx);
      } catch (error) {
        console.error("Failed to fetch transactions:", error);
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
    setSearchQuery("");
    setCurrentPage(1);
  }, [user, activeTab]);

  // Filtering Logic
  const filteredTransactions = transactions.filter((tx) => {
    const itemName = tx.itemDetail?.itemname?.toLowerCase() || "";
    const userName = tx.otherUser?.fullname?.toLowerCase() || "";
    const query = searchQuery.toLowerCase();
    return itemName.includes(query) || userName.includes(query);
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTransactions = filteredTransactions.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );

  return (
    <div className="min-h-screen bg-bg-clean text-tx-primary font-questrial relative pt-10 pb-20 overflow-x-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-16">
        <div className="mb-10">
          <h1 className="text-4xl font-gasoek text-tx-primary mb-2">
            Pesananku
          </h1>
          <p className="text-tx-secondary font-questrial">
            Disini kalian bisa lihat semua transaksi yang kalian buat, mau itu
            transaksi pembelian maupun penjualan.
          </p>
        </div>

        {/* Search and Tabs Row */}
        <div className="mb-10 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Bar */}
            <div className="relative grow group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="w-5 h-5 text-tx-primary/40 group-focus-within:text-bg-vermillion transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Cari pesanan atau pengirim..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-bg-fresh border border-bg-fresh/50 rounded-2xl py-3.5 pl-12 pr-4 text-tx-primary placeholder-opacity-50 focus:outline-none focus:ring-2 focus:ring-tx-primary/30 focus:border-tx-primary/50 transition-all shadow-sm font-gasoek text-sm tracking-wide"
              />
            </div>

            {/* Custom Tabs (Pills) */}
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              <button
                onClick={() => setActiveTab("sales")}
                className={`px-5 py-3 rounded-2xl text-sm tracking-wide whitespace-nowrap transition-all border font-gasoek ${
                  activeTab === "sales"
                    ? "bg-bg-fresh border-bg-fresh/50 text-tx-primary shadow-md"
                    : "bg-bg-vermillion border-bg-vermillion/50 text-tx-primary hover:bg-bg-vermillion/80 shadow-sm"
                }`}
              >
                Pesanan Masuk
              </button>
              <button
                onClick={() => setActiveTab("purchases")}
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
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="animate-pulse bg-bg-vermillion/30 border border-bg-vermillion/20 rounded-3xl p-6 h-48"
              />
            ))}
          </div>
        ) : currentTransactions && currentTransactions.length > 0 ? (
          <div className="space-y-6">
            {currentTransactions.map((tx) => (
              <div
                key={tx.transactionid}
                className="bg-bg-vermillion border border-bg-vermillion/50 rounded-3xl p-6 hover:border-bg-vermillion hover:shadow-md transition-all duration-300"
              >
                <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6 mb-6 pb-6 border-b border-bg-fresh/50">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
                    {/* Date Section */}
                    <div>
                      <p className="text-lg text-bg-clean font-questrial mb-1 flex items-center gap-1.5">
                        <Calendar size={15} />
                        Tanggal Transaksi
                      </p>
                      <div className="text-lg text-tx-primary font-gasoek uppercase tracking-wider flex items-center gap-2">
                        {new Date(tx.transactiondate).toLocaleDateString(
                          "id-ID",
                          {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          },
                        )}
                      </div>
                    </div>

                    {/* Price Section in Header */}
                    <div>
                      <p className="text-lg text-bg-clean font-questrial mb-1 flex items-center gap-1.5">
                        <DollarSign size={15} />
                        Total Harga
                      </p>
                      <p className="text-lg text-tx-primary font-gasoek  tracking-wider flex items-center gap-2">
                        Rp {tx.finalprice.toLocaleString("id-ID")}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`inline-flex px-4 py-2 text-[10px] font-gasoek uppercase tracking-widest rounded-xl w-fit shadow-sm ${
                      tx.status === "completed"
                        ? "bg-bg-fresh text-tx-primary"
                        : tx.status === "pending"
                          ? "bg-amber-100 text-amber-700 "
                          : "bg-red-100 text-red-700 "
                    }`}
                  >
                    {tx.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 space-x-5">
                  {/* Item Info */}
                  <div
                    className="flex flex-col justify-center cursor-pointer group bg-bg-fresh rounded-lg p-2 "
                    onClick={() =>
                      tx.itemDetail && setSelectedItem(tx.itemDetail)
                    }
                  >
                    <p className="text-sm text-tx-primary font-questrial mb-2  ">
                      Barang
                    </p>
                    <div className="flex items-center gap-3">
                      {tx.itemDetail?.itempicturl ? (
                        <img
                          src={tx.itemDetail.itempicturl}
                          alt={tx.itemDetail.itemname}
                          className="w-12 h-12 rounded-xl object-cover bg-bg-clean border border-white/20 shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-bg-fresh flex items-center justify-center shrink-0">
                          <Package size={20} className="text-tx-primary/40" />
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-bold text-tx-primary line-clamp-1 font-questrial">
                          {tx.itemDetail?.itemname || `Barang #${tx.itemid}`}
                        </p>
                        <p className="text-sm text-tx-primary mt-0.5 group-hover:text-bg-vermillion transition-colors font-questrial">
                          Lihat Detail
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* User Involvement */}
                  <div
                    className="flex flex-col justify-center cursor-pointer group text-bg-fresh bg-tx-primary p-2 rounded-xl"
                    onClick={() =>
                      tx.otherUser && setSelectedUser(tx.otherUser)
                    }
                  >
                    <p className="text-sm text-bg-clean font-questrial mb-2 flex items-center gap-1.5">
                      {activeTab === "sales" ? "Pembeli" : "Penjual"}
                    </p>
                    <div className="flex items-center justify-between gap-2 ">
                      <div className="flex items-center gap-3 overflow-hidden">
                        {tx.otherUser?.profilepicturl ? (
                          <img
                            src={tx.otherUser.profilepicturl}
                            alt={tx.otherUser.fullname}
                            className="w-10 h-10 rounded-full object-cover bg-bg-clean border border-white/20 shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-bg-fresh flex items-center justify-center shrink-0">
                            <UserIcon
                              size={16}
                              className="text-tx-primary/40"
                            />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-bold truncate font-questrial">
                            {tx.otherUser?.fullname || "User"}
                          </p>
                          <p className="text-xs mt-0.5 truncate font-questrial">
                            @{tx.otherUser?.username || "pengguna"}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const targetId =
                            activeTab === "sales" ? tx.buyerid : tx.sellerid;
                          navigate(`/chats?userId=${targetId}`);
                        }}
                        className="px-4 py-2.5 bg-bg-fresh hover:bg-tx-primary text-tx-primary hover:text-bg-fresh cursor-pointer rounded-xl transition-all shadow-sm shrink-0 flex items-center gap-2 group/btn"
                        title="Chat"
                      >
                        <MessageSquare size={18} />
                        <span className="text-xs font-gasoek uppercase tracking-wide">
                          Chat {activeTab === "sales" ? "Pembeli" : "Penjual"}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 py-8">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="p-3 bg-bg-vermillion/50 border border-bg-vermillion/30 rounded-xl text-tx-primary hover:bg-bg-fresh hover:border-bg-fresh disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <MessageSquare size={18} className="rotate-180" />
                </button>
                <div className="flex items-center gap-2">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-10 h-10 rounded-xl font-gasoek text-xs transition-all ${
                        currentPage === i + 1
                          ? "bg-bg-fresh text-tx-primary shadow-inner"
                          : "bg-bg-vermillion/50 text-tx-primary/40 hover:bg-white/20"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="p-3 bg-bg-vermillion/50 border border-bg-vermillion/30 rounded-xl text-tx-primary hover:bg-bg-fresh hover:border-bg-fresh disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <MessageSquare size={18} />
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="w-full py-24 flex flex-col items-center justify-center text-center bg-bg-vermillion rounded-xl border border-bg-vermillion/50 shadow-sm">
            <div className="w-25 h-25 mb-6 rounded-lg bg-bg-fresh flex items-center justify-center text-tx-primary">
              <span className="text-3xl font-black font-questrial">
                (´•︵•`)
              </span>
            </div>
            <h3 className="text-2xl font-gasoek text-tx-primary mb-3">
              {searchQuery ? "Pencarian Tidak Ditemukan" : "Belum Transaksi"}
            </h3>
            <p className="text-tx-primary font-questrial max-w-md px-6 bg-white/20 p-4 rounded-lg shadow-inner">
              {searchQuery
                ? `Tidak ada transaksi untuk "${searchQuery}" di bagian ini.`
                : `Anda belum memiliki riwayat ${activeTab === "sales" ? "penjualan" : "pembelian"} saat ini.`}
            </p>
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
          <div className="flex gap-4">
            <button
              onClick={() => {
                setSelectedItem(null);
                navigate(`/chats?userId=${selectedItem?.userid}`);
              }}
              className="flex-1 flex items-center justify-center gap-1.5 py-3.5 bg-bg-fresh text-tx-primary hover:bg-white rounded-lg text-sm font-bold font-questrial transition-colors shadow-md"
            >
              <MessageSquare size={18} />
              Chat Penjual
            </button>
          </div>
        }
      />
    </div>
  );
}
