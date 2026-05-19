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
  // Simple Icons "apple" — clean Apple silhouette with bite + leaf.
  macos: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' +
    '<path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>' +
  '</svg>',
  // Simple Icons "windows11" — straight 2x2 squares (the modern logo).
  windows: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' +
    '<path d="M3.449 0L0 .691v10.379h11.05V0H3.449zm9.501 0v11.07H24V0H12.95zM0 12.93v10.379L3.449 24h7.601V12.93H0zm12.95 0V24h11.05V12.93H12.95z"/>' +
  '</svg>',
  // FontAwesome 5 brands "linux" — proper Tux silhouette in 448x512 viewBox.
  linux: '<svg viewBox="0 0 448 512" fill="currentColor" aria-hidden="true">' +
    '<path d="M220.8 123.3c1 .5 1.8 1.7 3 1.7 1.1 0 2.8-.4 2.9-1.5.2-1.4-1.9-2.3-3.2-2.9-1.7-.7-3.9-1-5.5-.1-.4.2-.8.7-.6 1.1.3 1.3 2.3 1.1 3.4 1.7zm-21.9 1.7c1.2 0 2-1.2 3-1.7 1.1-.6 3.1-.4 3.5-1.6.2-.4-.2-.9-.6-1.1-1.6-.9-3.8-.6-5.5.1-1.3.6-3.4 1.5-3.2 2.9.1 1 1.8 1.5 2.8 1.4zM420 403.8c-3.6-4-5.3-11.6-7.2-19.7-1.8-8.1-3.9-16.8-10.5-22.4-1.3-1.1-2.6-2.1-4-2.9-1.3-.8-2.7-1.5-4.1-2 9.2-27.3 5.6-54.5-3.7-79.1-11.4-30.1-31.3-56.4-46.5-74.4-17.1-21.5-33.7-41.9-33.4-72C311.1 85.4 315.7.1 234.8 0 132.4-.2 158 103.4 156.9 135.2c-1.7 23.4-6.4 41.8-22.5 64.7-18.9 22.5-45.5 58.8-58.1 96.7-6 17.9-8.8 36.1-6.2 53.3-6.5 5.8-11.4 14.7-16.6 20.2-4.2 4.3-10.3 5.9-17 8.3s-14 6-18.5 14.5c-2.1 3.9-2.8 8.1-2.8 12.4 0 3.9.6 7.9 1.2 11.8 1.2 8.1 2.5 15.7.8 20.8-5.2 14.4-5.9 24.4-2.2 31.7 3.8 7.3 11.4 10.5 20.1 12.3 17.3 3.6 40.8 2.7 59.3 12.5 19.8 10.4 39.9 14.1 55.9 10.4 11.6-2.6 21.1-9.6 25.9-20.2 12.5-.1 26.3-5.4 48.3-6.6 14.9-1.2 33.6 5.3 55.1 4.1.6 2.3 1.4 4.6 2.5 6.7v.1c8.3 16.7 23.8 24.3 40.3 23 16.6-1.3 34.1-11 48.3-27.9 13.6-16.4 36-23.2 50.9-32.2 7.4-4.5 13.4-10.1 13.9-18.3.4-8.2-4.4-17.3-15.5-29.7zM223.7 87.3c9.8 0 17.7 8.8 17.7 19.6 0 7.8-4.1 14.5-10 17.6-1.5-.7-3.1-1.4-4.9-2 1.1-1.4 3.1-2.9 3.1-5.1.1-5.1-3.9-9.1-8.8-9.1s-8.8 4.1-8.8 9.1c0 2.9 1.2 5 2.6 6.3-1.4.5-3.1 1.3-4.4 1.9-3.6-3.5-6.3-9.1-6.3-15.2 0-10.7 7.9-19.4 17.7-19.4l.1.3z"/>' +
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

/* ---------- footer year ---------- */
function renderYear() {
  const el = document.getElementById("copyright-year");
  if (el) el.textContent = String(new Date().getFullYear());
}

document.addEventListener("DOMContentLoaded", () => {
  renderYear();
  renderHero();
});
