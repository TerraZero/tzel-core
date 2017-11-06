'use strict';

module.exports = class Items {

  constructor(items = []) {
    this.setItems(items);
  }

  setItems(items = []) {
    this._items = items;
    return this;
  }

  items() {
    return this._items;
  }

  indexOf(search) {
    return this._items.indexOf(search);
  }

  after(search, item) {
    const index = this.indexOf(search);

    if (index === -1 || index === this._items.length - 1) {
      this._items.push(item);
    } else {
      this._items.splice(index, 0, item);
    }
    return this;
  }

  before(search, item) {
    const index = this.indexOf(search);

    if (index === -1 || index === 0) {
      this._items.unshift(item);
    } else {
      this._items.splice(index - 1, 0, item);
    }
    return this;
  }

  first(item) {
    this._items.unshift(item);
    return this;
  }

  last(item) {
    this._items.push(item);
    return this;
  }

  length() {
    return this._items.length;
  }

}
