'use strict';

module.exports = class ReflectManager {

  constructor(data = null) {
    this._data = data;
  }

  data() {
    return this._data;
  }

}
