const REPOS = [
  { owner: 'Yoddikko', repo: 'Automercatorum-Guardalezioni',           elementId: 'version-guardalezioni' },
  { owner: 'Yoddikko', repo: 'Automercatorum-Downloader-di-dispense',  elementId: 'version-downloader'    },
  { owner: 'Yoddikko', repo: 'Automercatorum-video-export',            elementId: 'version-videoexport'   },
];

async function fetchLatestRelease(owner, repo) {
  try {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/releases/latest`, {
      headers: { Accept: 'application/vnd.github.v3+json' }
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.tag_name || null;
  } catch {
    return null;
  }
}

async function updateVersions() {
  for (const { owner, repo, elementId } of REPOS) {
    const version = await fetchLatestRelease(owner, repo);
    const el = document.getElementById(elementId);
    if (el) el.textContent = version ? version : '';
  }
}

document.addEventListener('DOMContentLoaded', updateVersions);
