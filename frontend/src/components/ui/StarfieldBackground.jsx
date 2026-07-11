import React, { useEffect, useRef } from 'react';

const StarfieldBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationId;
    let width, height, cx, cy;

    const rand = (min, max) => Math.random() * (max - min) + min;

    // ── Star layers ─────────────────────────────────────────────────────────────
    // Three depth layers that rotate at slightly different speeds to give
    // a parallax / depth-of-field feel, just like a real galaxy.
    const LAYERS = [
      { count: 160, speed: 0.00018, radiusRange: [0.3, 0.9],  orbitRange: [0.05, 0.55] },
      { count: 100, speed: 0.00010, radiusRange: [0.9, 1.6],  orbitRange: [0.25, 0.80] },
      { count:  40, speed: 0.00005, radiusRange: [1.6, 2.5],  orbitRange: [0.50, 0.95] },
    ];

    // Each star lives at a polar position (angle + distance from centre)
    // so rotation is just incrementing the angle.
    const starGroups = [];

    function initStars() {
      starGroups.length = 0;

      LAYERS.forEach(({ count, speed, radiusRange, orbitRange }) => {
        const stars = [];
        for (let i = 0; i < count; i++) {
          const dist = rand(
            Math.min(width, height) * orbitRange[0],
            Math.min(width, height) * orbitRange[1],
          );
          stars.push({
            angle:        rand(0, Math.PI * 2),          // initial polar angle
            dist,                                         // distance from centre
            radius:       rand(...radiusRange),
            opacity:      rand(0.25, 1.0),
            twinkleSpeed: rand(0.004, 0.018),
            twinklePhase: rand(0, Math.PI * 2),
            hue:          Math.random() < 0.65 ? 0 : Math.random() < 0.5 ? 220 : 270,
            sat:          Math.random() < 0.65 ? 0 : rand(55, 100),
            bright:       Math.random() < 0.05,           // star with cross spike
          });
        }
        starGroups.push({ stars, speed });
      });
    }

    function resize() {
      width  = canvas.width  = window.innerWidth;
      height = canvas.height = window.innerHeight;
      cx = width  / 2;
      cy = height / 2;
      initStars();
    }

    // ── Nebula (redrawn every frame, very cheap) ─────────────────────────────
    function drawNebula(t) {
      // Slowly drifting nebula blobs using sin/cos offsets
      const drift = (a, s, amp) => Math.sin(t * s) * amp;

      const blobs = [
        {
          x: cx + cx * 0.30 + drift(0, 0.07, 40),
          y: cy - cy * 0.45 + drift(1, 0.05, 30),
          r: Math.min(width, height) * 0.38,
          color: [140, 60, 220],
          alpha: 0.06,
        },
        {
          x: cx - cx * 0.50 + drift(2, 0.06, 35),
          y: cy + cy * 0.15 + drift(3, 0.08, 25),
          r: Math.min(width, height) * 0.32,
          color: [40, 80, 200],
          alpha: 0.05,
        },
        {
          x: cx + cx * 0.05 + drift(4, 0.04, 20),
          y: cy + cy * 0.60 + drift(5, 0.06, 30),
          r: Math.min(width, height) * 0.28,
          color: [200, 50, 160],
          alpha: 0.045,
        },
      ];

      blobs.forEach(({ x, y, r, color, alpha }) => {
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0,   `rgba(${color},${alpha})`);
        g.addColorStop(0.5, `rgba(${color},${alpha * 0.5})`);
        g.addColorStop(1,   'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    // ── Individual star ───────────────────────────────────────────────────────
    function drawStar(star, t) {
      // Polar → Cartesian (centred on canvas)
      const x = cx + Math.cos(star.angle) * star.dist;
      const y = cy + Math.sin(star.angle) * star.dist;

      // Smooth twinkle
      const twinkle = 0.5 + 0.5 * Math.sin(t * star.twinkleSpeed * 60 + star.twinklePhase);
      const opacity  = 0.12 + 0.88 * twinkle * star.opacity;

      ctx.save();
      ctx.globalAlpha = opacity;

      // Cross spike for prominent stars
      if (star.bright) {
        const spike = star.radius * 5;
        ctx.strokeStyle = star.sat > 0
          ? `hsl(${star.hue}, ${star.sat}%, 90%)`
          : '#ffffff';
        ctx.lineWidth   = 0.7;
        ctx.globalAlpha = opacity * 0.55;
        ctx.beginPath();
        ctx.moveTo(x - spike, y); ctx.lineTo(x + spike, y);
        ctx.moveTo(x, y - spike); ctx.lineTo(x, y + spike);
        ctx.stroke();
        ctx.globalAlpha = opacity;
      }

      // Glow halo for larger stars
      if (star.radius > 1.0) {
        const glow = ctx.createRadialGradient(x, y, 0, x, y, star.radius * 5);
        const col   = star.sat > 0
          ? `${star.hue}, ${star.sat}%, 85%`
          : '0, 0%, 100%';
        glow.addColorStop(0,   `hsla(${col}, 0.22)`);
        glow.addColorStop(1,   'hsla(0,0%,0%,0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(x, y, star.radius * 5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Core dot
      ctx.fillStyle = star.sat > 0
        ? `hsl(${star.hue}, ${star.sat}%, 93%)`
        : '#ffffff';
      ctx.beginPath();
      ctx.arc(x, y, star.radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    // ── Main loop ─────────────────────────────────────────────────────────────
    function animate(timestamp) {
      const t = timestamp / 1000;

      ctx.clearRect(0, 0, width, height);

      // Deep space base
      ctx.fillStyle = '#050516';
      ctx.fillRect(0, 0, width, height);

      drawNebula(t);

      // Rotate each layer & draw its stars
      starGroups.forEach(({ stars, speed }) => {
        stars.forEach(star => {
          star.angle += speed; // slow galaxy rotation
          drawStar(star, t);
        });
      });

      animationId = requestAnimationFrame(animate);
    }

    resize();
    window.addEventListener('resize', resize);
    animationId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    />
  );
};

export default StarfieldBackground;
