"use client";

import { useEffect, useState, useRef } from "react";

interface ConfettiProps {
  onComplete?: () => void;
  intensity?: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  shape: "circle" | "rect" | "star";
}

const COLORS = ["#C9A84C", "#E8D48B", "#A88A3A", "#F5E6B8", "#D4AF37", "#FFD700", "#B8860B"];

function getConfig(intensity: number) {
  if (intensity <= 2) return { count: 0, duration: 0 };
  if (intensity === 3) return { count: 30, duration: 2000 };
  if (intensity === 4) return { count: 60, duration: 2500 };
  return { count: 100, duration: 3500 };
}

function createParticle(canvasWidth: number, canvasHeight: number): Particle {
  const shapes: Particle["shape"][] = ["circle", "rect", "star"];
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;
  const angle = Math.random() * Math.PI * 2;
  const speed = Math.random() * 8 + 4;

  return {
    x: centerX + (Math.random() * 40 - 20),
    y: centerY + (Math.random() * 40 - 20),
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed - Math.random() * 6,
    size: Math.random() * 8 + 6,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    rotation: Math.random() * 360,
    rotationSpeed: (Math.random() - 0.5) * 12,
    opacity: 1,
    shape: shapes[Math.floor(Math.random() * shapes.length)],
  };
}

function drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number) {
  const spikes = 5;
  const outerRadius = size;
  const innerRadius = size * 0.4;
  let rot = (Math.PI / 2) * 3;
  const step = Math.PI / spikes;

  ctx.beginPath();
  ctx.moveTo(cx, cy - outerRadius);
  for (let i = 0; i < spikes; i++) {
    ctx.lineTo(
      cx + Math.cos(rot) * outerRadius,
      cy + Math.sin(rot) * outerRadius
    );
    rot += step;
    ctx.lineTo(
      cx + Math.cos(rot) * innerRadius,
      cy + Math.sin(rot) * innerRadius
    );
    rot += step;
  }
  ctx.lineTo(cx, cy - outerRadius);
  ctx.closePath();
  ctx.fill();
}

export function Confetti({ onComplete, intensity = 5 }: ConfettiProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const config = getConfig(intensity);

  useEffect(() => {
    if (config.count === 0) {
      onComplete?.();
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = window.innerWidth;
    const height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    const particles: Particle[] = [];
    for (let i = 0; i < config.count; i++) {
      const p = createParticle(width, height);
      p.vy -= Math.random() * 3;
      particles.push(p);
    }

    const gravity = 0.15;
    const friction = 0.99;
    const startTime = Date.now();
    let animationId: number;

    function animate() {
      const elapsed = Date.now() - startTime;
      const progress = elapsed / config.duration;

      ctx!.clearRect(0, 0, width, height);

      let allDone = true;

      for (const p of particles) {
        p.vy += gravity;
        p.vx *= friction;
        p.vy *= friction;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;

        if (progress > 0.6) {
          p.opacity = Math.max(0, 1 - (progress - 0.6) / 0.4);
        }

        if (p.opacity <= 0) continue;
        allDone = false;

        ctx!.save();
        ctx!.translate(p.x, p.y);
        ctx!.rotate((p.rotation * Math.PI) / 180);
        ctx!.globalAlpha = p.opacity;
        ctx!.fillStyle = p.color;

        if (p.shape === "star") {
          drawStar(ctx!, 0, 0, p.size);
        } else if (p.shape === "circle") {
          ctx!.beginPath();
          ctx!.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx!.fill();
        } else {
          ctx!.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        }

        ctx!.restore();
      }

      if (allDone || progress >= 1) {
        cancelAnimationFrame(animationId);
        onComplete?.();
        return;
      }

      animationId = requestAnimationFrame(animate);
    }

    animationId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationId);
  }, [config.count, config.duration, onComplete, intensity]);

  if (config.count === 0) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
    />
  );
}
