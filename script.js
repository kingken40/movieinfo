const API_KEY = "ee9d8de7";
const BASE_URL = "https://www.omdbapi.com/";

const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const typeFilter = document.getElementById("typeFilter");
const yearFilter = document.getElementById("yearFilter");
const sortFilter = document.getElementById("sortFilter");
const resultsGrid = document.getElementById("resultsGrid");
const resultsHeading = document.getElementById("resultsHeading");
const noResults = document.getElementById("noResults");

(function populateYears() {
  const currentYear = new Date().getFullYear();
  for (let y = currentYear; y >= currentYear - 50; y--) {
    const opt = document.createElement("option");
    opt.value = y;
    opt.textContent = y;
    yearFilter.appendChild(opt);
  }
})();

function sortMovies(movies) {
  const order = sortFilter.value;
  const sorted = [...movies];
  if (order === "az") sorted.sort((a, b) => a.Title.localeCompare(b.Title));
  else if (order === "za") sorted.sort((a, b) => b.Title.localeCompare(a.Title));
  else if (order === "newest") sorted.sort((a, b) => parseInt(b.Year) - parseInt(a.Year));
  else if (order === "oldest") sorted.sort((a, b) => parseInt(a.Year) - parseInt(b.Year));
  return sorted;
}

function showSkeletons(count = 6) {
  resultsGrid.innerHTML = "";
  noResults.classList.add("hidden");
  resultsHeading.classList.add("hidden");
  for (let i = 0; i < count; i++) {
    const skeleton = document.createElement("div");
    skeleton.classList.add("skeleton");
    skeleton.innerHTML = `
      <div class="skeleton-img"></div>
      <div class="skeleton-line"></div>
      <div class="skeleton-line short"></div>
    `;
    resultsGrid.appendChild(skeleton);
  }
}

function createCard(movie) {
  const card = document.createElement("div");
  card.classList.add("card");
  const posterSrc = movie.Poster && movie.Poster !== "N/A"
    ? movie.Poster
    : "https://via.placeholder.com/300x445/1c1c1c/555555?text=No+Image";
  card.innerHTML = `
    <img src="${posterSrc}" alt="${movie.Title}" loading="lazy" />
    <div class="card-info">
      <div class="card-title" title="${movie.Title}">${movie.Title}</div>
      <div class="card-year">${movie.Year}</div>
      <span class="card-type">${movie.Type}</span>
    </div>
  `;
  return card;
}

let lastMovies = [];
let lastQuery = "";

function renderMovies(movies, query) {
  resultsGrid.innerHTML = "";
  const sorted = sortMovies(movies);
  resultsHeading.innerHTML = `Search results for <span>"${query}"</span> — ${sorted.length} result${sorted.length !== 1 ? "s" : ""} shown`;
  resultsHeading.classList.remove("hidden");
  noResults.classList.add("hidden");
  sorted.forEach((movie) => resultsGrid.appendChild(createCard(movie)));
}

async function search() {
  const query = searchInput.value.trim();
  if (!query) return;
  showSkeletons(6);
  lastMovies = [];
  lastQuery = query;
  const params = new URLSearchParams({ apikey: API_KEY, s: query });
  if (typeFilter.value) params.append("type", typeFilter.value);
  if (yearFilter.value) params.append("y", yearFilter.value);
  try {
    const response = await fetch(`${BASE_URL}?${params}`);
    const data = await response.json();
    if (data.Response === "False" || !data.Search || data.Search.length === 0) {
      resultsGrid.innerHTML = "";
      noResults.classList.remove("hidden");
      resultsHeading.classList.add("hidden");
      return;
    }
    lastMovies = data.Search.slice(0, 6);
    renderMovies(lastMovies, query);
  } catch (error) {
    resultsGrid.innerHTML = "";
    noResults.classList.remove("hidden");
    noResults.querySelector("p").textContent = "⚠️ Something went wrong. Please try again.";
    console.error("Fetch error:", error);
  }
}

searchBtn.addEventListener("click", search);
searchInput.addEventListener("keydown", (e) => { if (e.key === "Enter") search(); });
sortFilter.addEventListener("change", () => { if (lastMovies.length > 0) renderMovies(lastMovies, lastQuery); });
