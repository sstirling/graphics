let ALL = [];
let activeTag = null;
let activeCat = null;

const grid = document.getElementById("grid");
const q = document.getElementById("q");
const tagbar = document.getElementById("tagbar");
const catbar = document.getElementById("catbar");

const lightbox = document.getElementById("lightbox");
const lbImg = document.getElementById("lbImg");
const lbTitle = document.getElementById("lbTitle");
const lbTags = document.getElementById("lbTags");
const lbInteractive = document.getElementById("lbInteractive");
const lbDownload = document.getElementById("lbDownload");
const lbClose = document.getElementById("lbClose");

function uniq(arr) {
  return [...new Set(arr)].filter(Boolean).sort((a, b) => a.localeCompare(b));
}

function buildPills(container, items, activeValue, onPick, allLabel = "All") {
  container.innerHTML = "";

  const allBtn = document.createElement("button");
  allBtn.className = "tag" + (activeValue ? "" : " active");
  allBtn.textContent = allLabel;
  allBtn.onclick = () => onPick(null);
  container.appendChild(allBtn);

  for (const v of items) {
    const b = document.createElement("button");
    b.className = "tag" + (activeValue === v ? " active" : "");
    b.textContent = v;
    b.onclick = () => onPick(activeValue === v ? null : v);
    container.appendChild(b);
  }
}

function buildFilters() {
  const cats = uniq(ALL.map(d => d.category || "Uncategorized"));
  buildPills(catbar, cats, activeCat, (v) => { activeCat = v; render(); }, "All categories");

  const tags = uniq(ALL.flatMap(d => d.tags || []));
  buildPills(tagbar, tags, activeTag, (v) => { activeTag = v; render(); }, "All tags");
}

function matches(item, query) {
  if (!query) return true;
  const hay = [
    item.title || "",
    item.category || "",
    String(item.year || ""),
    ...(item.tags || [])
  ].join(" ").toLowerCase();
  return hay.includes(query.toLowerCase());
}

function passesCat(item) {
  if (!activeCat) return true;
  return (item.category || "Uncategorized") === activeCat;
}

function passesTag(item) {
  if (!activeTag) return true;
  return (item.tags || []).includes(activeTag);
}

function openLightbox(item) {
  lbImg.src = item.image;
  lbImg.alt = item.alt || item.title || "Graphic";
  lbTitle.textContent = item.title || "Untitled";

  const tagText = [
    item.category ? `Category: ${item.category}` : null,
    item.year ? `Year: ${item.year}` : null,
    (item.tags && item.tags.length) ? `Tags: ${(item.tags || []).join(", ")}` : null
  ].filter(Boolean).join(" • ");
  lbTags.textContent = tagText;

  lbDownload.href = item.image;

  if (item.interactive) {
    lbInteractive.href = item.interactive;
    lbInteractive.style.display = "inline-flex";
  } else {
    lbInteractive.style.display = "none";
  }

  lightbox.classList.add("open");
  lightbox.setAttribute("aria-hidden", "false");
}

function closeLightbox() {
  lightbox.classList.remove("open");
  lightbox.setAttribute("aria-hidden", "true");
}

function render() {
  const query = q.value.trim();

  const items = ALL
    .filter(d => passesCat(d))
    .filter(d => passesTag(d))
    .filter(d => matches(d, query))
    .sort((a, b) => (b.year || 0) - (a.year || 0));

  buildFilters();

  grid.innerHTML = "";
  for (const d of items) {
    const card = document.createElement("article");
    card.className = "card";
    card.tabIndex = 0;

    const img = document.createElement("img");
    img.src = d.image;
    img.loading = "lazy";
    img.alt = d.alt || d.title || "Graphic";
    card.appendChild(img);

    const overlay = document.createElement("div");
    overlay.className = "overlay";

    const meta = document.createElement("div");
    meta.className = "meta";

    const title = document.createElement("p");
    title.className = "title";
    title.textContent = d.title || "Untitled";

    const year = document.createElement("span");
    year.className = "year";
    year.textContent = d.year ? String(d.year) : "";

    meta.appendChild(title);
    meta.appendChild(year);

    const badges = document.createElement("div");
    badges.className = "badges";

    const cat = d.category || "Uncategorized";
    const catBadge = document.createElement("span");
    catBadge.className = "badge";
    catBadge.textContent = cat;
    badges.appendChild(catBadge);

    (d.tags || []).slice(0, 2).forEach(t => {
      const b = document.createElement("span");
      b.className = "badge";
      b.textContent = t;
      badges.appendChild(b);
    });

    overlay.appendChild(meta);
    overlay.appendChild(badges);
    card.appendChild(overlay);

    card.addEventListener("click", () => openLightbox(d));
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") openLightbox(d);
    });

    grid.appendChild(card);
  }
}

async function init() {
  const res = await fetch("data/graphics.json");
  ALL = await res.json();
  buildFilters();
  render();
}

q.addEventListener("input", render);
lbClose.addEventListener("click", closeLightbox);
lightbox.addEventListener("click", (e) => { if (e.target === lightbox) closeLightbox(); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeLightbox(); });

init();
