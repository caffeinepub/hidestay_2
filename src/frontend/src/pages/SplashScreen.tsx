import { useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";

// Snowflake particle
interface Snowflake {
  id: number;
  x: number;
  size: number;
  speed: number;
  opacity: number;
  delay: number;
  drift: number;
}

function SnowCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const flakes = useMemo<Snowflake[]>(() => {
    return Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      size: Math.random() * 4 + 2,
      speed: Math.random() * 1.5 + 0.8,
      opacity: Math.random() * 0.6 + 0.2,
      delay: Math.random() * 3,
      drift: (Math.random() - 0.5) * 0.4,
    }));
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const positions = flakes.map((f) => ({
      x: (f.x / 100) * canvas.width,
      y: -f.size - f.delay * 60,
    }));

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      flakes.forEach((flake, i) => {
        positions[i].y += flake.speed * 0.5;
        positions[i].x += Math.sin(positions[i].y * 0.01) * flake.drift;
        if (positions[i].y > canvas.height + 10) {
          positions[i].y = -flake.size;
          positions[i].x = Math.random() * canvas.width;
        }
        ctx.beginPath();
        ctx.arc(positions[i].x, positions[i].y, flake.size / 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${flake.opacity})`;
        ctx.fill();
      });
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, [flakes]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-10"
    />
  );
}

export default function SplashScreen() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const duration = 3200;

    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min((elapsed / duration) * 100, 100);
      setProgress(pct);
      if (pct >= 100) clearInterval(interval);
    }, 30);

    const timer = setTimeout(() => {
      navigate({ to: "/dashboard" });
    }, duration);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [navigate]);

  return (
    <div
      className="relative min-h-screen w-full flex items-center justify-center overflow-hidden"
      style={{
        backgroundImage:
          "url('/assets/generated/splash-alpine-bg.dim_1080x1920.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center top",
      }}
    >
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Saffron gradient top */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#FF9933]/30 via-transparent to-transparent" />

      {/* Forest green gradient bottom */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#1F7A4C]/60 via-transparent to-transparent" />

      {/* Snowfall */}
      <SnowCanvas />

      {/* Content */}
      <div className="relative z-20 flex flex-col items-center gap-5 px-8 text-center">
        {/* Logo mark */}
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: [0.34, 1.56, 0.64, 1] }}
          className="mb-1"
        >
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-2xl"
            style={{
              background: "linear-gradient(135deg, #1F7A4C 0%, #145c38 100%)",
              boxShadow: "0 8px 32px rgba(31,122,76,0.5)",
            }}
          >
            <svg
              width="44"
              height="44"
              viewBox="0 0 44 44"
              fill="none"
              role="img"
              aria-label="HIDESTAY logo"
            >
              <path
                d="M22 6L36 18V38H28V28H16V38H8V18L22 6Z"
                fill="white"
                fillOpacity="0.95"
              />
              <circle cx="22" cy="16" r="3" fill="#FF9933" />
            </svg>
          </div>
        </motion.div>

        {/* HIDESTAY wordmark */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.9, ease: "easeOut" }}
        >
          <h1
            className="font-black text-white leading-none drop-shadow-2xl tracking-widest"
            style={{
              fontSize: "clamp(2.8rem, 12vw, 6.5rem)",
              letterSpacing: "0.2em",
              textShadow:
                "0 4px 32px rgba(0,0,0,0.6), 0 1px 0 rgba(255,255,255,0.1)",
            }}
          >
            HIDESTAY
          </h1>
        </motion.div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.85, duration: 0.9 }}
          className="text-white/90 font-light tracking-[0.3em] uppercase text-base md:text-xl drop-shadow"
        >
          Discover Hidden Stays
        </motion.p>

        {/* India strip */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 1.1, duration: 0.6, ease: "easeOut" }}
          className="flex items-center gap-2"
        >
          <div className="h-px w-10 bg-[#FF9933]/70" />
          <p className="text-[#FF9933] font-semibold tracking-widest uppercase text-xs">
            🇮🇳 India
          </p>
          <div className="h-px w-10 bg-[#FF9933]/70" />
        </motion.div>

        {/* Progress bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="w-44 h-0.5 bg-white/20 rounded-full overflow-hidden mt-4"
        >
          <div
            className="h-full rounded-full transition-all duration-75 ease-linear"
            style={{
              width: `${progress}%`,
              background: "linear-gradient(90deg, #FF9933, #1F7A4C)",
            }}
          />
        </motion.div>
      </div>
    </div>
  );
}
