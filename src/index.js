'use strict';
import pbkdf2 from 'pbkdf2';
let nacl = require('tweetnacl');
nacl.util = require('tweetnacl-util');
Object.freeze(nacl);

const enc64 = nacl.util.encodeBase64;
const dec64 = nacl.util.decodeBase64;
const encUTF8 = nacl.util.encodeUTF8;
const decUTF8 = nacl.util.decodeUTF8;

const keyPair = () => {
  let pair = nacl.box.keyPair();
  let strPair = {
    publicKey: enc64(pair.publicKey),
    secretKey: enc64(pair.secretKey)
  };
  return strPair;
};

const signKeyPair = () => {
  let pair = nacl.sign.keyPair();
  let strPair = {
    publicKey: enc64(pair.publicKey),
    secretKey: enc64(pair.secretKey)
  };
  return strPair;
};

const agreement = (publicKey, secretKey) => {
  let pk = dec64(publicKey);
  let sk = dec64(secretKey);
  let uKey = nacl.box.before(pk, sk);
  return enc64(uKey);
};

const getRandomKey = () => {
  return nacl.randomBytes(nacl.secretbox.keyLength);
};

const symEncrypt = (msg, key, salt, iter) => {
  let hKey = pbkdf2.pbkdf2Sync(key, salt, iter, 32, 'sha256');
  let nonce = nacl.randomBytes(nacl.secretbox.nonceLength);
  let cipherText = enc64(nacl.secretbox(decUTF8(msg), nonce, hKey));
  return {nonce: enc64(nonce), cipherText: cipherText};
};

const symDecrypt = (cipherText, nonce, key, salt, iter) => {
  let hKey = pbkdf2.pbkdf2Sync(key, salt, iter, 32, 'sha256');
  let n = dec64(nonce);
  let msg = encUTF8(nacl.secretbox.open(dec64(cipherText), n, hKey));
  return msg;
};

const pubEncrypt = (msg, publicKey, secretKey) => {
  let nonce = nacl.randomBytes(nacl.box.nonceLength);
  let cipherText = enc64(nacl.box(
    decUTF8(msg), nonce, dec64(publicKey), dec64(secretKey)));
  return {nonce: enc64(nonce), cipherText: cipherText};
};

const pubDecrypt = (cipherText, nonce, publicKey, secretKey) => {
  let msg = encUTF8(nacl.box.open(
    dec64(cipherText), dec64(nonce), dec64(publicKey), dec64(secretKey)));
  return msg;
};

const sign = (msg, secretKey) => {
  let sig = enc64(nacl.sign.detached(decUTF8(msg), dec64(secretKey)));
  return {msg: msg, sig: sig};
};

const verify = (msg, sig, publicKey) => {
  return nacl.sign.detached.verify(decUTF8(msg), dec64(sig), dec64(publicKey));
};

module.exports = {
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
