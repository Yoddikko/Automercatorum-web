// Configuration
const REPOS = [
    {
        owner: 'Yoddikko',
        repo: 'Automercatorum-Guardalezioni',
        elementId: 'version-guardalezioni'
    },
    {
        owner: 'Yoddikko',
        repo: 'Automercatorum-Downloader-di-dispense',
        elementId: 'version-downloader'
    }
];

// Fetch latest release from GitHub API
async function fetchLatestRelease(owner, repo) {
    try {
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/releases/latest`, {
            headers: {
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        if (!response.ok) {
            console.warn(`No releases found for ${owner}/${repo}`);
            return null;
        }
        
        const data = await response.json();
        return {
            version: data.tag_name,
            url: data.html_url,
            name: data.name
        };
    } catch (error) {
        console.error(`Error fetching release for ${owner}/${repo}:`, error);
        return null;
    }
}

// Update version tags on the page
async function updateVersionTags() {
    for (const repo of REPOS) {
        const release = await fetchLatestRelease(repo.owner, repo.repo);
        const element = document.getElementById(repo.elementId);
        
        if (element && release) {
            element.textContent = `(${release.version})`;
            element.style.opacity = '1';
        } else if (element) {
            element.textContent = '';
        }
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', updateVersionTags);

// Refresh versions every 5 minutes
setInterval(updateVersionTags, 5 * 60 * 1000);
