/*global describe, it */
'use strict';
var assert = require('assert');
var awr = require('../index.js');

describe('awr node module', function () {
    it('must have at least one test', function () {
        awr();
        assert(false, 'I was too lazy to write any tests. Shame on me.');
    });
});
