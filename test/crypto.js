import {
	keyPair,
	signKeyPair,
	agreement,
	symEncrypt,
	symDecrypt,
	getRandomKey,
	pubEncrypt,
	pubDecrypt,
	sign,
	verify
} from '../src/index';
import { expect } from 'chai';
let nacl = require('tweetnacl');
nacl.util = require('tweetnacl-util');

let enc64 = nacl.util.encodeBase64;
let dec64 = nacl.util.decodeBase64;
let encUTF8 = nacl.util.encodeUTF8;
let decUTF8 = nacl.util.decodeUTF8;

let keyPair1 = {};
let keyPair2 = {};
let signPair1 = {};
let signPair2 = {};

before(() => {
  keyPair1 = keyPair();
  keyPair2 = keyPair();
  signPair1 = signKeyPair();
  signPair2 = signKeyPair();
});

describe('crypto.js', () => {
	it('keypair agreement should match', () => {
		let agree1 = agreement(keyPair1.publicKey, keyPair2.secretKey);
		let agree2 = agreement(keyPair2.publicKey, keyPair1.secretKey);
		expect(agree1).to.deep.equal(agree2);
	});

	it('msg should match after symEncrypt/symDecrypt', () => {
    let agree1 = agreement(keyPair1.publicKey, keyPair2.secretKey);
		let agree2 = agreement(keyPair2.publicKey, keyPair1.secretKey);
		let iter = 20000;
		let msg = 'testing 123 super secret';
		let box = symEncrypt(msg, agree1, 'salt', iter);
		let msg2 = symDecrypt(box.cipherText, box.nonce, agree2, 'salt', iter);
		expect(msg).to.deep.equal(msg2);
	});

	it('random key generation should produce Uint8Array of length 32', () => {
		let randKey = getRandomKey();

		expect(randKey.length).to.equal(32);
	});

	it('public key encrypted message should not change after pubEncrypt/pubDecrypt', () => {
		let msg = 'this is a test, it is only a test';
		let sBox = pubEncrypt(msg, keyPair1.publicKey, keyPair2.secretKey);
		let msg2 = pubDecrypt(sBox.cipherText, sBox.nonce, keyPair2.publicKey, keyPair1.secretKey);

		expect(msg).to.deep.equal(msg2);
	});

	it('should make signatures that can be verified', () => {
    let msg = 'test message';
		let sigBox = sign(msg, signPair1.secretKey);
		let result = verify(sigBox.msg, sigBox.sig, signPair1.publicKey);
		expect(result).to.equal(true);
	});
})
