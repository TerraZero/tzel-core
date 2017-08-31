'use strict';

const fs = require('graceful-fs');
const eol = require('os').EOL;
const dateformat = require('dateformat');

let _settings = {};

module.exports = class Logger {

  static setSettings(settings) {
    _settings = settings;
  }

  static chanel(chanel, mod = null) {
    return new Logger(chanel, mod);
  }

  constructor(chanel, mod) {
    this._chanel = chanel;
    this._mod = mod;
    this._config = _settings[this.chanel()];
  }

  chanel() {
    return this._chanel;
  }

  mod() {
    return this._mod;
  }

  config(index = null) {
    if (this._config === undefined) return {};
    if (index === null) return this._config;
    if (this._config[index] === undefined) return {};
    return this._config[index];
  }

  head(index) {
    let head = this.config(index).head;

    if (head === undefined) return '';
    head = head.replace(/\$mod/g, this.mod());
    head = head.replace(/\$time/g, dateformat(new Date(), this.date(index)));
    return head;
  }

  type(index) {
    const type = this.config(index).type;

    if (type === undefined) return '';
    return type;
  }

  date(index) {
    const date = this.config(index).date;

    if (date === undefined) return 'yy.mm.dd hh:MM:ss';
    return date;
  }

  log(...args) {
    this.print(args.join(' '));
  }

  out(text, ...placeholders) {
    for (const index in placeholders) {
      text = text.replace(new RegExp('\\[([^\\d]*?)' + index + '\\]', 'g'), '$1' + placeholders[index] + '$1');
    }
    this.print(text);
  }

  print(text) {
    const configs = this.config();

    for (const index in configs) {
      let line = this.head(index) + text;
      let type = this.type(index);

      switch (type) {
        case 'console':
          this.outConsole(line, index);
          break;
        case 'file':
          this.outFile(line, index);
          break;
      }
    }
  }

  outConsole(text, index) {
    console.log(text);
  }

  outFile(text, index) {
    fs.appendFileSync(this.config(index).file, text + eol);
  }

};
