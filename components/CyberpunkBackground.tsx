'use client';

import { useEffect, useRef, useState } from 'react';

export default function CyberpunkBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [particleCount, setParticleCount] = useState(30);

  // Detect mobile on client-side
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setParticleCount(mobile ? 15 : 30);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Stars
    const stars: Array<{ x: number; y: number; size: number; opacity: number; speed: number }> = [];
    const starCount = isMobile ? 50 : 100;

    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 1,
        opacity: Math.random(),
        speed: Math.random() * 0.02 + 0.01,
      });
    }

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw stars
      stars.forEach((star) => {
        star.opacity += star.speed;
        if (star.opacity > 1) {
          star.opacity = 1;
          star.speed = -star.speed;
        } else if (star.opacity < 0.2) {
          star.opacity = 0.2;
          star.speed = -star.speed;
        }

        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      });

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [isMobile]);

  return (
    <>
      {/* Layer 1: Base gradient */}
      <div className="cyberpunk-base" />

      {/* Layer 2: Nebula blobs */}
      <div className="cyberpunk-nebula">
        <div className="nebula-blob nebula-blob-1" />
        <div className="nebula-blob nebula-blob-2" />
        <div className="nebula-blob nebula-blob-3" />
        <div className="nebula-blob nebula-blob-4" />
      </div>

      {/* Layer 3: Grid neon */}
      <div className="cyberpunk-grid">
        <div className="grid-lines" />
      </div>

      {/* Layer 4: Stars canvas */}
      <canvas ref={canvasRef} className="cyberpunk-stars" />

      {/* Layer 5: Floating particles */}
      <div className="cyberpunk-particles">
        {Array.from({ length: particleCount }).map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${15 + Math.random() * 10}s`,
            }}
          />
        ))}
      </div>

      {/* Layer 6: Glow behind SUKI */}
      <div className="cyberpunk-suki-glow" />

      {/* Layer 7: Scan lines */}
      <div className="cyberpunk-scanlines" />

      <style jsx>{`
        /* Layer 1: Base gradient */
        .cyberpunk-base {
          position: fixed;
          inset: 0;
          z-index: -7;
          background: radial-gradient(circle at 50% 50%, #1a0a2e 0%, #0a0612 100%);
          animation: baseShift 10s ease-in-out infinite alternate;
        }

        @keyframes baseShift {
          0% {
            background: radial-gradient(circle at 50% 50%, #1a0a2e 0%, #0a0612 100%);
          }
          100% {
            background: radial-gradient(circle at 45% 55%, #1a0a2e 0%, #0a0612 100%);
          }
        }

        /* Layer 2: Nebula blobs */
        .cyberpunk-nebula {
          position: fixed;
          inset: 0;
          z-index: -6;
          pointer-events: none;
        }

        .nebula-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          opacity: 1;
        }

        .nebula-blob-1 {
          width: 600px;
          height: 600px;
          top: -200px;
          right: -100px;
          background: rgba(139, 0, 255, 0.15);
          animation: nebula1 25s ease-in-out infinite alternate;
        }

        .nebula-blob-2 {
          width: 500px;
          height: 500px;
          bottom: -100px;
          left: -100px;
          background: rgba(255, 0, 128, 0.1);
          animation: nebula2 30s ease-in-out infinite alternate;
        }

        .nebula-blob-3 {
          width: 400px;
          height: 400px;
          top: 50%;
          left: 30%;
          background: rgba(0, 200, 255, 0.08);
          animation: nebula3 20s ease-in-out infinite alternate;
        }

        .nebula-blob-4 {
          width: 450px;
          height: 450px;
          top: 20%;
          left: 60%;
          background: rgba(139, 0, 255, 0.12);
          animation: nebula4 28s ease-in-out infinite alternate;
        }

        @keyframes nebula1 {
          0% {
            transform: translate(0, 0);
          }
          100% {
            transform: translate(-50px, 50px);
          }
        }

        @keyframes nebula2 {
          0% {
            transform: translate(0, 0);
          }
          100% {
            transform: translate(50px, -30px);
          }
        }

        @keyframes nebula3 {
          0% {
            transform: translate(0, 0);
          }
          100% {
            transform: translate(40px, 40px);
          }
        }

        @keyframes nebula4 {
          0% {
            transform: translate(0, 0);
          }
          100% {
            transform: translate(-40px, 30px);
          }
        }

        /* Layer 3: Grid neon */
        .cyberpunk-grid {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          height: 40%;
          z-index: -5;
          perspective: 500px;
          overflow: hidden;
          pointer-events: none;
        }

        .grid-lines {
          position: absolute;
          inset: 0;
          background-image: repeating-linear-gradient(
              0deg,
              transparent,
              transparent 79px,
              rgba(139, 0, 255, 0.3) 79px,
              rgba(139, 0, 255, 0.3) 80px
            ),
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent 79px,
              rgba(139, 0, 255, 0.3) 79px,
              rgba(139, 0, 255, 0.3) 80px
            );
          background-size: 80px 80px;
          transform: rotateX(60deg) translateY(50%);
          animation: gridMove 3s linear infinite;
        }

        @keyframes gridMove {
          0% {
            background-position: 0 0;
          }
          100% {
            background-position: 0 80px;
          }
        }

        /* Layer 4: Stars canvas */
        .cyberpunk-stars {
          position: fixed;
          inset: 0;
          z-index: -4;
          pointer-events: none;
        }

        /* Layer 5: Floating particles */
        .cyberpunk-particles {
          position: fixed;
          inset: 0;
          z-index: -3;
          pointer-events: none;
          overflow: hidden;
        }

        .particle {
          position: absolute;
          bottom: -10px;
          width: 6px;
          height: 6px;
          background: rgba(139, 0, 255, 0.8);
          border-radius: 50%;
          box-shadow: 0 0 10px rgba(139, 0, 255, 0.8), 0 0 20px rgba(139, 0, 255, 0.4);
          animation: particleFloat 20s linear infinite;
          transform: rotate(45deg);
        }

        .particle:nth-child(3n + 1) {
          background: rgba(255, 0, 128, 0.8);
          box-shadow: 0 0 10px rgba(255, 0, 128, 0.8), 0 0 20px rgba(255, 0, 128, 0.4);
        }

        .particle:nth-child(3n + 2) {
          background: rgba(0, 200, 255, 0.8);
          box-shadow: 0 0 10px rgba(0, 200, 255, 0.8), 0 0 20px rgba(0, 200, 255, 0.4);
        }

        @keyframes particleFloat {
          0% {
            transform: translateY(0) translateX(0) rotate(45deg);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(-100vh) translateX(calc(sin(1) * 50px)) rotate(45deg);
            opacity: 0;
          }
        }

        /* Layer 6: Glow behind SUKI */
        .cyberpunk-suki-glow {
          position: fixed;
          bottom: 0;
          right: 0;
          width: 50%;
          height: 80%;
          z-index: 0;
          pointer-events: none;
          background: radial-gradient(circle at 70% 80%, rgba(139, 0, 255, 0.2) 0%, transparent 50%);
          animation: glowPulse 4s ease-in-out infinite alternate;
        }

        @keyframes glowPulse {
          0% {
            opacity: 0.15;
          }
          100% {
            opacity: 0.25;
          }
        }

        /* Layer 7: Scan lines */
        .cyberpunk-scanlines {
          position: fixed;
          inset: 0;
          z-index: 10;
          pointer-events: none;
          background: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 1px,
            rgba(255, 255, 255, 0.03) 1px,
            rgba(255, 255, 255, 0.03) 2px
          );
        }

        /* Mobile optimizations */
        @media (max-width: 768px) {
          .cyberpunk-grid {
            display: none;
          }

          .nebula-blob {
            filter: blur(60px);
          }

          .nebula-blob-1,
          .nebula-blob-2 {
            width: 400px;
            height: 400px;
          }

          .nebula-blob-3,
          .nebula-blob-4 {
            width: 300px;
            height: 300px;
          }
        }
      `}</style>
    </>
  );
}
