// ============================================================
//  SoundWave — Firebase Realtime Database синхронизация
//  База: https://soundwave-45787-default-rtdb.europe-west1.firebasedatabase.app/
// ============================================================

const FIREBASE_URL = "https://soundwave-45787-default-rtdb.europe-west1.firebasedatabase.app";

const Firebase = {

  // ── Читать всю базу ──────────────────────────────────────
  async loadAll() {
    try {
      const res = await fetch(`${FIREBASE_URL}/db.json`);
      if (!res.ok) throw new Error("HTTP " + res.status);
      const data = await res.json();
      return data; // { artists, albums, tracks, genres } или null
    } catch(e) {
      console.warn("Firebase read error:", e);
      return null;
    }
  },

  // ── Записать всю базу ────────────────────────────────────
  async saveAll(data) {
    try {
      const res = await fetch(`${FIREBASE_URL}/db.json`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error("HTTP " + res.status);
      return true;
    } catch(e) {
      console.warn("Firebase write error:", e);
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
    // Кешируем в localStorage для офлайн-режима
    try {
      localStorage.setItem("sw_firebase_cache", JSON.stringify(data));
    } catch(e) {}
    return true;
  },

  // ── Загрузить из кеша (если Firebase недоступен) ─────────
  loadFromCache() {
    try {
      const raw = localStorage.getItem("sw_firebase_cache");
      if (!raw) return false;
      const data = JSON.parse(raw);
      if (data.artists) DB.artists = data.artists;
      if (data.albums)  DB.albums  = data.albums;
      if (data.tracks)  DB.tracks  = data.tracks;
      if (data.genres)  DB.genres  = data.genres;
      return true;
    } catch(e) { return false; }
  }
};
