import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { UserService } from "../../Services/UserServices";
import {
  CommunityService,
  type CommunityDetail,
} from "../../Services/CommunitiesServices";
import type { User } from "../../Types/User";
import UserDetailPopup from "./UserDetailPopup";

interface PinDetailCardProps {
  pin: { id: number; name: string; type: string } | null;
  onClose: () => void;
}

const PinDetailCard: React.FC<PinDetailCardProps> = ({ pin, onClose }) => {
  const [communityDetail, setCommunityDetail] =
    useState<CommunityDetail | null>(null);
  const [seller, setSeller] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUserPopup, setSelectedUserPopup] = useState<User | null>(null);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!pin || pin.type !== "community") return;

      setIsLoading(true);
      try {
        const communityService = new CommunityService();
        const community = await communityService.getCommunityDetailById(
          pin.id,
        );

        if (community) {
          setCommunityDetail(community);
          const userService = new UserService();
          const userParams = await userService.getUserById(community.userid);
          setSeller(userParams); // Reuse seller state for community creator/admin
        }
      } catch (error) {
        console.error("Failed to fetch pin details", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [pin]);

  if (!pin || pin.type !== "community") return null;

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
          communityDetail={communityDetail}
          seller={seller}
          setSelectedUserPopup={setSelectedUserPopup}
          onClose={onClose}
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
          communityDetail={communityDetail}
          seller={seller}
          setSelectedUserPopup={setSelectedUserPopup}
          onClose={onClose}
        />
      </motion.div>
      <UserDetailPopup
        selectedUser={selectedUserPopup}
        onClose={() => setSelectedUserPopup(null)}
      />
    </>
  );
};

// Extracted Content Component for Reusability across Mobile and Desktop Layouts
const CardContent = ({
  pin,
  isLoading,
  communityDetail,
  seller,
  setSelectedUserPopup,
  onClose,
}: any) => {
  return (
    <div>
      <div className="flex justify-between items-start mb-4 md:mb-6">
        <div className="flex-1">
          <span
            className="text-[10px] font-gasoek font-normal tracking-wide uppercase px-2.5 py-1 rounded-lg shadow-sm bg-bg-fresh text-tx-primary"
          >
            Komunitas
          </span>
          <h2 className="text-xl md:text-2xl font-gasoek font-normal tracking-wide text-tx-primary mt-2 md:mt-3 leading-tight pr-4">
            {pin.name}
          </h2>
        </div>

        <button
          onClick={onClose}
          className="p-2 bg-black/10 text-tx-primary/70 hover:text-tx-primary rounded-xl hover:bg-black/20 transition-all flex-shrink-0"
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
                src={communityDetail.profilepicturl}
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
            <div className="absolute top-3 right-3 px-3 py-1.5 text-[10px] font-gasoek font-normal tracking-wide uppercase rounded-xl bg-bg-fresh text-tx-primary shadow-lg backdrop-blur-md flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-tx-primary rounded-full animate-pulse"></div>
              {communityDetail.members.length} Members
            </div>
          </div>

          <div className="bg-white/90 p-4 md:p-5 rounded-2xl shadow-inner border border-white/50">
            <h3 className="text-xs font-gasoek font-normal tracking-wide text-tx-muted mb-2 uppercase">
              About Community
            </h3>
            <p className="text-sm text-tx-primary font-questrial leading-relaxed">
              {communityDetail.description}
            </p>
          </div>

          {seller && (
            <div
              className="p-4 bg-bg-fresh/50 rounded-2xl border border-bg-fresh/30 flex items-center gap-4 group cursor-pointer hover:bg-bg-fresh transition-all"
              onClick={() => setSelectedUserPopup(seller)}
            >
              <img
                src={seller.profilepicturl}
                alt={seller.fullname}
                className="w-12 h-12 rounded-full border-2 border-white shadow-md object-cover"
              />
              <div className="grow">
                <p className="text-[10px] font-gasoek font-normal tracking-wide text-tx-primary/60 mb-0.5 uppercase">
                  Admin
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
          )}

          <div className="mt-2">
            <button className="w-full bg-tx-primary hover:bg-black text-bg-clean shadow-xl font-gasoek font-normal tracking-wide py-4 rounded-xl transition-all border border-tx-primary/20 flex items-center justify-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                  clipRule="evenodd"
                />
              </svg>
              Join Community
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white/90 p-6 rounded-2xl shadow-inner border border-white/50 text-tx-primary text-center">
          <p className="font-gasoek font-normal tracking-wide uppercase text-xs text-tx-muted mb-2">
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
