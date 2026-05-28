// ============================================================
//  SoundWave — Auth System (localStorage-based)
//  Хранит хэш пароля, не сам пароль
// ============================================================

const Auth = {
  STORAGE_KEY: 'sw_auth_credentials',

  // Простой хэш (для localStorage — достаточно)
  _hash(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) {
      h = Math.imul(31, h) + str.charCodeAt(i) | 0;
    }
    return 'sw_' + Math.abs(h).toString(36) + str.length.toString(36);
  },

  // Получить сохранённые credentials (или дефолтные)
  _getCreds() {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch(e) {}
    // Дефолтные: admin / admin123
    return {
      login: 'admin',
      passHash: this._hash('admin123')
    };
  },

  // Проверить логин+пароль
  check(login, password) {
    const creds = this._getCreds();
    return login === creds.login && this._hash(password) === creds.passHash;
  },

  // Сменить логин и/или пароль
  update(newLogin, newPassword) {
    const creds = {
      login: newLogin,
      passHash: this._hash(newPassword)
    };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(creds));
  },

  // Сессия (вкладка браузера)
  SESSION_KEY: 'sw_admin_session',

  login(login, password) {
    if (!this.check(login, password)) return false;
    sessionStorage.setItem(this.SESSION_KEY, '1');
    return true;
  },

  logout() {
    sessionStorage.removeItem(this.SESSION_KEY);
  },

  isLoggedIn() {
    return sessionStorage.getItem(this.SESSION_KEY) === '1';
  },

  getLogin() {
    return this._getCreds().login;
  }
};
