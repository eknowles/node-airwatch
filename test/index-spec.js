/*global describe, it, mocha */
var assert = require('assert');
var AirWatch = require('../index.js');

describe('airwatch node module', function () {
  it('must have at least one test', function () {
    var config = {
      'username': 'myusername',
      'password': 'mYaIrWaTcHpAsSwOrD',
      'groupid': '123',
      'apicode': '1A2BC3DEFGE5OIC87',
      'host': '0.0.0.0'
    };
    var airwatch = new AirWatch(config);
    assert(false, 'I was too lazy to write any tests. Shame on me.');
  });
});
