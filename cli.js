#!/usr/bin/env node
'use strict';
var meow = require('meow');
var awr = require('./');

var cli = meow({
    help: [
        'Usage',
        '  awr <input>',
        '',
        'Example',
        '  awr Unicorn'
    ].join('\n')
});

awr(cli.input[0]);
