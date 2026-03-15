import React, { useState, useRef } from "react";
import ReactCrop, {
  centerCrop,
  makeAspectCrop,
  type Crop,
  type PixelCrop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { getCroppedImg } from "../../Utils/cropImage";

interface ImageCropModalProps {
  isOpen: boolean;
  image: string;
  aspect?: number;
  onClose: () => void;
  onCropComplete: (croppedFile: File) => void;
}

const ImageCropModal: React.FC<ImageCropModalProps> = ({
  isOpen,
  image,
  aspect = 1,
  onClose,
  onCropComplete,
}) => {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const imgRef = useRef<HTMLImageElement>(null);

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    const initialCrop = centerCrop(
      makeAspectCrop(
        {
          unit: "%",
          width: 90,
        },
        aspect,
        width,
        height,
      ),
      width,
      height,
    );
    setCrop(initialCrop);
  };

  const handleSave = async () => {
    try {
      if (completedCrop && imgRef.current) {
        const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
        const scaleY = imgRef.current.naturalHeight / imgRef.current.height;

        const pixelCrop = {
          x: completedCrop.x * scaleX,
          y: completedCrop.y * scaleY,
          width: completedCrop.width * scaleX,
          height: completedCrop.height * scaleY,
        };

        const croppedBlob = await getCroppedImg(image, pixelCrop);
        if (croppedBlob) {
          const file = new File([croppedBlob], "cropped-image.jpg", {
            type: "image/jpeg",
          });
          onCropComplete(file);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-100 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-bg-vermillion border border-bg-vermillion/50 rounded-xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          <div className="p-6 border-b border-white/10 flex justify-between items-center bg-bg-vermillion shrink-0">
            <h3 className="text-xl font-gasoek text-tx-primary">
              Potong Gambar
            </h3>
            <button
              onClick={onClose}
              className="p-1.5 bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors backdrop-blur-sm"
              title="Tutup"
            >
              <X size={20} />
            </button>
          </div>

          <div className="relative flex-1 bg-black/5 min-h-[40vh] overflow-auto flex items-center justify-center p-4">
            <ReactCrop
              crop={crop}
              onChange={(c) => setCrop(c)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={aspect}
              className="max-h-full"
            >
              <img
                ref={imgRef}
                alt="Crop me"
                src={image}
                onLoad={onImageLoad}
                style={{ maxHeight: "60vh", objectFit: "contain" }}
              />
            </ReactCrop>
          </div>

          <div className="p-6 space-y-4 bg-bg-vermillion shrink-0">
            <p className="text-xs font-questrial text-tx-primary/80 text-center italic">
              Geser dan tarik ujung kotak untuk menyesuaikan area potong.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={onClose}
                className="flex items-center justify-center py-3.5 bg-tx-primary hover:bg-black text-bg-clean rounded-lg text-sm font-bold font-questrial shadow-md transition-all active:scale-95"
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                disabled={!completedCrop}
                className={`flex items-center justify-center py-3.5 bg-bg-fresh text-tx-primary hover:bg-white rounded-lg text-sm font-bold font-questrial shadow-md transition-all active:scale-95 ${!completedCrop ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                Simpan
              </button>
            </div>
          </div>
        </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ImageCropModal;
