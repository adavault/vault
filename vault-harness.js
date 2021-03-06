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
	//var privA = "5820e9c6958a5bad511750d29912a3729858620d44d5312d199ae76004dd68b44779";
	console.log('\x1b[30m\x1b[43m%s\x1b[0m', 'privA: ', hex(privA));
	const pubA = await ed25519.getPublicKey(privA);
	//const pubA = encoder.encode('582038abfa38df63de892b56756c6a1153242351fae20f0efa6450e72e9f9eb6e136');
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
	console.log('\x1b[41m%s\x1b[0m', '=>Alice stores the encrypted message @URL');
	//create shared secret between Alice/Bob and wrap symmetric key, signature, URL)
	const sharedKeyAB = await ed25519.getSharedSecret(privA, pubB);
	console.log('\x1b[7m%s\x1b[0m', 'sharedKeyAB: ',hex(sharedKeyAB));
	const DataB = hex(symKeyA)+ "," + hex(signMessageA) + "," + "@URL"
	const ciphertextDataB = cryptoJS.AES.encrypt(DataB,hex(sharedKeyAB)).toString();
	console.log('\x1b[7m%s\x1b[0m', 'ciphertextSymKeyA: ',ciphertextDataB);
	//create data structure to pass to the oracle
        const sharedKeyAO = await ed25519.getSharedSecret(privA, pubO);
	console.log('\x1b[7m%s\x1b[0m', 'sharedKeyAO: ',hex(sharedKeyAO));
	const dataO = hex(hashMessageA) + "," + "@walletB" + "," + "@SCaddr" + "," + ciphertextDataB
	console.log('\x1b[7m%s\x1b[0m', 'dataO: ',dataO);
	const ciphertextDataO = cryptoJS.AES.encrypt(dataO,hex(sharedKeyAO)).toString();
	console.log('\x1b[7m%s\x1b[0m', 'ciphertextDataO: ',ciphertextDataO);
	//create data structure for the smart contract (pass wallet addresses so payments can be transferred)
	const ciphertextDataSC = cryptoJS.AES.encrypt(hex(hashMessageA),hex(sharedKeyAO)).toString();
	const dataSC = ciphertextDataSC + "," + "@walletA" + "," + "@walletB" + "," + "valEscrow";
	console.log('\x1b[7m%s\x1b[0m', 'dataSC: ',dataSC);
	console.log('\x1b[41m%s\x1b[0m', '=>Alice submits txn to oracle and smartcontract address');
	console.log('\n');

//Smart Contract Stub
        console.log('\x1b[37m\x1b[44m%s\x1b[0m', 'Smart Contract Stub');
	console.log('\x1b[41m%s\x1b[0m', '=>Bob submits txn to recover key (via the UI)');
	console.log('The smart contract cannot decrypt transaction metadata and must rely on the Oracle');
	console.log('\x1b[7m%s\x1b[0m', 'dataSC: ',dataSC);
        var arrayDataSC = dataSC.split(",");
	const ciphertextHashSC = arrayDataSC[0]
        console.log('\x1b[7m%s\x1b[0m', 'ciphertextHashSC: ',ciphertextHashSC);
	console.log('The smart contract to release the key is executed when Bob submits txn (including any payment) and success is based on time or relevant Oracle input.');
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
	console.log('Oracle checks the decrypted ciphertextHashSC == hashMessageA AND @SCaddr == txn addr');
	var plaintextDataSC = cryptoJS.AES.decrypt(ciphertextHashSC,hex(sharedKeyOA));
        plaintextDataSC = plaintextDataSC.toString(cryptoJS.enc.Utf8);
        console.log('\x1b[7m%s\x1b[0m', 'plaintextDataSC: ',plaintextDataSC);
	var SCvalid = false;
	if (arrayDataO[0] = plaintextDataSC) {
		SCvalid = true;
		console.log('\x1b[42m%s\x1b[0m', 'SCvalid: ',SCvalid);
	} else {
		console.log('\x1b[7m%s\x1b[0m', 'SCvalid: ',SCvalid); 
	}
	console.log('The Oracle returns data by submitting a txn to return wrapped key, message signature and URL to Bob ...');
	console.log('\x1b[7m%s\x1b[0m', 'destination wallet: ',arrayDataO[1]);
	console.log('\x1b[7m%s\x1b[0m', 'smart contract address: ',arrayDataO[2]);
	console.log('\x1b[7m%s\x1b[0m', 'wrapped data for Bob: ',arrayDataO[3]);
	console.log('\x1b[41m%s\x1b[0m', '=>Oracle submits txn to provide key to Bob and can also return payment to Alice');
	console.log('\n');

//User Interface message recovery
        console.log('\x1b[37m\x1b[44m%s\x1b[0m', 'User Interface message recovery');
        console.log('\x1b[7m%s\x1b[0m', 'ciphertextDataB: ',ciphertextDataB);
        //create shared secret betwen Bob/Alice and decrypt symKeyA
        const sharedKeyBA = await ed25519.getSharedSecret(privB, pubA);
        console.log('\x1b[7m%s\x1b[0m', 'sharedKeyBA: ',hex(sharedKeyBA));
	//decrypt data structure and process
        var plaintextDataB = cryptoJS.AES.decrypt(ciphertextDataB,hex(sharedKeyBA));
        plaintextDataB = plaintextDataB.toString(cryptoJS.enc.Utf8);
        console.log('\x1b[7m%s\x1b[0m', 'plaintextDataB: ',plaintextDataB);
	//split out key, signature, URL
        var arrayDataB = plaintextDataB.split(",");
	console.log('\x1b[7m%s\x1b[0m', 'symKeyA: ',arrayDataB[0]);
	console.log('\x1b[7m%s\x1b[0m', 'signMessageA: ',arrayDataB[1]);
	console.log('\x1b[7m%s\x1b[0m', 'URL: ',arrayDataB[2]);
	console.log('\x1b[41m%s\x1b[0m', '=>Bob recovers asset and decrypts');
	//decrypt ciphertext message using symKey
        var plaintextMessageB = cryptoJS.AES.decrypt(ciphertextMessageA,arrayDataB[0]);
        plaintextMessageB = plaintextMessageB.toString(cryptoJS.enc.Utf8);
        console.log('\x1b[7m%s\x1b[0m', 'plaintextMessageB: ',plaintextMessageB);
	//calculate hash and verify against signMessageA
        const hashMessageB = await secp.utils.sha256(plaintextMessageB);
        console.log('\x1b[7m%s\x1b[0m', 'hashMassageB: ',hex(hashMessageB));
	const isSigned = await ed25519.verify(arrayDataB[1], hashMessageB, pubA);
        if (isSigned == true) {
		console.log('\x1b[42m%s\x1b[0m', 'signedMessage: ', isSigned);
	} else {
        	console.log('\x1b[41m%s\x1b[0m', 'signedMessage: ', isSigned);
	}
	console.log('\n');

})();
