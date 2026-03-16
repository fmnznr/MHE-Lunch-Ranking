"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface ConfettiProps {
  onComplete?: () => void;
  intensity?: number; // 0-5, maps to star rating
}

interface Particle {
  id: number;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  color: string;
  delay: number;
  width: number;
  height: number;
  shape: "circle" | "rect" | "star";
}

const COLORS = ["#C9A84C", "#E8D48B", "#A88A3A", "#F5E6B8", "#D4AF37", "#FFD700"];

function generateParticles(count: number): Particle[] {
  const shapes: Particle["shape"][] = ["circle", "rect", "star"];
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 400 - 200,
    y: Math.random() * 500 - 250,
    rotation: Math.random() * 720 - 360,
    scale: Math.random() * 0.6 + 0.7,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    delay: Math.random() * 0.4,
    width: Math.random() * 6 + 8,
    height: Math.random() * 6 + 8,
    shape: shapes[Math.floor(Math.random() * shapes.length)],
  }));
}

function generateRainParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1000,
    x: Math.random() * 600 - 300,
    y: Math.random() * 400 + 200,
    rotation: Math.random() * 360,
    scale: Math.random() * 0.5 + 0.5,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    delay: Math.random() * 0.8 + 0.3,
    width: Math.random() * 4 + 6,
    height: Math.random() * 4 + 6,
    shape: "star" as const,
  }));
}

function ParticleShape({ particle }: { particle: Particle }) {
  if (particle.shape === "star") {
    return (
      <svg
        width={particle.width + 4}
        height={particle.height + 4}
        viewBox="0 0 24 24"
        fill={particle.color}
      >
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    );
  }

  return (
    <div
      style={{
        width: particle.width,
        height: particle.height,
        borderRadius: particle.shape === "circle" ? "50%" : "2px",
        backgroundColor: particle.color,
      }}
    />
  );
}

function getParticleConfig(intensity: number) {
  if (intensity <= 2) return { count: 0, rain: 0, duration: 0 };
  if (intensity === 3) return { count: 20, rain: 0, duration: 1800 };
  if (intensity === 4) return { count: 40, rain: 0, duration: 2200 };
  return { count: 50, rain: 30, duration: 3000 };
}

export function Confetti({ onComplete, intensity = 5 }: ConfettiProps) {
  const config = getParticleConfig(intensity);
  const [particles] = useState(() => generateParticles(config.count));
  const [rainParticles] = useState(() =>
    config.rain > 0 ? generateRainParticles(config.rain) : []
  );

  useEffect(() => {
    if (config.count === 0) {
      onComplete?.();
      return;
    }
    const timer = setTimeout(() => onComplete?.(), config.duration + 500);
    return () => clearTimeout(timer);
  }, [onComplete, config.count, config.duration]);

  if (config.count === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ opacity: 1, x: 0, y: 0, rotate: 0, scale: 0 }}
          animate={{
            opacity: [1, 1, 1, 0],
            x: p.x,
            y: p.y,
            rotate: p.rotation,
            scale: [0, p.scale * 1.2, p.scale],
          }}
          transition={{
            duration: config.duration / 1000,
            delay: p.delay,
            ease: [0.16, 1, 0.3, 1],
          }}
          style={{ position: "absolute" }}
        >
          <ParticleShape particle={p} />
        </motion.div>
      ))}

      {rainParticles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ opacity: 0, y: -200, x: p.x, rotate: 0, scale: 0 }}
          animate={{
            opacity: [0, 1, 1, 0],
            y: p.y,
            rotate: p.rotation,
            scale: [0, p.scale],
          }}
          transition={{
            duration: 2.5,
            delay: p.delay,
            ease: [0.25, 0.1, 0.25, 1],
          }}
          style={{ position: "absolute", top: 0 }}
        >
          <ParticleShape particle={p} />
        </motion.div>
      ))}
    </div>
  );
}
