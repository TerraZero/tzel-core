'use strict';

const Command = use('cli/Command');

/**
 * @Command
 */
module.exports = class ConfigGetCommand extends Command.class {

  command() {
    return 'config-get [setting]';
  }

  aliases() {
    return ['cget'];
  }

  description() {
    return 'Get the config';
  }

  execute(argv) {
    let value = null;

    if (argv.setting === undefined) {
      value = boot.settings();
    } else {
      value = boot.setting(argv.setting);
    }
    this.out(value);
  }

}
