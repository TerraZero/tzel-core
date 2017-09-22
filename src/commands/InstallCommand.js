'use strict';

const Command = use('cli/Command');
const path = require('path');
const glob = require('glob');

/**
 * @Command
 */
module.exports = class InstallCommand extends Command.class {

  command() {
    return 'install';
  }

  description() {
    return 'Install the system';
  }

  execute(argv) {
    this._root = boot.setting('root');
    const paths = boot.setting('path');
    const pConfigs = boot.setting('path.configs');

    this.io().h1('Start Install');

    this.io().h2('Create paths');
    for (const index in paths) {
      this.io().fsMkDirs(paths[index])
    }

    this.io().nl().h2('Build Configs');

    const mods = boot.getMods();
    const configs = {};

    for (const name in mods) {
      const mConfigs = mods[name].path('configs');

      if (mConfigs === null) continue;
      const pConfigFiles = glob.sync('**/*.json', {
        cwd: mConfigs,
        absolute: true,
      });

      for (const index in pConfigFiles) {
        this.io().out('[NODE] load config from mod ' + mods[name].name() + ' ' + this.io().subpath(pConfigFiles[index], mods[name].path('configs')));
        const config = require(pConfigFiles[index]);
        configs[path.parse(pConfigFiles[index]).name] = config;
      }
    }

    this.io().fsJson(path.join(pConfigs, 'defaults.json'), configs, true);
    this.io().fsJson(path.join(pConfigs, 'configs.json'), configs);
  }

}
