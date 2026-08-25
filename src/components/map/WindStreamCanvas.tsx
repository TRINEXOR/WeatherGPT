import React, { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

interface WindStreamCanvasProps {
  windSpeedKmh: number;
  windDirectionDeg: number;
  opacity?: number;
}

interface Particle {
  x: number;
  y: number;
  age: number;
  maxAge: number;
  speed: number;
}

export const WindStreamCanvas: React.FC<WindStreamCanvasProps> = ({
  windSpeedKmh,
  windDirectionDeg,
  opacity = 0.85,
}) => {
  const map = useMap();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameId = useRef<number | null>(null);

  useEffect(() => {
    const container = map.getContainer();
    const canvas = document.createElement('canvas');
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '450';
    canvas.style.opacity = String(opacity);

    container.appendChild(canvas);
    canvasRef.current = canvas;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = container.clientWidth);
    let height = (canvas.height = container.clientHeight);

    const onResize = () => {
      width = canvas.width = container.clientWidth;
      height = canvas.height = container.clientHeight;
    };
    map.on('resize', onResize);
    map.on('zoomstart', () => { if (canvas) canvas.style.opacity = '0'; });
    map.on('zoomend', () => { if (canvas) canvas.style.opacity = String(opacity); });

    // Calculate wind vector in radians
    // Meteorological wind direction: direction the wind is coming from. Flow vector is opposite (dir + 180).
    const flowRad = ((windDirectionDeg + 180) * Math.PI) / 180;
    const baseSpeed = Math.max(1.2, Math.min(6.5, windSpeedKmh * 0.18));
    const vx = Math.sin(flowRad) * baseSpeed;
    const vy = -Math.cos(flowRad) * baseSpeed;

    // Number of stream particles
    const particleCount = Math.min(220, Math.floor((width * height) / 3000));
    const particles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        age: Math.floor(Math.random() * 60),
        maxAge: 40 + Math.floor(Math.random() * 50),
        speed: 0.8 + Math.random() * 0.5,
      });
    }

    // Color gradient based on wind intensity
    const getWindColor = (speedKmh: number, alpha: number) => {
      if (speedKmh > 50) return `rgba(239, 68, 68, ${alpha})`; // Red / Gale
      if (speedKmh > 35) return `rgba(245, 158, 11, ${alpha})`; // Amber / Strong
      if (speedKmh > 20) return `rgba(56, 189, 248, ${alpha})`; // Cyan / Moderate
      return `rgba(52, 211, 153, ${alpha})`; // Emerald / Light breeze
    };

    const render = () => {
      // Semi-transparent clearing gives smooth particle trails
      ctx.fillStyle = 'rgba(10, 10, 10, 0.12)';
      ctx.fillRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.age++;

        if (p.age >= p.maxAge || p.x < 0 || p.x > width || p.y < 0 || p.y > height) {
          p.x = Math.random() * width;
          p.y = Math.random() * height;
          p.age = 0;
          p.maxAge = 40 + Math.floor(Math.random() * 50);
          continue;
        }

        // Slight organic atmospheric turbulence
        const turbulence = Math.sin(p.y * 0.02 + p.age * 0.05) * 0.3;
        const curVx = vx * p.speed + turbulence;
        const curVy = vy * p.speed;

        const nextX = p.x + curVx;
        const nextY = p.y + curVy;

        const progress = p.age / p.maxAge;
        const alpha = Math.sin(progress * Math.PI) * 0.85;

        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(nextX, nextY);
        ctx.strokeStyle = getWindColor(windSpeedKmh, alpha);
        ctx.lineWidth = 1.6;
        ctx.lineCap = 'round';
        ctx.stroke();

        p.x = nextX;
        p.y = nextY;
      }

      animFrameId.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
      map.off('resize', onResize);
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
    };
  }, [map, windSpeedKmh, windDirectionDeg, opacity]);

  return null;
};
