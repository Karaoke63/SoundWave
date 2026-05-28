// ============================================================
//  SoundWave — база данных (имитация MySQL через JS-объекты)
// ============================================================

const DB = {

  genres: [
    { id: 1, name: "Электроника",  color: "#a855f7", icon: "⚡" },
    { id: 2, name: "Джаз",         color: "#f59e0b", icon: "🎷" },
    { id: 3, name: "Классика",     color: "#3b82f6", icon: "🎻" },
    { id: 4, name: "Рок",          color: "#ef4444", icon: "🎸" },
    { id: 5, name: "Lo-Fi",        color: "#10b981", icon: "🌿" },
    { id: 6, name: "Поп",          color: "#ec4899", icon: "✨" },
  ],

  artists: [
    {
      id: 1,
      name: "Kai Engel",
      country: "Германия",
      bio: "Немецкий ambient и неоклассический композитор. Известен атмосферными инструментальными произведениями, доступными по лицензии Creative Commons.",
      photo: "https://api.dicebear.com/7.x/shapes/svg?seed=KaiEngel&backgroundColor=1a1a2e",
      genre_id: 3,
    },
    {
      id: 2,
      name: "Kevin MacLeod",
      country: "США",
      bio: "Американский композитор, выпустивший тысячи треков под открытой лицензией. Один из самых узнаваемых авторов фоновой музыки в интернете.",
      photo: "https://api.dicebear.com/7.x/shapes/svg?seed=KevinMac&backgroundColor=0f3460",
      genre_id: 1,
    },
    {
      id: 3,
      name: "Lofi Girl",
      country: "Франция",
      bio: "Культовый музыкальный проект, подаривший миру жанр lofi hip-hop. Миллионы слушателей используют эти биты для учёбы и релаксации.",
      photo: "https://api.dicebear.com/7.x/shapes/svg?seed=LofiGirl&backgroundColor=2d1b69",
      genre_id: 5,
    },
    {
      id: 4,
      name: "Audionautix",
      country: "США",
      bio: "Проект Джейсона Шоу — тысячи треков в самых разных жанрах, от джаза до рока, полностью бесплатные для использования.",
      photo: "https://api.dicebear.com/7.x/shapes/svg?seed=Audionautix&backgroundColor=1e3a5f",
      genre_id: 2,
    },
    {
      id: 5,
      name: "Broke For Free",
      country: "США",
      bio: "Американский chillhop и electronic музыкант. Альбом «Slam Funk» стал одним из самых скачиваемых на Free Music Archive.",
      photo: "https://api.dicebear.com/7.x/shapes/svg?seed=BrokeForFree&backgroundColor=14532d",
      genre_id: 1,
    },
    {
      id: 6,
      name: "Chris Zabriskie",
      country: "США",
      bio: "Минималистичный ambient-композитор из США. Его работы часто используются в документальных фильмах и YouTube-роликах.",
      photo: "https://api.dicebear.com/7.x/shapes/svg?seed=ChrisZ&backgroundColor=4a1942",
      genre_id: 3,
    },
  ],

  albums: [
    { id: 1, title: "Serenity",        artist_id: 1, year: 2014, cover: "https://picsum.photos/seed/serenity/300/300"   },
    { id: 2, title: "Incompetech Vol.1",artist_id: 2, year: 2019, cover: "https://picsum.photos/seed/incomp1/300/300"   },
    { id: 3, title: "Chilled Hip-Hop", artist_id: 3, year: 2021, cover: "https://picsum.photos/seed/chilledhh/300/300" },
    { id: 4, title: "Jazz Vibes",      artist_id: 4, year: 2020, cover: "https://picsum.photos/seed/jazzvibes/300/300" },
    { id: 5, title: "Slam Funk",       artist_id: 5, year: 2012, cover: "https://picsum.photos/seed/slamfunk/300/300"  },
    { id: 6, title: "Cylinders",       artist_id: 6, year: 2014, cover: "https://picsum.photos/seed/cylinders/300/300" },
    { id: 7, title: "Incompetech Vol.2",artist_id: 2, year: 2021, cover: "https://picsum.photos/seed/incomp2/300/300"  },
    { id: 8, title: "Mindfulness",     artist_id: 1, year: 2016, cover: "https://picsum.photos/seed/mindful/300/300"   },
  ],

  tracks: [
    // Kai Engel — Serenity
    { id: 1,  title: "Snowfall",            artist_id: 1, album_id: 1, genre_id: 3, year: 2014, duration: 183, file: "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/no_curator/Kai_Engel/Serenity/Kai_Engel_-_01_-_Snowfall.mp3"      },
    { id: 2,  title: "Intermezzo",          artist_id: 1, album_id: 1, genre_id: 3, year: 2014, duration: 152, file: "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/no_curator/Kai_Engel/Serenity/Kai_Engel_-_02_-_Intermezzo.mp3"   },
    { id: 3,  title: "Peculiar Feeling",    artist_id: 1, album_id: 8, genre_id: 3, year: 2016, duration: 201, file: "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/no_curator/Kai_Engel/Mindfulness/Kai_Engel_-_01_-_Peculiar_Feeling.mp3" },

    // Kevin MacLeod
    { id: 4,  title: "Cipher",             artist_id: 2, album_id: 2, genre_id: 1, year: 2019, duration: 134, file: "https://incompetech.com/music/royalty-free/mp3-royaltyfree/Cipher.mp3"         },
    { id: 5,  title: "Scheming Weasel",    artist_id: 2, album_id: 2, genre_id: 2, year: 2019, duration: 118, file: "https://incompetech.com/music/royalty-free/mp3-royaltyfree/Scheming%20Weasel%20(faster%20version).mp3" },
    { id: 6,  title: "Fluffing a Duck",    artist_id: 2, album_id: 7, genre_id: 6, year: 2021, duration: 122, file: "https://incompetech.com/music/royalty-free/mp3-royaltyfree/Fluffing%20a%20Duck.mp3" },
    { id: 7,  title: "Pixel Peeker Polka", artist_id: 2, album_id: 7, genre_id: 4, year: 2021, duration: 143, file: "https://incompetech.com/music/royalty-free/mp3-royaltyfree/Pixel%20Peeker%20Polka%20-%20faster.mp3" },

    // Lofi Girl
    { id: 8,  title: "Chill Morning",      artist_id: 3, album_id: 3, genre_id: 5, year: 2021, duration: 195, file: "https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0c6ff1bab.mp3" },
    { id: 9,  title: "Late Night Study",   artist_id: 3, album_id: 3, genre_id: 5, year: 2021, duration: 210, file: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3" },
    { id: 10, title: "Rain on Window",     artist_id: 3, album_id: 3, genre_id: 5, year: 2022, duration: 240, file: "https://cdn.pixabay.com/download/audio/2022/03/10/audio_270f49351c.mp3" },

    // Audionautix — Jazz
    { id: 11, title: "Jazz Brunch",        artist_id: 4, album_id: 4, genre_id: 2, year: 2020, duration: 167, file: "https://audionautix.com/Music/JazzBrunch.mp3"  },
    { id: 12, title: "Hip Hop Cookie",     artist_id: 4, album_id: 4, genre_id: 2, year: 2020, duration: 148, file: "https://audionautix.com/Music/HipHopCookie.mp3" },

    // Broke For Free
    { id: 13, title: "Poke",               artist_id: 5, album_id: 5, genre_id: 1, year: 2012, duration: 175, file: "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/WFMU/Broke_For_Free/Slam_Funk/Broke_For_Free_-_01_-_Poke.mp3" },
    { id: 14, title: "Juparo",             artist_id: 5, album_id: 5, genre_id: 1, year: 2012, duration: 223, file: "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/WFMU/Broke_For_Free/Slam_Funk/Broke_For_Free_-_02_-_Juparo.mp3" },
    { id: 15, title: "Day Bird",           artist_id: 5, album_id: 5, genre_id: 5, year: 2012, duration: 196, file: "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/WFMU/Broke_For_Free/Slam_Funk/Broke_For_Free_-_05_-_Day_Bird.mp3" },

    // Chris Zabriskie
    { id: 16, title: "Cylinder One",       artist_id: 6, album_id: 6, genre_id: 3, year: 2014, duration: 258, file: "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/ccCommunity/Chris_Zabriskie/Cylinders/Chris_Zabriskie_-_01_-_Cylinder_One.mp3"   },
    { id: 17, title: "Cylinder Two",       artist_id: 6, album_id: 6, genre_id: 3, year: 2014, duration: 224, file: "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/ccCommunity/Chris_Zabriskie/Cylinders/Chris_Zabriskie_-_02_-_Cylinder_Two.mp3"   },
    { id: 18, title: "Cylinder Three",     artist_id: 6, album_id: 6, genre_id: 3, year: 2014, duration: 212, file: "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/ccCommunity/Chris_Zabriskie/Cylinders/Chris_Zabriskie_-_03_-_Cylinder_Three.mp3" },

    // Extra pop/rock
    { id: 19, title: "Summer Vibes",       artist_id: 2, album_id: 7, genre_id: 6, year: 2021, duration: 138, file: "https://incompetech.com/music/royalty-free/mp3-royaltyfree/Sunshine.mp3"  },
    { id: 20, title: "Rock Drive",         artist_id: 2, album_id: 7, genre_id: 4, year: 2021, duration: 155, file: "https://incompetech.com/music/royalty-free/mp3-royaltyfree/Rock%20Muthafucka%20v2.mp3" },
  ],

  // ── Helpers ────────────────────────────────────────────────
  getArtist(id)     { return this.artists.find(a => a.id === id); },
  getAlbum(id)      { return this.albums.find(a => a.id === id); },
  getGenre(id)      { return this.genres.find(g => g.id === id); },
  getTrack(id)      { return this.tracks.find(t => t.id === id); },

  getTrackFull(track) {
    return {
      ...track,
      artist : this.getArtist(track.artist_id) || null,
      album  : track.album_id ? this.getAlbum(track.album_id) : null,
      genre  : this.getGenre(track.genre_id) || null,
    };
  },

  searchArtistsByLetter(letter) {
    return this.artists.filter(a =>
      a.name.toUpperCase().startsWith(letter.toUpperCase())
    );
  },

  filterTracksByGenre(genre_id) {
    return genre_id
      ? this.tracks.filter(t => t.genre_id === genre_id)
      : [...this.tracks];
  },

  searchTracks(query) {
    const q = query.toLowerCase();
    return this.tracks.filter(t => {
      const artist = this.getArtist(t.artist_id);
      return t.title.toLowerCase().includes(q) ||
             (artist && artist.name.toLowerCase().includes(q));
    });
  },

  getAlbumTracks(album_id) {
    return this.tracks.filter(t => t.album_id === album_id);
  },

  getArtistAlbums(artist_id) {
    return this.albums.filter(a => a.artist_id === artist_id);
  },

  countByGenre() {
    return this.genres.map(g => ({
      ...g,
      count: this.tracks.filter(t => t.genre_id === g.id).length,
    }));
  },

  // ── Перезагрузить данные (вызывается после Firebase sync) ─
  _loadFromStorage() {
    // Теперь данные приходят из Firebase через firebase.js
    // Этот метод оставлен для обратной совместимости с player.js
  },
};
