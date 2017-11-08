'use strict';

const Boot = require('./src/Boot');

module.exports = {

  key: 'core',
  name: 'Core',
  root: __dirname,
  paths: {
    src: 'src',
    configs: 'configs',
  },

  boot: function (settings) {
    const boot = new Boot(settings);

    boot.boot();
    return boot;
  },

};
