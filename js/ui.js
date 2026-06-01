// ============================================================
//  SoundWave — UI helpers
// ============================================================

function showToast(msg, duration = 2400) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove("show"), duration);
}

// ── Модалка: создать плейлист ──────────────────────────────
let _createPlaylistCb = null;

function openCreatePlaylist(cb) {
  _createPlaylistCb = cb;
  document.getElementById("modal-pl-input").value = "";
  document.getElementById("modal-create-playlist").classList.add("open");
  setTimeout(() => document.getElementById("modal-pl-input").focus(), 80);
}

function closeCreatePlaylist() {
  document.getElementById("modal-create-playlist").classList.remove("open");
  _createPlaylistCb = null;
}

// Вызывается ТОЛЬКО из кнопки «Создать» и Enter — НЕ из других мест
function confirmCreatePlaylist() {
  const name = document.getElementById("modal-pl-input").value.trim();
  if (!name) { showToast("⚠️ Введи название плейлиста"); return; }

  const pl = PlaylistManager.create(name);
  closeCreatePlaylist();

  // cb получает готовый объект плейлиста
  if (_createPlaylistCb) _createPlaylistCb(pl);
  _createPlaylistCb = null;

  refreshSidebarPlaylists();
  showToast("🎵 Плейлист «" + name + "» создан");
}

// ── Модалка: добавить в плейлист ──────────────────────────
let _addTrackId = null;

function openAddToPlaylist(trackId) {
  _addTrackId = trackId;
  renderPlaylistPicker();
  document.getElementById("modal-add-to-playlist").classList.add("open");
}

function closeAddToPlaylist() {
  document.getElementById("modal-add-to-playlist").classList.remove("open");
  _addTrackId = null;
}

function renderPlaylistPicker() {
  const list = document.getElementById("playlist-picker-list");
  const playlists = PlaylistManager.getAll();
  if (!playlists.length) {
    list.innerHTML = `<div class="empty-state" style="padding:20px 0">
      <div class="empty-icon">📭</div><p>Нет плейлистов</p>
    </div>`;
    return;
  }
  list.innerHTML = playlists.map(p => `
    <div class="playlist-modal-item" onclick="addToPlaylistConfirm(${p.id})">
      <span class="pm-icon">🎵</span>
      <span>${escHtml(p.name)}</span>
      <span style="margin-left:auto;font-size:12px;color:var(--text-muted)">${p.track_ids.length} тр.</span>
    </div>
  `).join("");
}

function addToPlaylistConfirm(playlistId) {
  if (_addTrackId === null) return;
  PlaylistManager.addTrack(playlistId, _addTrackId);
  const pl = PlaylistManager.getAll().find(p => p.id === playlistId);
  showToast(`✅ Добавлено в «${pl?.name}»`);
  closeAddToPlaylist();
  refreshSidebarPlaylists();
  if (typeof Pages !== "undefined") Pages.playlists?.refresh?.();
}

// ── Экранирование HTML ────────────────────────────────────
function escHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// ── Строка трека ──────────────────────────────────────────
function renderTrackRow(track, index, queueList) {
  const full     = DB.getTrackFull(track);
  const isPlay   = Player.getCurrentId() === track.id;
  const inPl     = PlaylistManager.getAll().some(p => p.track_ids.includes(track.id));
  // cover: сначала собственная обложка трека, затем обложка альбома
  const coverUrl = track.cover || full.album?.cover || "";
  const genre    = full.genre;
  const ids      = (queueList || DB.tracks).map(t => t.id).join(",");

  return `
    <div class="track-row${isPlay ? " playing" : ""}"
         data-track-id="${track.id}"
         onclick="Player.play(${track.id}, [${ids}])"
         ontouchend="event.preventDefault();Player.play(${track.id}, [${ids}])">
      <div class="track-num">${isPlay ? "▶" : index + 1}</div>
      <img class="track-cover" src="${coverUrl}" alt=""
           onerror="this.style.background='var(--bg-elevated)';this.removeAttribute('src')">
      <div class="track-info">
        <div class="track-name">${escHtml(track.title)}</div>
        <div class="track-artist">${escHtml(full.artist?.name || "")}</div>
      </div>
      <span class="track-genre-badge genre-${genre?.id || 0}">${escHtml(genre?.name || "")}</span>
      <span class="track-year">${track.year}</span>
      <span class="track-duration">${Player.fmtTime(track.duration)}</span>
      <button class="track-action-btn${inPl ? " in-playlist" : ""}"
              title="Добавить в плейлист"
              onclick="event.stopPropagation();openAddToPlaylist(${track.id})">＋</button>
    </div>`;
}

// ── Сайдбар: список плейлистов ────────────────────────────
function refreshSidebarPlaylists() {
  const container = document.getElementById("sidebar-playlists");
  const playlists = PlaylistManager.getAll();
  container.innerHTML = playlists.map(p => `
    <div class="playlist-item-sidebar" onclick="Pages.playlists.open(${p.id})">
      <span class="pl-dot"></span>
      <span>${escHtml(p.name)}</span>
    </div>
  `).join("") + `
    <div class="playlist-item-sidebar" style="color:var(--accent-1)"
         onclick="openCreatePlaylist((pl) => { Pages.playlists.refresh?.(); })">
      <span style="font-size:14px">＋</span>
      <span>Создать плейлист</span>
    </div>`;
}

// ── Кастомный попап подтверждения (для index.html) ────────
function showConfirmPopup(title, subtitle, onConfirm) {
  let overlay = document.getElementById("sw-confirm-overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "sw-confirm-overlay";
    overlay.innerHTML = `
      <div id="sw-confirm-box">
        <div id="sw-confirm-icon">⚠️</div>
        <div id="sw-confirm-title"></div>
        <div id="sw-confirm-sub"></div>
        <div class="sw-confirm-btns">
          <button id="sw-confirm-no">Отмена</button>
          <button id="sw-confirm-yes">Удалить</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);

    // Стили встроим сюда
    const style = document.createElement("style");
    style.textContent = `
      #sw-confirm-overlay {
        position:fixed;inset:0;background:rgba(0,0,0,.65);
        backdrop-filter:blur(8px);z-index:2000;
        display:none;align-items:center;justify-content:center;
      }
      #sw-confirm-overlay.open { display:flex; }
      #sw-confirm-box {
        background:var(--bg-elevated);border:1px solid var(--border);
        border-radius:var(--radius-xl);padding:32px 28px;
        min-width:300px;max-width:400px;width:90%;
        box-shadow:0 24px 60px rgba(0,0,0,.5);
        text-align:center;
        animation:sw-pop .2s cubic-bezier(.34,1.56,.64,1);
      }
      @keyframes sw-pop {
        from { opacity:0; transform:scale(.9) translateY(10px); }
        to   { opacity:1; transform:scale(1) translateY(0); }
      }
      #sw-confirm-icon { font-size:38px; margin-bottom:12px; }
      #sw-confirm-title {
        font-family:'Syne',sans-serif;font-size:17px;font-weight:700;
        margin-bottom:8px;color:var(--text-primary);
      }
      #sw-confirm-sub {
        font-size:13px;color:var(--text-secondary);margin-bottom:24px;line-height:1.5;
      }
      .sw-confirm-btns { display:flex;gap:10px;justify-content:center; }
      #sw-confirm-no {
        padding:9px 22px;border-radius:99px;font-size:13px;font-weight:600;
        border:1px solid var(--border);background:transparent;
        color:var(--text-secondary);cursor:pointer;
        transition:all .2s;font-family:'DM Sans',sans-serif;
      }
      #sw-confirm-no:hover { border-color:var(--text-muted);color:var(--text-primary); }
      #sw-confirm-yes {
        padding:9px 22px;border-radius:99px;font-size:13px;font-weight:600;
        border:none;background:linear-gradient(135deg,#ef4444,#dc2626);
        color:#fff;cursor:pointer;
        box-shadow:0 4px 14px rgba(239,68,68,.4);
        transition:opacity .2s;font-family:'DM Sans',sans-serif;
      }
      #sw-confirm-yes:hover { opacity:.85; }
    `;
    document.head.appendChild(style);

    overlay.addEventListener("click", e => { if (e.target === overlay) _swConfirmNo(); });
    document.getElementById("sw-confirm-no").addEventListener("click", _swConfirmNo);
    document.getElementById("sw-confirm-yes").addEventListener("click", _swConfirmYes);
  }

  document.getElementById("sw-confirm-title").textContent = title;
  document.getElementById("sw-confirm-sub").textContent   = subtitle;
  overlay.classList.add("open");
  window._swConfirmCb = onConfirm;
}

function _swConfirmYes() {
  document.getElementById("sw-confirm-overlay").classList.remove("open");
  if (window._swConfirmCb) { window._swConfirmCb(); window._swConfirmCb = null; }
}

function _swConfirmNo() {
  document.getElementById("sw-confirm-overlay").classList.remove("open");
  window._swConfirmCb = null;
}
