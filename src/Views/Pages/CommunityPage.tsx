import { useState, useEffect } from 'react';
import { useAuth } from '../../Utils/Hooks/AuthProvider';
import { CommunityService } from '../../Services/CommunitiesServices';
import type { Community } from '../../Types/Community';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Users, Hash } from 'lucide-react';

const CommunityPage = () => {
  const { user } = useAuth();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchCommunities = async () => {
    setIsLoading(true);
    try {
      const commService = new CommunityService();
      // Simulate network delay for effect
      await new Promise(resolve => setTimeout(resolve, 800));
      const allComms = await commService.getAllCommunities();
      // Filter out private communities (like personal chats)
      const publicComms = allComms.filter(c => c.isPublic !== false);
      setCommunities(publicComms);
    } catch (error) {
      console.error("Failed to fetch communities:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunities();
  }, [user]);

  const filteredCommunities = communities.filter(comm => 
    comm.communityname.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (comm.description && comm.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4">
            <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20"></div>
                <div className="absolute inset-0 rounded-full border-4 border-t-indigo-500 animate-spin"></div>
            </div>
            <p className="text-slate-400 font-medium animate-pulse">Memuat daftar komunitas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white relative pt-10 pb-20 overflow-x-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-16">
        <header className="mb-12">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row md:items-end justify-between gap-6"
            >
                <div>
                    <h1 className="text-4xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-slate-500 mb-3 tracking-tight">
                        Komunitas
                    </h1>
                    <p className="text-slate-400 text-lg max-w-xl">
                        Bergabunglah dengan komunitas thrift di sekitarmu. Temukan teman baru dan berdiskusi seputar barang menarik.
                    </p>
                </div>
                
                <div className="flex items-center gap-2 bg-slate-900/50 backdrop-blur-md border border-white/5 p-1 rounded-2xl">
                    <div className="flex items-center gap-2 px-4 py-2 border-r border-white/5">
                        <Users className="h-5 w-5 text-indigo-400" />
                        <span className="text-sm font-bold text-white">Thrift Hub</span>
                    </div>
                    <div className="px-4 py-2">
                        <span className="text-xs text-slate-500 block">Tersedia</span>
                        <span className="text-sm font-bold text-indigo-400">{communities.length} Grup</span>
                    </div>
                </div>
            </motion.div>
        </header>

        {/* Search */}
        <div className="mb-10 space-y-6">
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-grow group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                    </div>
                    <input 
                        type="text" 
                        placeholder="Cari nama atau deskripsi komunitas..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-900/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all backdrop-blur-sm"
                    />
                </div>
            </div>
        </div>

        {/* Community Grid */}
        <AnimatePresence mode="popLayout">
            {filteredCommunities.length === 0 ? (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="w-full py-20 flex flex-col items-center justify-center text-center bg-slate-900/20 rounded-3xl border border-white/5"
                >
                    <div className="w-20 h-20 mb-6 rounded-full bg-slate-800 flex items-center justify-center text-slate-500">
                        <Hash className="h-10 w-10" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Komunitas Tidak Ditemukan</h3>
                    <p className="text-slate-400 max-w-md px-6">
                        Maaf, kami tidak menemukan komunitas yang sesuai dengan pencarian Anda.
                    </p>
                </motion.div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {filteredCommunities.map((comm, idx) => {
                        const fallBackPic = `https://ui-avatars.com/api/?name=${encodeURIComponent(comm.communityname)}&background=random`;
                        return (
                          <motion.div 
                              layout
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: idx * 0.05 }}
                              key={comm.communityid} 
                              className="group flex flex-col bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden hover:bg-slate-800/60 transition-all duration-500 flex-grow"
                          >
                              {/* Image Header */}
                              <div className="relative h-48 overflow-hidden bg-slate-800">
                                  <img 
                                      src={comm.profilepicturl || fallBackPic} 
                                      alt={comm.communityname} 
                                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 opacity-60 group-hover:opacity-80"
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
                                  
                                  {/* Profile Circle Floating */}
                                  <div className="absolute -bottom-6 left-6 w-16 h-16 rounded-2xl border-4 border-slate-900 overflow-hidden shadow-xl bg-slate-800">
                                       <img 
                                          src={comm.profilepicturl || fallBackPic} 
                                          alt={comm.communityname} 
                                          className="w-full h-full object-cover"
                                       />
                                  </div>
                              </div>

                              {/* Info Part */}
                              <div className="p-6 pt-8 flex-1 flex flex-col">
                                  <h3 className="text-xl font-bold text-white mb-2 line-clamp-1 group-hover:text-indigo-400 transition-colors leading-tight">
                                      {comm.communityname}
                                  </h3>
                                  <p className="text-slate-400 text-sm line-clamp-3 mb-6 flex-1">
                                      {comm.description || "Tidak ada deskripsi tersedia untuk komunitas ini."}
                                  </p>
                                  
                                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                    <button className="w-full py-3 bg-indigo-500/10 hover:bg-indigo-500 text-indigo-400 hover:text-white rounded-xl font-bold transition-all duration-300">
                                        Lihat Komunitas
                                    </button>
                                  </div>
                              </div>
                          </motion.div>
                        );
                    })}
                </div>
            )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CommunityPage;