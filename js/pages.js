// ============================================================
//  SoundWave — Pages & Router
// ============================================================

const Router = (() => {
  let current = null;

  function go(pageId, params = {}) {
    // Скрыть все страницы
    document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));

    // Показать нужную
    const pageEl = document.getElementById("page-" + pageId);
    if (!pageEl) return;
    pageEl.classList.add("active");

    // Обновить навигацию
    document.querySelectorAll(".nav-item").forEach(n => {
      n.classList.toggle("active", n.dataset.page === pageId);
    });

    current = pageId;

    // Рендер страницы
    if (Pages[pageId]) Pages[pageId].render(params);

    // Скролл наверх
    document.getElementById("main").scrollTop = 0;
  }

  return { go, current: () => current };
})();

// ============================================================
const Pages = {};

// ── HOME ─────────────────────────────────────────────────
Pages.home = {
  render() {
    const genreStats = DB.countByGenre();
    const newTracks  = [...DB.tracks].reverse().slice(0, 8);
    const featured   = DB.artists.slice(0, 6);

    document.getElementById("page-home").innerHTML = `
      <div class="home-hero">
        <h1>Слушай музыку.<br>Открывай новое.</h1>
        <p>Тысячи треков — бесплатно и без рекламы.<br>Создавай плейлисты, ищи исполнителей, наслаждайся.</p>
        <button class="btn-primary" onclick="Router.go('catalog')" style="display:inline-flex;align-items:center;gap:10px"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg> Слушать сейчас</button>
      </div>

      <div class="stats-row">
        ${genreStats.map(g => `
          <div class="stat-card">
            <div class="stat-number">${g.count}</div>
            <div class="stat-label">${g.icon} ${g.name}</div>
          </div>
        `).join("")}
      </div>

      <div class="section-title">
        Новые треки
        <span class="see-all" onclick="Router.go('catalog')">Смотреть все →</span>
      </div>
      <div class="track-list" id="home-tracks">
        ${newTracks.map((t, i) => renderTrackRow(t, i, newTracks)).join("")}
      </div>

      <div class="spacer-md"></div>
      <div class="section-title">
        Исполнители
        <span class="see-all" onclick="Router.go('artists')">Смотреть все →</span>
      </div>
      <div class="artist-cards">
        ${featured.map(a => `
          <div class="artist-card" onclick="Router.go('artist-detail', {id:${a.id}})">
            <div class="artist-avatar">
              <img src="${a.photo}" alt="${escHtml(a.name)}" onerror="this.style.display='none'">
            </div>
            <div class="artist-card-name">${escHtml(a.name)}</div>
            <div class="artist-card-country">${a.country}</div>
          </div>
        `).join("")}
      </div>
    `;
  }
};

// ── CATALOG ──────────────────────────────────────────────
Pages.catalog = {
  activeGenre: 0,
  searchQuery: "",

  render() {
    document.getElementById("page-catalog").innerHTML = `
      <div class="page-header">
        <h1>Каталог</h1>
        <p>Все треки библиотеки</p>
      </div>

      <div class="search-bar">
        <span class="search-icon">🔍</span>
        <input type="text" placeholder="Поиск по названию или исполнителю..."
               id="catalog-search" value="${escHtml(this.searchQuery)}"
               oninput="Pages.catalog.onSearch(this.value)">
      </div>

      <div class="genre-filters">
        <button class="genre-pill${this.activeGenre === 0 ? " active" : ""}"
                onclick="Pages.catalog.filterGenre(0)">Все жанры</button>
        ${DB.genres.map(g => `
          <button class="genre-pill genre-${g.id}${this.activeGenre === g.id ? " active" : ""}"
                  onclick="Pages.catalog.filterGenre(${g.id})">
            ${g.icon} ${g.name}
          </button>
        `).join("")}
      </div>

      <div id="catalog-results"></div>
    `;

    this.renderTracks();
  },

  onSearch(q) {
    this.searchQuery = q;
    this.activeGenre = 0;
    this.renderTracks();
  },

  filterGenre(genreId) {
    this.activeGenre = genreId;
    this.searchQuery = "";
    document.getElementById("catalog-search").value = "";
    // обновить пилюли
    document.querySelectorAll(".genre-pill").forEach(btn => {
      const isAll = !btn.dataset.genre && genreId === 0;
      btn.classList.remove("active");
    });
    this.render();
  },

  renderTracks() {
    let tracks = this.searchQuery
      ? DB.searchTracks(this.searchQuery)
      : DB.filterTracksByGenre(this.activeGenre);

    const container = document.getElementById("catalog-results");
    if (!container) return;

    if (tracks.length === 0) {
      container.innerHTML = `<div class="empty-state">
        <div class="empty-icon">🎵</div>
        <p>Ничего не найдено</p>
        <small>Попробуйте другой запрос или жанр</small>
      </div>`;
      return;
    }

    const label = this.activeGenre
      ? `${DB.getGenre(this.activeGenre)?.icon} Жанр: <b>${DB.getGenre(this.activeGenre)?.name}</b> — ${tracks.length} треков`
      : this.searchQuery
        ? `Результаты поиска: <b>${tracks.length}</b> треков`
        : `Все треки: <b>${tracks.length}</b>`;

    container.innerHTML = `
      <p style="font-size:13px;color:var(--text-secondary);margin-bottom:14px">${label}</p>
      <div class="track-list">
        ${tracks.map((t, i) => renderTrackRow(t, i, tracks)).join("")}
      </div>
    `;
  },
};

// ── ARTISTS LIST ─────────────────────────────────────────
Pages.artists = {
  activeLetter: "",

  render() {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    const ruAlpha  = "АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ".split("");
    const allLetters = [...alphabet, ...ruAlpha];

    document.getElementById("page-artists").innerHTML = `
      <div class="page-header">
        <h1>Исполнители</h1>
        <p>Поиск по первой букве имени</p>
      </div>

      <div class="alpha-filter" id="alpha-filter">
        <button class="alpha-btn${!this.activeLetter ? " active" : ""}"
                onclick="Pages.artists.filterLetter('')">Все</button>
        ${allLetters.map(l => {
          const has = DB.artists.some(a => a.name.toUpperCase().startsWith(l));
          return `<button class="alpha-btn${has ? " has-results" : ""}${this.activeLetter === l ? " active" : ""}"
                          onclick="Pages.artists.filterLetter('${l}')"
                          ${!has ? "style='opacity:.35'" : ""}>${l}</button>`;
        }).join("")}
      </div>

      <div id="artists-grid" class="artist-cards"></div>
    `;

    this.renderArtists();
  },

  filterLetter(letter) {
    this.activeLetter = letter;
    this.render();
  },

  renderArtists() {
    const artists = this.activeLetter
      ? DB.searchArtistsByLetter(this.activeLetter)
      : DB.artists;

    const grid = document.getElementById("artists-grid");
    if (!grid) return;

    if (artists.length === 0) {
      grid.innerHTML = `<div class="empty-state"><div class="empty-icon">🔤</div>
        <p>Нет исполнителей на букву «${this.activeLetter}»</p></div>`;
      return;
    }

    grid.innerHTML = artists.map(a => `
      <div class="artist-card" onclick="Router.go('artist-detail', {id:${a.id}})">
        <div class="artist-avatar">
          <img src="${a.photo}" alt="${escHtml(a.name)}" onerror="this.style.display='none'">
        </div>
        <div class="artist-card-name">${escHtml(a.name)}</div>
        <div class="artist-card-country">${a.country}</div>
      </div>
    `).join("");
  },
};

// ── ARTIST DETAIL ─────────────────────────────────────────
Pages["artist-detail"] = {
  render({ id }) {
    const artist = DB.getArtist(id);
    if (!artist) return;

    const albums  = DB.getArtistAlbums(id);
    // Треки в альбомах
    const albumTrackIds = new Set(albums.flatMap(al => DB.getAlbumTracks(al.id).map(t => t.id)));
    // Все треки исполнителя (включая без альбома)
    const allArtistTracks = DB.tracks.filter(t => +t.artist_id === +id);
    // Треки без альбома
    const looseTracks = allArtistTracks.filter(t => !albumTrackIds.has(t.id));
    const allTracks = allArtistTracks;

    document.getElementById("page-artist-detail").innerHTML = `
      <button onclick="Router.go('artists')" style="margin-bottom:20px;color:var(--text-secondary);font-size:13px;display:flex;align-items:center;gap:6px">
        ← Все исполнители
      </button>

      <div class="artist-hero">
        <div class="artist-hero-avatar">
          <img src="${artist.photo}" alt="${escHtml(artist.name)}">
        </div>
        <div class="artist-hero-info">
          <h1>${escHtml(artist.name)}</h1>
          <div class="artist-hero-meta">
            <span>🌍 ${artist.country}</span>
            <span>💿 ${albums.length} ${albums.length === 1 ? "альбом" : "альбомов"}</span>
            <span>🎵 ${allTracks.length} ${allTracks.length === 1 ? "трек" : allTracks.length < 5 ? "трека" : "треков"}</span>
          </div>
          <div class="artist-hero-bio">${escHtml(artist.bio)}</div>
        </div>
      </div>

      ${albums.map(al => {
        const tracks = DB.getAlbumTracks(al.id);
        if (!tracks.length) return '';
        return `
          <div style="margin-bottom:32px">
            <div style="display:flex;align-items:center;gap:16px;margin-bottom:16px">
              <img src="${al.cover}" alt="" style="width:60px;height:60px;border-radius:10px;object-fit:cover;border:1px solid var(--border)">
              <div>
                <div style="font-family:Syne,sans-serif;font-size:16px;font-weight:700">${escHtml(al.title)}</div>
                <div style="font-size:12px;color:var(--text-secondary)">${al.year} · ${tracks.length} ${tracks.length===1?"трек":tracks.length<5?"трека":"треков"}</div>
              </div>
              <button class="btn-primary" style="margin-left:auto;padding:7px 16px;font-size:12px;display:inline-flex;align-items:center;gap:6px"
                onclick="Player.play(${tracks[0]?.id}, [${tracks.map(t=>t.id).join(",")}])"><svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg> Слушать</button>
            </div>
            <div class="track-list">
              ${tracks.map((t, i) => renderTrackRow(t, i, tracks)).join("")}
            </div>
          </div>
        `;
      }).join("")}

      ${looseTracks.length > 0 ? `
        <div style="margin-bottom:32px">
          <div style="display:flex;align-items:center;gap:16px;margin-bottom:16px">
            <div style="width:60px;height:60px;border-radius:10px;background:var(--bg-elevated);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;font-size:24px;flex-shrink:0">♪</div>
            <div>
              <div style="font-family:Syne,sans-serif;font-size:16px;font-weight:700">Отдельные треки</div>
              <div style="font-size:12px;color:var(--text-secondary)">${looseTracks.length} ${looseTracks.length===1?"трек":looseTracks.length<5?"трека":"треков"} · без альбома</div>
            </div>
            <button class="btn-primary" style="margin-left:auto;padding:7px 16px;font-size:12px;display:inline-flex;align-items:center;gap:6px"
              onclick="Player.play(${looseTracks[0]?.id}, [${looseTracks.map(t=>t.id).join(",")}])"><svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg> Слушать</button>
          </div>
          <div class="track-list">
            ${looseTracks.map((t, i) => renderTrackRow(t, i, looseTracks)).join("")}
          </div>
        </div>
      ` : ""}

      ${allTracks.length === 0 ? `
        <div class="empty-state">
          <div class="empty-icon">🎵</div>
          <p>У исполнителя пока нет треков</p>
        </div>
      ` : ""}
    `;
  }
};

// ── SEARCH ───────────────────────────────────────────────
Pages.search = {
  render() {
    document.getElementById("page-search").innerHTML = `
      <div class="page-header">
        <h1>Поиск</h1>
        <p>Найди трек, исполнителя или жанр</p>
      </div>

      <div class="search-bar" style="max-width:560px">
        <span class="search-icon">🔍</span>
        <input type="text" id="global-search-input"
               placeholder="Введи название трека или имя исполнителя..."
               oninput="Pages.search.doSearch(this.value)" autofocus>
      </div>

      <div id="search-results">
        <div class="section-title" style="margin-top:8px">Жанры</div>
        <div class="genre-filters">
          ${DB.genres.map(g => `
            <button class="genre-pill genre-${g.id}"
                    onclick="Pages.catalog.activeGenre=${g.id};Pages.catalog.searchQuery='';Router.go('catalog')">
              ${g.icon} ${g.name}
            </button>
          `).join("")}
        </div>

        <div class="section-title">Все исполнители</div>
        <div class="artist-cards">
          ${DB.artists.map(a => `
            <div class="artist-card" onclick="Router.go('artist-detail', {id:${a.id}})">
              <div class="artist-avatar">
                <img src="${a.photo}" alt="${escHtml(a.name)}">
              </div>
              <div class="artist-card-name">${escHtml(a.name)}</div>
              <div class="artist-card-country">${a.country}</div>
            </div>
          `).join("")}
        </div>
      </div>
    `;
  },

  doSearch(q) {
    const container = document.getElementById("search-results");
    if (!q.trim()) { this.render(); return; }

    const tracks  = DB.searchTracks(q);
    const artists = DB.artists.filter(a => a.name.toLowerCase().includes(q.toLowerCase()));

    let html = "";

    if (artists.length) {
      html += `<div class="section-title">Исполнители (${artists.length})</div>
        <div class="artist-cards">
          ${artists.map(a => `
            <div class="artist-card" onclick="Router.go('artist-detail', {id:${a.id}})">
              <div class="artist-avatar"><img src="${a.photo}" alt="${escHtml(a.name)}"></div>
              <div class="artist-card-name">${escHtml(a.name)}</div>
              <div class="artist-card-country">${a.country}</div>
            </div>
          `).join("")}
        </div>`;
    }

    if (tracks.length) {
      html += `<div class="section-title">Треки (${tracks.length})</div>
        <div class="track-list">
          ${tracks.map((t, i) => renderTrackRow(t, i, tracks)).join("")}
        </div>`;
    }

    if (!html) {
      html = `<div class="empty-state">
        <div class="empty-icon">🔍</div>
        <p>Ничего не найдено по запросу «${escHtml(q)}»</p>
      </div>`;
    }

    container.innerHTML = html;
  },
};

// ── PLAYLISTS ─────────────────────────────────────────────
Pages.playlists = {
  openedId: null,

  // Вызывается роутером при переходе через меню — всегда показывает список
  render() {
    this.openedId = null;
    this._activatePage();
    this.renderList();
  },

  // Вызывается после внешних изменений (добавление трека и т.д.)
  refresh() {
    if (this.openedId) this.open(this.openedId);
    else {
      this._activatePage();
      this.renderList();
    }
  },

  // Активирует страницу и nav без вспышки промежуточного контента
  _activatePage() {
    document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
    document.getElementById("page-playlists").classList.add("active");
    document.querySelectorAll(".nav-item").forEach(n => n.classList.remove("active"));
    const navEl = document.querySelector('.nav-item[data-page="playlists"]');
    if (navEl) navEl.classList.add("active");
    document.getElementById("main").scrollTop = 0;
  },

  renderList() {
    const playlists = PlaylistManager.getAll();
    document.getElementById("page-playlists").innerHTML = `
      <div class="page-header">
        <h1>Мои плейлисты</h1>
        <p>Твоя личная музыкальная коллекция</p>
      </div>

      <div class="playlists-grid">
        ${playlists.map(p => `
          <div class="playlist-card" onclick="Pages.playlists.open(${p.id})">
            <button class="playlist-card-del"
                    onclick="event.stopPropagation();Pages.playlists.deletePlaylist(${p.id})"
                    title="Удалить">✕</button>
            <div class="playlist-card-icon">🎵</div>
            <div class="playlist-card-name">${escHtml(p.name)}</div>
            <div class="playlist-card-count">${p.track_ids.length} треков · ${new Date(p.created_at).toLocaleDateString("ru")}</div>
          </div>
        `).join("")}
        <div class="new-playlist-card" onclick="Pages.playlists._createNew()">
          <span>＋</span>
          <span>Новый плейлист</span>
        </div>
      </div>

      ${playlists.length === 0 ? `<div class="empty-state">
        <div class="empty-icon">🎼</div>
        <p>У тебя пока нет плейлистов</p>
        <small>Создай первый и добавляй треки через кнопку «＋»</small>
      </div>` : ""}
    `;
  },

  // Создание плейлиста со страницы плейлистов
  _createNew() {
    openCreatePlaylist((pl) => {
      // pl — готовый объект из confirmCreatePlaylist
      this._activatePage();
      this.renderList();
      refreshSidebarPlaylists();
    });
  },

  // Открыть конкретный плейлист — БЕЗ промежуточного рендера списка
  open(id) {
    this.openedId = id;
    const pl = PlaylistManager.getAll().find(p => p.id === id);
    if (!pl) { this.render(); return; }
    const tracks = PlaylistManager.getTracks(id);

    this._activatePage(); // активируем страницу без рендера списка

    document.getElementById("page-playlists").innerHTML = `
      <button onclick="Pages.playlists.render()"
              style="margin-bottom:20px;color:var(--text-secondary);font-size:13px;
                     display:inline-flex;align-items:center;gap:6px;background:none;border:none;cursor:pointer">
        ← Мои плейлисты
      </button>

      <div class="page-header">
        <h1>🎵 ${escHtml(pl.name)}</h1>
        <p>${tracks.length} треков · создан ${new Date(pl.created_at).toLocaleDateString("ru")}</p>
      </div>

      ${tracks.length === 0 ? `<div class="empty-state">
        <div class="empty-icon">📭</div>
        <p>Плейлист пуст</p>
        <small>Добавь треки через кнопку «＋» в каталоге</small>
      </div>` : `
        <div style="margin-bottom:16px">
          <button class="btn-primary"
                  onclick="Player.play(${tracks[0].id}, [${tracks.map(t=>t.id).join(",")}])">
            ▶ Слушать всё
          </button>
        </div>
        <div class="track-list">
          ${tracks.map((t, i) => `
            <div class="track-row${Player.getCurrentId() === t.id ? " playing" : ""}"
                 data-track-id="${t.id}"
                 onclick="Player.play(${t.id}, [${tracks.map(x=>x.id).join(",")}])">
              <div class="track-num">${i + 1}</div>
              <img class="track-cover" src="${DB.getAlbum(t.album_id)?.cover || ""}" alt=""
                   onerror="this.style.display='none'">
              <div class="track-info">
                <div class="track-name">${escHtml(t.title)}</div>
                <div class="track-artist">${escHtml(DB.getArtist(t.artist_id)?.name || "")}</div>
              </div>
              <span class="track-genre-badge genre-${t.genre_id}">
                ${escHtml(DB.getGenre(t.genre_id)?.name || "")}
              </span>
              <span class="track-year">${t.year}</span>
              <span class="track-duration">${Player.fmtTime(t.duration)}</span>
              <button class="track-action-btn" style="opacity:1;color:#ef4444"
                      title="Удалить из плейлиста"
                      onclick="event.stopPropagation();Pages.playlists.removeTrack(${id},${t.id})">✕</button>
            </div>
          `).join("")}
        </div>
      `}
    `;
  },

  removeTrack(plId, trackId) {
    PlaylistManager.removeTrack(plId, trackId);
    this.open(plId);
    refreshSidebarPlaylists();
    showToast("🗑 Трек удалён из плейлиста");
  },

  deletePlaylist(id) {
    const pl = PlaylistManager.getAll().find(p => p.id === id);
    const name = pl?.name || "плейлист";
    const count = pl?.track_ids?.length || 0;
    showConfirmPopup(
      `Удалить плейлист «${name}»?`,
      `В нём ${count} ${count===1?"трек":count<5?"трека":"треков"}. Это нельзя отменить.`,
      () => {
        PlaylistManager.delete(id);
        this.openedId = null;
        this._activatePage();
        this.renderList();
        refreshSidebarPlaylists();
        showToast("🗑 Плейлист удалён");
      }
    );
  },
};
