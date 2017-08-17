'use strict';

module.exports = class Mod {

  constructor(data) {
    this._data = data;
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

}
