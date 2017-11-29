'use strict';

module.exports = class Cache {

  constructor() {
    this._data = {};
  }

  get(data) {
    const key = this.key(data);

    if (!this.has(key)) {
      this._data[key] = this.create(data);
    }
    return this._data[key];
  }

  has(key) {
    return this._data[key] !== undefined;
  }

  key(data) { }

  create(data) { }

}
