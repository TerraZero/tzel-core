'use strict';

let _data = {};
let _cache = {};

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
      const describer = mod.getUse(file).split('/');
      const key = mod.getUse(file);

      _data[key] = {
        key: key,
        file: file,
        mod: describer.shift(),
        class: describer.pop(),
        package: describer.join('/'),
        alias: [],
        extends: this.getExtend(file),
        extended: false,
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

    for (const index in _data) {
      _data[index].annotations = new this.Parser(_data[index].file).getData();
    }

    for (const index in _data) {
      this.extend(_data[index]);
    }
  }

  static extend(subject) {
    if (subject.extends !== null && !subject.extended) {
      const from = _data[subject.extends];

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
    if (_cache[key] === undefined) {
      _cache[key] = new Manifest(key);
    }
    return _cache[key];
  }

  constructor(search) {
    this._search = search;
    this._key = null;
  }

  getKey() {
    if (this._key === null) {
      if (_data[this._search] === undefined) {
        for (const index in _data) {
          if (_data[index].alias.indexOf(this._search) !== -1) {
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

  file() {
    return _data[this.getKey()].file;
  }

  class() {
    return _data[this.getKey()].class;
  }

  extends() {
    return Manifest.get(_data[this.getKey()].extends);
  }

}
