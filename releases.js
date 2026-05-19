/* Automercatorum — release/download wiring.
 *
 * Each .download (hero or card) renders:
 *   - a primary button that downloads the asset matching the visitor's OS
 *   - a caret button that opens a menu listing all platforms
 *
 * On load we hit the GitHub API for every repo's latest release and map
 * each asset to a platform via filename pattern. Missing assets get
 * disabled (greyed out) menu entries — the primary button falls back to
 * the first available platform if the visitor's OS has no build.
 */

const PLATFORMS = ["macos", "windows", "linux"];

const PLATFORM_LABELS = {
  macos:   "macOS",
  windows: "Windows",
  linux:   "Linux",
};

// First-match wins. Patterns ordered most-specific → most-generic.
const PLATFORM_PATTERNS = {
  macos:   [/mac(os)?/i, /darwin/i, /\.dmg$/i, /\.pkg$/i, /apple/i, /\.app\.zip$/i],
  windows: [/\.(exe|msi)$/i, /win(dows|32|64)/i],
  linux:   [/\.AppImage$/i, /\.deb$/i, /\.rpm$/i, /linux/i, /\.tar\.(gz|xz|bz2)$/i],
};

const PLATFORM_ICONS = {
  // macOS — apple silhouette
  macos: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' +
    '<path d="M16.5 2.5c.4 1.4-.5 2.7-1.4 3.6-.9.9-2.3 1.6-3.7 1.5-.4-1.4.4-2.7 1.4-3.7.9-.9 2.3-1.5 3.7-1.4zM20 17.5c-.7 1.6-1.7 3.4-3.2 3.4-1.4 0-1.9-.9-3.5-.9s-2.2.9-3.5.9c-1.5 0-2.5-1.6-3.2-3.2C5.3 14.6 4.7 9 7.6 6.7 8.7 5.8 9.9 5.4 11 5.4c1.4 0 2.2.9 3.4.9 1.1 0 1.9-.9 3.4-.9 1 0 2.1.4 3 1.2-2.6 1.5-2.2 5.3.7 6.5-.4 1.5-1 2.9-1.5 4.4z"/>' +
  '</svg>',
  // Windows — four squares (modern logo)
  windows: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' +
    '<path d="M3 5.4l8.2-1.1v8H3V5.4zM12.4 4.1l8.6-1.2v9.4h-8.6V4.1zM3 13.7h8.2v8L3 20.6v-6.9zM12.4 13.7H21V21l-8.6-1.2v-6.1z"/>' +
  '</svg>',
  // Linux — penguin silhouette (simplified)
  linux: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' +
    '<path d="M12 2c-1.6 0-3 1.4-3 3 0 .9.4 1.7 1 2.2-.7.5-1.4 1.2-1.9 2.1-.6 1-.9 2.1-1 3.1-.1.9 0 1.7.1 2.2.1.6 0 1.1-.4 1.6-.9 1.1-1.3 2.1-1.3 2.7 0 .5.4.9 1 1 .3 0 .6 0 .8-.1 0 .4.2.7.4 1 .4.5 1 .8 1.6.8.5 0 1-.2 1.4-.5.4.3 1 .5 1.7.5h.1c.7 0 1.3-.2 1.7-.5.4.3.9.5 1.4.5.6 0 1.2-.3 1.6-.8.2-.3.4-.6.4-1 .2.1.5.1.8.1.6-.1 1-.5 1-1 0-.6-.4-1.6-1.3-2.7-.4-.5-.5-1-.4-1.6.1-.5.2-1.3.1-2.2-.1-1-.4-2.1-1-3.1-.5-.9-1.2-1.6-1.9-2.1.6-.5 1-1.3 1-2.2 0-1.6-1.4-3-3-3zm-1.5 5c.5 0 .9.4.9.9 0 .5-.4.9-.9.9s-.9-.4-.9-.9c0-.5.4-.9.9-.9zm3 0c.5 0 .9.4.9.9 0 .5-.4.9-.9.9s-.9-.4-.9-.9c0-.5.4-.9.9-.9zm-3 4.5c.4.6 1.1 1 1.8 1s1.4-.4 1.8-1c.4.4.7.9.7 1.5 0 .8-.5 1.5-1.2 1.5-.4 0-.7-.2-.9-.4-.3.3-.7.4-1.1.4-.4 0-.8-.1-1.1-.4-.2.2-.5.4-.9.4-.7 0-1.2-.7-1.2-1.5 0-.6.3-1.1.7-1.5z"/>' +
  '</svg>',
};

function detectPlatform() {
  const blob = (
    navigator.userAgent + " " + (navigator.platform || "") + " " +
    (navigator.userAgentData?.platform || "")
  ).toLowerCase();
  if (/iphone|ipad|ipod/.test(blob)) return "macos";
  if (blob.includes("mac") || blob.includes("darwin")) return "macos";
  if (blob.includes("win")) return "windows";
  if (blob.includes("linux") || blob.includes("x11")) return "linux";
  return "macos";
}

function classifyAsset(assetName) {
  for (const platform of PLATFORMS) {
    for (const pat of PLATFORM_PATTERNS[platform]) {
      if (pat.test(assetName)) return platform;
    }
  }
  return null;
}

function buildAssetMap(release) {
  const out = { macos: null, windows: null, linux: null };
  if (!release || !Array.isArray(release.assets)) return out;
  for (const asset of release.assets) {
    if (!asset || asset.state !== "uploaded") continue;
    const platform = classifyAsset(asset.name);
    if (platform && !out[platform]) out[platform] = asset;
  }
  return out;
}

function readableSize(bytes) {
  if (!bytes) return "";
  if (bytes >= 1024 * 1024 * 1024) return (bytes / (1024**3)).toFixed(1) + " GB";
  if (bytes >= 1024 * 1024)        return Math.round(bytes / (1024**2)) + " MB";
  return Math.round(bytes / 1024) + " KB";
}

async function fetchLatestRelease(owner, repo) {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/releases/latest`,
      { headers: { Accept: "application/vnd.github.v3+json" } }
    );
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/** Wire one download control. `target` is the element wrapping the
 *  primary button + caret toggle + menu. */
function renderDownload(target, opts) {
  const { release, assets, version, defaultPlatform, primaryRefs, menuRefs, fallbackRepoUrl } = opts;
  const detected = defaultPlatform || detectPlatform();
  const fallbackPlatform = PLATFORMS.find(p => assets[p]) || null;
  const chosen = assets[detected] ? detected : fallbackPlatform;

  const primary = primaryRefs.button;
  const primaryIcon = primaryRefs.icon;
  const primaryOs = primaryRefs.os;
  const primaryMeta = primaryRefs.meta;

  if (chosen && assets[chosen]) {
    const a = assets[chosen];
    primary.href = a.browser_download_url;
    primary.removeAttribute("aria-disabled");
    if (primaryIcon) primaryIcon.innerHTML = PLATFORM_ICONS[chosen];
    if (primaryOs) primaryOs.textContent = PLATFORM_LABELS[chosen];
    if (primaryMeta) {
      const parts = [];
      if (version) parts.push(version);
      if (a.size) parts.push(readableSize(a.size));
      primaryMeta.textContent = parts.join(" · ");
    }
  } else {
    // No assets at all — point the button at the repo's releases page so the
    // user still has somewhere to land.
    primary.href = fallbackRepoUrl;
    primary.setAttribute("aria-disabled", "true");
    if (primaryIcon) primaryIcon.innerHTML = PLATFORM_ICONS[detected] || "";
    if (primaryOs) primaryOs.textContent = PLATFORM_LABELS[detected] || "macOS";
    if (primaryMeta) primaryMeta.textContent = "non disponibile";
  }

  // Menu
  if (menuRefs.menu) {
    menuRefs.menu.innerHTML = "";
    for (const platform of PLATFORMS) {
      const a = assets[platform];
      const item = document.createElement("a");
      item.className = "dl-item";
      item.setAttribute("role", "menuitem");
      item.dataset.platform = platform;
      item.rel = "noopener";

      const icon = document.createElement("span");
      icon.className = "dl-icon";
      icon.innerHTML = PLATFORM_ICONS[platform];

      const label = document.createElement("span");
      label.className = "dl-item-label";
      label.textContent = PLATFORM_LABELS[platform];

      const meta = document.createElement("span");
      meta.className = "dl-item-meta";

      if (a) {
        item.href = a.browser_download_url;
        meta.textContent = readableSize(a.size) || version || "";
      } else {
        item.setAttribute("aria-disabled", "true");
        item.href = fallbackRepoUrl;
        meta.textContent = "non disponibile";
      }

      item.append(icon, label, meta);
      menuRefs.menu.appendChild(item);
    }
  }
}

/** Toggle the platform menu. Closes any other open menu first. */
function wireMenuToggle(toggle, menu) {
  if (!toggle || !menu) return;
  toggle.addEventListener("click", (e) => {
    e.stopPropagation();
    const isOpen = !menu.hasAttribute("hidden");
    closeAllMenus();
    if (!isOpen) {
      menu.removeAttribute("hidden");
      toggle.setAttribute("aria-expanded", "true");
    }
  });
  // Clicking an item closes the menu (after the navigation kicks in).
  menu.addEventListener("click", () => {
    setTimeout(closeAllMenus, 0);
  });
}

function closeAllMenus() {
  document.querySelectorAll(".dl-menu").forEach(m => m.setAttribute("hidden", ""));
  document.querySelectorAll(".btn-download.caret").forEach(b => b.setAttribute("aria-expanded", "false"));
}

document.addEventListener("click", closeAllMenus);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeAllMenus();
});

/* ---------- HERO wiring ---------- */
async function renderHero() {
  const hero = document.getElementById("hero");
  if (!hero) return;
  const owner = hero.dataset.owner;
  const repo  = hero.dataset.repo;

  const release = await fetchLatestRelease(owner, repo);
  const assets = buildAssetMap(release);
  const version = release?.tag_name || "";

  document.getElementById("hero-version").textContent = version || "";

  const primary = document.getElementById("hero-download-primary");
  const toggle  = document.getElementById("hero-download-toggle");
  const menu    = document.getElementById("hero-download-menu");

  renderDownload(hero, {
    release,
    assets,
    version,
    defaultPlatform: detectPlatform(),
    primaryRefs: {
      button: primary,
      icon: document.getElementById("hero-download-icon"),
      os:   document.getElementById("hero-download-os"),
      meta: document.getElementById("hero-download-meta"),
    },
    menuRefs: { menu },
    fallbackRepoUrl: `https://github.com/${owner}/${repo}/releases/latest`,
  });
  wireMenuToggle(toggle, menu);
}

/* ---------- CARDS wiring ---------- */
async function renderCards() {
  const cards = document.querySelectorAll(".tool-card");
  await Promise.all(Array.from(cards).map(async (card) => {
    const owner = card.dataset.owner;
    const repo  = card.dataset.repo;
    const release = await fetchLatestRelease(owner, repo);
    const assets = buildAssetMap(release);
    const version = release?.tag_name || "";

    const primary = card.querySelector('[data-role="card-download"]');
    const icon    = card.querySelector('[data-role="card-icon"]');
    const meta    = card.querySelector('[data-role="card-meta"]');
    const toggle  = card.querySelector('[data-role="card-toggle"]');
    const menu    = card.querySelector('[data-role="card-menu"]');

    renderDownload(card, {
      release,
      assets,
      version,
      defaultPlatform: detectPlatform(),
      primaryRefs: { button: primary, icon, os: null, meta },
      menuRefs: { menu },
      fallbackRepoUrl: `https://github.com/${owner}/${repo}/releases/latest`,
    });
    wireMenuToggle(toggle, menu);
  }));
}

/* ---------- footer year ---------- */
function renderYear() {
  const el = document.getElementById("copyright-year");
  if (el) el.textContent = String(new Date().getFullYear());
}

document.addEventListener("DOMContentLoaded", () => {
  renderYear();
  renderHero();
  renderCards();
});
