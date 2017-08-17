'use strict';

const Mod = require('./Mod');

module.exports = class Boot {

  constructor(settings) {
    this._settings = settings;
    this._mods = null;
  }

  boot() {
    this.globals();
    this.mods();
  }

  globals() {
    global.log = this.log.bind(this);
    global.debug = this.debug.bind(this);
    global.boot = this;
  }

  mods() {
    if (this._mods === null) {
      this._mods = {};
      const mods = this.setting('modules.enabled', []);

      for (const index in mods) {
        try {
          const mod = new Mod(this.load(mods[index]));
          this._mods[mod.key()] = mod;
        } catch (e) {
          debug('core', 'Try to load module ["0]', mods[index]);
          throw e;
        }
      }
    }
    return this._mods;
  }

  log(...args) {
    console.log.apply(console, args);
  }

  debug(channel, notice, ...args) {
    if (!this.isDebug()) return;
    channel = channel.toUpperCase();

    const line = ['DEBUG [' + channel + ']:'];

    for (const index in args) {
      notice = notice.replace(new RegExp('\\[([^\\d]*?)' + index + '\\]', 'g'), '$1' + args[index] + '$1');
    }
    line.push(notice);
    console.log(line.join(' '));
  }

  load(name) {
    return this.setting('require')(name);
  }

  settings() {
    return this._settings;
  }

  setting(name, fallback = null) {
    const parts = name.split('.');
    let settings = this.settings();

    for (const index in parts) {
      if (settings[parts[index]] === undefined) return fallback;
      settings = settings[parts[index]];
    }
    return settings;
  }

  mod(key) {
    return this.mods()[key];
  }

  isDebug() {
    return this.setting('log.debug', false);
  }

}
