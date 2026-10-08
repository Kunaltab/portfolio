/* =========================================================
   THEME TOGGLE
   ========================================================= */
const root = document.documentElement;
const themeToggle = document.querySelector(".theme-toggle");
const backToTop = document.querySelector(".back-to-top");
const experienceButtons = [...document.querySelectorAll("[data-target]")];
const experienceCards = [...document.querySelectorAll(".experience-card")];

const savedTheme = window.localStorage.getItem("portfolio-theme");

if (savedTheme === "dark" || savedTheme === "light") {
  root.dataset.theme = savedTheme;
}

themeToggle?.addEventListener("click", () => {
  const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
  root.dataset.theme = nextTheme;
  window.localStorage.setItem("portfolio-theme", nextTheme);
});

/* =========================================================
   CURSOR GLOW + CUSTOM DOT
   ========================================================= */
const cursorGlow = document.querySelector(".cursor-glow");
const cursorDot = document.querySelector(".cursor-dot");
const cursorShadow = document.querySelector(".cursor-shadow");

if (cursorGlow && cursorDot && window.matchMedia("(pointer: fine)").matches) {
  let mouseX = 0, mouseY = 0;
  let currentX = 0, currentY = 0;
  let dotX = 0, dotY = 0;
  let shadowX = 0, shadowY = 0;

  document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  // Detect hover on interactive elements for the grow effect
  const interactiveSelectors = "a, button, input, textarea, select, [role='button'], .tool-chips span, .tag-list span, .metric-strip div, .certificate-card";

  document.addEventListener("mouseover", (e) => {
    if (e.target.closest(interactiveSelectors)) {
      cursorDot.classList.add("is-hovering");
    }
  });

  document.addEventListener("mouseout", (e) => {
    if (e.target.closest(interactiveSelectors)) {
      cursorDot.classList.remove("is-hovering");
    }
  });

  // Fade cursor when hovering text, headings, images
  const contentSelectors = "h1, h2, h3, p, li, span, img, figure, figcaption, strong, dt, dd, small, label";

  document.addEventListener("mouseover", (e) => {
    if (e.target.closest(contentSelectors)) {
      cursorDot.classList.add("is-clicking");
      if (cursorShadow) cursorShadow.classList.add("is-clicking");
    }
  });

  document.addEventListener("mouseout", (e) => {
    if (e.target.closest(contentSelectors)) {
      cursorDot.classList.remove("is-clicking");
      if (cursorShadow) cursorShadow.classList.remove("is-clicking");
    }
  });

  function animateCursor() {
    // Smooth lerp so glow trails slightly behind cursor
    currentX += (mouseX - currentX) * 0.12;
    currentY += (mouseY - currentY) * 0.12;
    cursorGlow.style.transform = `translate(${currentX - 190}px, ${currentY - 190}px)`;

    // Dot follows cursor closely
    dotX += (mouseX - dotX) * 0.25;
    dotY += (mouseY - dotY) * 0.25;
    cursorDot.style.transform = `translate(${dotX}px, ${dotY}px) translate(-50%, -50%)`;

    // Shadow trails behind with more delay
    shadowX += (mouseX - shadowX) * 0.08;
    shadowY += (mouseY - shadowY) * 0.08;
    if (cursorShadow) {
      cursorShadow.style.transform = `translate(${shadowX}px, ${shadowY}px) translate(-50%, -50%)`;
    }

    requestAnimationFrame(animateCursor);
  }

  animateCursor();
}

/* =========================================================
   3D INTERACTIVE WAVE MESH GRID (CANVAS)
   ========================================================= */
const heroGridCanvas = document.getElementById("heroGridCanvas");

if (heroGridCanvas) {
  const ctx = heroGridCanvas.getContext("2d");
  let width = 0, height = 0, dpr = 1;
  let animId = null;
  let isVisible = true;

  let cols = 38;
  let rows = 22;
  const spacing = 36;

  let mouseHeroX = -9999;
  let mouseHeroY = -9999;
  let targetTiltX = 0, targetTiltY = 0;
  let curTiltX = 0, curTiltY = 0;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = heroGridCanvas.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    heroGridCanvas.width = Math.floor(width * dpr);
    heroGridCanvas.height = Math.floor(height * dpr);
    ctx.scale(dpr, dpr);

    cols = Math.max(26, Math.min(48, Math.floor(width / 32)));
    rows = Math.max(16, Math.min(26, Math.floor(height / 26)));
  }

  window.addEventListener("resize", resize, { passive: true });
  resize();

  window.addEventListener("mousemove", (e) => {
    const rect = heroGridCanvas.getBoundingClientRect();
    if (
      e.clientY >= rect.top - 80 &&
      e.clientY <= rect.bottom + 80 &&
      e.clientX >= rect.left &&
      e.clientX <= rect.right
    ) {
      mouseHeroX = e.clientX - rect.left;
      mouseHeroY = e.clientY - rect.top;

      targetTiltX = ((e.clientY / window.innerHeight) - 0.5) * 0.16;
      targetTiltY = ((e.clientX / window.innerWidth) - 0.5) * 0.24;
    } else {
      mouseHeroX = -9999;
      mouseHeroY = -9999;
      targetTiltX = 0;
      targetTiltY = 0;
    }
  }, { passive: true });

  window.addEventListener("mouseleave", () => {
    mouseHeroX = -9999;
    mouseHeroY = -9999;
    targetTiltX = 0;
    targetTiltY = 0;
  });

  // Pause render loop when scrolled off screen
  const heroObserver = new IntersectionObserver(
    (entries) => {
      isVisible = entries[0].isIntersecting;
      if (isVisible && !animId) {
        lastTime = performance.now();
        animId = requestAnimationFrame(render);
      }
    },
    { threshold: 0.05 }
  );
  if (heroGridCanvas.parentElement) {
    heroObserver.observe(heroGridCanvas.parentElement);
  }

  let time = 0;
  let lastTime = performance.now();

  function render(now) {
    if (!isVisible) {
      animId = null;
      return;
    }

    const dt = Math.min((now - lastTime) / 1000, 0.1);
    lastTime = now;
    time += dt * 1.5;

    curTiltX += (targetTiltX - curTiltX) * 0.06;
    curTiltY += (targetTiltY - curTiltY) * 0.06;

    ctx.clearRect(0, 0, width, height);

    const isDark = document.documentElement.dataset.theme === "dark";
    const lineBase = isDark ? "rgba(255, 216, 61," : "rgba(17, 17, 17,";

    const centerX = width * 0.52;
    const centerY = height * 0.48;

    const pitch = 1.02 + curTiltX;
    const yaw = curTiltY;
    const cosP = Math.cos(pitch), sinP = Math.sin(pitch);
    const cosY = Math.cos(yaw), sinY = Math.sin(yaw);

    const fov = 480;
    const camZ = 320;

    const grid = [];

    for (let r = 0; r < rows; r++) {
      grid[r] = [];
      const normY = (r - rows / 2) / (rows / 2);

      for (let c = 0; c < cols; c++) {
        const normX = (c - cols / 2) / (cols / 2);

        const x3d = (c - cols / 2) * spacing;
        const y3d = (r - rows / 2) * spacing * 1.1;

        // Base 3D flowing wave
        let z = Math.sin(c * 0.28 + time) * Math.cos(r * 0.34 + time * 0.8) * 18;
        z += Math.sin((c + r) * 0.2 - time * 1.3) * 10;

        const rotX = x3d * cosY + y3d * sinY;
        const tempY = -x3d * sinY + y3d * cosY;
        const rotY = tempY * cosP - z * sinP;
        const rotZ = tempY * sinP + z * cosP;

        const scale = fov / (camZ + rotZ + 200);
        let px = centerX + rotX * scale;
        let py = centerY + rotY * scale;

        // Interactive 3D mouse wave ripple
        if (mouseHeroX > -1000) {
          const dx = px - mouseHeroX;
          const dy = py - mouseHeroY;
          const dist = Math.hypot(dx, dy);
          const maxDist = 220;

          if (dist < maxDist) {
            const rippleForce = (1 - dist / maxDist);
            const waveOffset = Math.sin(dist * 0.08 - time * 6) * rippleForce * 30;
            py += waveOffset * scale * 1.3;
          }
        }

        const distFromCenter = Math.hypot(normX * 0.9, normY * 1.1);
        const alpha = Math.max(0, Math.min(1, (1 - distFromCenter * 0.76)));

        grid[r][c] = { x: px, y: py, alpha };
      }
    }

    // Horizontal lines
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols - 1; c++) {
        const p1 = grid[r][c];
        const p2 = grid[r][c + 1];
        const a = (p1.alpha + p2.alpha) * 0.5;

        if (a > 0.02) {
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `${lineBase} ${a * (isDark ? 0.35 : 0.2)})`;
          ctx.lineWidth = isDark ? 1.4 : 1.2;
          ctx.stroke();
        }
      }
    }

    // Vertical lines
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows - 1; r++) {
        const p1 = grid[r][c];
        const p2 = grid[r + 1][c];
        const a = (p1.alpha + p2.alpha) * 0.5;

        if (a > 0.02) {
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `${lineBase} ${a * (isDark ? 0.3 : 0.16)})`;
          ctx.lineWidth = isDark ? 1.4 : 1.2;
          ctx.stroke();
        }
      }
    }

    // Glowing intersection nodes near cursor
    if (mouseHeroX > -1000) {
      for (let r = 0; r < rows; r += 2) {
        for (let c = 0; c < cols; c += 2) {
          const p = grid[r][c];
          const dist = Math.hypot(p.x - mouseHeroX, p.y - mouseHeroY);
          if (dist < 180 && p.alpha > 0.1) {
            const dotAlpha = (1 - dist / 180) * p.alpha;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
            ctx.fillStyle = isDark ? `rgba(255, 216, 61, ${dotAlpha * 0.95})` : `rgba(17, 17, 17, ${dotAlpha * 0.75})`;
            ctx.fill();
          }
        }
      }
    }

    animId = requestAnimationFrame(render);
  }

  animId = requestAnimationFrame(render);
}

/* =========================================================
   3D CARD GRID TILT ANIMATION
   ========================================================= */
if (window.matchMedia("(pointer: fine)").matches) {
  const tiltElements = document.querySelectorAll(
    ".project-preview, .portrait-art, .rest-grid article, .metric-strip div"
  );

  tiltElements.forEach((el) => {
    el.addEventListener("mousemove", (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = -((y - centerY) / centerY) * 11;
      const rotateY = ((x - centerX) / centerX) * 11;

      el.style.transform = `perspective(850px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-4px) translateZ(12px)`;
    });

    el.addEventListener("mouseleave", () => {
      el.style.transform = "";
    });
  });
}

/* =========================================================
   EXPERIENCE TABS
   ========================================================= */
function setActiveExperience(id) {
  experienceButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.target === id);
  });

  experienceCards.forEach((card) => {
    card.classList.toggle("is-current", card.id === id);
  });
}

experienceButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const target = document.getElementById(button.dataset.target);

    if (!target) {
      return;
    }

    setActiveExperience(target.id);
    target.scrollIntoView({ block: "center", behavior: "smooth" });
  });
});

const expObserver = new IntersectionObserver(
  (entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (visible?.target?.id) {
      setActiveExperience(visible.target.id);
    }
  },
  {
    rootMargin: "-35% 0px -35% 0px",
    threshold: [0.2, 0.45, 0.7],
  },
);

experienceCards.forEach((card) => expObserver.observe(card));

/* =========================================================
   SCROLL REVEAL
   ========================================================= */
const revealEls = [...document.querySelectorAll("[data-reveal]")];

if (revealEls.length > 0 && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-revealed");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
  );

  revealEls.forEach((el) => revealObserver.observe(el));
} else {
  // Immediately show everything if reduced motion or no elements
  revealEls.forEach((el) => el.classList.add("is-revealed"));
}

/* =========================================================
   COUNTER ANIMATION
   ========================================================= */
const counters = [...document.querySelectorAll(".counter[data-target]")];

function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  const suffix = el.dataset.suffix || "";
  const duration = 900;
  const start = performance.now();

  function tick(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(eased * target);
    el.textContent = current + suffix;

    if (progress < 1) {
      requestAnimationFrame(tick);
    }
  }

  requestAnimationFrame(tick);
}

if (counters.length > 0) {
  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach((counter) => counterObserver.observe(counter));
}

/* =========================================================
   ACTIVE NAV HIGHLIGHTING
   ========================================================= */
const navLinks = [...document.querySelectorAll(".nav-links a[href^='#']")];
const sections = navLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

const navObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.id || entry.target.closest("[id]")?.id;
        navLinks.forEach((link) => {
          link.classList.toggle("is-active", link.getAttribute("href") === `#${id}`);
        });
      }
    });
  },
  { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
);

sections.forEach((section) => navObserver.observe(section));

/* =========================================================
   BACK TO TOP
   ========================================================= */
function updateBackToTop() {
  backToTop?.classList.toggle("is-visible", window.scrollY > 620);
}

window.addEventListener("scroll", updateBackToTop, { passive: true });
updateBackToTop();



