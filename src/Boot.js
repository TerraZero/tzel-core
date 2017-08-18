'use strict';

const Mod = require('./Mod');
const Use = require('./Use');
const Parser = require('./reflect/AnnotationParser');
const fs = require('graceful-fs');
const Glob = require('glob');

module.exports = class Boot {

  constructor(settings) {
    this._settings = settings;
    this._mods = null;
  }

  boot() {
    this.globals();
    this.mods();
    this.annotations();
    this.scanning();
  }

  globals() {
    global.log = this.log.bind(this);
    global.debug = this.debug.bind(this);
    global.boot = this;
    new Use();
  }

  mods() {
    if (this._mods === null) {
      this._mods = {};
      const mods = this.setting('modules.enabled', []);

      for (const index in mods) {
        try {
          this.addMod(this.load(mods[index]));
        } catch (e) {
          debug('core', 'Try to load module ["0]', mods[index]);
          throw e;
        }
      }
    }
    return this._mods;
  }

  annotations() {
    for (const name in this.mods()) {
      const mod = this.mod(name);
      const dir = mod.file('annotations');
      let files = null;

      try {
        files = fs.readdirSync(dir);
      } catch (e) {
        files = [];
      }
      for (const file of files) {
        Parser.register(mod.file('annotations/' + file));
      }
    }
  }

  scanning() {
    for (const name in this.mods()) {
      const files = Glob.sync('**/*.js', {
        cwd: this.mod(name).file(''),
        absolute: true,
      });

    }
  }

  addMod(data) {
    const mod = new Mod(data);
    this._mods[mod.key()] = mod;
  }

  log(...args) {
    console.log.apply(console, args);
  }

  debug(mod, notice, ...args) {
    const channel = this.debugChannel();
    if (!channel) return;
    mod = mod.toUpperCase();

    const line = ['DEBUG [' + mod + ']:'];

    for (const index in args) {
      notice = notice.replace(new RegExp('\\[([^\\d]*?)' + index + '\\]', 'g'), '$1' + args[index] + '$1');
    }
    line.push(notice);

    switch (channel) {
      case 'console':
        console.log(line.join(' '));
        break;
    }
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

  debugChannel() {
    return this.setting('log.debug', false);
  }

}
