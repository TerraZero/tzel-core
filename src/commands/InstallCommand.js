'use strict';

const path = require('path');
const glob = require('glob');

const Command = use('cli/Command');
const Path = use('core/Path');

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
    const pConfigs = Path.create(boot.setting('path.configs'));

    this.io().h1('Start Install');

    this.io().h2('Create paths');
    for (const index in paths) {
      this.io().fsMkDirs(paths[index]);
    }

    this.io().nl().h2('Build Configs');

    const mods = boot.getMods();
    const configs = {};

    for (const name in mods) {
      let mConfigs = mods[name].path('configs');

      if (mConfigs === null) continue;
      mConfigs = Path.create(mConfigs);
      const pConfigFiles = mConfigs.glob('**/*.json');

      for (const index in pConfigFiles) {
        this.io().out('[NODE] load config from ' + pConfigFiles[index].cli());
        const config = require(pConfigFiles[index].norm());
        configs[path.parse(pConfigFiles[index].norm()).name] = config;
      }
    }

    this.io().fsJson(pConfigs.join('defaults.json'), configs, true);
    this.io().fsJson(pConfigs.join('configs.json'), configs);
  }

}
