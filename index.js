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
    new Boot(settings).boot();
  },

};
