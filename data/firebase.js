// ============================================================
//  SoundWave — Firebase Realtime Database (v9 — оптимизирован)
//  База: https://soundwave-45787-default-rtdb.europe-west1.firebasedatabase.app/
// ============================================================

const FIREBASE_URL = "https://soundwave-45787-default-rtdb.europe-west1.firebasedatabase.app";

// Таймаут fetch (мс). На слабых соединениях Firebase может висеть 30+ сек.
const FIREBASE_TIMEOUT_MS = 8000;

// Версия кеша — увеличивать при изменении схемы DB
const CACHE_KEY   = "sw_firebase_cache";
const CACHE_VER   = "sw_cache_ver";
const CACHE_VER_V = "2";

const Firebase = {

  // ── Fetch с таймаутом ────────────────────────────────────
  async _fetch(url, opts = {}) {
    const ctrl = new AbortController();
    const tid  = setTimeout(() => ctrl.abort(), FIREBASE_TIMEOUT_MS);
    try {
      const res = await fetch(url, { ...opts, signal: ctrl.signal });
      clearTimeout(tid);
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res;
    } catch(e) {
      clearTimeout(tid);
      throw e;
    }
  },

  // ── Читать всю базу ──────────────────────────────────────
  async loadAll() {
    try {
      const res  = await this._fetch(`${FIREBASE_URL}/db.json`);
      const data = await res.json();
      return data; // { artists, albums, tracks, genres } или null
    } catch(e) {
      console.warn("Firebase read error:", e.name === "AbortError"
        ? `Таймаут ${FIREBASE_TIMEOUT_MS}мс`
        : e.message);
      return null;
    }
  },

  // ── Записать всю базу ────────────────────────────────────
  async saveAll(data) {
    try {
      await this._fetch(`${FIREBASE_URL}/db.json`, {
        method:  "PUT",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(data)
      });
      return true;
    } catch(e) {
      console.warn("Firebase write error:", e.message);
      return false;
    }
  },

  // ── Загрузить данные в объект DB ─────────────────────────
  async syncToLocalDB() {
    const data = await this.loadAll();
    if (!data) return false;
    if (data.artists) DB.artists = data.artists;
    if (data.albums)  DB.albums  = data.albums;
    if (data.tracks)  DB.tracks  = data.tracks;
    if (data.genres)  DB.genres  = data.genres;
    // Кешируем с меткой версии
    try {
      localStorage.setItem(CACHE_KEY,  JSON.stringify(data));
      localStorage.setItem(CACHE_VER,  CACHE_VER_V);
      localStorage.setItem("sw_cache_ts", Date.now());
    } catch(e) {}
    return true;
  },

  // ── Загрузить из кеша (если Firebase недоступен) ─────────
  loadFromCache() {
    try {
      // Инвалидация кеша при смене версии схемы
      if (localStorage.getItem(CACHE_VER) !== CACHE_VER_V) {
        localStorage.removeItem(CACHE_KEY);
        return false;
      }
      const raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return false;
      const data = JSON.parse(raw);
      if (data.artists) DB.artists = data.artists;
      if (data.albums)  DB.albums  = data.albums;
      if (data.tracks)  DB.tracks  = data.tracks;
      if (data.genres)  DB.genres  = data.genres;
      return true;
    } catch(e) { return false; }
  },

  // ── Возраст кеша в секундах (для отображения в UI) ───────
  cacheAge() {
    const ts = parseInt(localStorage.getItem("sw_cache_ts") || "0");
    return ts ? Math.round((Date.now() - ts) / 1000) : null;
  }
};
