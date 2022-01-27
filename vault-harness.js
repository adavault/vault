//npm dependencies
const ed25519 = require('@noble/ed25519');
const secp = require('@noble/secp256k1');
const cryptoJS = require('crypto-js');

//Common functions
//If you need hex strings
const hex = secp.utils.bytesToHex;


//Main

//wrap in async as many functions return promise
(async () => {

//Set up key pairs for test harness
	console.log('\x1b[37m\x1b[44m%s\x1b[0m', 'Set up key pairs for test harness');
	const privA = ed25519.utils.randomPrivateKey(); // 32-byte Uint8Array or string.
	console.log('\x1b[30m\x1b[43m%s\x1b[0m', 'privA: ', hex(privA));
	const pubA = await ed25519.getPublicKey(privA);
	console.log('\x1b[30m\x1b[43m%s\x1b[0m', 'pubA: ',hex(pubA));
        const privB = ed25519.utils.randomPrivateKey(); // 32-byte Uint8Array or string.
        console.log('\x1b[30m\x1b[43m%s\x1b[0m', 'privB: ',hex(privB));
        const pubB = await ed25519.getPublicKey(privB);
        console.log('\x1b[30m\x1b[43m%s\x1b[0m', 'pubB: ',hex(pubB));
        const privO = ed25519.utils.randomPrivateKey(); // 32-byte Uint8Array or string.
        console.log('\x1b[30m\x1b[43m%s\x1b[0m', 'privO: ',hex(privO));
        const pubO = await ed25519.getPublicKey(privO);
        console.log('\x1b[30m\x1b[43m%s\x1b[0m', 'pubO: ',hex(pubO));
	console.log('\n');

//User Interface message submission 
        console.log('\x1b[37m\x1b[44m%s\x1b[0m', 'User Interface message submission');
	const plaintextMessageA = 'If you can keep your head when all about you Are losing theirs and blaming it on you;If you can trust yourself when all men doubt you, But make allowance for their doubting too;If you can wait and not be tired by waiting, Or, being lied about, don’t deal in lies, Or, being hated, don’t give way to hating, And yet don’t look too good, nor talk too wise;If you can dream—and not make dreams your master; If you can think—and not make thoughts your aim; If you can meet with triumph and disaster And treat those two impostors just the same;If you can bear to hear the truth you’ve spoken Twisted by knaves to make a trap for fools, Or watch the things you gave your life to broken, And stoop and build ’em up with wornout tools';
	console.log('\x1b[7m%s\x1b[0m', 'plaintextMessageA: ',plaintextMessageA);
	//create hash and sign
	const hashMessageA = await secp.utils.sha256(plaintextMessageA);
	console.log('\x1b[7m%s\x1b[0m', 'hashMassageA: ',hex(hashMessageA));
	const signMessageA = await ed25519.sign(hex(hashMessageA), privA);
	console.log('\x1b[7m%s\x1b[0m', 'signMessageA: ',hex(signMessageA));
	//create symmetric key and encrypt message
	const symKeyA = ed25519.utils.randomPrivateKey(); // 32-byte Uint8Array or string.
	console.log('\x1b[7m%s\x1b[0m', 'symKeyA: ',hex(symKeyA));
	var ciphertextMessageA = cryptoJS.AES.encrypt(plaintextMessageA,hex(symKeyA)).toString();
	console.log('\x1b[7m%s\x1b[0m', 'ciphertextMessageA: ',ciphertextMessageA);
	//create shared secret between Alice/Bob and wrap symmetric key
	const sharedKeyAB = await ed25519.getSharedSecret(privA, pubB);
	console.log('\x1b[7m%s\x1b[0m', 'sharedKeyAB: ',hex(sharedKeyAB));
	const ciphertextSymKeyA = cryptoJS.AES.encrypt(hex(symKeyA),hex(sharedKeyAB)).toString();
	console.log('\x1b[7m%s\x1b[0m', 'ciphertextSymKeyA: ',ciphertextSymKeyA);
	//create data structure to pass to the oracle
        const sharedKeyAO = await ed25519.getSharedSecret(privA, pubO);
	console.log('\x1b[7m%s\x1b[0m', 'sharedKeyAO: ',hex(sharedKeyAO));
	const dataO = hex(hashMessageA) + "," + "@walletB" + "," + "@SCaddr" + "," + ciphertextSymKeyA
	//console.log('\x1b[7m%s\x1b[0m', 'dataO: ',dataO);
	const ciphertextDataO = cryptoJS.AES.encrypt(dataO,hex(sharedKeyAO)).toString();
	console.log('\x1b[7m%s\x1b[0m', 'ciphertextDataO: ',ciphertextDataO);
	//create data structure for the smart contract
	const ciphertextDataSC = cryptoJS.AES.encrypt(hex(hashMessageA),hex(sharedKeyAO)).toString();
	console.log('\x1b[7m%s\x1b[0m', 'ciphertextDataSC: ',ciphertextDataSC);
	console.log('\n');

//Smart Contract Stub
        console.log('\x1b[37m\x1b[44m%s\x1b[0m', 'Smart Contract Stub');
	console.log('The smart contract cannot decrypt transaction metadata and must rely on the Oracle');
	console.log('\x1b[7m%s\x1b[0m', 'ciphertextDataSC: ',ciphertextDataSC);
	console.log('The smart contract to release the key is executed when Bob submits a transaction and success is based on time or relevant Oracle input.');
	console.log('Output goes to a wallet address @ORACLEaddr (can be passed into contract) that is monitored by the oracle.');
	console.log('\n');

//Oracle Stub
        console.log('\x1b[37m\x1b[44m%s\x1b[0m', 'Oracle Stub');
        //decrypt and store data structure
        console.log('\x1b[7m%s\x1b[0m', 'ciphertextDataO: ',ciphertextDataO);
        const sharedKeyOA = await ed25519.getSharedSecret(privO, pubA);
        console.log('\x1b[7m%s\x1b[0m', 'sharedKeyOA: ',hex(sharedKeyOA));
        var plaintextDataO = cryptoJS.AES.decrypt(ciphertextDataO,hex(sharedKeyOA));
	plaintextDataO = plaintextDataO.toString(cryptoJS.enc.Utf8);
	var arrayDataO = plaintextDataO.split(",");
        console.log('\x1b[7m%s\x1b[0m', 'plaintextDataO: ',plaintextDataO);
	//check that the data passed from smart contract is correct
	console.log('Oracle checks the SC data that has been passed in against the hash ...');
	var plaintextDataSC = cryptoJS.AES.decrypt(ciphertextDataSC,hex(sharedKeyOA));
        plaintextDataSC = plaintextDataSC.toString(cryptoJS.enc.Utf8);
        console.log('\x1b[7m%s\x1b[0m', 'plaintextDataSC: ',plaintextDataSC);
	var SCvalid = false;
	if (arrayDataO[0] = plaintextDataSC) {
		SCvalid = true;
	}
	console.log('\x1b[7m%s\x1b[0m', 'SCvalid: ',SCvalid); 
	console.log('The Oracle returns data by submitting a txn to return wrapped key to Bob ...');
	console.log('\x1b[7m%s\x1b[0m', 'destination wallet: ',arrayDataO[1]);
	console.log('\x1b[7m%s\x1b[0m', 'smart contract address: ',arrayDataO[2]);
	console.log('\x1b[7m%s\x1b[0m', 'wrapped key: ',arrayDataO[3]);
	console.log('\n');

//User Interface message recovery
        console.log('\x1b[37m\x1b[44m%s\x1b[0m', 'User Interface message recovery');
        //create shared secret betwen Bob/Alice and decrypt symKeyA
        console.log('\x1b[7m%s\x1b[0m', 'ciphertextSymKeyA: ',ciphertextSymKeyA);
        const sharedKeyBA = await ed25519.getSharedSecret(privB, pubA);
        console.log('\x1b[7m%s\x1b[0m', 'sharedKeyBA: ',hex(sharedKeyBA));
        var symKeyB = cryptoJS.AES.decrypt(ciphertextSymKeyA,hex(sharedKeyBA));
        symKeyB = symKeyB.toString(cryptoJS.enc.Utf8);
        console.log('\x1b[7m%s\x1b[0m', 'symKeyB: ',symKeyB);
	//decrypt ciphertext message using symKey
        var plaintextMessageB = cryptoJS.AES.decrypt(ciphertextMessageA,symKeyB);
        plaintextMessageB = plaintextMessageB.toString(cryptoJS.enc.Utf8);
        console.log('\x1b[7m%s\x1b[0m', 'plaintextMessageB: ',plaintextMessageB);
	//create hash and verify signature
        const hashMessageB = await secp.utils.sha256(plaintextMessageB);
        console.log('\x1b[7m%s\x1b[0m', 'hashMassageB: ',hex(hashMessageB));
	const isSigned = await ed25519.verify(signMessageA, hashMessageB, pubA);
        console.log('\x1b[7m%s\x1b[0m', 'signMessage: ',isSigned);
	console.log('\n');

})();
