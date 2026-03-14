import React, { useEffect, useState, useMemo, useRef } from "react";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";

const generateBlades = (width: number) => {
  const blades = [];
  const total = Math.floor(width / 6);
  const height = 80;
  const maxHeight = height * 0.8;
  const startAngle = 40;
  const offset = 20;

  for (let i = 0; i < total; i++) {
    const rx = Math.random();
    const bladeWidth = 1 + rx * 4;
    const bladeHeight = 20 + Math.random() * (maxHeight - 20);
    const sign = Math.random() < 0.5 ? 1 : -1;
    const angle = Math.random() * sign * startAngle * (Math.PI / 180);
    const offsetX = 1.5;

    // Titik Dasar Kiri (sx, sy)
    const sx = offset / 2 + Math.random() * (width - offset);
    const sy = height;

    // Titik Lengkung Kiri (csx, csy) & Kanan (psx, psy)
    const csx = sx - offsetX;
    const csy = sy - bladeHeight / (Math.random() < 0.5 ? 1 : 2);
    const psx = csx;
    const psy = csy;

    // Titik Dasar Kanan (dx, dy)
    const dx = sx + bladeWidth;
    const dy = sy;

    // Titik Ujung Puncak (px, py)
    const th = angle + Math.PI / 2;
    const px = sx + bladeWidth + bladeHeight * Math.cos(th);
    const py = sy - bladeHeight * Math.sin(th);

    // Alih-alih merender 'd' secara permanen, kita simpan setiap koordinatnya
    blades.push({
      id: i,
      sx,
      sy, // Kordinat dasar kiri (akan dikunci)
      dx,
      dy, // Kordinat dasar kanan (akan dikunci)
      csx,
      csy, // Kordinat tengah/kontrol lengkungan
      psx,
      psy,
      px,
      py, // Kordinat ujung rumput
      centerX: sx + bladeWidth / 2,
      delay: Math.random() * 2,
      duration: 2.5 + Math.random(),
      rotationOrigin: `${sx + bladeWidth / 2}px ${sy}px`,
    });
  }

  return blades;
};

const GrassBlade = ({ blade, mouseX }: { blade: any; mouseX: any }) => {
  // Hitung pergeseran khusus untuk ujung rumput (Tip) saat menghindari kursor
  const targetBend = useTransform(mouseX, (x: number) => {
    if (x === -1000) return 0;

    const dist = x - blade.centerX;
    const maxDist = 120; // Jarak jangkauan kursor

    if (Math.abs(dist) < maxDist) {
      // Semakin dekat, semakin besar dorongannya (maksimal pergeseran 60px)
      const intensity = 1 - Math.abs(dist) / maxDist;
      const maxBendPixels = 60;

      // Jika kursor di kanan (dist > 0), dorong ujung ke kiri (-)
      // Jika kursor di kiri (dist < 0), dorong ujung ke kanan (+)
      return dist > 0 ? -intensity * maxBendPixels : intensity * maxBendPixels;
    }
    return 0;
  });

  // Efek pegas supaya kembalinya mulus (membal alami)
  const springBend = useSpring(targetBend, {
    stiffness: 100,
    damping: 12,
    mass: 0.8,
  });

  // Generate attribute 'd' untuk path secara dinamis
  // Dasar rumput tidak ditambahkan 'bend', sehingga akan diam seratus persen.
  const pathD = useTransform(springBend, (bend) => {
    const { sx, sy, dx, dy } = blade;

    // Titik Control (tengah rumput) bergeser sedikit (40%) agar lengkungan natural
    const csx = blade.csx + bend * 0.4;
    const csy = blade.csy;
    const psx = blade.psx + bend * 0.4;
    const psy = blade.psy;

    // Ujung rumput (puncak) bergeser sepenuhnya (100%)
    const px = blade.px + bend;
    // Agar saat membengkok rumput tidak terlihat meregang/memanjang, kita rendahkan (turunkan) tingginya sedikit saat ia bergeser.
    const py = blade.py + Math.abs(bend) * 0.25;

    // Susun kembali string SVG
    return `M${sx},${sy} C${sx},${sy},${csx},${csy},${px},${py} C${px},${py},${psx},${psy},${dx},${dy} Z`;
  });

  return (
    <motion.g
      style={{ transformOrigin: blade.rotationOrigin }}
      animate={{ rotate: [-3, 3, -3] }} // Angin berhembus konstan (Sangat pelan agar dasar tidak terpengaruh)
      transition={{
        duration: blade.duration,
        repeat: Infinity,
        ease: "easeInOut",
        delay: blade.delay,
      }}
    >
      <motion.path
        d={pathD} // Menggunakan string path dinamis yang terus merender titik setiap frame
        fill="currentColor"
        className="text-bg-fresh opacity-90"
      />
    </motion.g>
  );
};

// ... (Komponen AnimatedGrass sama persis seperti sebelumnya) ...
const AnimatedGrass: React.FC = () => {
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1000,
  );
  const svgRef = useRef<SVGSVGElement>(null);
  const mouseX = useMotionValue(-1000);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    const handleMouseMove = (e: MouseEvent) => {
      if (!svgRef.current) return;
      const rect = svgRef.current.getBoundingClientRect();
      const isOver =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top - 100 &&
        e.clientY <= rect.bottom + 50;

      if (isOver) {
        mouseX.set(e.clientX - rect.left);
      } else {
        mouseX.set(-1000);
      }
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [mouseX]);

  const widthStep = Math.floor(windowWidth / 100) * 100;

  const blades = useMemo(() => {
    return generateBlades(windowWidth + 100);
  }, [widthStep]);

  return (
    <div
      className="absolute bottom-0 left-0 w-full overflow-hidden pointer-events-none"
      style={{ height: "80px", transform: "translateY(1px)" }}
    >
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        viewBox={`0 0 ${windowWidth} 80`}
        preserveAspectRatio="none"
        style={{ display: "block" }}
      >
        {blades.map((blade) => (
          <GrassBlade key={blade.id} blade={blade} mouseX={mouseX} />
        ))}
      </svg>
    </div>
  );
};

export default AnimatedGrass;
