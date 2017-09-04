'use strict';

const child_process = require('child_process');

module.exports = class Thread {

  constructor() {
    this._worker = null;
  }

  start() {
    if (cluster.isMaster) {
      this._worker = child_process.fork();
    }
    return this._worker;
  }

  worker() {
    return this._worker;
  }

}
