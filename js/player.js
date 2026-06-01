// ============================================================
//  SoundWave — Audio Player Engine
// ============================================================

const Player = (() => {
  const audio = new Audio();
  audio.crossOrigin = "anonymous";

  let currentTrack = null;
  let queue = [];
  let queueIndex = -1;
  let isPlaying = false;

  // Защита от бесконечного цикла при ошибках
  let errorCount = 0;
  let errorTimer = null;
  let stopped = false; // флаг: пользователь остановил цикл через ESC

  let els = {};

  function fmtTime(sec) {
    if (!sec || isNaN(sec)) return "0:00";
    const m = Math.floor(sec / 60);
    const s = String(Math.floor(sec % 60)).padStart(2, "0");
    return `${m}:${s}`;
  }

  function updateUI() {
    if (!currentTrack) return;
    const t = DB.getTrackFull(currentTrack);
    // Обложка: сначала cover самого трека, потом альбома
    const coverSrc = t.cover || t.album?.cover || "";
    if (coverSrc) {
      els.cover.style.backgroundImage = `url('${coverSrc}')`;
      els.cover.style.backgroundSize = "cover";
      els.cover.style.backgroundPosition = "center";
      els.cover.innerHTML = "";
    } else {
      els.cover.style.backgroundImage = "";
      els.cover.innerHTML = "♪";
    }
    els.title.textContent  = t.title;
    els.artist.textContent = t.artist?.name || "—";
    els.playBtn.innerHTML = isPlaying ? "⏸" : "▶";
    syncMobilePlayIcon();
  }

  audio.addEventListener("timeupdate", () => {
    if (!audio.duration) return;
    const pct = (audio.currentTime / audio.duration) * 100;
    els.progressFill.style.width = pct + "%";
    els.timeNow.textContent = fmtTime(audio.currentTime);
    els.timeTot.textContent = fmtTime(audio.duration);
  });

  audio.addEventListener("ended", () => {
    errorCount = 0;
    next();
  });

  audio.addEventListener("play",  () => { isPlaying = true;  els.playBtn.innerHTML = "⏸"; syncMobilePlayIcon(); });
  audio.addEventListener("pause", () => { isPlaying = false; els.playBtn.innerHTML = "▶"; syncMobilePlayIcon(); });

  audio.addEventListener("error", () => {
    if (stopped) return; // ESC был нажат — не переключаем

    errorCount++;

    // Если все треки в очереди недоступны — останавливаемся
    if (errorCount >= queue.length || errorCount >= 20) {
      errorCount = 0;
      audio.pause();
      isPlaying = false;
      els.playBtn.innerHTML = "▶";
      showToast("⚠️ Треки недоступны. Добавьте реальные файлы в data/db.js. Нажмите ESC для сброса.", 5000);
      return;
    }

    showToast(`⚠️ Трек недоступен (${errorCount}/${queue.length}) — ESC для остановки`);

    clearTimeout(errorTimer);
    errorTimer = setTimeout(() => {
      if (!stopped) next();
    }, 900);
  });

  function stopErrorLoop() {
    stopped = true;
    errorCount = 0;
    clearTimeout(errorTimer);
    audio.pause();
    audio.src = "";
    isPlaying = false;
    els.playBtn.innerHTML = "▶";
    els.title.textContent  = "Воспроизведение остановлено";
    els.artist.textContent = "Нажмите на трек чтобы начать";
    showToast("⛔ Остановлено. Нажмите на любой трек для воспроизведения.");
  }

  function seekHandler(e) {
    const rect = els.progressBar.getBoundingClientRect();
    const pct  = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    if (audio.duration) audio.currentTime = pct * audio.duration;
  }

  // Синхронизация иконки мобильной кнопки play/pause
  function syncMobilePlayIcon() {
    const mb = document.getElementById("m-player-play");
    if (!mb) return;
    if (isPlaying) {
      mb.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="currentColor" stroke-width="0">'
        + '<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>';
    } else {
      mb.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="currentColor" stroke-width="0">'
        + '<polygon points="5 3 19 12 5 21 5 3"/></svg>';
    }
  }

  function init() {
    els = {
      cover:        document.getElementById("player-cover"),
      title:        document.getElementById("player-title"),
      artist:       document.getElementById("player-artist"),
      playBtn:      document.getElementById("player-play"),
      prevBtn:      document.getElementById("player-prev"),
      nextBtn:      document.getElementById("player-next"),
      progressBar:  document.getElementById("progress-bar"),
      progressFill: document.getElementById("progress-fill"),
      timeNow:      document.getElementById("time-now"),
      timeTot:      document.getElementById("time-total"),
      volume:       document.getElementById("volume-slider"),
    };

    els.playBtn.addEventListener("click", toggle);
    els.prevBtn.addEventListener("click", prev);
    els.nextBtn.addEventListener("click", next);

    els.progressBar.addEventListener("click", seekHandler);
    let dragging = false;
    els.progressBar.addEventListener("mousedown", () => { dragging = true; });
    document.addEventListener("mousemove", (e) => { if (dragging) seekHandler(e); });
    document.addEventListener("mouseup",   ()  => { dragging = false; });

    els.volume.addEventListener("input", () => { audio.volume = els.volume.value / 100; });
    audio.volume = 0.7;
    els.volume.value = 70;

    document.addEventListener("keydown", (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      if (e.code === "Escape")      { stopErrorLoop(); }
      if (e.code === "Space")       { e.preventDefault(); toggle(); }
      if (e.code === "ArrowRight")  { audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + 5); }
      if (e.code === "ArrowLeft")   { audio.currentTime = Math.max(0, audio.currentTime - 5); }
    });
  }

  function play(trackId, newQueue = null) {
    stopped = false; // сброс флага остановки при ручном выборе
    errorCount = 0;
    clearTimeout(errorTimer);

    // Обновляем DB из localStorage перед каждым воспроизведением
    // чтобы треки, добавленные в admin, были доступны
    if (typeof DB !== "undefined" && DB._loadFromStorage) DB._loadFromStorage();

    if (newQueue) {
      queue = newQueue;
      queueIndex = queue.indexOf(trackId);
      if (queueIndex === -1) { queue.unshift(trackId); queueIndex = 0; }
    }

    const track = DB.getTrack(trackId);
    if (!track) { showToast("⚠️ Трек не найден в базе"); return; }
    if (!track.file) { showToast("⚠️ У трека не указан файл"); return; }

    currentTrack = trackId;
    audio.src = track.file;
    audio.load();
    audio.play().catch(() => {});

    updateUI();
    highlightRow(trackId);
  }

  function toggle() {
    if (!currentTrack) return;
    stopped = false;
    if (audio.paused) audio.play().catch(() => {});
    else audio.pause();
  }

  function prev() {
    if (queue.length === 0) return;
    if (audio.currentTime > 3) { audio.currentTime = 0; return; }
    queueIndex = (queueIndex - 1 + queue.length) % queue.length;
    play(queue[queueIndex]);
  }

  function next() {
    if (queue.length === 0) return;
    queueIndex = (queueIndex + 1) % queue.length;
    play(queue[queueIndex]);
  }

  function highlightRow(trackId) {
    document.querySelectorAll(".track-row").forEach(r => {
      r.classList.toggle("playing", +r.dataset.trackId === trackId);
    });
  }

  function getCurrentId() { return currentTrack; }
  function isCurrentlyPlaying() { return isPlaying; }

  return { init, play, toggle, prev, next, getCurrentId, isCurrentlyPlaying, fmtTime };
})();
