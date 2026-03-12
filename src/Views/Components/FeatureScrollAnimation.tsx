import { useRef } from "react";
import { useScroll, useTransform, motion } from "framer-motion";
import { Sparkles } from "lucide-react";

const features = [
  {
    id: 1,
    title: "Peta Interaktif",
    description:
      "Didukung OpenStreetMap, temukan penjual dan pembeli elektronik bekas persis di sekitar Anda secara real-time. Cukup buka peta, pilih, dan deal.",
    image: "/src/Assets/Homepage/ScrollingSlide/dmitry-limonov-peta.webp",
    credit: (
      <>
        Photo by{" "}
        <a
          href="https://unsplash.com/@limonov?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText"
          target="_blank"
          rel="noreferrer"
          className="underline hover:text-white/80 transition-colors"
        >
          Dmitry Limonov
        </a>{" "}
        on{" "}
        <a
          href="https://unsplash.com/photos/a-city-next-to-a-body-of-water-WO3z0tGh0JY?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText"
          target="_blank"
          rel="noreferrer"
          className="underline hover:text-white/80 transition-colors"
        >
          Unsplash
        </a>
      </>
    ),
  },
  {
    id: 2,
    title: "Jual & Tukar Barang",
    description:
      "Pasang iklan jual perangkat lama atau ajukan penawaran tukar (trade) langsung dengan pengguna lain. Fleksibel — ada uang atau tidak, transaksi tetap bisa terjadi.",
    image: "/src/Assets/Homepage/ScrollingSlide/biris-bianca-trade.webp",
    credit: (
      <>
        Photo by{" "}
        <a
          href="https://unsplash.com/@thedoublebi?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText"
          target="_blank"
          rel="noreferrer"
          className="underline hover:text-white/80 transition-colors"
        >
          Biris Bianca
        </a>{" "}
        on{" "}
        <a
          href="https://unsplash.com/photos/a-group-of-people-standing-around-a-table-full-of-items-CyUQtUOlisA?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText"
          target="_blank"
          rel="noreferrer"
          className="underline hover:text-white/80 transition-colors"
        >
          Unsplash
        </a>
      </>
    ),
  },
  {
    id: 3,
    title: "Komunitas Lokal",
    description:
      "Temukan komunitas reparasi dan pecinta barang elektronik bekas di kota Anda. Berbagi pengetahuan, rekomendasi, dan kolaborasi dalam satu jaringan lokal.",
    image: "/src/Assets/Homepage/ScrollingSlide/joylynn-goh-komunitas.webp",
    credit: (
      <>
        Photo by{" "}
        <a
          href="https://unsplash.com/@joylynn_goh?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText"
          target="_blank"
          rel="noreferrer"
          className="underline hover:text-white/80 transition-colors"
        >
          Joylynn Goh
        </a>{" "}
        on{" "}
        <a
          href="https://unsplash.com/photos/a-group-of-people-walking-in-the-rain-with-umbrellas-j0hazmfofm0?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText"
          target="_blank"
          rel="noreferrer"
          className="underline hover:text-white/80 transition-colors"
        >
          Unsplash
        </a>
      </>
    ),
  },
  {
    id: 4,
    title: "Analisis Pengurangan Karbon",
    description:
      "Didukung Google Gemini AI, fitur ini secara otomatis menghitung estimasi jejak karbon yang berhasil Anda hemat setiap kali melakukan transaksi. Lihat secara nyata dampak lingkungan dari pilihan Anda.",
    image:
      "/src/Assets/Homepage/ScrollingSlide/muhammad-bilal-zafar-carbon.webp",
    isAI: true,
    credit: (
      <>
        Photo by{" "}
        <a
          href="https://unsplash.com/@mbilal0820?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText"
          target="_blank"
          rel="noreferrer"
          className="underline hover:text-white/80 transition-colors"
        >
          Muhammad Bilal Zafar
        </a>{" "}
        on{" "}
        <a
          href="https://unsplash.com/photos/a-smokestack-billows-from-a-building-in-a-city-2J7tUNTLcLk?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText"
          target="_blank"
          rel="noreferrer"
          className="underline hover:text-white/80 transition-colors"
        >
          Unsplash
        </a>
      </>
    ),
  },
  {
    id: 5,
    title: "Analisis Harga Lokal",
    description:
      "Tidak tahu harus pasang harga berapa? Ditenagai Google Gemini AI, fitur ini menganalisis tren pasar barang elektronik bekas di sekitar lokasi Anda dan merekomendasikan harga jual yang kompetitif — sehingga barang Anda laku lebih cepat dengan harga yang adil.",
    image:
      "/src/Assets/Homepage/ScrollingSlide/moises-gonzalez-local-prices.webp",
    isAI: true,
    credit: (
      <>
        Photo by{" "}
        <a
          href="https://unsplash.com/@moigonz?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText"
          target="_blank"
          rel="noreferrer"
          className="underline hover:text-white/80 transition-colors"
        >
          Moises Gonzalez
        </a>{" "}
        on{" "}
        <a
          href="https://unsplash.com/photos/black-and-white-labeled-box-SoftXx65RzM?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText"
          target="_blank"
          rel="noreferrer"
          className="underline hover:text-white/80 transition-colors"
        >
          Unsplash
        </a>
      </>
    ),
  },
];

const FeatureScrollAnimation = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  return (
    <section
      ref={containerRef}
      className="relative w-full bg-white text-tx-primary border-t border-slate-100"
      // Height corresponds to total features so we can scroll through them
      style={{ height: `${features.length * 100}vh` }}
    >
      <div className="sticky top-0 w-full h-screen overflow-hidden flex flex-col md:flex-row items-center px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto gap-8 lg:gap-16 py-10 md:py-20">
        {/* Left: Text Content container */}
        <div className="w-full md:w-1/2 flex flex-col justify-center h-full relative z-10 md:pt-0 pt-16">
          <div className="mb-6 md:mb-12">
            <h2 className="text-3xl md:text-5xl font-gasoek leading-tight">
              <span className="text-xl md:text-2xl">
                Demi mengurangi e-waste,
              </span>
              <br />
              <span className="text-tx-primary">kami menyediakan</span>
              <br />
              <span className="text-bg-vermillion">platform untuk</span>
            </h2>
          </div>

          {/* Cards Container */}
          <div className="relative h-64 sm:h-72 md:h-80 w-full">
            {features.map((feature, index) => {
              // We map index cleanly so that each feature occupies exactly 1/N of the scroll progress
              const start = index / features.length;
              const end = (index + 1) / features.length;

              // Transition effect for fading in and out text cards
              const opacity = useTransform(
                scrollYProgress,
                [
                  Math.max(0, start - 0.05),
                  start + 0.05,
                  end - 0.05,
                  Math.min(1, end + 0.05),
                ],
                [0, 1, 1, 0],
              );

              const y = useTransform(
                scrollYProgress,
                [
                  Math.max(0, start - 0.05),
                  start + 0.05,
                  end - 0.05,
                  Math.min(1, end + 0.05),
                ],
                [30, 0, 0, -30],
              );

              // pointerEvents is essentially a derived state from scrollYProgress but useTransform string interpolation works for simple cases,
              // or we can just let opacity handle visibility.
              // Instead of pointerEvents transfrom, we'll let CSS handle it.
              const zIndex = useTransform(scrollYProgress, (v) =>
                v >= start && v < end ? 10 : 0,
              );

              return (
                <motion.div
                  key={feature.id}
                  className="absolute top-0 left-0 w-full flex flex-col gap-4"
                  style={{ opacity, y, zIndex }}
                >
                  <span className="text-xs font-bold tracking-[0.2em] text-bg-vermillion uppercase font-questrial">
                    {String(index + 1).padStart(2, "0")} &mdash; Fitur
                  </span>
                  <h3 className="text-3xl md:text-4xl font-gasoek text-tx-primary leading-tight flex items-center gap-3">
                    {feature.title}
                    {feature.isAI && (
                      <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-bg-vermillion shrink-0" />
                    )}
                  </h3>
                  <p className="text-tx-secondary leading-relaxed text-base md:text-lg font-questrial max-w-md">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Right: Image container + scroll timeline */}
        <div className="relative flex items-center gap-3">
          {/* Image panel */}
          <div className="w-full md:w-[calc(50vw-5rem)] lg:w-[40vw] h-1/2 md:h-[75vh] relative rounded-3xl overflow-hidden shadow-2xl border border-slate-100 mt-4 md:mt-0">
            {features.map((feature, index) => {
              const start = index / features.length;
              const end = (index + 1) / features.length;

              const opacity = useTransform(
                scrollYProgress,
                [
                  Math.max(0, start - 0.05),
                  start + 0.05,
                  end - 0.05,
                  Math.min(1, end + 0.05),
                ],
                [0, 1, 1, 0],
              );
              const scale = useTransform(
                scrollYProgress,
                [start, end],
                [1, 1.1],
              );

              return (
                <motion.div
                  key={feature.id}
                  className="absolute inset-0 w-full h-full"
                  style={{ opacity, zIndex: 1 }}
                >
                  <motion.img
                    src={feature.image}
                    alt={feature.title}
                    className="w-full h-full object-cover"
                    style={{ scale }}
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/80 via-black/40 to-transparent p-4 md:p-6 pt-12">
                    <p className="text-[10px] md:text-xs text-white/70 text-center font-questrial">
                      {feature.credit}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Scroll Timeline (vertical dots on the right of the image) */}
          <div className="hidden md:flex flex-col items-center gap-3 py-2">
            {features.map((_, index) => {
              const start = index / features.length;
              const end = (index + 1) / features.length;

              const dotScale = useTransform(
                scrollYProgress,
                [
                  Math.max(0, start - 0.02),
                  start + 0.05,
                  end - 0.05,
                  Math.min(1, end + 0.02),
                ],
                [1, 1.6, 1.6, 1],
              );
              const dotOpacity = useTransform(
                scrollYProgress,
                [
                  Math.max(0, start - 0.02),
                  start + 0.05,
                  end - 0.05,
                  Math.min(1, end + 0.02),
                ],
                [0.3, 1, 1, 0.3],
              );
              const dotBg = useTransform(scrollYProgress, (v) =>
                v >= start && v < end ? "#C0392B" : "#CBD5E1",
              );

              return (
                <div key={index} className="flex flex-col items-center">
                  <motion.div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{
                      scale: dotScale,
                      opacity: dotOpacity,
                      backgroundColor: dotBg,
                    }}
                  />
                  {index < features.length - 1 && (
                    <div className="w-px h-6 bg-slate-200" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeatureScrollAnimation;
