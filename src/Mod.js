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

  path() {
    return this.data().path;
  }

  src() {
    return this.data().src;
  }

  info() {
    if (this._info === null) {
      this._info = require(this.path() + '/package.json');
    }
    return this._info;
  }

  version() {
    return this.info().version;
  }

  file(file = '') {
    return Path.join(this.path(), this.src(), file);
  }

}
