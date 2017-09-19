'use strict';

const Path = require('path');

module.exports = class Mod {

  constructor(data) {
    this._data = data;
    this._info = null;
  }

  data() {
    return this._data;
  }

  key() {
    return this.data().key;
  }

  name() {
    return this.data().name;
  }

  root() {
    return this.data().root;
  }

  hasPath(base = 'src') {
    return this.data().paths[base] !== undefined;
  }

  path(base = 'src') {
    if (this.data().paths[base] === undefined) {
      return null;
    }
    return Path.join(this.root(), this.data().paths[base]);
  }

  info() {
    if (this._info === null) {
      this._info = require(this.root() + '/package.json');
    }
    return this._info;
  }

  version() {
    return this.info().version;
  }

  file(file = '', base = 'src') {
    return Path.join(this.path(base), file);
  }

  getUse(file = '') {
    return this.key() + file.substring(this.path().length, file.length - 3).split(Path.sep).join('/');
  }

}
