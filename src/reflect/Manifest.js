'use strict';

const _data = {
  providers: [],
  classes: {},
  register: {},
};
const _cache = {
  providers: null,
  classes: {},
};

module.exports = class Manifest {

  static init() {
    if (this._init === undefined) {
      this._init = true;

      this.Glob = require('glob');
      this.Parser = require('./AnnotationParser');
      this.FS = require('graceful-fs');
    }
  }

  static data() {
    return _data;
  }

  static scan(mod) {
    this.init();

    const files = this.Glob.sync('**/*.js', {
      cwd: mod.path(),
      absolute: true,
    });

    for (const file of files) {
      const key = mod.getUse(file);
      const describer = key.split('/');

      _data.classes[key] = {
        key: key,
        file: file,
        mod: describer.shift(),
        class: describer.pop(),
        package: describer.join('/'),
        alias: [],
        annotations: null,
        extends: this.getExtend(file),
        extended: false,
        invokes: {},
        data: {},
        provide: 'class',
      };
    }
  }

  static getExtend(file) {
    this.init();

    const content = this.FS.readFileSync(file).toString();
    let classname = /module.exports = .* extends (.*).class {\n/.exec(content);

    if (classname !== null) {
      classname = classname[1];

      let id = new RegExp('const ' + classname + ' = use\\(\'(.*)\'\\);').exec(content);

      if (id !== null) {
        id = id[1];
        return id;
      }
    }
    return null;
  }

  static parsing() {
    this.init();

    for (const index in _data.classes) {
      _data.classes[index].annotations = new this.Parser(_data.classes[index].file).getData();
      for (const annotation of _data.classes[index].annotations) {
        if (annotation.meta.name === 'Provider') {
          _data.providers.push(index);
        }
      }
    }

    for (const index in _data.classes) {
      this.extend(_data.classes[index]);
    }

    const providers = this.providers();

    for (const key in _data.classes) {
      for (const provider of providers) {
        provider.parsing(Manifest.get(key), _data.classes[key]);
      }
    }
  }

  static extend(subject) {
    if (subject.extends !== null && !subject.extended) {
      const from = _data.classes[subject.extends];

      this.extend(from);
      for (const index in from.annotations) {
        for (const item of from.annotations[index]) {
          if (subject.annotations[index] === undefined) {
            subject.annotations[index] = [];
          }
          subject.annotations[index].push(item);
        }
      }
    }
    subject.extended = true;
  }

  static get(key) {
    if (_cache.classes[key] === undefined) {
      _cache.classes[key] = new Manifest(key);
    }
    return _cache.classes[key];
  }

  static providers(filter = null) {
    if (_cache.providers === null) {
      _cache.providers = [];
      for (const index of _data.providers) {
        _cache.providers.push(new (use(index))(Manifest.get(index)));
      }
    }
    if (filter === null) return _cache.providers;

    const filtered = [];

    for (const provider of _cache.providers) {
      if (filter.indexOf(provider.describer()) !== -1) {
        filtered.push(provider);
      }
    }
    return filtered;
  }

  static getRegister(provider, collection = null) {
    if (typeof provider === 'string') {
      provider = this.providers([Manifest.get(provider).getKey()])[0];
    }
    if (collection === null) return _data.register[provider.describer()];
    if (_data.register[provider.describer()] === undefined) return null;
    return _data.register[provider.describer()][collection];
  }

  constructor(search) {
    this._search = search;
    this._key = null;
  }

  getKey() {
    if (this._key === null) {
      if (_data.classes[this._search] === undefined) {
        for (const index in _data.classes) {
          if (_data.classes[index].alias.indexOf(this._search) !== -1) {
            this._key = index;
            break;
          }
        }
      } else {
        this._key = this._search;
      }
    }
    return this._key;
  }

  data() {
    return _data.classes[this.getKey()];
  }

  file() {
    return this.data().file;
  }

  class() {
    return this.data().class;
  }

  extends() {
    return Manifest.get(this.data().extends);
  }

  isAlias() {
    return this.getKey() !== this._search;
  }

  getFromAnnotations(annotation) {
    return this.getAnnotations(annotation.name);
  }

  getAnnotations(name) {
    const annotations = [];

    for (const annotation of this.data().annotations) {
      if (annotation.meta.name === name) {
        annotations.push(annotation);
      }
    }
    return annotations;
  }

  addAlias(alias) {
    this.data().alias.push(alias);
  }

  get(provider, name = null) {
    if (name === null) {
      return this.data().data[provider.describer()];
    }
    return this.data().data[provider.describer()][name];
  }

  set(provider, name, value) {
    this.data().data[provider.describer()] = this.data().data[provider.describer()] || {};
    this.data().data[provider.describer()][name] = value;
  }

  invoke(provider, event = 'construct') {
    this.data().invokes[event] = this.data().invokes[event] || [];
    this.data().invokes[event].push(provider.describer());
  }

  getInvokes(event) {
    return this.data().invokes[event];
  }

  register(provider, collection, value = null) {
    if (value === null) value = this.getKey();

    _data.register[provider.describer()] = _data.register[provider.describer()] || {};
    _data.register[provider.describer()][collection] = _data.register[provider.describer()][collection] || [];
    _data.register[provider.describer()][collection].push(value);
  }

  /**
   * Options:
   *   - class (default) - the class object
   *   - object - the object of the class will be created
   * @param {string} provide
   */
  setProvide(provide) {
    this.data().provide = provide;
  }

  getProvide() {
    return this.data().provide;
  }

}
