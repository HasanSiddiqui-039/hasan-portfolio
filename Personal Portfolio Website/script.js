const menuToggle = document.getElementById("menuToggle");
const mobileNav = document.getElementById("mobileNav");
const cursorGlow = document.getElementById("cursorGlow");

if (menuToggle && mobileNav) {
    menuToggle.addEventListener("click", () => {
        const open = mobileNav.classList.toggle("open");
        menuToggle.textContent = open ? "✕" : "☰";
        menuToggle.setAttribute("aria-expanded", String(open));
        menuToggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
    });

    mobileNav.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => {
            mobileNav.classList.remove("open");
            menuToggle.textContent = "☰";
            menuToggle.setAttribute("aria-expanded", "false");
        });
    });
}

document.addEventListener("keydown", event => {
    if (event.key === "Escape" && mobileNav && menuToggle) {
        mobileNav.classList.remove("open");
        menuToggle.textContent = "☰";
        menuToggle.setAttribute("aria-expanded", "false");
    }
});

if (cursorGlow && window.matchMedia("(pointer:fine)").matches) {
    window.addEventListener("pointermove", event => {
        cursorGlow.style.left = `${event.clientX}px`;
        cursorGlow.style.top = `${event.clientY}px`;
    });
}

const revealItems = document.querySelectorAll(".reveal");
const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.12 });
revealItems.forEach(item => revealObserver.observe(item));

const sections = document.querySelectorAll("main section[id]");
const navLinks = document.querySelectorAll(".desktop-nav .nav-link");
const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        navLinks.forEach(link => {
            link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`);
        });
    });
}, { rootMargin: "-40% 0px -50% 0px" });
sections.forEach(section => sectionObserver.observe(section));

const contactForm = document.getElementById("contactForm");
if (contactForm) {
    contactForm.addEventListener("submit", event => {
        event.preventDefault();
        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const message = document.getElementById("message").value.trim();

        if (!name || !email || !message) return;

        const subject = encodeURIComponent(`Portfolio contact from ${name}`);
        const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);
        window.location.href = `mailto:hs0721507@gmail.com?subject=${subject}&body=${body}`;
    });
}

const GITHUB_USER = "HasanSiddiqui-039";
const reposGrid = document.getElementById("reposGrid");
const repoCount = document.getElementById("repoCount");

function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text ?? "";
    return div.innerHTML;
}

function prettyName(name) {
    return name.replace(/[-_]+/g, " ");
}

async function loadRepos() {
    if (!reposGrid) return;
    try {
        const res = await fetch(`https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&sort=updated`);
        if (!res.ok) throw new Error(res.status);
        const repos = (await res.json())
            .filter(repo => !repo.fork)
            .sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at));

        if (!repos.length) {
            reposGrid.innerHTML = `<div class="repo-status">NO PUBLIC REPOSITORIES YET.</div>`;
            repoCount.textContent = "00 REPOSITORIES";
            return;
        }

        repoCount.textContent = `${String(repos.length).padStart(2, "0")} REPOSITORIES`;
        reposGrid.innerHTML = repos.map((repo, i) => {
            const delay = i % 3 ? ` delay-${i % 3}` : "";
            const updated = new Date(repo.pushed_at).toLocaleDateString("en-GB", { month: "short", year: "numeric" });
            return `
                <a class="project-card reveal${delay}" href="${repo.html_url}" target="_blank" rel="noopener noreferrer">
                    <div class="project-top"><span>${String(i + 1).padStart(2, "0")}</span><span>${escapeHtml((repo.language || "REPOSITORY").toUpperCase())}</span></div>
                    <h3>${escapeHtml(prettyName(repo.name))}</h3>
                    <p>${escapeHtml(repo.description || "No description added yet.")}</p>
                    <span class="project-link">VIEW ON GITHUB ↗</span>
                    <span class="repo-meta">★ ${repo.stargazers_count} · ${updated.toUpperCase()}</span>
                </a>`;
        }).join("");

        reposGrid.querySelectorAll(".reveal").forEach(item => revealObserver.observe(item));
    } catch (error) {
        repoCount.textContent = "UNAVAILABLE";
        reposGrid.innerHTML = `<div class="repo-status">COULD NOT LOAD REPOSITORIES RIGHT NOW. <a href="https://github.com/${GITHUB_USER}?tab=repositories" target="_blank" rel="noopener noreferrer">OPEN GITHUB ↗</a></div>`;
    }
}

loadRepos();

document.getElementById("year").textContent = new Date().getFullYear();
