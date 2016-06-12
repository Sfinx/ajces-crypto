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
  return {
    pubKey: enc64(pair.publicKey),
    privKey: enc64(pair.secretKey)
  };
};

const signKeyPair = () => {
  let pair = nacl.sign.keyPair();
  return {
    pubKey: enc64(pair.publicKey),
    privKey: enc64(pair.secretKey)
  };
};

const agreement = (pubKey, privKey) => {
  let pk = dec64(pubKey);
  let sk = dec64(privKey);
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
  return {nonce: enc64(nonce), cipherText};
};

const symDecrypt = (cipherText, nonce, key, salt, iter) => {
  let hKey = pbkdf2.pbkdf2Sync(key, salt, iter, 32, 'sha256');
  let n = dec64(nonce);
  let msg = encUTF8(nacl.secretbox.open(dec64(cipherText), n, hKey));
  return msg;
};

const pubEncrypt = (msg, pubKey, privKey) => {
  let nonce = nacl.randomBytes(nacl.box.nonceLength);
  let cipherText = enc64(nacl.box(
    decUTF8(msg), nonce, dec64(pubKey), dec64(privKey)));
  return {nonce: enc64(nonce), cipherText};
};

const pubDecrypt = (cipherText, nonce, pubKey, privKey) => {
  let msg = encUTF8(nacl.box.open(
    dec64(cipherText), dec64(nonce), dec64(pubKey), dec64(privKey)));
  return msg;
};

const sign = (msg, privKey) => {
  let sig = enc64(nacl.sign.detached(decUTF8(msg), dec64(privKey)));
  return {msg, sig};
};

const verify = (msg, sig, pubKey) => {
  return nacl.sign.detached.verify(decUTF8(msg), dec64(sig), dec64(pubKey));
};

const sha512 = (msg) => {
  return enc64(nacl.hash(msg));
};

module.exports = {
  enc64,
  dec64,
  encUTF8,
  decUTF8,
  keyPair,
  signKeyPair,
  agreement,
  getRandomKey,
  symEncrypt,
  symDecrypt,
  pubEncrypt,
  pubDecrypt,
  sign,
  verify,
  sha512
};
