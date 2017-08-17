'use strict';

const core = require('./index');
const settings = {
  root: __dirname,
  require: require.bind(),
  log: {
    debug: 'console',
  },
  modules: {
    enabled: ['zzz'],
  },
};

core.boot(settings);
boot.addMod(core);

const t = use('core/Use');
log(t.__file);
log(t.__path);
log(t.class);
