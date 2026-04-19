// Floating XP text effect
export const showXPFloat = (amount, x, y) => {
  const el = document.createElement('div');
  el.className = 'xp-float';
  el.textContent = `+${amount} XP`;
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1200);
};

// Confetti burst for level up
export const triggerConfetti = () => {
  const colors = ['#7c3aed', '#06b6d4', '#ec4899', '#10b981', '#f59e0b', '#a78bfa', '#fff'];
  const count = 80;

  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      const el = document.createElement('div');
      el.className = 'confetti-piece';

      const size = Math.random() * 10 + 5;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const startX = Math.random() * window.innerWidth;
      const rotation = Math.random() * 360;
      const shape = Math.random() > 0.5 ? '50%' : '2px';

      el.style.cssText = `
        left: ${startX}px;
        top: -20px;
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border-radius: ${shape};
        transform: rotate(${rotation}deg);
        animation-duration: ${1.5 + Math.random() * 1.5}s;
        animation-delay: ${Math.random() * 0.5}s;
      `;

      document.body.appendChild(el);
      setTimeout(() => el.remove(), 3000);
    }, Math.random() * 300);
  }
};

// Particle burst on habit complete
export const particleBurst = (x, y) => {
  const colors = ['#7c3aed', '#06b6d4', '#a78bfa', '#c4b5fd'];
  for (let i = 0; i < 12; i++) {
    const el = document.createElement('div');
    const angle = (i / 12) * 360;
    const distance = 40 + Math.random() * 30;
    const color = colors[Math.floor(Math.random() * colors.length)];

    el.style.cssText = `
      position: fixed;
      left: ${x}px;
      top: ${y}px;
      width: 6px;
      height: 6px;
      background: ${color};
      border-radius: 50%;
      pointer-events: none;
      z-index: 9999;
      transition: all 0.6s ease-out;
      box-shadow: 0 0 6px ${color};
    `;
    document.body.appendChild(el);

    requestAnimationFrame(() => {
      const rad = (angle * Math.PI) / 180;
      el.style.transform = `translate(${Math.cos(rad) * distance}px, ${Math.sin(rad) * distance}px) scale(0)`;
      el.style.opacity = '0';
    });

    setTimeout(() => el.remove(), 700);
  }
};
