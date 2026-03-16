import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { UserService } from "../../Services/UserServices";
import {
  CommunityService,
  type CommunityDetail,
} from "../../Services/CommunitiesServices";
import { ThriftService, type Item } from "../../Services/ThriftsServices";
import { LLMService } from "../../Services/LLMService";
import type { User } from "../../Types/User";
import UserDetailPopup from "./UserDetailPopup";
import { formatImageUrl } from "../../Utils/FormatUrl";
import { Sparkles, TrendingUp, Leaf, MessageSquare, ShoppingBag, RefreshCw, Loader2, Plus, Check, Lock } from "lucide-react";
import { TransactionServices } from "../../Services/TransactionServices";
import { useNavigate } from "react-router-dom";

interface PinDetailCardProps {
  pin: { id: number; name: string; type: string } | null;
  onClose: () => void;
}

const PinDetailCard: React.FC<PinDetailCardProps> = ({ pin, onClose }) => {
  const navigate = useNavigate();
  const [communityDetail, setCommunityDetail] =
    useState<CommunityDetail | null>(null);
  const [itemDetail, setItemDetail] = useState<Item | null>(null);
  const [seller, setSeller] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPriceLoading, setIsPriceLoading] = useState(false);
  const [isCarbonLoading, setIsCarbonLoading] = useState(false);
  const [isBuying, setIsBuying] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [selectedUserPopup, setSelectedUserPopup] = useState<User | null>(null);

  const fetchDetails = async () => {
    if (!pin) return;

    setIsLoading(true);
    try {
      if (pin.type === "community") {
        const communityService = new CommunityService();
        const community = await communityService.getCommunityDetailById(pin.id);

        if (community) {
          setCommunityDetail(community);
          const userService = new UserService();
          const userParams = await userService.getUserById(community.userid);
          setSeller(userParams);
        }
      } else if (pin.type === "item") {
        const thriftService = new ThriftService();
        const item = await thriftService.getThriftDetailById(pin.id);
        if (item) {
          setItemDetail(item);
          const userService = new UserService();
          const userParams = await userService.getUserById(item.userid);
          setSeller(userParams);
        }
      }
    } catch (error) {
      console.error("Failed to fetch pin details", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
     setCommunityDetail(null);
     setItemDetail(null);
     setSeller(null);
     fetchDetails();
  }, [pin]);

  const handleGeneratePrice = async () => {
    if (!itemDetail) return;
    setIsPriceLoading(true);
    const llmService = new LLMService();
    try {
      const res = await llmService.analyzePrice(itemDetail.itemid);
      if (res.success) {
        await fetchDetails();
      } else {
        alert(res.message);
      }
    } catch (error) {
      console.error("Price AI Generation failed", error);
    } finally {
      setIsPriceLoading(false);
    }
  };

  const handleGenerateCarbon = async () => {
    if (!itemDetail) return;
    setIsCarbonLoading(true);
    const llmService = new LLMService();
    try {
      const res = await llmService.analyzeCarbon(itemDetail.itemid);
      if (res.success) {
        await fetchDetails();
      } else {
        alert(res.message);
      }
    } catch (error) {
      console.error("Carbon AI Generation failed", error);
    } finally {
      setIsCarbonLoading(false);
    }
  };
  
  const handleBuyItem = async () => {
    if (!itemDetail || isBuying) return;

    const confirmed = window.confirm(
      `Kamu yakin ingin membeli "${itemDetail.itemname}"? Penjual akan mendapatkan notifikasi dan bisa menerima atau menolak permintaanmu.`
    );
    if (!confirmed) return;

    setIsBuying(true);
    try {
      const transactionService = new TransactionServices();
      const res = await transactionService.buyItem(
        itemDetail.itemid,
        itemDetail.itemprice,
        (itemDetail.transaction_type as 'Uang' | 'Barter') || 'Uang'
      );
      if (res.success) {
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

  const handleJoinCommunity = async () => {
    if (!communityDetail || isJoining) return;

    setIsJoining(true);
    try {
      const communityService = new CommunityService();
      const res = await communityService.joinCommunity(communityDetail.communityid);
      
      if (res.success) {
        alert(res.message);
        await fetchDetails(); // Refresh to update status
      } else {
        alert(res.message);
      }
    } catch (error) {
      console.error("Failed to join community:", error);
      alert("Terjadi kesalahan saat bergabung ke komunitas.");
    } finally {
      setIsJoining(false);
    }
  };

  if (!pin) return null;

  return (
    <>
      {/* Mobile Bottom Sheet Configuration */}
      <motion.div
        className="md:hidden absolute bottom-0 left-0 right-0 z-50 bg-bg-vermillion rounded-t-[32px] shadow-[0_-10px_40px_rgba(0,0,0,0.2)] p-6 h-[50vh] overflow-y-auto font-questrial"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        drag="y"
        dragConstraints={{ top: 0 }}
        dragElastic={0.2}
        onDragEnd={(_e, info) => {
          if (info.offset.y > 100 || info.velocity.y > 500) {
            onClose();
          }
        }}
      >
        <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-6 cursor-grab active:cursor-grabbing" />
        <CardContent
          pin={pin}
          isLoading={isLoading}
          isPriceLoading={isPriceLoading}
          isCarbonLoading={isCarbonLoading}
          communityDetail={communityDetail}
          itemDetail={itemDetail}
          seller={seller}
          setSelectedUserPopup={setSelectedUserPopup}
          onClose={onClose}
          navigate={navigate}
          onGeneratePrice={handleGeneratePrice}
          onGenerateCarbon={handleGenerateCarbon}
          onBuyItem={handleBuyItem}
          isBuying={isBuying}
          onJoinCommunity={handleJoinCommunity}
          isJoining={isJoining}
        />
      </motion.div>

      {/* Desktop Left Sidebar Configuration */}
      <motion.div
        className="hidden md:block absolute top-0 bottom-0 left-0 z-50 bg-bg-vermillion shadow-[10px_0_40px_rgba(0,0,0,0.2)] p-6 w-[400px] h-full overflow-y-auto font-questrial"
        initial={{ x: "-100%" }}
        animate={{ x: 0 }}
        exit={{ x: "-100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
      >
        <CardContent
          pin={pin}
          isLoading={isLoading}
          isPriceLoading={isPriceLoading}
          isCarbonLoading={isCarbonLoading}
          communityDetail={communityDetail}
          itemDetail={itemDetail}
          seller={seller}
          setSelectedUserPopup={setSelectedUserPopup}
          onClose={onClose}
          navigate={navigate}
          onGeneratePrice={handleGeneratePrice}
          onGenerateCarbon={handleGenerateCarbon}
          onBuyItem={handleBuyItem}
          isBuying={isBuying}
          onJoinCommunity={handleJoinCommunity}
          isJoining={isJoining}
        />
      </motion.div>
      <UserDetailPopup
        selectedUser={selectedUserPopup}
        onClose={() => setSelectedUserPopup(null)}
      />
    </>
  );
};

const SellerCard = ({ seller, setSelectedUserPopup, label }: any) => (
  <div
    className="p-4 bg-bg-fresh/50 rounded-2xl border border-bg-fresh/30 flex items-center gap-4 group cursor-pointer hover:bg-bg-fresh transition-all"
    onClick={() => setSelectedUserPopup(seller)}
  >
    <img
      src={formatImageUrl(seller.profilepicturl)}
      alt={seller.fullname}
      className="w-12 h-12 rounded-full border-2 border-white shadow-md object-cover"
    />
    <div className="grow">
      <p className="text-[10px] font-questrial font-normal tracking-wide text-tx-primary mb-0.5 uppercase">
        {label}
      </p>
      <p className="text-sm font-gasoek font-normal tracking-wide text-tx-primary">
        {seller.fullname}
      </p>
    </div>
    <div className="bg-white/50 p-2 rounded-lg text-tx-primary opacity-0 group-hover:opacity-100 transition-opacity">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5l7 7-7 7"
        />
      </svg>
    </div>
  </div>
);

// Extracted Content Component for Reusability across Mobile and Desktop Layouts
const CardContent = ({
  pin,
  isLoading,
  isPriceLoading,
  isCarbonLoading,
  communityDetail,
  itemDetail,
  seller,
  setSelectedUserPopup,
  onClose,
  navigate,
  onGeneratePrice,
  onGenerateCarbon,
  onBuyItem,
  isBuying,
  onJoinCommunity,
  isJoining
}: any) => {
  const canGeneratePrice = () => {
    if (!itemDetail?.last_price_analysis) return true;
    const last = new Date(itemDetail.last_price_analysis);
    const now = new Date();
    return (now.getTime() - last.getTime()) > (7 * 24 * 60 * 60 * 1000);
  };

  const canGenerateCarbon = () => {
    if (!itemDetail?.last_carbon_analysis) return true;
    const last = new Date(itemDetail.last_carbon_analysis);
    const now = new Date();
    return (now.getTime() - last.getTime()) > (7 * 24 * 60 * 60 * 1000);
  };

  const getMembershipButton = () => {
    if (!communityDetail) return null;
    
    const membership = communityDetail.my_membership;
    
    if (membership) {
        if (membership.status === 'Active') {
            return (
                <button 
                  onClick={() => navigate(`/chats?communityId=${communityDetail.communityid}`)}
                  className="w-full bg-tx-primary hover:bg-black text-bg-clean shadow-xl font-gasoek font-normal tracking-wide py-4 rounded-xl transition-all border border-tx-primary/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                    <MessageSquare size={18} />
                    Open Community
                </button>
            );
        } else if (membership.status === 'Pending') {
            return (
                <button 
                  disabled
                  className="w-full bg-bg-clean text-tx-secondary shadow-xl font-gasoek font-normal tracking-wide py-4 rounded-xl transition-all border border-tx-primary/10 flex items-center justify-center gap-2 cursor-not-allowed italic"
                >
                    <Check size={18} className="text-bg-fresh" />
                    Waiting for Approval
                </button>
            );
        }
    }

    return (
        <button 
          onClick={onJoinCommunity}
          disabled={isJoining}
          className="w-full bg-tx-primary hover:bg-black text-bg-clean shadow-xl font-gasoek font-normal tracking-wide py-4 rounded-xl transition-all border border-tx-primary/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
        >
            {isJoining ? (
                <Loader2 size={18} className="animate-spin" />
            ) : (
                <Plus size={18} />
            )}
            {isJoining ? "Joining..." : "Join Community"}
        </button>
    );
  };

  return (
    <div>
      <div className="flex justify-between items-start mb-4 md:mb-6">
        <div className="flex-1">
          <span
            className={`text-[10px] font-questrial font-normal tracking-wide uppercase px-2.5 py-1 rounded-lg shadow-sm flex items-center gap-1.5 w-fit ${
              pin.type === "community"
                ? "bg-bg-fresh text-tx-primary"
                : "bg-tx-primary text-bg-clean"
            }`}
          >
            {pin.type === "community" && communityDetail && !communityDetail.isPublic && <Lock size={10} />}
            {pin.type === "community" ? "Komunitas" : "Barang Penjual"}
          </span>
          <h2 className="text-xl md:text-2xl font-gasoek font-normal tracking-wide text-tx-primary mt-2 md:mt-3 leading-tight pr-4">
            {pin.name}
          </h2>
        </div>

        <button
          onClick={onClose}
          className="p-2 bg-black/10 text-tx-primary/70 hover:text-tx-primary rounded-xl hover:bg-black/20 transition-all shrink-0"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-bg-fresh"></div>
        </div>
      ) : communityDetail ? (
        <div className="flex flex-col gap-4 md:gap-6">
          <div className="relative w-full aspect-21/9 md:aspect-video rounded-2xl overflow-hidden bg-white/20 border border-white/30 shadow-inner">
            {communityDetail.profilepicturl ? (
              <img
                src={formatImageUrl(communityDetail.profilepicturl)}
                alt={pin.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-bg-fresh/30 text-tx-primary/20">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 md:h-16 md:w-16"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
            )}
            <div className="absolute top-3 right-3 px-3 py-1.5 text-[10px] font-questrial font-normal tracking-wide uppercase rounded-xl bg-bg-fresh text-tx-primary shadow-lg backdrop-blur-md flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-tx-primary rounded-full animate-pulse"></div>
              {communityDetail.members.length} Members
            </div>
          </div>

          <div className="bg-white/90 p-4 md:p-5 rounded-2xl shadow-inner border border-white/50">
            <h3 className="text-xs font-questrial font-normal tracking-wide text-tx-primary mb-2 uppercase">
              About Community
            </h3>
            <p className="text-sm text-tx-primary font-questrial leading-relaxed">
              {communityDetail.description}
            </p>
          </div>

          {seller && (
             <SellerCard seller={seller} setSelectedUserPopup={setSelectedUserPopup} label="Admin" />
          )}

          <div className="mt-2">
            {getMembershipButton()}
          </div>
        </div>
      ) : itemDetail ? (
        <div className="flex flex-col gap-4 md:gap-6">
          <div className="relative w-full aspect-21/9 md:aspect-video rounded-2xl overflow-hidden bg-white/20 border border-white/30 shadow-inner">
            <img
              src={formatImageUrl(itemDetail.itempicturl)}
              alt={pin.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 right-3 px-3 py-1.5 text-[10px] font-questrial font-normal tracking-wide uppercase rounded-xl bg-bg-fresh text-tx-primary shadow-lg backdrop-blur-md">
              {itemDetail.category}
            </div>
          </div>

          <div className="bg-white/90 p-4 md:p-5 rounded-2xl shadow-inner border border-white/50">
             <div className="flex items-center justify-between mb-4">
                <div className={`${itemDetail.transaction_type === 'Barter' ? 'bg-bg-vermillion/20' : 'bg-bg-fresh/50'} px-4 py-2 rounded-xl border border-tx-primary/10`}>
                   <p className="text-xl font-gasoek text-tx-primary">
                      {itemDetail.transaction_type === 'Barter' ? 'BARTER' : `Rp ${Number(itemDetail.itemprice).toLocaleString("id-ID")}`}
                   </p>
                </div>
                <div className="text-[10px] font-questrial text-tx-primary uppercase bg-black/5 px-2 py-1 rounded-lg">
                   Sisa {itemDetail.itemquantity}
                </div>
             </div>
            <h3 className="text-xs font-questrial font-normal tracking-wide text-tx-primary mb-2 uppercase">
              Deskripsi Barang
            </h3>
            <p className="text-sm text-tx-primary font-questrial leading-relaxed">
              {itemDetail.itemdescription}
            </p>
          </div>

          {/* Kata AI Section */}
          <div className="bg-tx-primary p-5 rounded-3xl shadow-2xl border border-white/10 relative overflow-hidden">
            <div className="absolute inset-0 bg-linear-to-br from-bg-vermillion/20 to-transparent opacity-40"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-6">
                <div className="p-2 bg-bg-fresh rounded-xl">
                   <Sparkles className="w-4 h-4 text-tx-primary" />
                </div>
                <h3 className="text-xs font-questrial font-normal tracking-wide text-bg-fresh uppercase">
                  Kata AI
                </h3>
              </div>

              <div className="flex flex-col gap-6">
                  {/* Price Analysis Sub-section */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                         <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
                         <span className="text-[10px] font-questrial text-white uppercase">Analisis Harga</span>
                      </div>
                      <button
                        onClick={onGeneratePrice}
                        disabled={isPriceLoading || !canGeneratePrice()}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all ${
                          canGeneratePrice() 
                            ? "bg-bg-fresh/20 text-bg-fresh hover:bg-bg-fresh/30 cursor-pointer" 
                            : "bg-white/5 text-white/20 cursor-not-allowed"
                        }`}
                        title={!canGeneratePrice() ? "Baru saja di-analisis (Batas 1 minggu)" : "Refresh Analisis"}
                      >
                        <RefreshCw className={`w-3 h-3 ${isPriceLoading ? "animate-spin" : ""}`} />
                        <span className="text-[9px] font-questrial uppercase">Update</span>
                      </button>
                    </div>

                    <div className="bg-white/5 rounded-2xl p-4 border border-white/10 space-y-3">
                       <div className="flex items-center justify-between">
                          <p className="text-[10px] font-questrial text-white uppercase">Estimasi Pasar</p>
                          <span className="text-xs font-gasoek text-blue-400">
                             {itemDetail.ai_price_analysis 
                               ? (typeof itemDetail.ai_price_analysis === 'string' ? JSON.parse(itemDetail.ai_price_analysis).suggested_price_range : (itemDetail.ai_price_analysis as any).suggested_price_range)
                               : "-"}
                          </span>
                       </div>
                       <p className="text-sm text-white/80 font-questrial leading-loose italic">
                          "{itemDetail.ai_price_analysis_text || "Belum ada analisis harga."}"
                       </p>
                    </div>
                  </div>

                  <div className="h-px bg-white/10 w-full"></div>

                  {/* Carbon Analysis Sub-section */}
                  <div className="space-y-3">
                     <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                         <Leaf className="w-3.5 h-3.5 text-bg-fresh" />
                         <span className="text-[10px] font-questrial text-white uppercase">Eco Impact</span>
                      </div>
                      <button
                        onClick={onGenerateCarbon}
                        disabled={isCarbonLoading || !canGenerateCarbon()}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all ${
                          canGenerateCarbon() 
                            ? "bg-bg-fresh/20 text-bg-fresh hover:bg-bg-fresh/30 cursor-pointer" 
                            : "bg-white/5 text-white/20 cursor-not-allowed"
                        }`}
                        title={!canGenerateCarbon() ? "Baru saja di-analisis (Batas 1 minggu)" : "Refresh Analisis"}
                      >
                        <RefreshCw className={`w-3 h-3 ${isCarbonLoading ? "animate-spin" : ""}`} />
                        <span className="text-[9px] font-questrial uppercase">Update</span>
                      </button>
                    </div>

                    <div className="bg-white/5 rounded-2xl p-4 border border-white/10 space-y-3">
                       <div className="flex items-center justify-between">
                          <p className="text-[10px] font-questrial text-white uppercase">Karbon Dihemat</p>
                          <span className="text-xs font-gasoek text-bg-fresh">
                             {itemDetail.ai_carbon_analysis
                               ? `${parseFloat(typeof itemDetail.ai_carbon_analysis === 'string' ? JSON.parse(itemDetail.ai_carbon_analysis).carbon_saved_kg : (itemDetail.ai_carbon_analysis as any).carbon_saved_kg)} kg`
                               : "-"}
                          </span>
                       </div>
                       <div className="flex items-center justify-between">
                          <p className="text-[10px] font-questrial text-white uppercase">Rating Dampak</p>
                          <span className="text-xs font-gasoek text-bg-fresh">
                             {itemDetail.ai_carbon_analysis
                               ? `${typeof itemDetail.ai_carbon_analysis === 'string' ? JSON.parse(itemDetail.ai_carbon_analysis).environmental_impact_rating : (itemDetail.ai_carbon_analysis as any).environmental_impact_rating}/10`
                               : "-"}
                          </span>
                       </div>
                       <p className="text-sm text-white/80 font-questrial leading-loose italic">
                          "{itemDetail.ai_carbon_analysis_text || "Belum ada analisis karbon."}"
                       </p>
                    </div>
                  </div>
              </div>
            </div>
          </div>

          {seller && (
             <SellerCard seller={seller} setSelectedUserPopup={setSelectedUserPopup} label="Penjual" />
          )}

          <div className="grid grid-cols-2 gap-3 mt-2">
            <button 
               onClick={() => navigate(`/chats?userId=${itemDetail.userid}`)}
               className="flex items-center justify-center gap-2 py-4 bg-bg-fresh text-tx-primary hover:bg-white rounded-xl text-sm font-gasoek uppercase tracking-wider transition-all shadow-lg cursor-pointer"
            >
              <MessageSquare size={18} />
              Chat
            </button>
            <button 
              onClick={onBuyItem}
              disabled={isBuying}
              className="flex items-center justify-center gap-2 py-4 bg-tx-primary hover:bg-black text-bg-clean rounded-xl text-sm font-gasoek uppercase tracking-wider transition-all shadow-lg cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isBuying ? <Loader2 size={18} className="animate-spin" /> : <ShoppingBag size={18} />}
              {isBuying ? "Memproses..." : (itemDetail.transaction_type === "Barter" ? "Barter" : "Beli")}
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white/90 p-6 rounded-2xl shadow-inner border border-white/50 text-tx-primary text-center">
          <p className="font-questrial font-normal tracking-wide uppercase text-xs text-tx-primary mb-2">
            Error
          </p>
          <p className="font-questrial text-sm">
            Gagal memuat detail data (ID: {pin.id})
          </p>
        </div>
      )}
    </div>
  );
};

export default PinDetailCard;
