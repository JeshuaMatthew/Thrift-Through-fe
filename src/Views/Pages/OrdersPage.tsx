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
        await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate network lag

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
    <div className="min-h-screen bg-slate-950 text-white relative pt-10 pb-20">
      {/* Background Ornaments */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-600/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-linear-to-r from-white to-slate-400 mb-2">
              Orders & Transactions
            </h1>
            <p className="text-slate-400">
              Pantau seluruh riwayat pembelian dan penjualan barang Anda.
            </p>
          </div>
        </div>

        {/* Custom Tabs */}
        <div className="flex p-1 mb-8 bg-slate-900/60 rounded-2xl w-full max-w-sm border border-slate-800">
          <button
            onClick={() => setActiveTab("sales")}
            className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-300 ${
              activeTab === "sales"
                ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/25"
                : "text-slate-400 hover:text-white hover:bg-slate-800/50"
            }`}
          >
            Pesanan Masuk (Sales)
          </button>
          <button
            onClick={() => setActiveTab("purchases")}
            className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-300 ${
              activeTab === "purchases"
                ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/25"
                : "text-slate-400 hover:text-white hover:bg-slate-800/50"
            }`}
          >
            Pembelian (Purchases)
          </button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-slate-900/30 rounded-3xl border border-slate-800/50">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500 mb-4"></div>
            <p className="text-slate-400 text-sm">Memuat daftar transaksi...</p>
          </div>
        ) : transactions && transactions.length > 0 ? (
          <div className="space-y-4">
            {transactions.map((tx) => (
              <div
                key={tx.transactionid}
                className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-3xl p-6 hover:bg-slate-800/80 transition-colors shadow-xl shadow-black/20"
              >
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6 pb-4 border-b border-slate-800/80">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-3 rounded-2xl ${
                        tx.transactiontype === "buy"
                          ? "bg-indigo-500/10 text-indigo-400"
                          : "bg-emerald-500/10 text-emerald-400"
                      }`}
                    >
                      <Package size={24} />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-slate-200 uppercase tracking-wide">
                        Pesanan ID #
                        {tx.transactionid.toString().padStart(4, "0")}
                      </span>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
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
                    className={`inline-flex px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-xl border w-fit ${
                      tx.status === "completed"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : tx.status === "pending"
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          : "bg-red-500/10 text-red-400 border-red-500/20"
                    }`}
                  >
                    {tx.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Item Info */}
                  <div 
                    className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800/50 flex flex-col justify-center cursor-pointer hover:bg-slate-800/80 transition-colors"
                    onClick={() => tx.itemDetail && setSelectedItem(tx.itemDetail)}
                  >
                    <p className="text-xs text-slate-500 font-medium mb-2 uppercase tracking-wider">
                      Detail Barang
                    </p>
                    <div className="flex items-center gap-3">
                      {tx.itemDetail?.itempicturl ? (
                        <img 
                          src={tx.itemDetail.itempicturl} 
                          alt={tx.itemDetail.itemname} 
                          className="w-12 h-12 rounded-xl object-cover bg-slate-800 shrink-0" 
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center shrink-0">
                          <Package size={20} className="text-slate-500" />
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-bold text-slate-200 line-clamp-1">
                          {tx.itemDetail?.itemname || `Barang #${tx.itemid}`}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5 group-hover:text-slate-300">
                          {tx.itemDetail?.category || "Barang Thrift"} • Lihat detail
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* User Involvement */}
                  <div 
                    className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800/50 flex flex-col justify-center cursor-pointer hover:bg-slate-800/80 transition-colors"
                    onClick={() => tx.otherUser && setSelectedUser(tx.otherUser)}
                  >
                    <p className="text-xs text-slate-500 flex items-center gap-1.5 mb-2 font-medium uppercase tracking-wider">
                      <UserIcon size={12} />
                      {activeTab === "sales" ? "Pembeli" : "Penjual"}
                    </p>
                    <div className="flex items-center justify-between gap-2">
                       <div className="flex items-center gap-3 overflow-hidden">
                         {tx.otherUser?.profilepicturl ? (
                           <img 
                             src={tx.otherUser.profilepicturl} 
                             alt={tx.otherUser.fullname} 
                             className="w-10 h-10 rounded-full object-cover bg-slate-800 shrink-0" 
                           />
                         ) : (
                           <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center shrink-0">
                             <UserIcon size={16} className="text-slate-500" />
                           </div>
                         )}
                         <div className="min-w-0">
                            <p className="text-sm font-bold text-slate-200 truncate group-hover:text-white">
                              {tx.otherUser?.fullname || `User ID: ${activeTab === "sales" ? tx.buyerid : tx.sellerid}`}
                            </p>
                            <p className="text-xs text-slate-400 mt-0.5 truncate group-hover:text-slate-300">
                              @{tx.otherUser?.username || "pengguna"} • Lihat profil
                            </p>
                         </div>
                       </div>
                       <button 
                         onClick={(e) => {
                           e.stopPropagation();
                           const targetId = activeTab === "sales" ? tx.buyerid : tx.sellerid;
                           navigate(`/chats?userId=${targetId}`);
                         }}
                         className="p-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-xl transition-colors shrink-0"
                         title="Chat Pengguna"
                       >
                         <MessageSquare size={18} />
                       </button>
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800/50 flex flex-col justify-center">
                    <p className="text-xs text-slate-500 flex items-center gap-1.5 mb-1 font-medium uppercase tracking-wider">
                      <DollarSign size={12} />
                      Harga Akhir
                    </p>
                    <p className="text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-emerald-400 to-teal-400">
                      Rp {tx.finalprice.toLocaleString("id-ID")}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-slate-900/30 rounded-3xl border border-slate-800/50 border-dashed">
            <div className="w-20 h-20 mx-auto bg-slate-800/50 rounded-full flex items-center justify-center mb-6 text-slate-500">
              <Package size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-200 mb-2">
              Tidak Ada Transaksi
            </h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
              Anda belum memiliki riwayat{" "}
              {activeTab === "sales" ? "penjualan" : "pembelian"} apa pun saat
              ini.
            </p>
          </div>
        )}
      </div>

      {/* User Profile Modal Overlay */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) setSelectedUser(null); }}>
          <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div
              className={`h-24 relative bg-cover bg-center ${!selectedUser.bannerimgurl ? "bg-linear-to-r from-indigo-500 to-purple-500" : ""}`}
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
                className="absolute top-4 right-4 p-1.5 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors"
                title="Tutup"
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
                  className="w-20 h-20 rounded-full border-4 border-slate-900 object-cover bg-slate-800 shadow-md"
                />
              </div>
            </div>
            <div className="pt-12 px-6 pb-6 text-slate-200">
              <h3 className="text-xl font-bold leading-tight truncate">
                {selectedUser.fullname}
              </h3>
              <p className="text-sm text-slate-400 mb-1">
                @{selectedUser.username}
              </p>
              <p className="text-sm text-slate-400 mb-1 flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                {selectedUser.email}
              </p>
              <p className="text-sm text-slate-400 mb-4 flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                {selectedUser.phonenum}
              </p>

              <div className="flex gap-4">
                <div className="bg-slate-800/80 px-4 py-3 rounded-2xl flex-1 border border-slate-700/50 flex flex-col items-center">
                  <span className="text-xs text-slate-400 font-medium mb-1">Rank</span>
                  <span className={`text-sm font-bold ${selectedUser.userrank.toLowerCase() === "gold" ? "text-yellow-500" : selectedUser.userrank.toLowerCase() === "silver" ? "text-slate-300" : "text-orange-500"}`}>
                    {selectedUser.userrank}
                  </span>
                </div>
                <div className="bg-indigo-500/10 px-4 py-3 rounded-2xl flex-1 border border-indigo-500/20 flex flex-col items-center">
                  <span className="text-xs text-indigo-400 font-medium mb-1">Points</span>
                  <span className="text-sm font-bold text-indigo-400">
                    {selectedUser.userpoint}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Item Profile Modal Overlay */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) setSelectedItem(null); }}>
          <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="relative shrink-0">
               <img src={selectedItem.itempicturl} alt={selectedItem.itemname} className="w-full h-56 object-cover bg-slate-800" />
               <button
                  onClick={() => setSelectedItem(null)}
                  className="absolute top-4 right-4 p-1.5 bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors"
                  title="Tutup"
                >
                  <X size={18} />
                </button>
            </div>
            <div className="p-6 text-slate-200 overflow-y-auto custom-scrollbar">
              <div className="flex justify-between items-start gap-4 mb-2">
                 <h3 className="text-xl font-bold leading-tight">
                   {selectedItem.itemname}
                 </h3>
                 <span className="px-2.5 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-bold rounded-lg whitespace-nowrap">
                   {selectedItem.category}
                 </span>
              </div>
              <p className="text-2xl font-bold text-emerald-400 mb-6">
                 Rp {selectedItem.itemprice.toLocaleString("id-ID")}
              </p>
              
              <div className="mb-6">
                 <p className="text-xs text-slate-500 mb-2 uppercase tracking-wider font-semibold">Deskripsi Barang</p>
                 <p className="text-sm text-slate-300 leading-relaxed bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                   {selectedItem.itemdescription || "Tidak ada deskripsi."}
                 </p>
              </div>

              <div className="flex gap-4">
                <div className="bg-slate-800/80 px-4 py-3 rounded-2xl flex-1 border border-slate-700/50 flex flex-col items-center text-center">
                  <span className="text-xs text-slate-500 font-medium mb-1">Status</span>
                  <span className="text-sm font-bold text-slate-200">
                    {selectedItem.itemstatus}
                  </span>
                </div>
                <div className="bg-slate-800/80 px-4 py-3 rounded-2xl flex-1 border border-slate-700/50 flex flex-col items-center text-center">
                  <span className="text-xs text-slate-500 font-medium mb-1">Kuantitas</span>
                  <span className="text-sm font-bold text-slate-200">
                    {selectedItem.itemquantity} unit
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
