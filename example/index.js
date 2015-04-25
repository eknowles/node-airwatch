var _ = require('lodash');
var AirWatch = require('../index.js');
var config = require('../example/config.json');

var aw = new AirWatch(config);
var filename = 'xxx.ipa';


aw.on('debug', console.log);

//aw.updateVersion({
//    app: 'uk.co.xxx.xxx-xxx',
//    release: 'patch',
//    path: '/Users/xxx/xxx-xxx'
//}, function () {
//
//});

//aw.uploadAppBlob(filename, function (e, r, b) {
//   console.log(b);
//});

//aw.uploadAppChunks(filename, function (error, transactionId) {
//
//    aw.logger.log('info', 'File Uploaded with transactionId: ' + transactionId);
//
//    aw.installApp({
//        'TransactionId': transactionId,
//        'DeviceType': '2',
//        'ApplicationName': 'xxx',
//        'PushMode': 'OnDemand',
//        'AutoUpdateVersion': false
//    }, function (error, response, body) {
//        console.log(body);
//    });
//
//});

//aw.installApp({
//    'TransactionId': 'abb73edf-23bb-43c8-a1b8-d235fd6c4f3d',
//    'DeviceType': '2',
//    'ApplicationName': 'xxx',
//    'PushMode': 'OnDemand',
//    'AutoUpdateVersion': false
//}, function (error, response) {
//    console.log(error, response);
//});

aw.getDeviceApps({deviceId: 'UDID', uid: 'xxx'}, function (error, info) {
    console.log(info);
});
