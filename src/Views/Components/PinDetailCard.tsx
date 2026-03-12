import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ThriftService, type Item } from '../../Services/ThriftsServices';
import { UserService } from '../../Services/UserServices';
import { CommunityService, type CommunityDetail } from '../../Services/CommunitiesServices';
import type { User } from '../../Types/User';

interface PinDetailCardProps {
  pin: { id: number; name: string; type: string } | null;
  onClose: () => void;
}

const PinDetailCard: React.FC<PinDetailCardProps> = ({ pin, onClose }) => {
  const [itemDetail, setItemDetail] = useState<Item | null>(null);
  const [communityDetail, setCommunityDetail] = useState<CommunityDetail | null>(null);
  const [seller, setSeller] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!pin) return;
      
      setIsLoading(true);
      try {
        if (pin.type === 'item') {
          const thriftService = new ThriftService();
          // pin.id is already guaranteed to be a number by MapComponent's update
          const item = await thriftService.getThriftDetailById(pin.id);
          
          if (item) {
            setItemDetail(item);
            const userService = new UserService();
            const userParams = await userService.getUserById(item.userid);
            setSeller(userParams);
          }
        } else if (pin.type === 'community') {
          const communityService = new CommunityService();
          const community = await communityService.getCommunityDetailById(pin.id);
          
          if (community) {
             setCommunityDetail(community);
             const userService = new UserService();
             const userParams = await userService.getUserById(community.userid);
             setSeller(userParams); // Reuse seller state for community creator/admin
          }
        }
      } catch (error) {
         console.error("Failed to fetch pin details", error);
      } finally {
         setIsLoading(false);
      }
    };

    fetchDetails();
  }, [pin]);

  if (!pin) return null;

  return (
    <>
      {/* Mobile Bottom Sheet Configuration */}
      <motion.div
        className="md:hidden absolute bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] p-6 max-h-[85vh] overflow-y-auto"
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
        <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-6 cursor-grab active:cursor-grabbing" />
        <CardContent 
          pin={pin} 
          isLoading={isLoading} 
          itemDetail={itemDetail} 
          communityDetail={communityDetail} 
          seller={seller} 
          onClose={onClose} 
        />
      </motion.div>

      {/* Desktop Left Sidebar Configuration */}
      <motion.div
        className="hidden md:block absolute top-0 bottom-0 left-0 z-50 bg-white shadow-[10px_0_40px_rgba(0,0,0,0.1)] p-6 w-[400px] h-full overflow-y-auto"
        initial={{ x: "-100%" }} 
        animate={{ x: 0 }}      
        exit={{ x: "-100%" }}    
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
      >
        <CardContent 
          pin={pin} 
          isLoading={isLoading} 
          itemDetail={itemDetail} 
          communityDetail={communityDetail} 
          seller={seller} 
          onClose={onClose} 
        />
      </motion.div>
    </>
  );
};

// Extracted Content Component for Reusability across Mobile and Desktop Layouts
const CardContent = ({ pin, isLoading, itemDetail, communityDetail, seller, onClose }: any) => {
  return (
    <div>
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md ${pin.type === 'community' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
            {pin.type === 'community' ? 'Community' : 'Thrift Item'}
          </span>
          <h2 className="text-xl font-bold text-gray-900 mt-2 leading-tight pr-4">{pin.name}</h2>
        </div>
        
        <button 
          onClick={onClose}
          className="p-2 bg-gray-100 text-gray-500 rounded-full hover:bg-gray-200 transition-colors flex-shrink-0"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-10">
           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : pin.type === 'item' && itemDetail ? (
        <div className="flex flex-col gap-4">
          <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-gray-100">
             <img src={itemDetail.itempicturl} alt={pin.name} className="w-full h-full object-cover" />
             <div className="absolute top-2 right-2 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg bg-emerald-500/90 backdrop-blur-sm text-white shadow-sm">
                {itemDetail.itemstatus}
             </div>
          </div>

          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Price</p>
              <p className="text-2xl font-black text-indigo-600">Rp {itemDetail.itemprice.toLocaleString('id-ID')}</p>
            </div>
            <div className="text-right">
               <p className="text-xs text-gray-500 mb-0.5">Category</p>
               <p className="text-sm font-semibold text-gray-700">{itemDetail.category}</p>
            </div>
          </div>

          <div>
             <h3 className="text-sm font-bold text-gray-900 mb-1">Description</h3>
             <p className="text-sm text-gray-600 leading-relaxed">{itemDetail.itemdescription}</p>
          </div>

          {seller && (
             <div className="mt-2 p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-3">
                <img src={seller.profilepicturl} alt={seller.fullname} className="w-10 h-10 rounded-full border border-gray-200" />
                <div className="flex-grow">
                   <p className="text-xs text-gray-500">Seller</p>
                   <p className="text-sm font-bold text-gray-900">{seller.fullname}</p>
                </div>
                <button className="px-3 py-1.5 bg-white border border-gray-200 shadow-sm text-xs font-bold text-indigo-600 rounded-lg hover:bg-gray-50 transition-colors">
                   View Profile
                </button>
             </div>
          )}

          <div className="grid grid-cols-2 gap-3 mt-4">
            <button className="w-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100 font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
              </svg>
              Chat Seller
            </button>
            <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 font-bold py-3 rounded-xl transition-colors">
              Buy Now
            </button>
          </div>
        </div>
      ) : pin.type === 'community' && communityDetail ? (
        <div className="flex flex-col gap-4">
          <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-gray-100">
             {communityDetail.profilepicturl ? (
               <img src={communityDetail.profilepicturl} alt={pin.name} className="w-full h-full object-cover" />
             ) : (
               <div className="w-full h-full flex items-center justify-center bg-blue-50 text-blue-200">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
               </div>
             )}
             <div className="absolute top-2 right-2 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg bg-blue-600/90 backdrop-blur-sm text-white shadow-sm flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                {communityDetail.members.length} Members
             </div>
          </div>

          <div>
             <h3 className="text-sm font-bold text-gray-900 mb-1">About Community</h3>
             <p className="text-sm text-gray-600 leading-relaxed">{communityDetail.description}</p>
          </div>

          {seller && (
             <div className="mt-2 p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-3">
                <img src={seller.profilepicturl} alt={seller.fullname} className="w-10 h-10 rounded-full border border-gray-200" />
                <div className="flex-grow">
                   <p className="text-xs text-gray-500">Community Admin</p>
                   <p className="text-sm font-bold text-gray-900">{seller.fullname}</p>
                </div>
                <button className="px-3 py-1.5 bg-white border border-gray-200 shadow-sm text-xs font-bold text-blue-600 rounded-lg hover:bg-gray-50 transition-colors">
                   View Profile
                </button>
             </div>
          )}

          <div className="mt-4">
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
              </svg>
              Join Community
            </button>
          </div>
        </div>
      ) : (
        <div className="text-gray-600 text-sm">
          <p>ID Pin: {pin.id}</p>
          <p className="mt-2">Failed to load details.</p>
        </div>
      )}
    </div>
  );
};

export default PinDetailCard;