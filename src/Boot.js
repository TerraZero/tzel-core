'use strict';

const Mod = require('./Mod');
const Use = require('./Use');
const Manifest = require('./reflect/Manifest');
const Parser = require('./reflect/AnnotationParser');
const fs = require('graceful-fs');
const Glob = require('glob');
const Logger = require('./Logger');

let logging = null;
let debug = null;

module.exports = class Boot {

  constructor(settings) {
    this._settings = settings;
    this._mods = null;
    this._datas = null;
    this._providers = null;
  }

  boot() {
    this.globals();

    debug = Logger.chanel('debug', 'boot');
    logging = Logger.chanel('log', 'boot');

    this.scanning();
    this.annotations();
    this.parsing();
    this.subscribing();
    this.listeners();
  }

  globals() {
    global.log = this.log.bind(this);
    Logger.setSettings(this.settings().logger);
    global.logger = Logger.chanel.bind(Logger);
    global.boot = this;
    new Use();
  }

  log() {
    logging.log.apply(logging, arguments);
  }

  getMods() {
    if (this._mods === null) {
      this._mods = {};
      const mods = this.setting('modules.enabled', []);

      for (const index in mods) {
        try {
          this.addMod(this.load(mods[index]));
        } catch (e) {
          debug.out('Try to load module ["0]', mods[index]);
          throw e;
        }
      }
    }
    return this._mods;
  }

  scanning() {
    for (const name in this.getMods()) {
      Manifest.scan(this.mod(name));
    }
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
    this._datas = null;
  }

  parsing() {
    Manifest.parsing();
    throw 'parsing';
  }

  getDatas() {
    if (this._datas === null) {
      this._datas = [];
      for (const name in this.getMods()) {
        Manifest.scan(this.mod(name));
        const mod = this.mod(name);
        const files = Glob.sync('**/*.js', {
          cwd: mod.path(),
          absolute: true,
        });

        for (const index in files) {
          const parser = new Parser(files[index]);
          const data = parser.getData();

          data.setUse(mod.getUse(data.path()));
          this._datas.push(data);
        }
      }
    }
    throw 'hallo';
    return this._datas;
  }

  providers() {
    if (this._providers === null) {
      this._providers = {};
      const datas = this.getDatas();
      const Provider = use('core/annotations/Provider');

      for (const index in datas) {
        if (datas[index].hasTag(Provider.name)) {
          const subscriber = use(datas[index].use());
          this._providers[datas[index].use()] = new subscriber(datas[index]);
        }
      }
    }
    return this._providers;
  }

  provider(name) {
    return this.providers()[name];
  }

  subscribing() {
    const providers = this.providers();
    const datas = this.getDatas();

    for (const index in datas) {
      for (const i in providers) {
        providers[i].subscribe(datas[index]);
      }
    }
  }

  addMod(data) {
    const mod = new Mod(data);
    this._mods[mod.key()] = mod;
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

  listeners() {
    const em = use('manager.event');

    em.register();
    em.fire('core', 'boot');
    if (typeof window !== 'undefined') {
      em.fire('core', 'boot.window');
    }
  }

}
