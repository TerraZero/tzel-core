'use strict';

const Command = use('cli/Command');

/**
 * @Command
 */
module.exports = class ConfigSetCommand extends Command.class {

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
    yargv.choices('mode', ['set', 'add', 'del']);
  }

  execute(argv) {
    log(argv);
  }

}
