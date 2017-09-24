'use strict';

const nPath = require('path');
const glob = require('glob');

module.exports = class Path {

  static create(path, base = 'root', type = 'src') {
    if (path instanceof Path) return path;

    path = Path._pre(path);
    if (nPath.isAbsolute(path)) {
      const lookup = Path._lookup(path);
      return new Path(lookup.path, lookup.base, lookup.type);
    }

    return new Path(path, base, type);
  }

  static extend(path, joins = []) {
    joins.unshift(path.path());
    return new Path(Path.join.apply(Path, joins), path.base(), path.type());
  }

  static root() {
    return this._pre(boot.setting('root'));
  }

  static join() {
    return nPath.join.apply(nPath, arguments);
  }

  static _pre(path) {
    if (Array.isArray(path)) {
      path = nPath.join.apply(nPath, path);
    }
    return path.replace(/\\/g, '/');
  }

  static _lookup(path) {
    if (this._modPaths === undefined) {
      this._modPaths = {};
      const mods = boot.getMods();

      for (const mod in mods) {
        this._modPaths[mod] = {};
        const paths = mods[mod].data().paths;

        for (const type in paths) {
          this._modPaths[mod][type] = this._pre(mods[mod].path(type));
        }
      }
    }

    let p = null;
    let m = null;
    let t = null;
    for (const mod in this._modPaths) {
      for (const type in this._modPaths[mod]) {
        if (path.startsWith(this._modPaths[mod][type])) {
          if (p === null || p.length < this._modPaths[mod][type].length) {
            p = this._modPaths[mod][type];
            m = mod;
            t = type;
          }
        }
      }
    }

    if (p === null && path.startsWith(this.root())) {
      p = this.root();
      m = 'root';
      t = null;
    }

    if (p !== null) {
      p = path.substring(p.length);
    } else {
      p = path;
    }

    return {
      path: p,
      base: m,
      type: t,
    };
  }

  constructor(path, base = 'root', type = 'src') {
    this._path = path;
    this._base = base;
    this._type = type;

    this._parts = null;
    this._subpath = null;
    this._norm = null;
  }

  path() {
    return this._path;
  }

  base() {
    return this._base;
  }

  type() {
    return this._type;
  }

  isInternal() {
    return !this.isExternal();
  }

  isExternal() {
    return this.base() === null;
  }

  norm() {
    if (this._norm === null) {
      if (this.isInternal()) {
        this._norm = nPath.normalize(nPath.join(this.root(), this.path()));
      } else {
        this._norm = nPath.normalize(this.path());
      }
    }
    return this._norm;
  }

  root() {
    if (this.base() === 'root') {
      return Path.root();
    } else if (this.base() === null) {
      return null;
    } else {
      return boot.mod(this.base()).path(this.type());
    }
  }

  subpath() {
    if (this._subpath === null) {
      this._subpath = this.norm().substring(this.root().length);
    }
    return this._subpath;
  }

  parts() {
    if (this._parts === null) {
      this._parts = this.path().split('/');
    }
    return this._parts;
  }

  glob(pattern, options) {
    options.cwd = this.norm();
    return glob.sync(pattern, options);
  }

  join(...paths) {
    return Path.extend(this, paths);
  }

  inspect() {
    return 'Path[' + this.norm() + ']';
  }

  toString() {
    return this.norm();
  }

}
