import * as crypto from 'crypto';

class Transcation {
  constructor(
    public amount: number,
    public payer: string,
    public payee: string
  ) {}

  toString() {
    return JSON.stringify(this);
  }
}

class Block {
    //nonce for mining
    public nonce = Math.round(Math.random() * 999999999);

  constructor(
    public prevHash: string,
    public transcations: Transcation,
    public timestamp = Date.now()
    ) {}
    //generates hash of the block
    get hash() {
        const str = JSON.stringify(this);
        const hash = crypto.createHash('SHA256');
        hash.update(str).end();
        return hash.digest('hex');
        }
}

class Chain {
    
    public static instance = new Chain();

    chain: Block[];
    //instantiate first block of the chain
    constructor(){
        this.chain = [new Block('', new Transcation(100, 'genesis', 'x'))];
    }   

    get lastBlock() {
        return this.chain[this.chain.length - 1];
    }
    
    mine(nonce: number) {
        let solution = 1;
        console.log('mining...');
        
        while(true){
            const hash = crypto.createHash('MD5');
            hash.update((nonce + solution).toString()).end();

            const attempt = hash.digest('hex');

            if(attempt.substring(0,4) === '0000'){
                console.log('Solved: ' + solution);
                return solution;
            }

            solution += 1;
        }

    }

    addBlock(transcations: Transcation, senderPublicKey: string, signature: Buffer) {
        const verifier = crypto.createVerify('SHA256');
        verifier.update(transcations.toString());
        const isValid = verifier.verify(senderPublicKey, signature);

        //adds new block to the chain if the transcation is valid
        if(isValid){
            const newBlock = new Block(this.lastBlock.hash, transcations);
            this.mine(newBlock.nonce);
            this.chain.push(newBlock);
        }
    }
}



class Wallet{
    public publicKey: string;
    public privateKey: string;

    constructor(){
        const keypair = crypto.generateKeyPairSync('rsa', {
            modulusLength: 2048,
            publicKeyEncoding: { type: 'spki', format: 'pem'},
            privateKeyEncoding: { type: 'pkcs8', format: 'pem'}
        });

        this.publicKey = keypair.publicKey;
        this.privateKey = keypair.privateKey;
    }

    sendMoney(amount: number, payeePublicKey: string){
        const transcation = new Transcation(amount, this.publicKey, payeePublicKey);

        //creating signature
        const sign = crypto.createSign('SHA256');
        sign.update(transcation.toString()).end();

        //signing the transcation
        const signature = sign.sign(this.privateKey);
        Chain.instance.addBlock(transcation, this.publicKey, signature);

    }
}

