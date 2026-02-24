/* ═══════════════════════════════════════════════════
   FIKRA — Core Application Logic v5.5
   Refined and Optimized.
   ═══════════════════════════════════════════════════ */

// ── DATA & STATE ──────────────────────────────────
const MOCK_DATA = [
  {
    id: "FK-1092",
    idea: "What if there was a barber shop where you pay with content — post a review, get a free cut.",
    user: "@zah_creates",
    city: "Riyadh",
    remixes: 142,
    energy: 9800,
    tag: "Business",
    picked: false,
  },
  {
    id: "FK-2281",
    idea: "An app that translates silence. You record dead air and it tells you what the vibe was.",
    user: "@moody_dev",
    city: "Cairo",
    remixes: 87,
    energy: 6400,
    tag: "Tech",
    picked: true,
  },
  {
    id: "FK-7740",
    idea: "Youth-run underground radio that broadcasts from random rooftops every Friday night.",
    user: "@streetfreq",
    city: "Amman",
    remixes: 310,
    energy: 15200,
    tag: "Culture",
    picked: false,
  },
  {
    id: "FK-0032",
    idea: "A sneaker brand that drops 1 pair per city per week. Exclusivity is the whole product.",
    user: "@drip_theory",
    city: "Dubai",
    remixes: 200,
    energy: 11300,
    tag: "Business",
    picked: false,
  },
  {
    id: "FK-8812",
    idea: "Mental health check-ins disguised as daily mood playlists, auto-generated from your listening.",
    user: "@freq_mind",
    city: "Cairo",
    remixes: 415,
    energy: 21000,
    tag: "Wellness",
    picked: true,
  },
  {
    id: "FK-D1",
    idea: "Solar-powered water synthesisers for arid regions.",
    user: "@desert_tech",
    city: "Dubai",
    remixes: 8,
    energy: 1500,
    tag: "Future",
    picked: true,
  },
  {
    id: "AD-001",
    isAd: true,
    title: "ENCRYPT YOUR MIND",
    idea: "The surface web is compromised. Shield your neural pathways. Join the Underground Protocol.",
    image:
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=600",
    tag: "PROPAGANDA",
    energy: 99999,
  },
  {
    id: "FK-D2",
    idea: "Decentralized logistics for rural agriculture co-ops.",
    user: "@farm_chain",
    city: "Casablanca",
    remixes: 15,
    energy: 3100,
    tag: "Tech",
    picked: false,
  },
  {
    id: "AD-002",
    isAd: true,
    title: "GLOBAL SYNC ACTIVE",
    idea: "1.2M nodes connected. Do not disconnect during the feed transfer. The system requires your processing power.",
    image:
      "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=600",
    tag: "SYSTEM DIRECTIVE",
    energy: 99999,
  },
  {
    id: "AD-003",
    isAd: true,
    title: "BECOME THE ANOMALY",
    idea: "Break out of the algorithm. Remix the truth. We are looking for operators.",
    image:
      "https://images.unsplash.com/photo-1614729939124-032f0b56c9ce?auto=format&fit=crop&q=80&w=600",
    tag: "RECRUITMENT",
    energy: 99999,
  },
];

let appFeedData = [];
let likedPosts = new Set();
let activeFilter = "all";
let remixingPostId = null;
let activeTag = null;
let selectedColor = "#7B2FFF";

// Visuals
let particles = [];
let bgCanvas, ctx;
let cardObserver = null;

// ── INITIALIZATION ────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  bgCanvas = document.getElementById("bg-canvas");
  if (bgCanvas) ctx = bgCanvas.getContext("2d");

  initApp();
});

function initApp() {
  loadPersistence();
  loadProfile();

  const path = window.location.pathname;
  const page = path.split("/").pop() || "index.html";

  if (page === "index.html" || page === "") {
    renderFeed();
    updateFeedStats();
  } else if (page === "dashboard.html") {
    populateDashboard();
  } else if (page === "profile.html") {
    populateProfileScreen();
  } else if (page === "drop.html") {
    // Drop-specific init if any
  }

  if (ctx) {
    initParticles();
    animateParticles();
  }

  setupEventListeners();
  setupCardObserver();
}

function loadPersistence() {
  try {
    const savedFeed = localStorage.getItem("fikra_feed_vlv");
    appFeedData = savedFeed ? JSON.parse(savedFeed) : [...MOCK_DATA];

    const savedLikes = localStorage.getItem("fikra_likes_vlv");
    if (savedLikes) likedPosts = new Set(JSON.parse(savedLikes));
  } catch (e) {
    appFeedData = [...MOCK_DATA];
  }
}

function saveData() {
  try {
    localStorage.setItem("fikra_feed_vlv", JSON.stringify(appFeedData));
    localStorage.setItem("fikra_likes_vlv", JSON.stringify([...likedPosts]));
  } catch (e) {
    console.warn("STORAGE_ERROR: Persistence failed");
  }
}

function siteNav(screenId, navEl) {
  // If we're on a different page, just redirect
  const path = window.location.pathname;
  const currentPage = path.split("/").pop() || "index.html";
  const targetPage = screenId === "feed" ? "index.html" : `${screenId}.html`;

  if (currentPage !== targetPage) {
    window.location.href = targetPage;
    return;
  }

  const gl = document.getElementById("tac-glitch");
  if (gl) {
    gl.classList.add("active");
    setTimeout(() => gl.classList.remove("active"), 400);
  }

  // Hide all screens (internal SPA logic if overlapping screens exist)
  document.querySelectorAll(".screen").forEach((s) => {
    s.classList.remove("active");
    s.style.opacity = "0";
  });

  // Show target screen
  const target = document.getElementById(screenId + "-screen");
  if (target) {
    target.classList.add("active");
    setTimeout(() => {
      target.style.transition = "opacity 0.4s ease";
      target.style.opacity = "1";
    }, 50);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Update nav links
  document
    .querySelectorAll(".fikra-nav-link")
    .forEach((l) => l.classList.remove("active"));
  if (navEl) navEl.classList.add("active");

  // Screen-specific logic (for SPA transitions if still used)
  const isSPAEntry = target && !window.location.pathname.includes(targetPage);
  if (!isSPAEntry) return;

  switch (screenId) {
    case "dashboard":
      populateDashboard();
      break;
    case "feed":
      setTimeout(() => {
        observeCards();
      }, 150);
      break;
    case "profile":
      populateProfileScreen();
      break;
  }
}

function setupEventListeners() {
  // Modal & Screens Exit
  ["close-drop-btn", "close-remix-btn", "back-to-feed-btn"].forEach((id) => {
    const btn = document.getElementById(id);
    if (!btn) return;

    btn.onclick = (e) => {
      if (id === "back-to-feed-btn") resetDropForm();
      // Let the standard <a> tag handle navigation if it has an href
      if (btn.tagName === "A" && btn.getAttribute("href")) return;

      e.preventDefault();
      window.location.href = "index.html";
    };
  });

  // Filter Chips
  document.querySelectorAll(".filter-chip").forEach((chip) => {
    chip.addEventListener("click", (e) => {
      activeFilter = e.currentTarget.dataset.filter;
      document.querySelectorAll(".filter-chip").forEach((c) => {
        c.classList.toggle("active", c.dataset.filter === activeFilter);
      });
      renderFeed();
    });
  });

  // Form Handling
  const fikraForm = document.getElementById("fikra-form");
  if (fikraForm) fikraForm.addEventListener("submit", handleDropSubmit);

  // Media Options
  ["voice-btn", "video-btn"].forEach((id) => {
    const btn = document.getElementById(id);
    if (btn) {
      btn.onclick = () => {
        if (btn.classList.contains("active")) {
          btn.classList.remove("active");
          btn.innerHTML = btn.dataset.originalHTML;
          showToast("Media cleared.");
          return;
        }
        if (!btn.dataset.originalHTML) btn.dataset.originalHTML = btn.innerHTML;

        // Simulate recording
        btn.classList.add("recording");
        btn.innerHTML = `<span class="ms-btn-text" style="color:#FF3B3B; animation: pulse 1s infinite;">RECORDING...</span>`;

        setTimeout(() => {
          btn.classList.remove("recording");
          btn.classList.add("active");
          const type = id === "voice-btn" ? "VOICE_INTEL" : "VIDEO_INTEL";
          btn.innerHTML = `<span class="ms-btn-text" style="color:#00FF41;">[x] ${type}_SECURED</span>`;
          showToast(`✅ ${type} Secured`);
        }, 2000);
      };
    }
  });

  // Text Input Interactions (Mission Launch)
  const ideaInput = document.getElementById("idea-input");
  if (ideaInput) {
    ideaInput.addEventListener("input", () => {
      const len = ideaInput.value.length;
      const counter = document.getElementById("idea-char-counter");
      if (counter) counter.textContent = `${len} / 200`;

      // Signal Strength HUD
      const signalFill = document.getElementById("ms-signal-fill");
      if (signalFill) {
        const signalPct = Math.min(100, Math.floor((len / 50) * 100)); // Fills at 50 chars
        signalFill.style.width = `${signalPct}%`;
        if (signalPct === 100) signalFill.style.background = "#FF3B3B";
        else signalFill.style.background = "var(--tac-cyan)";
      }

      // System Logs Reactivity
      const msLogs = document.querySelector(".ms-system-logs");
      if (msLogs && Math.random() > 0.6) {
        const logs = [
          "> ANALYZING COGNITIVE PATTERN...",
          "> ENCRYPTING PAYLOAD...",
          "> OPTIMIZING SIGNAL ROUTING...",
          "> TRACING NEURAL PATHWAYS...",
          "> COMPILING INTEL DATA...",
        ];
        const logEntry = document.createElement("div");
        logEntry.className = "ms-log-entry";
        logEntry.textContent = logs[Math.floor(Math.random() * logs.length)];
        logEntry.style.color = Math.random() > 0.8 ? "#FF3B3B" : "#00FF41";
        msLogs.appendChild(logEntry);
        msLogs.scrollTop = msLogs.scrollHeight;
        if (msLogs.children.length > 6) msLogs.removeChild(msLogs.firstChild);
      }

      // Protocol Checklist
      const checkLen = document.getElementById("check-len");
      if (checkLen) checkLen.classList.toggle("complete", len >= 5);

      const checkSync = document.getElementById("check-sync");
      if (checkSync) checkSync.classList.toggle("complete", len >= 20);

      const submitBtn = document.getElementById("submit-btn-v3");
      if (submitBtn) {
        const canSubmit = len >= 5 && !!activeTag;
        submitBtn.disabled = !canSubmit;
        submitBtn.classList.toggle("enabled", canSubmit);

        // Dynamic Pulse Intensity
        if (canSubmit) {
          const intensity = Math.min(1.5, 0.8 + len / 200);
          submitBtn.style.animationDuration = `${2 / Math.max(0.5, intensity)}s`;
          submitBtn.style.boxShadow = `0 0 ${20 * intensity}px var(--tac-amber-dim)`;
        } else {
          submitBtn.style.animationDuration = "2s";
          submitBtn.style.boxShadow = "none";
        }
      }
    });
  }

  const remixInput = document.getElementById("remix-input");
  if (remixInput) {
    remixInput.addEventListener("input", () => {
      const len = remixInput.value.length;
      const counter = document.getElementById("remix-char-counter");
      if (counter) counter.textContent = `${len} / 200`;
    });
  }

  // Mission Protocol Tags (Inline)
  document.querySelectorAll(".ms-tag-opt").forEach((btn) => {
    btn.onclick = () => {
      const opts = document.querySelectorAll(".ms-tag-opt");
      opts.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      activeTag = btn.dataset.tag;

      // Security check update
      const checkTag = document.getElementById("check-tag");
      if (checkTag) checkTag.classList.add("complete");

      // Re-trigger input validation
      const ideaInput = document.getElementById("idea-input");
      if (ideaInput) ideaInput.dispatchEvent(new Event("input"));

      triggerGlitch(150);
      showToast(
        `PROTOCOL: ${activeTag ? activeTag.toUpperCase() : "UNKNOWN"}_ENGAGED`,
      );
    };
  });

  // Encryption Key Rotation
  const keyVal = document.getElementById("ms-key-val");
  if (keyVal) {
    setInterval(() => {
      const isDropPage = window.location.pathname.includes("drop.html");
      if (isDropPage) {
        const hex =
          "0x" +
          Math.floor(Math.random() * 0xfffff)
            .toString(16)
            .toUpperCase()
            .padStart(5, "0");
        keyVal.textContent = hex;
      }
    }, 4000);
  }

  document
    .getElementById("remix-submit-btn")
    ?.addEventListener("click", handleRemixSubmit);

  window.addEventListener("resize", () => {
    if (typeof bgCanvas !== "undefined" && bgCanvas) {
      initParticles();
    }
  });
}

function resetDropForm() {
  document.getElementById("success-overlay")?.classList.remove("active");
  const input = document.getElementById("idea-input");
  if (input) input.value = "";

  const charCounter = document.getElementById("idea-char-counter");
  if (charCounter) charCounter.textContent = "0 / 200";

  activeTag = null;

  // Reset Sidebar HUD
  const signalFill = document.getElementById("ms-signal-fill");
  if (signalFill) signalFill.style.width = "10%";

  document
    .querySelectorAll(".ms-check-item")
    .forEach((el) => el.classList.remove("complete"));
  document
    .querySelectorAll(".ms-tag-opt")
    .forEach((b) => b.classList.remove("active"));

  const sb = document.getElementById("submit-btn-v3");
  if (sb) {
    sb.disabled = true;
    sb.classList.remove("enabled");
    sb.textContent = "TRANSMIT SIGNAL";
  }
}

// ── FEED CORE ─────────────────────────────────────
function renderFeed() {
  const container = document.getElementById("ideas-container");
  if (!container) return;
  container.innerHTML = "";

  const filtered =
    activeFilter === "all"
      ? appFeedData
      : appFeedData.filter((i) => i.tag === activeFilter);

  if (filtered.length === 0) {
    container.innerHTML =
      '<div class="empty-state">No ideas here yet. Be the first!</div>';
    return;
  }

  filtered.forEach((post, index) => {
    const card = createCard(post);
    container.appendChild(card);
    setTimeout(() => {
      if (cardObserver) cardObserver.observe(card);
      else card.classList.add("reveal");
    }, index * 40);
  });
}

function createCard(post) {
  const card = document.createElement("article");

  if (post.isAd) {
    card.className = "reel-card ad-card";
    const bgImg = post.image ? `url('${post.image}')` : "none";

    card.innerHTML = `
        <div class="ad-bg" style="background-image: ${bgImg};"></div>
        <div class="reel-content ad-content">
            <div class="reel-tag ad-tag">${post.tag}</div>
            <h2 class="ad-header">${post.title}</h2>
            <p class="reel-idea ad-idea">${post.idea}</p>
        </div>
        <div class="ad-footer">
            <button class="ad-btn" onclick="showToast('Initiating Sync...')">CONNECT NOW</button>
        </div>
    `;
    return card;
  }

  card.className =
    "reel-card" + (likedPosts.has(post.id) ? " liked-state" : "");
  const initial = post.user.charAt(1).toUpperCase();

  card.innerHTML = `
        <div class="reel-content">
            ${post.picked ? '<div class="picked-badge">PICKED</div>' : ""}
            <div class="reel-tag">${post.tag}</div>
            <p class="reel-idea">${post.idea}</p>
            <div class="reel-meta">
                <div class="user-avatar">${initial}</div>
                <div class="user-details">
                    <span class="name">${post.user}</span>
                    <span class="city">${post.city}</span>
                </div>
            </div>
        </div>
        <div class="reel-actions">
            <button class="reel-btn like-btn" onclick="toggleLike('${post.id}', this)">
                <div class="reel-btn-icon"><span class="like-icon">⚡</span></div>
                <span class="reel-btn-count like-count">${formatEnergy(post.energy)}</span>
            </button>
            <button class="reel-btn remix-btn" onclick="remixIdea('${post.id}')">
                <div class="reel-btn-icon">🔁</div>
                <span class="reel-btn-count">${post.remixes}</span>
            </button>
            <button class="reel-btn share-btn" onclick="showToast('Link copied!')">
                <div class="reel-btn-icon">📤</div>
                <span class="reel-btn-count">Share</span>
            </button>
        </div>
    `;
  return card;
}

function toggleLike(id, btn) {
  const post = appFeedData.find((i) => i.id === id);
  if (!post) return;

  // Support both old .card and new .reel-card class names
  const cardEl = btn.closest(".card") || btn.closest(".reel-card");

  if (likedPosts.has(id)) {
    likedPosts.delete(id);
    post.energy -= 100;
    if (cardEl) cardEl.classList.remove("liked-state");
  } else {
    likedPosts.add(id);
    post.energy += 100;
    if (cardEl) cardEl.classList.add("liked-state");
    showToast("⚡ Energy Boosted");
  }

  btn.querySelector(".like-count").textContent = formatEnergy(post.energy);
  saveData();
  updateFeedStats();
}

function updateFeedStats() {
  const totalDrops = appFeedData.length;
  const totalRemixes = appFeedData.reduce((s, p) => s + (p.remixes || 0), 0);
  const totalEnergy = appFeedData.reduce((s, p) => s + (p.energy || 0), 0);
  const cities = [...new Set(appFeedData.map((p) => p.city))].length;

  const map = {
    "stat-ideas": totalDrops,
    "stat-remixes":
      totalRemixes >= 1000
        ? (totalRemixes / 1000).toFixed(1) + "k"
        : totalRemixes,
    "stat-cities": cities,
    "stat-energy":
      totalEnergy >= 1000 ? Math.round(totalEnergy / 1000) + "k" : totalEnergy,
  };

  for (const [id, val] of Object.entries(map)) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  }
}

// ── REMIX LOGIC ───────────────────────────────────
function remixIdea(postId) {
  const post = appFeedData.find((i) => i.id === postId);
  if (!post) return;

  remixingPostId = postId;

  // UI Updates
  const badge = document.getElementById("original-poster-badge");
  if (badge)
    badge.innerHTML = `<span class="op-label">REMIXING</span> <span class="op-handle">${post.user}</span>`;

  const anchor = document.getElementById("original-card-anchor");
  if (anchor) {
    anchor.innerHTML = `
            <div class="original-idea-preview">
                <div class="orig-tag">${post.tag}</div>
                <p class="orig-idea-text">${post.idea}</p>
                <span class="orig-meta">${post.user} · ${post.city}</span>
            </div>
        `;
  }

  const treeEl = document.getElementById("remix-tree");
  if (treeEl) {
    if (post.remixChain?.length > 0) {
      treeEl.innerHTML = post.remixChain
        .map(
          (r) => `
                <div class="remix-node">
                    <div class="remix-node-user">${r.user}</div>
                    <p class="remix-node-text">${r.text}</p>
                </div>
            `,
        )
        .join("");
    } else {
      treeEl.innerHTML = `<div class="remix-empty-state">No remixes yet. Be the first.</div>`;
    }
  }

  const remixInput = document.getElementById("remix-input");
  if (remixInput) remixInput.value = "";
  const remixCounter = document.getElementById("remix-char-counter");
  if (remixCounter) remixCounter.textContent = "0 / 200";
  siteNav("remix", null);
}

function handleRemixSubmit() {
  if (!remixingPostId) return;
  const input = document.getElementById("remix-input");
  const text = input?.value.trim() || "";

  if (text.length < 3) {
    showToast("✏️ Write a bit more...");
    return;
  }

  const post = appFeedData.find((i) => i.id === remixingPostId);
  if (!post) return;

  if (!post.remixChain) post.remixChain = [];
  post.remixChain.push({ user: "@me", text });
  post.remixes += 1;
  post.energy += 200;

  saveData();
  showToast("🔁 Remix Released");

  setTimeout(() => {
    siteNav("feed", document.getElementById("snl-feed"));
    renderFeed();
    updateFeedStats();
  }, 1000);
}

// ── DROP LOGIC ────────────────────────────────────
function handleDropSubmit(e) {
  e.preventDefault();
  const input = document.getElementById("idea-input");
  const submitBtn = document.getElementById("submit-btn-v3");
  if (!input || input.value.trim().length < 5 || !activeTag || !submitBtn)
    return;

  // ── Pre-launch sequence
  submitBtn.disabled = true;
  submitBtn.textContent = "ENCRYPTING...";
  submitBtn.classList.add("transmitting");
  document.body.classList.add("shake-anim");

  // Add rapid logs
  const msLogs = document.querySelector(".ms-system-logs");
  if (msLogs) {
    let count = 0;
    const logInt = setInterval(() => {
      const entry = document.createElement("div");
      entry.className = "ms-log-entry";
      entry.style.color = "#FFB000";
      entry.textContent = `> UPLOADING BLOCK ${Math.floor(Math.random() * 9999)}...`;
      msLogs.appendChild(entry);
      msLogs.scrollTop = msLogs.scrollHeight;
      if (count++ > 10) clearInterval(logInt);
    }, 100);
  }

  triggerGlitch(200);

  setTimeout(() => {
    submitBtn.textContent = "BROADCASTING SIGNAL...";
    showToast("📡 HANDSHAKE ESTABLISHED...");
    triggerGlitch(400);
  }, 1000);

  setTimeout(() => {
    document.body.classList.remove("shake-anim");
    submitBtn.classList.remove("transmitting");
    const newPost = {
      id: "FK-" + Date.now(),
      idea: input.value.trim(),
      user: "@me",
      city: "Riyadh",
      remixes: 0,
      energy: 0,
      tag: activeTag,
      picked: false,
    };

    appFeedData.unshift(newPost);
    saveData();
    updateFeedStats();

    submitBtn.textContent = "TRANSMIT SIGNAL";
    document.getElementById("success-overlay")?.classList.add("active");
    showToast("✅ MISSION SUCCESSFUL");
  }, 2400);
}

// ── PROFILE ───────────────────────────────────────
function populateProfileScreen() {
  const profile = JSON.parse(localStorage.getItem("fikra_profile") || "{}");
  const name = profile.name || "Zaid Al-Harbi";
  const handle = profile.handle || "@zaid_creates";
  const city = profile.city || "Riyadh";
  const bio =
    profile.bio ||
    "Unfiltered. Original. Building the future one fikra at a time.";

  // ── Text fields
  const fields = {
    "ps-name-disp": name,
    "ps-handle-disp": handle,
    "ps-bio-text": bio,
    "ps-city-disp": "📍 " + city,
  };
  for (const [id, val] of Object.entries(fields)) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  }

  // ── Avatar
  const avatarLg = document.getElementById("ps-avatar-lg");
  if (avatarLg) {
    avatarLg.textContent = name.charAt(0).toUpperCase();
    avatarLg.style.background = profile.color || selectedColor;
  }

  // ── Stats
  const myDrops = appFeedData.filter((p) => p.user === "@me");
  const myLiked = likedPosts.size;
  const totalEnergy = appFeedData.reduce((s, p) => s + (p.energy || 0), 0);
  const myRemixes = appFeedData.reduce(
    (s, p) => s + (p.remixChain?.filter((r) => r.user === "@me").length || 0),
    0,
  );

  const statMap = {
    "ps-stat-drops": myDrops.length || appFeedData.length,
    "ps-stat-remixes": myRemixes,
    "ps-stat-energy": formatEnergy(totalEnergy),
    "ps-stat-impact": calcRank(totalEnergy, myDrops.length).label,
  };
  for (const [id, val] of Object.entries(statMap)) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  }

  // ── Rank badge
  const rankEl = document.getElementById("ps-rank-label");
  if (rankEl) {
    const rank = calcRank(totalEnergy, myDrops.length);
    rankEl.textContent = rank.emoji + " Rank: " + rank.label;
  }

  // ── Activity grid
  buildActivityGrid();

  // ── My Drops tab
  renderDropCards("ps-recent-drops", appFeedData.slice(0, 12));

  // ── Remixes tab
  const allRemixes = [];
  appFeedData.forEach((p) => {
    if (p.remixChain) {
      p.remixChain.forEach((r) =>
        allRemixes.push({ ...r, tag: p.tag, origUser: p.user }),
      );
    }
  });
  renderRemixCards("ps-remix-drops", allRemixes.slice(0, 6));

  // ── Reset to first tab
  switchProfileTabByPanel("ps-panel-drops");
}

function calcRank(energy, drops) {
  if (energy >= 50000 || drops >= 20) return { label: "Legend", emoji: "👑" };
  if (energy >= 20000 || drops >= 10)
    return { label: "Visionary", emoji: "🚀" };
  if (energy >= 8000 || drops >= 5) return { label: "Catalyst", emoji: "🔥" };
  if (energy >= 2000 || drops >= 2) return { label: "Igniter", emoji: "⚡" };
  return { label: "Spark", emoji: "✨" };
}

function buildActivityGrid() {
  const grid = document.getElementById("ps-activity-grid");
  if (!grid) return;
  grid.innerHTML = "";
  // 52 weeks × 7 days = 364 cells
  for (let i = 0; i < 364; i++) {
    const cell = document.createElement("div");
    cell.className = "ps-activity-cell";
    // Pseudo-random activity seeded by position + data
    const seed = (i * 7 + appFeedData.length * 3) % 11;
    const level =
      seed < 5 ? 0 : seed < 7 ? 1 : seed < 9 ? 2 : seed < 10 ? 3 : 4;
    if (level > 0) cell.dataset.level = level;
    grid.appendChild(cell);
  }
}

function renderDropCards(containerId, posts) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (!posts || posts.length === 0) {
    container.innerHTML = `
            <div class="ps-empty" style="grid-column: 1/-1;">
                <span class="ps-empty-icon">💡</span>
                <p>No fikras dropped yet. Release your first idea!</p>
                <button class="ps-empty-cta" onclick="siteNav('drop', document.getElementById('snl-drop'))">Drop a Fikra</button>
            </div>`;
    return;
  }

  container.innerHTML = posts
    .map(
      (p) => `
        <div class="ps-drop-card">
            <div class="ps-drop-tag">${p.tag}</div>
            <p class="ps-drop-idea">${p.idea}</p>
            <div class="ps-drop-meta">
                <span>${p.city}</span>
                <span class="ps-drop-energy">⚡ ${formatEnergy(p.energy)}</span>
            </div>
        </div>
    `,
    )
    .join("");
}

function renderRemixCards(containerId, remixes) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (!remixes || remixes.length === 0) {
    container.innerHTML = `
            <div class="ps-empty" style="grid-column: 1/-1;">
                <span class="ps-empty-icon">🔁</span>
                <p>No remixes yet. Remix an idea from the feed!</p>
                <button class="ps-empty-cta" onclick="siteNav('feed', document.getElementById('snl-feed'))">Browse Feed</button>
            </div>`;
    return;
  }

  container.innerHTML = remixes
    .map(
      (r) => `
        <div class="ps-drop-card">
            <div class="ps-drop-tag">${r.tag || "Remix"} · from ${r.origUser || "@?"}</div>
            <p class="ps-drop-idea">${r.text}</p>
            <div class="ps-drop-meta">
                <span>${r.user}</span>
                <span class="ps-drop-energy">🔁 Remix</span>
            </div>
        </div>
    `,
    )
    .join("");
}

function switchProfileTab(btn) {
  // Deactivate all tabs and panels
  document
    .querySelectorAll(".ps-tab")
    .forEach((t) => t.classList.remove("active"));
  document
    .querySelectorAll(".ps-panel")
    .forEach((p) => p.classList.remove("active"));
  // Activate target
  btn.classList.add("active");
  const panelId = btn.dataset.panel;
  const panel = document.getElementById(panelId);
  if (panel) panel.classList.add("active");
}

function switchProfileTabByPanel(panelId) {
  document
    .querySelectorAll(".ps-tab")
    .forEach((t) => t.classList.remove("active"));
  document
    .querySelectorAll(".ps-panel")
    .forEach((p) => p.classList.remove("active"));
  const panel = document.getElementById(panelId);
  if (panel) panel.classList.add("active");
  const tab = document.querySelector(`.ps-tab[data-panel="${panelId}"]`);
  if (tab) tab.classList.add("active");
}

function shareProfile() {
  const profile = JSON.parse(localStorage.getItem("fikra_profile") || "{}");
  const name = profile.name || "Zaid Al-Harbi";
  if (navigator.share) {
    navigator.share({
      title: `${name} on FIKRA`,
      text: `Check out ${name}'s ideas on FIKRA!`,
      url: window.location.href,
    });
  } else {
    navigator.clipboard
      ?.writeText(window.location.href)
      .then(() => showToast("🔗 Profile link copied!"));
  }
}

function loadProfile() {
  const profile = JSON.parse(localStorage.getItem("fikra_profile") || "{}");
  if (!profile.name) return;

  const profileNameEl = document.getElementById("site-profile-name");
  if (profileNameEl) profileNameEl.textContent = profile.name.split(" ")[0];

  ["site-avatar-icon", "pm-avatar", "ps-avatar-lg"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = (profile.name || "?").charAt(0).toUpperCase();
      el.style.background = profile.color || "#7B2FFF";
    }
  });
}

function saveProfile() {
  const profile = {
    name: document.getElementById("pm-full-name").value,
    handle: document.getElementById("pm-handle").value,
    city: document.getElementById("pm-city").value,
    bio: document.getElementById("pm-bio").value,
    color: selectedColor,
  };

  localStorage.setItem("fikra_profile", JSON.stringify(profile));
  loadProfile();
  closeProfileModal();
  if (document.getElementById("profile-screen")?.classList.contains("active"))
    populateProfileScreen();
  showToast("Identity Synchronized ✓");
}

function openEditProfileModal() {
  const backdrop = document.getElementById("profile-modal-bg");
  if (!backdrop) return;
  backdrop.style.display = "flex";
  setTimeout(() => backdrop.classList.add("active"), 10);

  const profile = JSON.parse(localStorage.getItem("fikra_profile") || "{}");
  const nameInput = document.getElementById("pm-full-name");
  if (nameInput) nameInput.value = profile.name || "";
  const handleInput = document.getElementById("pm-handle");
  if (handleInput) handleInput.value = profile.handle || "";
  const cityInput = document.getElementById("pm-city");
  if (cityInput) cityInput.value = profile.city || "";
  const bioInput = document.getElementById("pm-bio");
  if (bioInput) bioInput.value = profile.bio || "";
}

function closeProfileModal() {
  const backdrop = document.getElementById("profile-modal-bg");
  backdrop?.classList.remove("active");
  setTimeout(() => {
    if (backdrop) backdrop.style.display = "";
  }, 300);
}

function onProfileBgClick(e) {
  const bg = document.getElementById("profile-modal-bg");
  if (bg && e.target === bg) closeProfileModal();
}

function setAvatarColor(btn, color) {
  document
    .querySelectorAll(".avatar-color-swatch")
    .forEach((s) => s.classList.remove("active"));
  btn.classList.add("active");
  selectedColor = color;
  const pmAvatar = document.getElementById("pm-avatar");
  if (pmAvatar) pmAvatar.style.background = color;
}

// ── UTILS ─────────────────────────────────────────
function formatEnergy(n) {
  return n >= 1000 ? (n / 1000).toFixed(1) + "k" : n;
}

function showToast(msg) {
  const t = document.getElementById("toast");
  if (!t) return;
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 3000);
}

function setupCardObserver() {
  if ("IntersectionObserver" in window) {
    cardObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal");
            cardObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 },
    );
  }
}

function observeCards() {
  document
    .querySelectorAll(".card:not(.reveal)")
    .forEach((card) => cardObserver?.observe(card));
}

// ── VISUALS ───────────────────────────────────────
function initParticles() {
  if (!ctx) return;
  bgCanvas.width = window.innerWidth;
  bgCanvas.height = window.innerHeight;
  const isDropPage = window.location.pathname.includes("drop.html");
  const particleCount = isDropPage ? 80 : 40; // Dense network for drop page

  particles = Array.from({ length: particleCount }, () => ({
    x: Math.random() * bgCanvas.width,
    y: Math.random() * bgCanvas.height,
    vx: (Math.random() - 0.5) * 0.6,
    vy: (Math.random() - 0.5) * 0.6,
    size: isDropPage ? Math.random() * 2 + 1 : Math.random() * 2,
    opacity: Math.random() * 0.5,
  }));
}

let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
document.addEventListener("mousemove", (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

function animateParticles() {
  if (!ctx) return;
  ctx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
  const isDropPage = window.location.pathname.includes("drop.html");

  // Cyber-grid or constellation connections
  for (let i = 0; i < particles.length; i++) {
    let p = particles[i];
    p.x += p.vx;
    p.y += p.vy;

    // Repel from mouse
    const dx = mouseX - p.x;
    const dy = mouseY - p.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 150) {
      p.x -= dx * 0.02;
      p.y -= dy * 0.02;
    }

    if (p.x < 0 || p.x > bgCanvas.width) p.vx *= -1;
    if (p.y < 0 || p.y > bgCanvas.height) p.vy *= -1;

    ctx.fillStyle = isDropPage
      ? `rgba(0, 210, 255, ${p.opacity})`
      : `rgba(138, 63, 255, ${p.opacity})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();

    if (isDropPage) {
      for (let j = i + 1; j < particles.length; j++) {
        let p2 = particles[j];
        const pdist = Math.hypot(p.x - p2.x, p.y - p2.y);
        if (pdist < 100) {
          ctx.strokeStyle = `rgba(0, 210, 255, ${0.15 * (1 - pdist / 100)})`;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }
    }
  }
  requestAnimationFrame(animateParticles);
}

// ── DASHBOARD (TACTICAL MISSION COMMAND) ───────────────────────
function populateDashboard() {
  const data = appFeedData;
  if (!data.length) return;

  // Boot Effect
  const root = document.querySelector(".dashboard-root");
  if (root) {
    root.style.opacity = "0";
    setTimeout(() => {
      root.style.transition = "opacity 0.6s ease";
      root.style.opacity = "1";
      showToast("📡 ESTABLISHING SECURE LINK...");
    }, 50);
  }

  const totalDrops = data.length;
  const totalEnergy = data.reduce((s, p) => s + (p.energy || 0), 0);
  const totalRemixes = data.reduce((s, p) => s + (p.remixes || 0), 0);
  const cities = [...new Set(data.map((p) => p.city))];
  const impact = Math.round(totalEnergy / 500 + totalRemixes * 2);

  // ── Tactical KPIs
  animateCounter("dash-impact-val", 0, impact, 1400);
  animateCounter("dash-drops-val", 0, totalDrops, 900);
  // Note: Some IDs changed in rebrand script or might need manual sync in HTML
  // Handling generic dashboard IDs
  const kpiMap = {
    "di-kpi-drops": totalDrops,
    "di-kpi-remixes": totalRemixes,
    "di-kpi-energy": Math.round(totalEnergy / 1000),
    "di-kpi-cities": cities.length,
  };
  for (const [id, val] of Object.entries(kpiMap)) {
    animateCounter(id, 0, val, 1000 + Math.random() * 500);
  }

  // ── Operations & Map
  buildEnergyChart(data);
  buildTopIdeas(data);
  buildGlobe(data, cities);
  buildLiveFeed(data);
  buildVibeArc(totalEnergy);
  buildTagBars(data);
  buildRankCard(totalEnergy, totalDrops);
  if (typeof startLiveTicker === "function") startLiveTicker(data);
}

/* ── Animated number counter ── */
function animateCounter(id, from, to, duration, suffix = "") {
  const el = document.getElementById(id);
  if (!el) return;
  const start = performance.now();
  const range = to - from;
  function tick(now) {
    const p = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(from + range * ease) + suffix;
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

/* ── Dual-line energy chart ── */
function buildEnergyChart(data) {
  const svg = document.getElementById("di-energy-svg");
  if (!svg) return;

  const W = 700,
    H = 140,
    PAD = 16;
  const days = 7;
  const points = Array.from({ length: days }, (_, i) => {
    const idxSeed = (i * 13 + data.length * 7) % data.length;
    return {
      energy: data[idxSeed % data.length].energy,
      remixes: data[idxSeed % data.length].remixes,
    };
  });

  const maxE = Math.max(...points.map((p) => p.energy));
  const maxR = Math.max(...points.map((p) => p.remixes)) * 80;

  const ex = (i) => PAD + (i / (days - 1)) * (W - PAD * 2);
  const ey = (v) => H - PAD - (v / maxE) * (H - PAD * 2);
  const ry = (v) => H - PAD - ((v * 80) / maxR) * (H - PAD * 2);

  const eLine = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${ex(i)} ${ey(p.energy)}`)
    .join(" ");
  const eFill = eLine + ` L ${ex(days - 1)} ${H} L ${ex(0)} ${H} Z`;

  const rLine = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${ex(i)} ${ry(p.remixes)}`)
    .join(" ");
  const rFill = rLine + ` L ${ex(days - 1)} ${H} L ${ex(0)} ${H} Z`;

  const setPath = (id, d) => {
    const el = document.getElementById(id);
    if (el) el.setAttribute("d", d);
  };
  setPath("di-energy-line", eLine);
  setPath("di-energy-fill", eFill);
  setPath("di-remix-line", rLine);
  setPath("di-remix-fill", rFill);
}

/* ── Top ideas ranked list ── */
const TAG_COLORS = {
  Tech: "#00D2FF",
  Future: "#8A3FFF",
  Business: "#FFD700",
  Culture: "#FF6B6B",
  Wellness: "#00C97E",
  Education: "#FF8C00",
  Community: "#BB8FCE",
};

function buildTopIdeas(data) {
  const container = document.getElementById("di-top-ideas");
  if (!container) return;
  const sorted = [...data]
    .sort((a, b) => b.energy + b.remixes * 50 - (a.energy + a.remixes * 50))
    .slice(0, 6);
  container.innerHTML = sorted
    .map(
      (p, i) => `
        <div class="di-idea-row" style="--row-color:${TAG_COLORS[p.tag] || "#8A3FFF"}">
            <div class="di-idea-rank">#${i + 1}</div>
            <div>
                <div class="di-idea-text">${p.idea}</div>
            </div>
            <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px">
                <div class="di-idea-tag" style="background:${TAG_COLORS[p.tag]}22;color:${TAG_COLORS[p.tag]};border-color:${TAG_COLORS[p.tag]}44">${p.tag}</div>
                <div class="di-idea-energy">⚡ ${formatEnergy(p.energy)}</div>
            </div>
        </div>
    `,
    )
    .join("");
}

/* ── Network Globe ── */
function buildGlobe(data, cities) {
  const nodesWrap = document.getElementById("di-globe-nodes");
  const citiesWrap = document.getElementById("di-globe-cities");
  if (!nodesWrap || !citiesWrap) return;

  // Nodes scattered on globe
  nodesWrap.innerHTML = cities
    .slice(0, 8)
    .map((_, i) => {
      const angle = (i / 8) * Math.PI;
      const x = 50 + 35 * Math.cos(angle + i * 0.9);
      const y = 50 + 32 * Math.sin(angle * 1.3 + i * 0.5);
      const colors = [
        "#8A3FFF",
        "#00D2FF",
        "#FFD700",
        "#00C97E",
        "#FF6B6B",
        "#FF8C00",
        "#BB8FCE",
        "#8A3FFF",
      ];
      return `<div class="di-globe-node" style="left:${x}%;top:${y}%;--node-color:${colors[i % colors.length]};animation-delay:${i * 0.4}s"></div>`;
    })
    .join("");

  // City bars
  const cityData = cities
    .slice(0, 5)
    .map((city) => ({
      name: city,
      count: data.filter((p) => p.city === city).length,
    }))
    .sort((a, b) => b.count - a.count);
  const max = cityData[0]?.count || 1;
  const colors = ["#8A3FFF", "#00D2FF", "#FFD700", "#00C97E", "#FF6B6B"];
  citiesWrap.innerHTML = cityData
    .map(
      (c, i) => `
        <div class="di-city-row">
            <div class="di-city-dot" style="background:${colors[i]}"></div>
            <span style="font-size:12px;font-weight:600;min-width:70px">${c.name}</span>
            <div class="di-city-bar">
                <div class="di-city-fill" style="--bar-color:${colors[i]};width:${Math.round((c.count / max) * 100)}%"></div>
            </div>
            <div class="di-city-count">${c.count}</div>
        </div>
    `,
    )
    .join("");
}

/* ── Live Event Feed ── */
/* ── Live Intel Logs ── */
const EVENT_TEMPLATES = [
  (p) => ({
    icon: "�",
    msg: `INTEL ACQUIRED [${p.city.toUpperCase()}]: "${p.idea.slice(0, 35)}..."`,
  }),
  (p) => ({
    icon: "�️",
    msg: `REINFORCEMENTS: ${p.remixes} supports detected on op "${p.idea.slice(0, 25)}"`,
  }),
  (p) => ({
    icon: "⚡",
    msg: `POWER SURGE: ${formatEnergy(p.energy)} energy units deployed to #${p.tag.toUpperCase()}`,
  }),
  (p) => ({
    icon: "🎯",
    msg: `SECTOR SECURED: ${p.city} engagement levels critical`,
  }),
  (p) => ({
    icon: "⚠️",
    msg: `HIGH PRIORITY: "${p.idea.slice(0, 30)}..." gaining friction`,
  }),
];

function buildLiveFeed(data) {
  const feed = document.getElementById("di-live-feed");
  if (!feed) return;
  const shuffled = [...data].sort(() => Math.random() - 0.5).slice(0, 6);
  feed.innerHTML = shuffled
    .map((p, i) => {
      const tmpl = EVENT_TEMPLATES[i % EVENT_TEMPLATES.length](p);
      const mins = Math.floor(Math.random() * 59) + 1;
      return `
            <div class="di-event" style="animation-delay:${i * 0.08}s">
                <div class="di-event-icon">${tmpl.icon}</div>
                <div class="di-event-body">
                    <div class="di-event-msg">${tmpl.msg}</div>
                    <div class="di-event-time">${mins}m ago</div>
                </div>
            </div>`;
    })
    .join("");
}

let liveTickerInterval = null;
function startLiveTicker(data) {
  if (liveTickerInterval) clearInterval(liveTickerInterval);
  liveTickerInterval = setInterval(() => {
    const feed = document.getElementById("di-live-feed");
    if (!feed) return;
    const p = data[Math.floor(Math.random() * data.length)];
    const tmpl =
      EVENT_TEMPLATES[Math.floor(Math.random() * EVENT_TEMPLATES.length)](p);
    const newEl = document.createElement("div");
    newEl.className = "di-event";
    newEl.innerHTML = `
            <div class="di-event-icon">${tmpl.icon}</div>
            <div class="di-event-body">
                <div class="di-event-msg">${tmpl.msg}</div>
                <div class="di-event-time">just now</div>
            </div>`;
    feed.insertBefore(newEl, feed.firstChild);
    while (feed.children.length > 6) feed.removeChild(feed.lastChild);
  }, 4000);
}

/* ── Vibe Arc ── */
function buildVibeArc(energy) {
  const TOTAL_DASH = 201;
  const pct = Math.min(energy / 80000, 1);
  const offset = TOTAL_DASH - pct * TOTAL_DASH;
  const arc = document.getElementById("di-vibe-arc");
  if (arc) {
    setTimeout(() => {
      arc.style.strokeDashoffset = offset;
    }, 200);
    arc.style.transition =
      "stroke-dashoffset 1.5s cubic-bezier(0.165,0.84,0.44,1)";
  }
  const vibes =
    energy > 60000
      ? "LEGENDARY"
      : energy > 30000
        ? "ELECTRIC"
        : energy > 10000
          ? "RISING"
          : "WARMING";
  const lbl = document.getElementById("di-vibe-label");
  if (lbl) lbl.textContent = vibes;
}

/* ── Tag Distribution Bars ── */
function buildTagBars(data) {
  const container = document.getElementById("di-tag-bars");
  if (!container) return;
  const counts = {};
  data.forEach((p) => {
    counts[p.tag] = (counts[p.tag] || 0) + 1;
  });
  const entries = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);
  const total = entries.reduce((s, [, n]) => s + n, 0);
  container.innerHTML = entries
    .map(([tag, n]) => {
      const pct = Math.round((n / total) * 100);
      const color = TAG_COLORS[tag] || "#8A3FFF";
      return `
            <div class="di-tag-bar-row">
                <div class="di-tag-bar-name">${tag}</div>
                <div class="di-tag-bar-track">
                    <div class="di-tag-bar-fill" style="background:${color};width:0" data-w="${pct}%"></div>
                </div>
                <div class="di-tag-bar-pct">${pct}%</div>
            </div>`;
    })
    .join("");
  // Animate widths after paint
  setTimeout(() => {
    container.querySelectorAll(".di-tag-bar-fill").forEach((el) => {
      el.style.width = el.dataset.w;
    });
  }, 100);
}

/* ── Rank Card ── */
const RANKS = [
  { min: 0, label: "Spark", emoji: "✨", next: "Igniter", pct: 20 },
  { min: 2000, label: "Igniter", emoji: "⚡", next: "Catalyst", pct: 40 },
  { min: 8000, label: "Catalyst", emoji: "🔥", next: "Visionary", pct: 60 },
  { min: 20000, label: "Visionary", emoji: "🚀", next: "Legend", pct: 80 },
  { min: 50000, label: "Legend", emoji: "👑", next: "MAX", pct: 100 },
];

function buildRankCard(energy, drops) {
  const rank =
    [...RANKS]
      .reverse()
      .find((r) => energy >= r.min || drops >= r.min / 1000) || RANKS[0];
  const trophy = document.getElementById("di-rank-trophy");
  const title = document.getElementById("di-rank-title");
  const prog = document.getElementById("di-rank-prog");
  const next = document.getElementById("di-rank-next");
  if (trophy) trophy.textContent = rank.emoji;
  if (title) title.textContent = rank.label;
  if (next)
    next.textContent =
      rank.next === "MAX"
        ? "👑 Maximum Rank!"
        : `${100 - rank.pct}% to ${rank.next}`;
  if (prog)
    setTimeout(() => {
      prog.style.width = rank.pct + "%";
    }, 300);
}

/* ── DASHBOARD INTERACTIVITY (Parallax & Globe) ── */
document.addEventListener("mousemove", (e) => {
  const dash = document.getElementById("dashboard-screen");
  if (!dash || !dash.classList.contains("active")) return;

  const x = (e.clientX / window.innerWidth - 0.5) * 2;
  const y = (e.clientY / window.innerHeight - 0.5) * 2;

  // Tilt KPIs and handle local glow
  document.querySelectorAll(".di-kpi").forEach((kpi) => {
    const rect = kpi.getBoundingClientRect();
    const localX = ((e.clientX - rect.left) / rect.width) * 100;
    const localY = ((e.clientY - rect.top) / rect.height) * 100;

    kpi.style.setProperty("--mouse-x", `${localX}%`);
    kpi.style.setProperty("--mouse-y", `${localY}%`);
    kpi.style.transform = `perspective(1000px) rotateX(${y * -4}deg) rotateY(${x * 4}deg) translateY(${y * -2}px)`;
  });

  // Subtly move globe nodes
  document.querySelectorAll(".di-globe-node").forEach((node) => {
    node.style.marginLeft = `${x * 12}px`;
    node.style.marginTop = `${y * 12}px`;
  });
});

// Inject dynamic styles for HUD and effects
(function () {
  const s = document.createElement("style");
  s.textContent = `
        @keyframes globeRotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .di-globe-nodes { animation: globeRotate 60s linear infinite !important; }
        .di-kpi { transition: transform 0.1s ease-out !important; }
        .dashboard-root::after { 
            animation: scanline 8s linear infinite; 
            background: linear-gradient(to bottom, transparent, rgba(138,63,255,0.05) 50%, transparent 50%);
            background-size: 100% 4px;
        }
        @keyframes scanline { from { transform: translateY(-100%); } to { transform: translateY(100%); } }
        
        /* HUD Scan effect for ideas */
        .di-idea-row { position: relative; overflow: hidden; }
        .di-idea-row::after {
            content: '';
            position: absolute;
            top: -100%; left: 0; width: 100%; height: 100%;
            background: linear-gradient(to bottom, transparent, rgba(0,210,255,0.05), transparent);
            animation: hudScan 4s linear infinite;
            pointer-events: none;
        }
        @keyframes hudScan {
            0% { top: -100%; }
            30% { top: 100%; }
            100% { top: 100%; }
        }
    `;
  document.head.appendChild(s);
})();

/* ── THEME TOGGLE ── */
function toggleTheme() {
  const body = document.body;
  body.classList.toggle("light-theme");
  const isLight = body.classList.contains("light-theme");
  localStorage.setItem("fikra_theme", isLight ? "light" : "dark");
  showToast(isLight ? "☀️ Clean Perspective" : "🌙 Raw Perspective");

  // Refresh dashboard if active to adjust colors
  if (
    document.getElementById("dashboard-screen").classList.contains("active")
  ) {
    populateDashboard();
  }
}

// Load theme on startup
(function initTheme() {
  const saved = localStorage.getItem("fikra_theme");
  if (saved === "light") document.body.classList.add("light-theme");
})();

/* ── REMIX CHAIN ENHANCEMENTS ── */
let remixCtx = null;

function initRemixCanvas() {
  const canvas = document.getElementById("remix-canvas");
  if (!canvas) return;
  const parent = canvas.parentElement;
  canvas.width = parent.offsetWidth;
  canvas.height = parent.offsetHeight;
  remixCtx = canvas.getContext("2d");

  animateRemixNetwork();
}

function animateRemixNetwork() {
  if (!document.getElementById("remix-screen").classList.contains("active"))
    return;
  if (!remixCtx) return;

  remixCtx.clearRect(0, 0, remixCtx.canvas.width, remixCtx.canvas.height);

  // Draw connections between nodes
  const elements = document.querySelectorAll(
    ".remix-node, .original-idea-preview",
  );
  const rects = Array.from(elements).map((el) => el.getBoundingClientRect());
  const screenRect = document
    .getElementById("remix-screen")
    .getBoundingClientRect();

  remixCtx.strokeStyle = document.body.classList.contains("light-theme")
    ? "rgba(138, 63, 255, 0.1)"
    : "rgba(138, 63, 255, 0.2)";
  remixCtx.lineWidth = 1;

  for (let i = 0; i < rects.length; i++) {
    for (let j = i + 1; j < rects.length; j++) {
      const x1 = rects[i].left - screenRect.left + rects[i].width / 2;
      const y1 = rects[i].top - screenRect.top + rects[i].height / 2;
      const x2 = rects[j].left - screenRect.left + rects[j].width / 2;
      const y2 = rects[j].top - screenRect.top + rects[j].height / 2;

      const dist = Math.hypot(x1 - x2, y1 - y2);
      if (dist < 400) {
        remixCtx.beginPath();
        remixCtx.moveTo(x1, y1);
        remixCtx.lineTo(x2, y2);
        remixCtx.stroke();
      }
    }
  }

  requestAnimationFrame(animateRemixNetwork);
}

// Wrap existing remixIdea to trigger canvas
const _oldRemixIdea = remixIdea;
remixIdea = function (postId) {
  _oldRemixIdea(postId);
  setTimeout(initRemixCanvas, 100);
};

/* ── TACTICAL TERMINAL & MISSIONS ── */
let missionProgress = 0;
const ACTIVE_MISSION = {
  title: "OPERATION: NEURAL SPARK",
  desc: "Achieve 5 remixes on a trending idea to bridge cognitive networks.",
  target: 5,
  reward: 500,
};

function handleTerminalCommand(e) {
  if (e.key !== "Enter") return;
  const input = e.target;
  const cmd = input.value.trim().toUpperCase();
  input.value = "";

  const body = document.getElementById("term-body");
  if (!body) return;

  function addLine(text, type = "default") {
    const line = document.createElement("div");
    line.className = "term-line";
    line.style.color =
      type === "error" ? "#FF3B3B" : type === "success" ? "#FFB000" : "#00FF41";
    line.textContent = `> ${text}`;
    body.appendChild(line);
    body.scrollTop = body.scrollHeight;
  }

  addLine(cmd);

  switch (cmd) {
    case "SCAN":
      addLine("SCANNING SECTORS...", "success");
      setTimeout(() => addLine("8 SIGNAL NODES LOCATED. ALL SECURE."), 800);
      triggerGlitch(200);
      break;
    case "REBOOT":
      addLine("INITIATING SYSTEM REBOOT...", "error");
      setTimeout(populateDashboard, 1000);
      break;
    case "GLITCH":
      addLine("WARNING: SECURITY BREACH DETECTED", "error");
      triggerGlitch(1500);
      break;
    case "HELP":
      addLine("AVAILABLE: SCAN, REBOOT, GLITCH, MISSION");
      break;
    case "MISSION":
      addLine(`CURRENT: ${ACTIVE_MISSION.title}`);
      addLine(`STATUS: ${missionProgress}/${ACTIVE_MISSION.target} TARGETS`);
      break;
    default:
      addLine('uNKOWN_COMMAND. TYPE "HELP" for INTEL.', "error");
  }
}

function triggerGlitch(duration = 300) {
  const gl = document.getElementById("tac-glitch");
  if (!gl) return;
  gl.classList.add("active");
  setTimeout(() => gl.classList.remove("active"), duration);
}

function updateMissionUI() {
  const totalRemixes = appFeedData.reduce((s, p) => s + (p.remixes || 0), 0);
  // Simulated mission logic: 10% of total remixes contribute
  missionProgress = Math.min(
    ACTIVE_MISSION.target,
    Math.floor(totalRemixes / 2),
  );
  const pct = (missionProgress / ACTIVE_MISSION.target) * 100;

  const fill = document.getElementById("mission-fill");
  const label = document.getElementById("mission-pct");
  if (fill) fill.style.width = `${pct}%`;
  if (label) label.textContent = `${Math.round(pct)}%`;

  if (missionProgress >= ACTIVE_MISSION.target) {
    const titleEl = document.getElementById("mission-title");
    if (titleEl) {
      titleEl.textContent = "MISSION COMPLETE // ACCESS GRANTED";
      titleEl.style.color = "#00FF41";
    }
  }
}

// Attach listener
document.addEventListener("DOMContentLoaded", () => {
  // Note: Since dashboard can be injected/cleared, we use delegation
  document.body.addEventListener("keypress", (e) => {
    if (e.target.id === "term-input") handleTerminalCommand(e);
  });
});

// Hook into buildLiveTicker or populate to occasionally glitch
const _oldTicker = startLiveTicker;
startLiveTicker = function (data) {
  _oldTicker(data);
  setInterval(() => {
    if (Math.random() > 0.9) triggerGlitch(150);
  }, 12000);
};

// Add mission update to populate
const _oldPopDash = populateDashboard;
populateDashboard = function () {
  _oldPopDash();
  updateMissionUI();
};
