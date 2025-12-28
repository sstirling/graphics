let ALL = [];

const grid = document.getElementById("grid");
const q = document.getElementById("q");

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

function targetUrl(item) {
  // Click goes to interactive if present; else image.
  return item.interactive || item.image;
}

function render() {
  const query = q.value.trim();

  const items = ALL
    .filter(d => matches(d, query))
    .sort((a, b) => (b.year || 0) - (a.year || 0));

  grid.innerHTML = "";

  for (const d of items) {
    const card = document.createElement("article");
    card.className = "card";
    card.tabIndex = 0;
    card.setAttribute("role", "link");
    card.setAttribute("aria-label", d.title ? `Open: ${d.title}` : "Open graphic");

    const img = document.createElement("img");
    img.src = d.image;
    img.loading = "lazy";
    img.alt = d.alt || d.title || "Graphic";
    card.appendChild(img);

    const url = targetUrl(d);

    card.addEventListener("click", () => {
      window.open(url, "_blank", "noopener");
    });

    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        window.open(url, "_blank", "noopener");
      }
    });

    grid.appendChild(card);
  }
}

async function init() {
  const res = await fetch("data/graphics.json");
  ALL = await res.json();
  render();
}

q.addEventListener("input", render);

init();
