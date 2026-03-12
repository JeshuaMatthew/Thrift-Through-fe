import { useState, useEffect } from 'react';
import { useAuth } from '../../Utils/Hooks/AuthProvider';
import { ThriftService, type Item } from '../../Services/ThriftsServices';
import { motion, AnimatePresence } from 'framer-motion';

const MarketPage = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Pakaian', 'Elektronik', 'Furniture', 'Otomotif', 'Lainnya'];

  const fetchMarketItems = async () => {
    if (user?.userid) {
      setIsLoading(true);
      try {
        const thriftService = new ThriftService();
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));
        const marketItems = await thriftService.getMarketThrifts(user.userid);
        setItems(marketItems);
      } catch (error) {
        console.error("Failed to fetch market items:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchMarketItems();
  }, [user]);

  const filteredItems = items.filter(item => {
    const matchesSearch = item.itemname.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4">
            <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20"></div>
                <div className="absolute inset-0 rounded-full border-4 border-t-indigo-500 animate-spin"></div>
            </div>
            <p className="text-slate-400 font-medium animate-pulse">Menyiapkan pasar untuk Anda...</p>
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
                        Marketplace
                    </h1>
                    <p className="text-slate-400 text-lg max-w-xl">
                        Temukan harta karun tersembunyi dari komunitas di sekitarmu. Barang bekas, cerita baru.
                    </p>
                </div>
                
                <div className="flex items-center gap-2 bg-slate-900/50 backdrop-blur-md border border-white/5 p-1 rounded-2xl">
                    <div className="flex items-center gap-2 px-4 py-2 border-r border-white/5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-sm font-bold text-white">Jakarta Central</span>
                    </div>
                    <div className="px-4 py-2">
                        <span className="text-xs text-slate-500 block">Available Items</span>
                        <span className="text-sm font-bold text-indigo-400">{items.length} Barang</span>
                    </div>
                </div>
            </motion.div>
        </header>

        {/* Filters and Search */}
        <div className="mb-10 space-y-6">
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-grow group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input 
                        type="text" 
                        placeholder="Cari barang impianmu..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-900/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all backdrop-blur-sm"
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide no-scrollbar">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-6 py-4 rounded-2xl text-sm font-bold whitespace-nowrap transition-all border ${
                                selectedCategory === cat 
                                ? 'bg-indigo-500 border-indigo-400 text-white shadow-lg shadow-indigo-500/25' 
                                : 'bg-slate-900/40 border-white/5 text-slate-400 hover:text-white hover:border-white/20'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>
        </div>

        {/* Item Grid */}
        <AnimatePresence mode="popLayout">
            {filteredItems.length === 0 ? (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="w-full py-20 flex flex-col items-center justify-center text-center bg-slate-900/20 rounded-3xl border border-white/5"
                >
                    <div className="w-20 h-20 mb-6 rounded-full bg-slate-800 flex items-center justify-center text-slate-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Barang Tidak Ditemukan</h3>
                    <p className="text-slate-400 max-w-md px-6">
                        Maaf, kami tidak menemukan barang yang sesuai dengan pencarian Anda. Coba kata kunci lain atau cek kategori lainnya.
                    </p>
                </motion.div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {filteredItems.map((item, idx) => (
                        <motion.div 
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.05 }}
                            key={item.itemid} 
                            className="group flex flex-col bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden hover:bg-slate-800/60 transition-all duration-500 flex-grow"
                        >
                            {/* Image Part */}
                            <div className="relative aspect-[4/5] overflow-hidden">
                                <img 
                                    src={item.itempicturl} 
                                    alt={item.itemname} 
                                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60"></div>
                                
                                {/* Labels */}
                                <div className="absolute top-4 left-4 flex flex-col gap-2">
                                    <span className="px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-white">
                                        {item.category}
                                    </span>
                                </div>
                                
                                <button className="absolute bottom-4 right-4 w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-950 shadow-xl opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:bg-indigo-500 hover:text-white">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                    </svg>
                                </button>
                            </div>

                            {/* Info Part */}
                            <div className="p-6">
                                <h3 className="text-xl font-bold text-white mb-2 line-clamp-1 group-hover:text-indigo-400 transition-colors leading-tight">
                                    {item.itemname}
                                </h3>
                                <p className="text-slate-400 text-xs line-clamp-2 mb-6 h-8">
                                    {item.itemdescription}
                                </p>
                                
                                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                    <div>
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">CASH PRICE</span>
                                        <span className="text-lg font-black text-emerald-400">
                                            Rp {item.itemprice.toLocaleString('id-ID')}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">STOCK</span>
                                        <span className="text-sm font-bold text-white italic">{item.itemquantity} Unit</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MarketPage;
