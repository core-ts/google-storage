"use strict";
var __extends = (this && this.__extends) || (function () {
  var extendStatics = function (d, b) {
    extendStatics = Object.setPrototypeOf ||
      ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
      function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return extendStatics(d, b);
  };
  return function (d, b) {
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.map = {
  png: 'image/png',
  JPEG: 'video/JPEG',
  mp4: 'video/mp4',
  example: 'video/example',
  quicktime: 'video/quicktime',
  MPV: 'video/MPV',
  H265: 'video/H265',
  mj2: 'video/mj2',
  raw: 'video/raw',
  VP8: 'video/VP8',
  VP9: 'video/VP9',
  AV1: 'video/AV1',
  '3gpp': 'video/3gpp',
  '3gpp2': 'video/3gpp2',
  CelB: 'video/CelB',
  DV: 'video/DV',
  aac: 'audio/aac',
  ac3: 'audio/ac3',
  AMR: 'audio/AMR',
  L8: 'audio/L8',
  L16: 'audio/L16',
  L20: 'audio/L20',
  L24: 'audio/L24',
  LPC: 'audio/LPC',
  MELP: 'audio/MELP',
  MELP600: 'audio/MELP600',
  MELP1200: 'audio/MELP1200',
  MELP2400: 'audio/MELP2400',
  mhas: 'audio/mhas',
  'mobile-xmf': 'audio/mobile-xmf',
  MPA: 'audio/MPA',
  aces: 'image/aces',
  avci: 'image/avci',
  avcs: 'image/avcs',
  avif: 'image/avif',
  bmp: 'image/bmp',
  cgm: 'image/cgm',
  'dicom-rle': 'image/dicom-rle',
  emf: 'image/emf',
  fits: 'image/fits',
  g3fax: 'image/g3fax',
  heic: 'image/heic',
  hej2k: 'image/hej2k',
  hsj2: 'image/hsj2',
  jls: 'image/jls',
  jp2: 'image/jp2',
  jph: 'image/jph',
  jphc: 'image/jphc',
  jpm: 'image/jpm',
  jpx: 'image/jpx',
  jxr: 'image/jxr',
  jxrA: 'image/jxrA',
  jxrS: 'image/jxrS',
  jxs: 'image/jxs',
  jxsc: 'image/jxsc',
  jxsi: 'image/jxsi',
  jxss: 'image/jxss',
  ktx: 'image/ktx',
  ktx2: 'image/ktx2',
  naplps: 'image/naplps',
};
function getPublicUrl(bucketName, filename) {
  return "https://storage.googleapis.com/" + bucketName + "/" + filename;
}
exports.getPublicUrl = getPublicUrl;
var GoogleStorageService = /** @class */ (function () {
  function GoogleStorageService(bucket, config, mp) {
    this.bucket = bucket;
    this.config = config;
    this.map = mp;
    this.upload = this.upload.bind(this);
    this.delete = this.delete.bind(this);
  }
  GoogleStorageService.prototype.upload = function (data, name, directory) {
    var _this = this;
    var key = name;
    if (directory && directory.length > 0) {
      key = directory + '/' + name;
    }
    var metadata = {};
    var i = name.lastIndexOf('.');
    if (i >= 0) {
      var ext = name.substr(i + 1);
      if (this.map && ext.length > 0) {
        var contentType = this.map[ext];
        if (!contentType || contentType.length === 0) {
          contentType = ext;
        }
        if (contentType && contentType.length > 0) {
          metadata.contentType = contentType;
        }
      }
    }
    return new Promise(function (resolve, reject) {
      var object = _this.bucket.file(key);
      object.save(data, { metadata: metadata }, function (er1) {
        if (er1) {
          return reject(er1);
        }
        if (_this.config.public) {
          object.makePublic(function (er2) {
            if (er2) {
              return reject(er2);
            }
            resolve(getPublicUrl(_this.bucket.name, key));
          });
        }
        else if (!_this.config.private) {
          object.acl.add({
            entity: 'allAuthenticatedUsers',
            role: 'READER',
          }, function (err, acl, resp) {
            if (err) {
              return reject(err);
            }
            else {
              return resolve(getPublicUrl(_this.bucket.name, key));
            }
          });
        }
      });
    });
  };
  GoogleStorageService.prototype.delete = function (filename, directory) {
    var key = filename;
    if (directory && directory.length > 0) {
      key = directory + '/' + filename;
    }
    var object = this.bucket.file(key);
    return new Promise(function (resolve, reject) {
      object.delete(function (err) {
        if (err) {
          return reject(err);
        }
        resolve(true);
      });
    });
  };
  return GoogleStorageService;
}());
exports.GoogleStorageService = GoogleStorageService;
var GoogleStorageRepository = /** @class */ (function (_super) {
  __extends(GoogleStorageRepository, _super);
  function GoogleStorageRepository() {
    return _super !== null && _super.apply(this, arguments) || this;
  }
  return GoogleStorageRepository;
}(GoogleStorageService));
exports.GoogleStorageRepository = GoogleStorageRepository;
function deleteFile(delFile, url) {
  var _a, _b, _c;
  var fileName = (_a = url.split('/')) !== null && _a !== void 0 ? _a : [];
  return delFile((_b = fileName[fileName.length - 1]) !== null && _b !== void 0 ? _b : '', (_c = fileName[fileName.length - 2]) !== null && _c !== void 0 ? _c : '');
}
exports.deleteFile = deleteFile;
var UrlBuilder = /** @class */ (function () {
  function UrlBuilder(bucket) {
    this.bucket = bucket;
    this.build = this.build.bind(this);
  }
  UrlBuilder.prototype.build = function (name, directory) {
    var key = name;
    if (directory && directory.length > 0) {
      key = directory + '/' + name;
    }
    return "https://storage.googleapis.com/" + this.bucket + "/" + key;
  };
  return UrlBuilder;
}());
exports.UrlBuilder = UrlBuilder;
function useBuildUrl(bucket) {
  var builder = new UrlBuilder(bucket);
  return builder.build;
}
exports.useBuildUrl = useBuildUrl;
