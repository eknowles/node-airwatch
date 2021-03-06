/*jslint node:true*/
/*global AirWatchService */

module.exports = AirWatchService;

var fs = require('fs');
var _ = require('lodash');
var request = require('request');
var winston = require('winston');
var chunkingStreams = require('chunking-streams');
var SizeChunker = chunkingStreams.SizeChunker;
var deviceIdentifiers = ['macaddress', 'serialnumber', 'UDID'];

winston.remove(winston.transports.Console);
winston.add(winston.transports.Console, {'timestamp': true, 'colorize': true});

require('util').inherits(AirWatchService, require('events').EventEmitter);

/**
 * Returns a filesize in bytes of a file.
 * @param {String} filename - Path to file.
 * @returns {Number} bytes - Total file size in bytes.
 */
function getFilesizeInBytes(filename) {
  var stats = fs.statSync(filename);
  var fileSizeInBytes = stats.size;
  return fileSizeInBytes;
}


/**
 * Creates an object of the AirWatchService
 * @param {Object} config - Service configurations object
 * @param {String} config.username - AirWatch API Username.
 * @param {String} config.password - AirWatch API Password.
 * @param {String} config.groupid - Group ID.
 * @param {String} config.apicode - aw-tenant-code.
 * @param {String} config.host - IP Address or domain name of the AirWatch server.
 * @returns {AirWatchService}
 * @class
 * @classdesc This is a description of the AirWatchService class.
 */
function AirWatchService(config) {
  if (!(this instanceof AirWatchService)) {
    return new AirWatchService(config);
  }
  require('events').EventEmitter.call(this);

  this.version = '0.0.1';
  this.logger = winston;
  this.config = config; //meh
  this.username = config.username;
  this.password = config.password;
  this.groupid = config.groupid;
  this.apicode = config.apicode;
  this.apiVersion = config.apiVersion || 'v1';
  this.path = 'https://' + config.host + '/api/' + this.apiVersion + '/';
  winston.log('info', 'AirWatchService Loaded');
}

/**
 * Make an request to the AirWatch API
 * @param {String} url - Endpoint to make the request, do not include hostname.
 * @param {Object} post - A json object with data to post. Optional.
 * @param {function} callback - The callback that handles the response.
 * @param {Object} callback.error
 * @param {Object} callback.response
 * @param {Object} callback.body
 */
AirWatchService.prototype.makeRequest = function (url, post, callback) {
  var self, options;
  self = this;
  options = {
    method: post ? 'POST' : 'GET',
    url: self.path + url,
    strictSSL: false,
    followRedirect: true,
    followAllRedirects: true,
    json: true,
    headers: {
      'Host': self.config.host,
      'Accept': 'application/json',
      'User-Agent': 'node-airwatch',
      'aw-tenant-code': self.apicode,
      'Date': new Date().toUTCString(),
      'content-type': 'application/json',
      'Authorization': 'Basic ' + new Buffer(self.username + ':' + self.password).toString('base64')
    }
  };
  if (post) {
    options.body = post;
  }
  request(options, callback);
};

/**
 * Request the current version of an App and update it via semantic versioning. This is currently designed for iOS
 * apps, must have agvtool installed.
 *
 * @param {Object} options
 * @param {String} options.app - Bundle ID of App.
 * @param {String} [options.status=active] - Status of App.
 * @param {String} [options.release=PATCH] - Type of release.
 * @param callback
 */
AirWatchService.prototype.updateVersion = function (options, callback) {
  var self, newVersion, currentVersion, versionSplit, operate, reqUrl;
  self = this;
  if (!options.status) {
    options.status = 'active';
  }
  if (!options.release) {
    options.release = 'PATCH';
  }
  reqUrl = 'mam/apps/search?bundleid=' + options.app + '&status=' + options.status;
  self.makeRequest(reqUrl, null, function (error, request, body) {
    if (request.statusCode !== 200) {
      return callback(error);
    }
    currentVersion = body.Application[0].ActualFileVersion;
    versionSplit = currentVersion.split('.');
    switch (options.release) {
      case ('MAJOR'):
        operate = parseInt(versionSplit[0]);
        operate += 1;
        versionSplit[0] = operate;
        break;
      case ('MINOR'):
        operate = parseInt(versionSplit[1]);
        operate += 1;
        versionSplit[1] = operate;
        break;
      case ('PATCH'):
        operate = parseInt(versionSplit[2]);
        operate += 1;
        versionSplit[2] = operate;
        break;
      default:
        break;
    }
    newVersion = versionSplit.join('.');
    winston.log('info', 'Updating version ' + currentVersion + ' -> ' + newVersion);
    return callback(null);
    //TODO update ios with new version
    //os.system('agvtool new-marketing-version ' + newVer)
  });

};

/**
 * Installs an Application on a device
 * @param {Object} options
 * @param {String} options.TransactionId -
 * @param {function} callback
 */
AirWatchService.prototype.installApp = function (options, callback) {
  var self;
  self = this;
  self.makeRequest('mam/apps/internal/begininstall', options, function (error, response, body) {
    if (error || response.statusCode !== 200) {
      self.emit('debug', 'Install App Failed ' + (error || response.statusCode));
      return callback(error || new Error(response.statusCode));
    }
    if (!body) {
      self.emit('debug', 'Install App Failed');
      return callback(new Error('Invalid Response'));
    }
    callback(null, body);
  });
};

/**
 * Upload an App to the AirWatch API as a single Blob
 * @param {String} filename - Filename of app. Must be in the same directory (for now).
 * @param {function} callback - The callback that handles the response.
 * @param {Object} callback.error
 * @param {Object} callback.response
 * @param {Object} callback.body
 */
AirWatchService.prototype.uploadAppBlob = function (filename, callback) {
  var self, endpoint, options;
  self = this;
  endpoint = 'mam/blobs/uploadblob?filename=' + filename + '&organizationgroupid=' + self.groupid;
  options = {
    method: 'POST',
    url: self.path + endpoint,
    json: true,
    strictSSL: false,
    followRedirect: true,
    followAllRedirects: true,
    headers: {
      'Host': self.config.host,
      'Accept': 'application/json',
      'aw-tenant-code': self.apicode,
      'Date': new Date().toUTCString(),
      'Authorization': 'Basic ' + new Buffer(self.username + ':' + self.password).toString('base64')
    }
  };
  winston.log('info', options.url);
  fs.createReadStream(filename).pipe(request(options, callback));
};

/**
 * Upload Application Chunks (iOS and Android).
 * Uploads application chunks into the AirWatch database for internal application install. This function must be used
 * prior to the 'Begin Install API' for uploading an internal application.
 * @param {String} filename - Name of the file you want to upload.
 * @param {String} callback - Returns a function with the uploaded transactionId.
 */
AirWatchService.prototype.uploadAppChunks = function (filename, callback) {
  var self, chunker, input, totalUploaded, totalAppSize, tmp, endpoint, chunkData, output, transactionId, chunkDataSize;
  self = this;
  tmp = './tmp/';
  endpoint = 'mam/apps/internal/uploadchunk';
  totalAppSize = getFilesizeInBytes(filename);
  totalUploaded = 0;
  input = fs.createReadStream(filename);
  chunker = new SizeChunker({chunkSize: 1024 * 35, flushTail: true});
  chunker.on('chunkStart', function (id, done) {
    chunkData = [];
    chunkDataSize = 0;
    done();
  });
  chunker.on('chunkEnd', function (id, done) {
    var fullChunkToUpload = Buffer.concat(chunkData, chunkDataSize);
    var post = {
      'ChunkData': fullChunkToUpload.toString('base64'),
      'ChunkSequenceNumber': id + 1,
      'TotalApplicationSize': totalAppSize,
      'ChunkSize': fullChunkToUpload.length
    };
    if (transactionId) {
      post.TransactionId = transactionId;
    }
    self.makeRequest(endpoint, post, function (error, response, body) {
      if (!body.UploadSuccess) {
        self.emit('debug', 'problem ' + (error || response.statusCode));
        return callback(error || new Error(response.statusCode));
      }
      transactionId = body.TranscationId;
      totalUploaded += fullChunkToUpload.length;
      if (totalUploaded === totalAppSize) {
        return callback(null, transactionId);
      }
      done();
    });
  });
  chunker.on('data', function (chunk) {
    chunkData.push(chunk.data);
    chunkDataSize += chunk.data.length;
  });
  input.pipe(chunker);
};

/**
 * Returns an object containing an array of applications installed on the device.
 * @param {Object} options - A json object containing items needed to make the request.
 * @param {String} options.deviceId - Type of identification. Can be either 'macaddress', 'serialnumber' or 'UDID'.
 * @param {String} options.uid - Unique ID of the device. Can be either a valid MAC address, serial number or UDID.
 * @param callback
 */
AirWatchService.prototype.getDeviceApps = function (options, callback) {
  var self = this;
  self._makeDeviceRequest(options, 'apps', callback);
};

/**
 * Retrieves details of the device identified by its numeric ID.
 * @param {Object} options - A json object containing items needed to make the request.
 * @param {String} options.deviceId - Type of identification. Can be either 'macaddress', 'serialnumber' or 'UDID'.
 * @param {String} options.uid - Unique ID of the device. Can be either a valid MAC address, serial number or UDID.
 * @param {function} callback
 */
AirWatchService.prototype.getDeviceInfo = function (options, callback) {
  var self = this;
  self._makeDeviceRequest(options, null, callback);
};

/**
 * Retrieves the details of the certificates that are present on the device.
 * @param {Object} options - A json object containing items needed to make the request.
 * @param {String} options.deviceId - Type of identification. Can be either 'macaddress', 'serialnumber' or 'UDID'.
 * @param {String} options.uid - Unique ID of the device. Can be either a valid MAC address, serial number or UDID.
 * @param {function} callback
 */
AirWatchService.prototype.getDeviceCertificates = function (options, callback) {
  var self = this;
  self._makeDeviceRequest(options, 'certificates', callback);
};

/**
 * Retrieves the details of the compliance policies that are present on a device.
 * @param {Object} options - A json object containing items needed to make the request.
 * @param {String} options.deviceId - Type of identification. Can be either 'macaddress', 'serialnumber' or 'UDID'.
 * @param {String} options.uid - Unique ID of the device. Can be either a valid MAC address, serial number or UDID.
 * @param {function} callback
 */
AirWatchService.prototype.getDeviceCompliance = function (options, callback) {
  var self = this;
  self._makeDeviceRequest(options, 'compliance', callback);
};

/**
 * Retrieves the details of the content that is present on a device.
 * @param {Object} options - A json object containing items needed to make the request.
 * @param {String} options.deviceId - Type of identification. Can be either 'macaddress', 'serialnumber' or 'UDID'.
 * @param {String} options.uid - Unique ID of the device. Can be either a valid MAC address, serial number or UDID.
 * @param {function} callback
 */
AirWatchService.prototype.getDeviceContent = function (options, callback) {
  var self = this;
  self._makeDeviceRequest(options, 'content', callback);
};

/**
 * Retrieves the profile related information of the device.
 * @param {Object} options - A json object containing items needed to make the request.
 * @param {String} options.deviceId - Type of identification. Can be either 'macaddress', 'serialnumber' or 'UDID'.
 * @param {String} options.uid - Unique ID of the device. Can be either a valid MAC address, serial number or UDID.
 * @param {function} callback
 */
AirWatchService.prototype.getDeviceProfiles = function (options, callback) {
  var self = this;
  self._makeDeviceRequest(options, 'profiles', callback);
};

/**
 * Retrieves the event log details of the device.
 * @param {Object} options - A json object containing items needed to make the request.
 * @param {String} options.deviceId - Type of identification. Can be either 'macaddress', 'serialnumber' or 'UDID'.
 * @param {String} options.uid - Unique ID of the device. Can be either a valid MAC address, serial number or UDID.
 * @param {function} callback
 */
AirWatchService.prototype.getDeviceEventLog = function (options, callback) {
  var self = this;
  self._makeDeviceRequest(options, 'eventlog', callback);
};

/**
 * Make a request to the API for a device specific action.
 * @param {Object} options - A json object containing items needed to make the request.
 * @param {String} options.deviceId - Type of identification. Can be either 'macaddress', 'serialnumber' or 'UDID'.
 * @param {String} options.uid - Unique ID of the device. Can be either a valid MAC address, serial number or UDID.
 * @param {function} callback
 * @private
 */
AirWatchService.prototype._makeDeviceRequest = function (options, action, callback) {
  var self, endpoint, suffix;
  self = this;
  if (!_.includes(deviceIdentifiers, options.deviceId)) {
    winston.log('warn', 'Bad ID Type');
    //TODO: handle error
  }
  suffix = action ? '/' + action : '';
  endpoint = 'mdm/devices/' + options.deviceId + '/' + options.uid + suffix;
  self.makeRequest(endpoint, null, function (error, response, body) {
    if (error || response.statusCode !== 200) {
      self.emit('debug', 'problem ' + (error || response.statusCode));
      return callback(error || new Error(response.statusCode));
    }
    if (!body) {
      self.emit('debug', 'no body');
      return callback(new Error('Invalid Response'));
    }
    callback(null, body);
  });
};
