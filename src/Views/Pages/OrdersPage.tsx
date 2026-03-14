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
  X,
} from "lucide-react";

interface TransactionWithDetails extends Transaction {
  itemDetail?: Item | null;
  otherUser?: User | null;
}

export default function OrdersPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"sales" | "purchases">("sales");
  const [transactions, setTransactions] = useState<TransactionWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

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
            const itemDetail = await thriftService.getThriftDetailById(tx.itemid).catch(() => null);
            const otherUserId = activeTab === "sales" ? tx.buyerid : tx.sellerid;
            const otherUser = await userService.getUserById(otherUserId).catch(() => null);
            return {
              ...tx,
              itemDetail,
              otherUser
            };
          })
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
  }, [user, activeTab]);

  return (
    <div className="min-h-screen bg-bg-clean text-tx-primary font-questrial relative pt-10 pb-20 overflow-x-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-16">
        <div className="mb-10">
          <h1 className="text-4xl font-gasoek text-tx-primary mb-2">
            Pesananku
          </h1>
          <p className="text-tx-secondary font-questrial">
            Pantau seluruh riwayat pembelian dan penjualan barang Anda.
          </p>
        </div>

        {/* Custom Tabs */}
        <div className="flex p-1.5 mb-10 bg-bg-vermillion/50 rounded-2xl w-full max-w-md border border-bg-vermillion/30 shadow-sm">
          <button
            onClick={() => setActiveTab("sales")}
            className={`flex-1 py-3 px-4 rounded-xl text-xs font-gasoek tracking-widest uppercase transition-all duration-300 ${
              activeTab === "sales"
                ? "bg-bg-fresh text-tx-primary shadow-inner"
                : "text-tx-primary/40 hover:text-tx-primary hover:bg-white/20"
            }`}
          >
            Pesanan Masuk
          </button>
          <button
            onClick={() => setActiveTab("purchases")}
            className={`flex-1 py-3 px-4 rounded-xl text-xs font-gasoek tracking-widest uppercase transition-all duration-300 ${
              activeTab === "purchases"
                ? "bg-bg-fresh text-tx-primary shadow-inner"
                : "text-tx-primary/40 hover:text-tx-primary hover:bg-white/20"
            }`}
          >
            Pembelianku
          </button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse bg-bg-vermillion/30 border border-bg-vermillion/20 rounded-3xl p-6 h-48" />
            ))}
          </div>
        ) : transactions && transactions.length > 0 ? (
          <div className="space-y-6">
            {transactions.map((tx) => (
              <div
                key={tx.transactionid}
                className="bg-bg-vermillion border border-bg-vermillion/50 rounded-3xl p-6 hover:border-bg-vermillion hover:shadow-md transition-all duration-300"
              >
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6 pb-4 border-b border-bg-fresh/50">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-3 rounded-2xl ${
                        tx.status === "completed"
                          ? "bg-bg-fresh text-tx-primary"
                          : "bg-white/50 text-tx-primary/60"
                      }`}
                    >
                      <Package size={24} />
                    </div>
                    <div>
                      <span className="text-xs font-gasoek text-tx-primary uppercase tracking-widest">
                        ID Pesanan #{tx.transactionid.toString().padStart(4, "0")}
                      </span>
                      <div className="flex items-center gap-1.5 text-xs text-tx-secondary mt-1 font-questrial">
                        <Calendar size={12} />
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
                  </div>
                  <span
                    className={`inline-flex px-4 py-2 text-[10px] font-gasoek uppercase tracking-widest rounded-xl border w-fit shadow-sm ${
                      tx.status === "completed"
                        ? "bg-bg-fresh text-tx-primary border-bg-fresh/50"
                        : tx.status === "pending"
                          ? "bg-amber-100 text-amber-700 border-amber-200"
                          : "bg-red-100 text-red-700 border-red-200"
                    }`}
                  >
                    {tx.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Item Info */}
                  <div 
                    className="bg-bg-clean/40 p-4 rounded-2xl border border-white/20 flex flex-col justify-center cursor-pointer hover:bg-white transition-colors group shadow-inner"
                    onClick={() => tx.itemDetail && setSelectedItem(tx.itemDetail)}
                  >
                    <p className="text-[10px] text-tx-primary/40 font-gasoek mb-2 uppercase tracking-widest">
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
                        <p className="text-[10px] text-tx-primary/60 mt-0.5 group-hover:text-bg-vermillion transition-colors font-gasoek uppercase tracking-wide">
                          Lihat Detail
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* User Involvement */}
                  <div 
                    className="bg-bg-clean/40 p-4 rounded-2xl border border-white/20 flex flex-col justify-center cursor-pointer hover:bg-white transition-colors group shadow-inner"
                    onClick={() => tx.otherUser && setSelectedUser(tx.otherUser)}
                  >
                    <p className="text-[10px] text-tx-primary/40 font-gasoek mb-2 uppercase tracking-widest flex items-center gap-1.5">
                      <UserIcon size={12} />
                      {activeTab === "sales" ? "Pembeli" : "Penjual"}
                    </p>
                    <div className="flex items-center justify-between gap-2 text-tx-primary">
                       <div className="flex items-center gap-3 overflow-hidden">
                         {tx.otherUser?.profilepicturl ? (
                           <img 
                             src={tx.otherUser.profilepicturl} 
                             alt={tx.otherUser.fullname} 
                             className="w-10 h-10 rounded-full object-cover bg-bg-clean border border-white/20 shrink-0" 
                           />
                         ) : (
                           <div className="w-10 h-10 rounded-full bg-bg-fresh flex items-center justify-center shrink-0">
                             <UserIcon size={16} className="text-tx-primary/40" />
                           </div>
                         )}
                         <div className="min-w-0">
                            <p className="text-sm font-bold truncate font-questrial">
                              {tx.otherUser?.fullname || "User"}
                            </p>
                            <p className="text-[10px] opacity-60 mt-0.5 truncate font-gasoek uppercase tracking-wide">
                              @{tx.otherUser?.username || "pengguna"}
                            </p>
                         </div>
                       </div>
                       <button 
                         onClick={(e) => {
                           e.stopPropagation();
                           const targetId = activeTab === "sales" ? tx.buyerid : tx.sellerid;
                           navigate(`/chats?userId=${targetId}`);
                         }}
                         className="p-2.5 bg-bg-fresh/50 hover:bg-bg-fresh text-tx-primary rounded-xl transition-all shadow-sm shrink-0"
                         title="Chat"
                       >
                         <MessageSquare size={18} />
                       </button>
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="bg-bg-clean/40 p-4 rounded-2xl border border-white/20 flex flex-col justify-center shadow-inner">
                    <p className="text-[10px] text-tx-primary/40 font-gasoek mb-1 uppercase tracking-widest flex items-center gap-1.5">
                      <DollarSign size={12} />
                      Harga
                    </p>
                    <p className="text-2xl font-gasoek text-tx-primary">
                      Rp {tx.finalprice.toLocaleString("id-ID")}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-bg-vermillion/20 rounded-3xl border border-bg-vermillion border-dashed">
            <div className="w-20 h-20 mx-auto bg-bg-fresh/50 rounded-2xl flex items-center justify-center mb-6 text-tx-primary/40">
              <Package size={32} />
            </div>
            <h3 className="text-xl font-gasoek text-tx-primary mb-2 uppercase tracking-wide">
              Tidak Ada Transaksi
            </h3>
            <p className="text-sm text-tx-secondary font-questrial max-w-sm mx-auto opacity-70">
              Anda belum memiliki riwayat{" "}
              {activeTab === "sales" ? "penjualan" : "pembelian"} apa pun saat
              ini.
            </p>
          </div>
        )}
      </div>

      {/* User Profile Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) setSelectedUser(null); }}>
          <div className="bg-bg-vermillion border border-bg-vermillion/50 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div
              className={`h-24 relative bg-cover bg-center ${!selectedUser.bannerimgurl ? "bg-linear-to-r from-bg-fresh to-bg-vermillion" : ""}`}
              style={
                selectedUser.bannerimgurl
                  ? {
                      backgroundImage: `url(${selectedUser.bannerimgurl})`,
                    }
                  : {}
              }
            >
              <button
                onClick={() => setSelectedUser(null)}
                className="absolute top-4 right-4 p-2 bg-white/40 hover:bg-white/60 text-tx-primary rounded-full transition-all backdrop-blur-md"
              >
                <X size={18} />
              </button>
              <div className="absolute -bottom-10 left-6">
                <img
                  src={
                    selectedUser.profilepicturl ||
                    `https://ui-avatars.com/api/?name=${selectedUser.fullname}&background=random`
                  }
                  alt={selectedUser.fullname}
                  className="w-20 h-20 rounded-2xl border-4 border-bg-vermillion object-cover bg-bg-clean shadow-xl"
                />
              </div>
            </div>
            <div className="pt-12 px-6 pb-8 text-tx-primary bg-bg-vermillion">
              <h3 className="text-xl font-gasoek leading-tight truncate uppercase tracking-tight">
                {selectedUser.fullname}
              </h3>
              <p className="text-sm font-questrial opacity-60 mb-6">
                @{selectedUser.username}
              </p>
              
              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3 text-sm font-questrial opacity-80">
                   <div className="w-8 h-8 rounded-lg bg-bg-fresh flex items-center justify-center shrink-0">
                      <Package size={14} />
                   </div>
                   {selectedUser.email}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-bg-fresh/50 px-4 py-4 rounded-2xl border border-bg-fresh flex flex-col items-center shadow-inner">
                  <span className="text-[10px] font-gasoek opacity-40 mb-1 uppercase tracking-widest">Rank</span>
                  <span className="text-sm font-gasoek text-tx-primary uppercase tracking-widest">
                    {selectedUser.userrank}
                  </span>
                </div>
                <div className="bg-bg-fresh/50 px-4 py-4 rounded-2xl border border-bg-fresh flex flex-col items-center shadow-inner">
                  <span className="text-[10px] font-gasoek opacity-40 mb-1 uppercase tracking-widest">Poin</span>
                  <span className="text-sm font-gasoek text-tx-primary uppercase tracking-widest">
                    {selectedUser.userpoint}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Item Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) setSelectedItem(null); }}>
          <div className="bg-bg-vermillion border border-bg-vermillion/50 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="relative shrink-0 aspect-4/3 bg-bg-clean overflow-hidden">
               <img src={selectedItem.itempicturl} alt={selectedItem.itemname} className="w-full h-full object-cover" />
               <button
                  onClick={() => setSelectedItem(null)}
                  className="absolute top-4 right-4 p-2 bg-white/40 hover:bg-white/60 text-tx-primary rounded-full transition-all backdrop-blur-md"
                >
                  <X size={18} />
                </button>
                <div className="absolute bottom-4 left-4">
                   <span className="px-3 py-1.5 bg-bg-fresh text-tx-primary shadow-lg text-[10px] font-gasoek uppercase tracking-widest rounded-xl">
                      {selectedItem.category}
                   </span>
                </div>
            </div>
            <div className="p-6 overflow-y-auto custom-scrollbar bg-bg-vermillion">
              <h3 className="text-2xl font-gasoek text-tx-primary mb-1 uppercase tracking-tight">
                {selectedItem.itemname}
              </h3>
              <p className="text-3xl font-gasoek text-tx-primary mb-6">
                 Rp {selectedItem.itemprice.toLocaleString("id-ID")}
              </p>
              
              <div className="mb-8">
                 <p className="text-[10px] font-gasoek opacity-40 mb-2 uppercase tracking-widest">Catatan Barang</p>
                 <p className="text-sm text-tx-secondary font-questrial leading-relaxed bg-white/40 p-5 rounded-2xl border border-white/20 shadow-inner">
                   {selectedItem.itemdescription || "Tidak ada deskripsi."}
                 </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-bg-fresh px-4 py-4 rounded-2xl border border-bg-fresh/50 flex flex-col items-center text-center shadow-sm">
                  <span className="text-[10px] font-gasoek opacity-40 mb-1 uppercase tracking-widest">Kondisi</span>
                  <span className="text-sm font-gasoek text-tx-primary uppercase tracking-widest">
                    {selectedItem.itemstatus}
                  </span>
                </div>
                <div className="bg-bg-fresh px-4 py-4 rounded-2xl border border-bg-fresh/50 flex flex-col items-center text-center shadow-sm">
                  <span className="text-[10px] font-gasoek opacity-40 mb-1 uppercase tracking-widest">Stok</span>
                  <span className="text-sm font-gasoek text-tx-primary uppercase tracking-widest">
                    {selectedItem.itemquantity} Unit
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

