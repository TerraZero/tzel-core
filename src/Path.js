'use strict';

module.exports = class Path {

  constructor(path) {
    this._path = path;
  }

  path() {
    return this._path;
  }

}
