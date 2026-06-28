// Health-check script for MovieVault API
// Usage:
//   API_URL=http://localhost:5000 AUTH_TOKEN=<Clerk JWT> node backend/scripts/health-check.js

const BASE =
  process.env.API_URL || process.env.BASE_URL || "http://localhost:5000";
const AUTH = process.env.AUTH_TOKEN || null;

const headers = { "Content-Type": "application/json" };
if (AUTH) headers["Authorization"] = `Bearer ${AUTH}`;

const fetcher = global.fetch
  ? global.fetch
  : (...args) =>
      import("node-fetch").then(({ default: fetch }) => fetch(...args));

async function req(path, options = {}) {
  const url = `${BASE}${path}`;
  const opts = {
    headers: { ...headers, ...(options.headers || {}) },
    ...options,
  };
  console.log("->", opts.method || "GET", url);
  const res = await fetcher(url, opts);
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    data = text;
  }
  return { ok: res.ok, status: res.status, data };
}

async function main() {
  try {
    const endpoints = [
      { path: "/", check: (r) => r.ok },
      {
        path: "/api/movies/tmdb/trending",
        check: (r) => Array.isArray(r.data.results),
      },
      {
        path: "/api/movies/tmdb/popular",
        check: (r) => Array.isArray(r.data.results),
      },
      {
        path: "/api/movies/tmdb/search?query=matrix",
        check: (r) => Array.isArray(r.data.results),
      },
    ];

    for (const ep of endpoints) {
      const res = await req(ep.path);
      console.log(`<- ${ep.path} [${res.status}]`);
      if (!ep.check(res)) {
        console.error("Check failed for", ep.path, res.data);
        process.exitCode = 2;
      } else {
        console.log("OK");
      }
    }

    if (!AUTH) {
      console.warn(
        "No AUTH_TOKEN provided — skipping protected endpoint checks.",
      );
      return;
    }

    // Attempt to sync user (requires valid Clerk JWT)
    const syncBody = JSON.stringify({
      email: "healthcheck+test@example.com",
      name: "Health Check",
    });
    const syncRes = await req("/api/movies/sync-user", {
      method: "POST",
      body: syncBody,
    });
    console.log(
      "<- /api/movies/sync-user",
      syncRes.status,
      syncRes.data && syncRes.data._id
        ? "synced"
        : JSON.stringify(syncRes.data).slice(0, 200),
    );

    // Sample movie payload used for add/get/remove tests
    const sample = {
      movieId: 99999999,
      title: "Healthcheck Movie",
      posterPath: "/health.jpg",
      backdropPath: "/health_back.jpg",
      rating: 9.9,
      releaseDate: "2026-01-01",
    };

    const favAdd = await req("/api/movies/favorites/add", {
      method: "POST",
      body: JSON.stringify(sample),
    });
    console.log("<- favorites add", favAdd.status);
    if (favAdd.status !== 201) {
      console.error("Favorites add failed:", favAdd.data);
      process.exitCode = 3;
    }

    const favGet = await req("/api/movies/favorites");
    const foundFav =
      Array.isArray(favGet.data) &&
      favGet.data.some((f) => Number(f.movieId) === sample.movieId);
    console.log("Favorites present:", foundFav);

    const favDel = await req(`/api/movies/favorites/remove/${sample.movieId}`, {
      method: "DELETE",
    });
    console.log("<- favorites remove", favDel.status);

    const wlAdd = await req("/api/movies/watchlist/add", {
      method: "POST",
      body: JSON.stringify(sample),
    });
    console.log("<- watchlist add", wlAdd.status);

    const wlGet = await req("/api/movies/watchlist");
    const foundWl =
      Array.isArray(wlGet.data) &&
      wlGet.data.some((w) => Number(w.movieId) === sample.movieId);
    console.log("Watchlist present:", foundWl);

    const wlDel = await req(`/api/movies/watchlist/remove/${sample.movieId}`, {
      method: "DELETE",
    });
    console.log("<- watchlist remove", wlDel.status);

    console.log("Health-check complete.");
  } catch (err) {
    console.error("Health-check error:", err);
    process.exitCode = 1;
  }
}

main();
