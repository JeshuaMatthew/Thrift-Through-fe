import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import type { User } from "../../Types/User";

interface UserDetailPopupProps {
  selectedUser: User | null;
  onClose: () => void;
}

const UserDetailPopup = ({ selectedUser, onClose }: UserDetailPopupProps) => {
  return (
    <AnimatePresence>
      {selectedUser && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-bg-vermillion border border-bg-vermillion/50 rounded-xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col"
          >
            <div
              className={`h-32 relative bg-cover bg-center shrink-0 ${
                !selectedUser.bannerimgurl
                  ? "bg-linear-to-r from-bg-vermillion to-bg-fresh"
                  : ""
              }`}
              style={
                selectedUser.bannerimgurl
                  ? { backgroundImage: `url(${selectedUser.bannerimgurl})` }
                  : {}
              }
            >
              <div className="absolute inset-0 bg-black/20"></div>
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-1.5 bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors backdrop-blur-sm z-10"
                title="Tutup"
              >
                <X size={18} />
              </button>
              <div className="absolute -bottom-12 left-6 z-10">
                <img
                  src={
                    selectedUser.profilepicturl ||
                    `https://ui-avatars.com/api/?name=${selectedUser.fullname}&background=random`
                  }
                  alt={selectedUser.fullname}
                  className="w-24 h-24 rounded-full border-4 border-bg-vermillion object-cover bg-white shadow-md"
                />
              </div>
            </div>
            <div className="pt-14 px-6 pb-6 text-tx-primary bg-bg-vermillion flex-1 flex flex-col">
              <h3 className="text-xl font-gasoek leading-tight truncate text-tx-primary mb-1">
                {selectedUser.fullname}
              </h3>
              <p className="text-sm font-questrial text-white/90 mb-4 bg-black/10 inline-block px-3 py-1 rounded-lg w-max shadow-inner">
                @{selectedUser.username}
              </p>
              <div className="space-y-3 mb-6 bg-white/90 p-4 rounded-xl shadow-inner">
                <p className="text-sm font-questrial text-tx-primary flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-tx-muted"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  {selectedUser.email}
                </p>
                <p className="text-sm font-questrial text-tx-primary flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-tx-muted"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  {selectedUser.phonenum}
                </p>
              </div>

              <div className="flex gap-4 mt-auto">
                <div className="bg-white/90 px-4 py-3 rounded-xl flex-1 border border-white/50 flex flex-col items-center justify-center text-center shadow-sm">
                  <span className="text-xs font-questrial text-tx-muted font-bold mb-1 uppercase tracking-wider">
                    Peringkat
                  </span>
                  <span
                    className={`text-sm font-bold font-questrial ${
                      selectedUser.userrank.toLowerCase() === "gold"
                        ? "text-yellow-600"
                        : selectedUser.userrank.toLowerCase() === "silver"
                        ? "text-slate-500"
                        : "text-amber-600"
                    }`}
                  >
                    {selectedUser.userrank}
                  </span>
                </div>
                <div className="bg-bg-fresh px-4 py-3 rounded-xl flex-1 border border-bg-fresh/50 flex flex-col items-center justify-center text-center shadow-sm">
                  <span className="text-xs font-questrial text-tx-primary font-bold mb-1 uppercase tracking-wider">
                    Poin
                  </span>
                  <span className="text-sm font-bold font-questrial text-tx-primary">
                    {selectedUser.userpoint}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UserDetailPopup;
