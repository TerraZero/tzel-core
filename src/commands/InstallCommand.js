'use strict';

const Command = use('cli/Command');
const fs = require('graceful-fs');
const path = require('path');
const glob = require('glob');

/**
 * @Command
 */
module.exports = class InstallCommand extends Command.class {

  command() {
    return 'install [reinstall]';
  }

  description() {
    return 'Install the system';
  }

  execute(argv) {
    this._root = boot.setting('root');
    const pRoot = path.join(this._root, 'install');
    const pSettings = path.join(pRoot, 'configs.json');

    this.out();
    this.out('Start Install');
    this.out();

    this.mkdir(pRoot);

    const mods = boot.getMods();
    const configs = {};

    for (const name in mods) {
      const pConfigs = mods[name].path('configs');

      if (pConfigs === null) continue;
      const pConfigFiles = glob.sync('**/*.json', {
        cwd: pConfigs,
        absolute: true,
      });

      for (const index in pConfigFiles) {
        this.out('[NODE] load config from mod ' + mods[name].name() + ' ' + this._subpath(pConfigFiles[index], mods[name].path('configs')));
        const config = require(pConfigFiles[index]);

        for (const value in config) {
          configs[value] = config[value];
        }
      }
    }

    this.json(pSettings, configs);
  }

  _subpath(path, rootPath = null) {
    rootPath = rootPath || this._root;
    return '"..' + path.substring(rootPath.length) + '"';
  }

  mkdir(path) {
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path);
      this.out('[FS] mkdir ' + this._subpath(path));
    }
  }

  json(path, value) {
    if (!fs.existsSync(path)) {
      fs.writeFileSync(path, JSON.stringify(value, null, 2));
      this.out('[FS] write json ' + this._subpath(path));
    }
  }

  copy(from, to) {
    fs.createReadStream(from).pipe(fs.createWriteStream(to));
    this.out('[FS] copy from ' + this._subpath(from) + ' to ' + this._subpath(to));
  }

}
