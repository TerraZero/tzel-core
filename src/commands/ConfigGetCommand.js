'use strict';

const Command = use('cli/Command');

/**
 * @Command
 */
module.exports = class ConfigGetCommand extends Command.class {

  /**
   * @Inject('util.type')
   */
  inject(util) {
    this._util = util;
  }

  command() {
    return 'config-get [setting]';
  }

  aliases() {
    return ['cget'];
  }

  description() {
    return 'Get the config';
  }

  build(yargs) {
    yargs.option('type', {
      describe: 'show type of value',
      type: 'boolean',
    });
  }

  execute(argv) {
    let value = null;

    if (argv.setting === undefined) {
      value = boot.settings();
    } else {
      value = boot.setting(argv.setting);
    }

    if (argv.type) {
      this.io().out(this._util.getType(value));
    } else {
      this.io().out(value);
    }
  }

}
