/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "http://localhost:8888/test";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(1);


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _crypto = __webpack_require__(2);

	var _crypto2 = _interopRequireDefault(_crypto);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _index = __webpack_require__(3);

	var _chai = __webpack_require__(7);

	var keyPair1 = {};
	var keyPair2 = {};
	var signPair1 = {};
	var signPair2 = {};

	before(function () {
		keyPair1 = (0, _index.keyPair)();
		keyPair2 = (0, _index.keyPair)();
		signPair1 = (0, _index.signKeyPair)();
		signPair2 = (0, _index.signKeyPair)();
	});

	describe('crypto.js', function () {
		it('keypair agreement should match', function () {
			var agree1 = (0, _index.agreement)(keyPair1.pubKey, keyPair2.privKey);
			var agree2 = (0, _index.agreement)(keyPair2.pubKey, keyPair1.privKey);
			(0, _chai.expect)(agree1).to.deep.equal(agree2);
		});

		it('msg should match after symEncrypt/symDecrypt', function () {
			var agree1 = (0, _index.agreement)(keyPair1.pubKey, keyPair2.privKey);
			var agree2 = (0, _index.agreement)(keyPair2.pubKey, keyPair1.privKey);
			var iter = 20000;
			var msg = 'testing 123 super secret';
			var box = (0, _index.symEncrypt)(msg, agree1, 'salt', iter);
			var msg2 = (0, _index.symDecrypt)(box.cipherText, box.nonce, agree2, 'salt', iter);
			(0, _chai.expect)(msg).to.deep.equal(msg2);
		});

		it('random key generation should produce Uint8Array of length 32', function () {
			var randKey = (0, _index.getRandomKey)();

			(0, _chai.expect)(randKey.length).to.equal(32);
		});

		it('public key encrypted message should not change after pubEncrypt/pubDecrypt', function () {
			var msg = 'this is a test, it is only a test';
			var sBox = (0, _index.pubEncrypt)(msg, keyPair1.pubKey, keyPair2.privKey);
			var msg2 = (0, _index.pubDecrypt)(sBox.cipherText, sBox.nonce, keyPair2.pubKey, keyPair1.privKey);

			(0, _chai.expect)(msg).to.deep.equal(msg2);
		});

		it('should make signatures that can be verified', function () {
			var msg = 'test message';
			var sigBox = (0, _index.sign)(msg, signPair1.privKey);
			var result = (0, _index.verify)(sigBox.msg, sigBox.sig, signPair1.pubKey);
			(0, _chai.expect)(result).to.equal(true);
		});
	});

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _pbkdf = __webpack_require__(4);

	var _pbkdf2 = _interopRequireDefault(_pbkdf);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var nacl = __webpack_require__(5);
	nacl.util = __webpack_require__(6);
	Object.freeze(nacl);

	var enc64 = nacl.util.encodeBase64;
	var dec64 = nacl.util.decodeBase64;
	var encUTF8 = nacl.util.encodeUTF8;
	var decUTF8 = nacl.util.decodeUTF8;

	var keyPair = function keyPair() {
	  var pair = nacl.box.keyPair();
	  return {
	    pubKey: enc64(pair.publicKey),
	    privKey: enc64(pair.secretKey)
	  };
	};

	var signKeyPair = function signKeyPair() {
	  var pair = nacl.sign.keyPair();
	  return {
	    pubKey: enc64(pair.publicKey),
	    privKey: enc64(pair.secretKey)
	  };
	};

	var agreement = function agreement(pubKey, privKey) {
	  var pk = dec64(pubKey);
	  var sk = dec64(privKey);
	  var uKey = nacl.box.before(pk, sk);
	  return enc64(uKey);
	};

	var getRandomKey = function getRandomKey() {
	  return nacl.randomBytes(nacl.secretbox.keyLength);
	};

	var symEncrypt = function symEncrypt(msg, key, salt, iter) {
	  var hKey = _pbkdf2.default.pbkdf2Sync(key, salt, iter, 32, 'sha256');
	  var nonce = nacl.randomBytes(nacl.secretbox.nonceLength);
	  var cipherText = enc64(nacl.secretbox(decUTF8(msg), nonce, hKey));
	  return { nonce: enc64(nonce), cipherText: cipherText };
	};

	var symDecrypt = function symDecrypt(cipherText, nonce, key, salt, iter) {
	  var hKey = _pbkdf2.default.pbkdf2Sync(key, salt, iter, 32, 'sha256');
	  var n = dec64(nonce);
	  var msg = encUTF8(nacl.secretbox.open(dec64(cipherText), n, hKey));
	  return msg;
	};

	var pubEncrypt = function pubEncrypt(msg, pubKey, privKey) {
	  var nonce = nacl.randomBytes(nacl.box.nonceLength);
	  var cipherText = enc64(nacl.box(decUTF8(msg), nonce, dec64(pubKey), dec64(privKey)));
	  return { nonce: enc64(nonce), cipherText: cipherText };
	};

	var pubDecrypt = function pubDecrypt(cipherText, nonce, pubKey, privKey) {
	  var msg = encUTF8(nacl.box.open(dec64(cipherText), dec64(nonce), dec64(pubKey), dec64(privKey)));
	  return msg;
	};

	var sign = function sign(msg, privKey) {
	  var sig = enc64(nacl.sign.detached(decUTF8(msg), dec64(privKey)));
	  return { msg: msg, sig: sig };
	};

	var verify = function verify(msg, sig, pubKey) {
	  return nacl.sign.detached.verify(decUTF8(msg), dec64(sig), dec64(pubKey));
	};

	module.exports = {
	  enc64: enc64,
	  dec64: dec64,
	  encUTF8: encUTF8,
	  decUTF8: decUTF8,
	  keyPair: keyPair,
	  signKeyPair: signKeyPair,
	  agreement: agreement,
	  getRandomKey: getRandomKey,
	  symEncrypt: symEncrypt,
	  symDecrypt: symDecrypt,
	  pubEncrypt: pubEncrypt,
	  pubDecrypt: pubDecrypt,
	  sign: sign,
	  verify: verify
	};

/***/ },
/* 4 */
/***/ function(module, exports) {

	module.exports = require("pbkdf2");

/***/ },
/* 5 */
/***/ function(module, exports) {

	module.exports = require("tweetnacl");

/***/ },
/* 6 */
/***/ function(module, exports) {

	module.exports = require("tweetnacl-util");

/***/ },
/* 7 */
/***/ function(module, exports) {

	module.exports = require("chai");

/***/ }
/******/ ]);