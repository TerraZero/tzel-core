'use strict';

const Command = use('cli/Command');
const Provider = use('core/Provider');

/**
 * @Command
 */
module.exports = class ConfigSetCommand extends Command.class {

  /**
   * @Inject('util.nesting')
   */
  inject(util) {
    this._util = util;
  }

  command() {
    return 'config-set <mode> <setting> [value]';
  }

  aliases() {
    return ['cset'];
  }

  description() {
    return 'Set the config';
  }

  build(yargv) {
    yargv
      .choices('mode', ['set', 'add', 'del'])
      .option('json', {
        describe: 'interpret value as json',
        type: 'boolean',
      })
      .option('test', {
        alias: ['t'],
        describe: "Don't save the changes",
        type: 'boolean',
      })
      .option('show', {
        alias: ['s'],
        describe: 'Show the result',
        type: 'boolean',
      })
      .check(this.check.bind(this));
  }

  check(argv, options) {
    if ((argv.mode === 'set' || argv.mode === 'add') && argv.value === undefined) {
      throw 'The modes "set" and "add" require a value.';
    }
    return true;
  }

  execute(argv) {
    if (argv.json && argv.value) {
      argv.value = JSON.parse(argv.value);
    }

    switch (argv.mode) {
      case 'set':
        this.executeSet(argv);
        break;
      case 'add':
        this.executeAdd(argv);
        break;
      case 'del':
        this.executeDel(argv);
        break;
    }
  }

  executeDel(argv) {
    const settings = boot.settings();

  }

  executeSet(argv) {
    const settings = boot.settings();
    const keys = this._util.split(argv.setting);
    const key = keys.pop();
    const object = this._util.get(settings, keys);

    object[key] = argv.value;
    this.executeFinish(argv, settings);
  }

  executeFinish(argv, settings) {
    if (argv.show) {
      this.io().out(settings).newline();
    }
    if (!argv.test) {
      this.io().fsJson([boot.setting('root'), 'install/configs/configs.json'], settings, true);
    }
  }

}
