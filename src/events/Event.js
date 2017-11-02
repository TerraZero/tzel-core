'use strict';

module.exports = class Event {

  constructor(original, mod, data = {}) {
    this._event = null;
    this._original = original;
    this._mod = mod;
    this._data = data;
  }

  setEvent(event) {
    this._event = event;
    return this;
  }

  event() {
    return this._event;
  }

  original() {
    return this._original;
  }

  mod() {
    return this._mod;
  }

  data() {
    return this._data;
  }

  get(name, fallback = null) {
    if (this._data[name] === undefined) return fallback;
    return this._data[name];
  }

  set(name, object) {
    this._data[name] = object;
    return this;
  }

}
