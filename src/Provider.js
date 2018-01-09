'use strict';

module.exports = class Provider {

  constructor(manifest) {
    this._manifest = manifest;
  }

  manifest() {
    return this._manifest;
  }

  describer() {
    return this.manifest().getKey();
  }

  parsing(manifest, data) { }

  addInvoke(manifest, type = 'construct', data = null) {
    manifest.invokes[type] = manifest.invokes[type] || [];
    manifest.invokes[type].push({
      provider: this.manifest().key,
      type: type,
      data: data,
    });
  }

  invoke() { }

}
