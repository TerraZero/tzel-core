'use strict';

const glob = require('glob');

const Parser = require('./AnnotationParser');

const _data = {};

module.exports = class Manifest {

  static data() {
    return _data;
  }

  static scan(mod) {
    const files = glob.sync('**/*.js', {
      cwd: mod.path(),
      absolute: true,
    });

    for (const file of files) {
      _data[mod.getUse(file)] = {
        file: file,
        mod: mod.key(),
        class: mod.getUse(file).split('/').pop(),
        alias: [],
      };
    }
  }

  static parsing() {
    for (const index in _data) {
      const parser = new Parser(_data[index].file);

      _data[index].annotations = parser.getData();
    }
  }

  static get(key) {
    return new Manifest(key);
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

}
