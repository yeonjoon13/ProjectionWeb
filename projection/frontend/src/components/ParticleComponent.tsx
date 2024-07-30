// components/ParticleCircle.tsx
'use client'
import React, { useEffect, useRef } from 'react';

const ParticleCircle: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: { x: number; y: number; angle: number; radius: number }[] = [];
    const numParticles = 100;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const circleRadius = 150;

    for (let i = 0; i < numParticles; i++) {
      const angle = (i / numParticles) * 2 * Math.PI;
      particles.push({
        x: centerX + circleRadius * Math.cos(angle),
        y: centerY + circleRadius * Math.sin(angle),
        angle,
        radius: 3,
      });
    }

    const drawParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, 2 * Math.PI);
        ctx.fillStyle = '#ff0000';
        ctx.fill();
        ctx.closePath();
      });

      particles.forEach(p => {
        p.angle += 0.01;
        p.x = centerX + circleRadius * Math.cos(p.angle);
        p.y = centerY + circleRadius * Math.sin(p.angle);
      });

      requestAnimationFrame(drawParticles);
    };

    drawParticles();
  }, []);

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%', position: 'absolute' }} />;
};

export default ParticleCircle;
