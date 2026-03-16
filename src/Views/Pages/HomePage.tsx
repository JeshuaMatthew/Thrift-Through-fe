import { useState, useEffect } from "react";
import EWasteScrollAnimation from "../Components/EWasteScrollAnimation";
import FeatureScrollAnimation from "../Components/FeatureScrollAnimation";

const HomePage = () => {
  const words = ["menjual", "menukar"];
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const word = words[currentWordIndex];
    let timeoutId: ReturnType<typeof setTimeout>;

    if (isDeleting) {
      if (currentText === "") {
        setIsDeleting(false);
        setCurrentWordIndex((prev) => (prev + 1) % words.length);
      } else {
        timeoutId = setTimeout(() => {
          setCurrentText(currentText.slice(0, -1));
        }, 100);
      }
    } else {
      if (currentText === word) {
        timeoutId = setTimeout(() => {
          setIsDeleting(true);
        }, 2000);
      } else {
        timeoutId = setTimeout(() => {
          setCurrentText(word.slice(0, currentText.length + 1));
        }, 150);
      }
    }

    return () => clearTimeout(timeoutId);
  }, [currentText, isDeleting, currentWordIndex]);

  return (
    <div className="w-full min-h-screen bg-bg-clean text-tx-primary pb-20 font-questrial">
      {/* Hero Section */}
      {/* Hapus justify-center di sini agar konten bisa dikontrol dari dalam container */}
      <section className="relative w-full h-screen overflow-hidden flex items-center">
        {/* Background Video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute z-0 w-auto min-w-full min-h-full max-w-none object-cover pointer-events-none"
        >
          <source
            src="https://www.pexels.com/download/video/36498297/"
            type="video/mp4"
          />
          Your browser does not support the video tag.
        </video>

        <div className="absolute inset-0 z-10 bg-black/40" />

        <div className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
          <div className="max-w-3xl flex flex-col items-start text-left gap-5">
            {/* Main headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-gasoek text-white leading-tight drop-shadow-lg">
              Lindungi bumi kita dengan{" "}
              <span className="text-bg-vermillion whitespace-nowrap">
                {currentText || "\u200B"}
                <span className="inline-block w-[3px] h-[0.75em] bg-bg-vermillion ml-[2px] animate-pulse rounded-full align-middle" />
              </span>
              <br />
              barang elektronik bekas.
            </h1>
            
            <p className="text-xs text-white/40 font-questrial">
              Video by Jakub Zerdzicki: <a href="https://www.pexels.com/video/aerial-view-of-modern-city-skyscrapers-36498297/" target="_blank" rel="noreferrer" className="underline hover:text-white transition-colors">Pexels</a>
            </p>

            {/* Supporting subtext */}
            <p className="text-base md:text-lg text-white/70 font-questrial max-w-xl leading-relaxed">
              70% limbah beracun berasal dari sampah elektronik. Setiap
              perangkat yang beredar kembali adalah satu langkah nyata
              mengurangi sampah elektronik.
            </p>
          </div>
        </div>

        {/* Scroll down indicator */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 animate-bounce">
          <svg
            className="w-10 h-10 text-white/80"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            ></path>
          </svg>
        </div>

        {/* Jagged Stamp Edge Transition */}
        <div className="absolute bottom-0 left-0 w-full leading-none z-30 transform translate-y-px">
          <svg
            className="w-full h-4 sm:h-5 md:h-6 drop-shadow-sm text-bg-clean"
            preserveAspectRatio="none"
            viewBox="0 0 100 10"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* The path draws stamp edges with curved inner valleys and flat tops. */}
            <path d="M 0 10 L 0 5 C 0,5 0.25,6 0.5,5 L 1.25,0 L 1.75,0 L 2.5,5 C 2.5,5 2.75,6 3,5 L 3.75,0 L 4.25,0 L 5,5 C 5,5 5.25,6 5.5,5 L 6.25,0 L 6.75,0 L 7.5,5 C 7.5,5 7.75,6 8,5 L 8.75,0 L 9.25,0 L 10,5 C 10,5 10.25,6 10.5,5 L 11.25,0 L 11.75,0 L 12.5,5 C 12.5,5 12.75,6 13,5 L 13.75,0 L 14.25,0 L 15,5 C 15,5 15.25,6 15.5,5 L 16.25,0 L 16.75,0 L 17.5,5 C 17.5,5 17.75,6 18,5 L 18.75,0 L 19.25,0 L 20,5 C 20,5 20.25,6 20.5,5 L 21.25,0 L 21.75,0 L 22.5,5 C 22.5,5 22.75,6 23,5 L 23.75,0 L 24.25,0 L 25,5 C 25,5 25.25,6 25.5,5 L 26.25,0 L 26.75,0 L 27.5,5 C 27.5,5 27.75,6 28,5 L 28.75,0 L 29.25,0 L 30,5 C 30,5 30.25,6 30.5,5 L 31.25,0 L 31.75,0 L 32.5,5 C 32.5,5 32.75,6 33,5 L 33.75,0 L 34.25,0 L 35,5 C 35,5 35.25,6 35.5,5 L 36.25,0 L 36.75,0 L 37.5,5 C 37.5,5 37.75,6 38,5 L 38.75,0 L 39.25,0 L 40,5 C 40,5 40.25,6 40.5,5 L 41.25,0 L 41.75,0 L 42.5,5 C 42.5,5 42.75,6 43,5 L 43.75,0 L 44.25,0 L 45,5 C 45,5 45.25,6 45.5,5 L 46.25,0 L 46.75,0 L 47.5,5 C 47.5,5 47.75,6 48,5 L 48.75,0 L 49.25,0 L 50,5 C 50,5 50.25,6 50.5,5 L 51.25,0 L 51.75,0 L 52.5,5 C 52.5,5 52.75,6 53,5 L 53.75,0 L 54.25,0 L 55,5 C 55,5 55.25,6 55.5,5 L 56.25,0 L 56.75,0 L 57.5,5 C 57.5,5 57.75,6 58,5 L 58.75,0 L 59.25,0 L 60,5 C 60,5 60.25,6 60.5,5 L 61.25,0 L 61.75,0 L 62.5,5 C 62.5,5 62.75,6 63,5 L 63.75,0 L 64.25,0 L 65,5 C 65,5 65.25,6 65.5,5 L 66.25,0 L 66.75,0 L 67.5,5 C 67.5,5 67.75,6 68,5 L 68.75,0 L 69.25,0 L 70,5 C 70,5 70.25,6 70.5,5 L 71.25,0 L 71.75,0 L 72.5,5 C 72.5,5 72.75,6 73,5 L 73.75,0 L 74.25,0 L 75,5 C 75,5 75.25,6 75.5,5 L 76.25,0 L 76.75,0 L 77.5,5 C 77.5,5 77.75,6 78,5 L 78.75,0 L 79.25,0 L 80,5 C 80,5 80.25,6 80.5,5 L 81.25,0 L 81.75,0 L 82.5,5 C 82.5,5 82.75,6 83,5 L 83.75,0 L 84.25,0 L 85,5 C 85,5 85.25,6 85.5,5 L 86.25,0 L 86.75,0 L 87.5,5 C 87.5,5 87.75,6 88,5 L 88.75,0 L 89.25,0 L 90,5 C 90,5 90.25,6 90.5,5 L 91.25,0 L 91.75,0 L 92.5,5 C 92.5,5 92.75,6 93,5 L 93.75,0 L 94.25,0 L 95,5 C 95,5 95.25,6 95.5,5 L 96.25,0 L 96.75,0 L 97.5,5 C 97.5,5 97.75,6 98,5 L 98.75,0 L 99.25,0 L 100,5 L 100 10 Z"></path>
          </svg>
        </div>
      </section>

      {/* Section 1: The E-Waste Problem */}
      <section className="w-full py-24 bg-bg-clean text-tx-primary px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <h2 className="text-5xl md:text-6xl font-gasoek text-bg-vermillion leading-tight">
              Ancaman Limbah
              <br />
              <span className="text-tx-primary">Elektronik</span>
            </h2>
            <div className="space-y-5 text-lg text-tx-secondary font-questrial leading-relaxed">
              <p>
                Dunia saat ini tengah menghadapi krisis lingkungan yang sering
                terabaikan — ledakan{" "}
                <strong className="text-tx-primary">
                  limbah elektronik (e-waste)
                </strong>
                . Setiap tahunnya, penduduk bumi menghasilkan lebih dari{" "}
                <strong className="text-tx-primary">50 juta ton</strong> sampah
                elektronik, namun hanya{" "}
                <strong className="text-tx-primary">20%</strong> yang didaur
                ulang dengan prosedur yang benar.
                <a
                  href="https://ewastemonitor.info/"
                  target="_blank"
                  rel="noreferrer"
                  className="group relative inline-block ml-1 cursor-pointer"
                >
                  <sup className="text-xs text-tx-muted group-hover:text-bg-vermillion transition-colors">
                    [1]
                  </sup>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-56 p-3 bg-slate-800 text-xs text-white/90 rounded-lg shadow-xl border border-slate-700 z-50">
                    Sumber:{" "}
                    <span className="text-bg-fresh font-bold block mt-1 text-sm">
                      The Global E-waste Monitor (UNITAR)
                    </span>
                  </div>
                </a>
              </p>
              <p>
                Sisa 80% berakhir di tempat pembuangan akhir, di mana
                perangkat-perangkat ini menjadi bom waktu ekologis. Zat-zat
                beracun seperti{" "}
                <span className="text-bg-vermillion font-bold">
                  timbal, merkuri, dan kadmium
                </span>{" "}
                terlepas ke tanah dan merembes ke air tanah.
                <a
                  href="https://www.who.int/news-room/fact-sheets/detail/electronic-waste-(e-waste)"
                  target="_blank"
                  rel="noreferrer"
                  className="group relative inline-block ml-1 cursor-pointer"
                >
                  <sup className="text-xs text-tx-muted group-hover:text-bg-vermillion transition-colors">
                    [2]
                  </sup>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-56 p-3 bg-slate-800 text-xs text-white/90 rounded-lg shadow-xl border border-slate-700 z-50">
                    Sumber:{" "}
                    <span className="text-bg-fresh font-bold block mt-1 text-sm">
                      World Health Organization (WHO)
                    </span>
                  </div>
                </a>
              </p>
              <p className="font-bold text-tx-primary p-4 bg-slate-50 border-l-4 border-bg-vermillion rounded-r-xl">
                Satu baterai smartphone yang bocor saja mampu mencemari hingga
                600.000 liter air — mengancam keberlangsungan ekosistem dan
                kesehatan manusia.
              </p>
            </div>
          </div>
          <div className="relative">
            <div className="rounded-2xl overflow-hidden shadow-2xl border border-slate-100">
              <img
                src="/src/Assets/Homepage/nathan-cima-gpu.webp"
                alt="Tumpukan komponen elektronik bekas - e-waste"
                className="w-full h-auto object-cover"
              />
            </div>
            <p className="mt-3 text-xs text-tx-muted text-center font-questrial">
              Photo by{" "}
              <a
                href="https://unsplash.com/@nathan_cima?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText"
                target="_blank"
                rel="noreferrer"
                className="underline hover:text-tx-secondary transition-colors"
              >
                Nathan Cima
              </a>{" "}
              on{" "}
              <a
                href="https://unsplash.com/photos/a-pile-of-assorted-electronic-components-sitting-on-top-of-each-other-G09BIFdUAGU?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText"
                target="_blank"
                rel="noreferrer"
                className="underline hover:text-tx-secondary transition-colors"
              >
                Unsplash
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* Scroll Animation: Solution in Action */}
      <EWasteScrollAnimation />

      {/* Section 3: Platform Features (Scrolling Slideshow) */}
      <FeatureScrollAnimation />
    </div>
  );
};

export default HomePage;
