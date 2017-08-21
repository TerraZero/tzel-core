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
    this._datas = null;
  }

  boot() {
    this.globals();
    this.annotations();
    this.subscribing();
  }

  globals() {
    global.log = this.log.bind(this);
    global.debug = this.debug.bind(this);
    global.boot = this;
    new Use();
  }

  getMods() {
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
    for (const name in this.getMods()) {
      const mod = this.mod(name);
      const dir = mod.file('annotations');
      let files = null;

      try {
        files = fs.readdirSync(dir);
      } catch (e) {
        files = [];
      }
      for (const file of files) {
        const abs = mod.file('annotations/' + file);

        Parser.register(abs);
      }
    }
  }

  getDatas() {
    if (this._datas === null) {
      this._datas = [];
      for (const name in this.getMods()) {
        const mod = this.mod(name);
        const files = Glob.sync('**/*.js', {
          cwd: mod.file(),
          absolute: true,
        });

        for (const index in files) {
          const parser = new Parser(files[index]);
          const data = parser.getData();

          data.setUse(mod);
          this._datas.push(data);
        }
      }
    }
    return this._datas;
  }

  subscribing() {
    const Provider = use('core/annotations/Provider');
    const datas = this.getDatas();
    const subscriber = [];

    for (const index in datas) {
      if (datas[index].hasTag(Provider.name)) {
        subscriber.push(datas[index]);
      }
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
    return this.getMods()[key];
  }

  debugChannel() {
    return this.setting('log.debug', false);
  }

}
