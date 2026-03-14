import { useEffect, useRef, useState } from "react";

const modules = import.meta.glob("../../Assets/Homepage/imgframes/*.webp", {
  eager: true,
});
// Sort the keys to ensure the frames are in the correct sequence (001 to 100)
const frameUrls = Object.keys(modules)
  .sort((a, b) => a.localeCompare(b))
  .map((key) => (modules[key] as any).default);

const EWasteScrollAnimation = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [images, setImages] = useState<HTMLImageElement[]>([]);

  // Preload frames
  useEffect(() => {
    const loadedImages = frameUrls.map((url) => {
      const img = new Image();
      img.src = url;
      return img;
    });
    setImages(loadedImages);
  }, []);

  useEffect(() => {
    if (images.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Draw the first frame when it loads
    if (images[0].complete) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(images[0], 0, 0, canvas.width, canvas.height);
    } else {
      images[0].onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(images[0], 0, 0, canvas.width, canvas.height);
      };
    }

    const handleScroll = () => {
      if (!containerRef.current || !canvas) return;

      const { top, height } = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // scrollProgress goes from 0 to 1 as the user scrolls past the container
      let scrollProgress = -top / (height - windowHeight);
      scrollProgress = Math.max(0, Math.min(1, scrollProgress));

      const frameIndex = Math.min(
        images.length - 1,
        Math.floor(scrollProgress * images.length),
      );

      const currentImage = images[frameIndex];
      // Only draw if image is fully loaded to prevent flickering
      if (currentImage && currentImage.complete) {
        // Optional: clear canvas if necessary, but writing over entirely usually works.
        // ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(currentImage, 0, 0, canvas.width, canvas.height);
      }
    };

    // Use requestAnimationFrame for smoother scrolling if desired, or simple event listener
    window.addEventListener("scroll", handleScroll, { passive: true });
    // Trigger once on mount to set initial frame if already scrolled
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [images]);

  return (
    <div ref={containerRef} className="relative w-full h-[400vh] bg-tx-primary">
      <div className="sticky top-0 w-full h-screen overflow-hidden flex items-center justify-center">
        {/* Canvas for sequence animation */}
        <canvas
          ref={canvasRef}
          width={1920}
          height={1080}
          className="absolute inset-0 w-full h-full object-cover z-0"
        />

        {/* Overlay to dim background video slightly for readability */}
        <div className="absolute inset-0 bg-black/50 z-10" />

        {/* Content overlaid on top of animation */}
        <div className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-end items-center">
            {/* Right: text content */}
            <div className="space-y-6 md:w-1/2">
              <h2 className="text-4xl md:text-5xl font-gasoek text-bg-fresh leading-tight drop-shadow-md">
                Mulai dari
                <br />
                <span className="text-bg-vermillion">Tindakan Anda</span>
              </h2>
              <div className="space-y-4 text-lg text-white/90 font-questrial leading-relaxed drop-shadow-md pr-4">
                <p>
                  Alih-alih membuang gadget lama, dengan{" "}
                  <strong className="text-white">
                    memperbaiki, menjual, atau menukarnya
                  </strong>
                  , Anda memberikan "napas kedua" bagi perangkat tersebut.
                </p>
                <p>
                  Memperpanjang usia pakai perangkat satu tahun saja mampu
                  memangkas jejak karbonnya hingga{" "}
                  <span className="text-bg-fresh font-bold">23–30%</span>.
                  <a
                    href="https://doi.org/10.1111/jiec.13119"
                    target="_blank"
                    rel="noreferrer"
                    className="group relative inline-block ml-1 cursor-pointer"
                  >
                    <sup className="text-xs text-white/60 group-hover:text-bg-fresh transition-colors">
                      [1]
                    </sup>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-64 p-3 bg-slate-900 text-xs text-white/90 rounded-lg shadow-xl border border-slate-700 z-50">
                      Cordella et al. (2021).{" "}
                      <span className="text-bg-fresh font-bold block mt-1">
                        Journal of Industrial Ecology
                      </span>
                    </div>
                  </a>
                </p>
                <p>
                  Bahkan, memperpanjang usia seluruh smartphone di Uni Eropa
                  satu tahun saja setara dengan{" "}
                  <span className="text-bg-fresh font-bold">
                    menghilangkan 2 juta mobil
                  </span>{" "}
                  dari jalanan pada 2030.
                  <a
                    href="https://eeb.org/en/revealed-the-climate-cost-of-disposable-smartphones/"
                    target="_blank"
                    rel="noreferrer"
                    className="group relative inline-block ml-1 cursor-pointer"
                  >
                    <sup className="text-xs text-white/60 group-hover:text-bg-fresh transition-colors">
                      [2]
                    </sup>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-64 p-3 bg-slate-900 text-xs text-white/90 rounded-lg shadow-xl border border-slate-700 z-50">
                      EEB — "Coolproducts: Long Live the Machine" (2019).{" "}
                      <span className="text-bg-fresh font-bold block mt-1">
                        European Environmental Bureau
                      </span>
                    </div>
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
        {/* Video credit */}
        <div className="absolute bottom-4 right-4 z-20">
          <p className="text-[11px] text-white/40 font-questrial">
            Video by{" "}
            <a
              href="https://www.pexels.com/video/close-up-view-of-cassette-player-12281669/"
              target="_blank"
              rel="noreferrer"
              className="underline hover:text-white/70 transition-colors"
            >
              Stefan
            </a>{" "}
            on Pexels
          </p>
        </div>
      </div>
    </div>
  );
};

export default EWasteScrollAnimation;
