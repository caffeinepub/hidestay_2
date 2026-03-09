import { useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useEffect, useState } from "react";

export default function SplashScreen() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const duration = 3000;

    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min((elapsed / duration) * 100, 100);
      setProgress(pct);
      if (pct >= 100) {
        clearInterval(interval);
      }
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
          "url('/assets/generated/mountain-bg.dim_1200x800.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/55" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-6 px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h1
            className="font-display font-black text-white leading-none"
            style={{
              fontSize: "clamp(3rem, 12vw, 7rem)",
              letterSpacing: "0.18em",
            }}
          >
            HIDESTAY
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="text-white/85 font-body font-light tracking-[0.25em] uppercase text-lg md:text-2xl"
        >
          Discover Hidden Stays
        </motion.p>

        {/* Dot loader */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="flex gap-2 mt-4"
        >
          <span className="dot-1 inline-block w-2.5 h-2.5 rounded-full bg-white" />
          <span className="dot-2 inline-block w-2.5 h-2.5 rounded-full bg-white" />
          <span className="dot-3 inline-block w-2.5 h-2.5 rounded-full bg-white" />
        </motion.div>

        {/* Progress bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.4 }}
          className="w-48 h-0.5 bg-white/25 rounded-full overflow-hidden mt-2"
        >
          <div
            className="h-full bg-white rounded-full transition-all duration-75 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </motion.div>
      </div>
    </div>
  );
}
