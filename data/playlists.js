// ============================================================
//  SoundWave — менеджер плейлистов (localStorage)
// ============================================================

const PlaylistManager = {
  STORAGE_KEY: "soundwave_playlists",

  load() {
    try {
      return JSON.parse(localStorage.getItem(this.STORAGE_KEY)) || [];
    } catch { return []; }
  },

  save(playlists) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(playlists));
  },

  getAll() { return this.load(); },

  create(name) {
    const playlists = this.load();
    const newPl = {
      id: Date.now(),
      name,
      track_ids: [],
      created_at: new Date().toISOString(),
    };
    playlists.push(newPl);
    this.save(playlists);
    return newPl;
  },

  delete(id) {
    const playlists = this.load().filter(p => p.id !== id);
    this.save(playlists);
  },

  rename(id, name) {
    const playlists = this.load().map(p => p.id === id ? { ...p, name } : p);
    this.save(playlists);
  },

  addTrack(playlist_id, track_id) {
    const playlists = this.load().map(p => {
      if (p.id !== playlist_id) return p;
      if (p.track_ids.includes(track_id)) return p;
      return { ...p, track_ids: [...p.track_ids, track_id] };
    });
    this.save(playlists);
  },

  removeTrack(playlist_id, track_id) {
    const playlists = this.load().map(p => {
      if (p.id !== playlist_id) return p;
      return { ...p, track_ids: p.track_ids.filter(id => id !== track_id) };
    });
    this.save(playlists);
  },

  getTracks(playlist_id) {
    const pl = this.load().find(p => p.id === playlist_id);
    if (!pl) return [];
    return pl.track_ids.map(id => DB.getTrack(id)).filter(Boolean);
  },

  isInAnyPlaylist(track_id) {
    return this.load().some(p => p.track_ids.includes(track_id));
  },
};
