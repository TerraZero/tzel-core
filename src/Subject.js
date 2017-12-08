'use strict';

module.exports = class Subject {

  constructor() {
    this._subjects = {};
  }

  get(file) {
    if (this._subjects[file] === undefined) {
      this._subjects[file] = this.create(file);
    }
    return this._subjects[file];
  }

  create(file) {
    return new (use(file))();
  }

}
