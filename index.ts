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
  public nonce = Math.round(Math.random() * 999999999);

  constructor(
    public prevHash: string,
    public transcations: Transcation,
    public timestamp = Date.now()
    ) {}

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

    constructor(){
        this.chain = [new Block('', new Transcation(100, 'genesis', 'satoshi'))];
    }   

    get lastBlock() {
        return this.chain[this.chain.length - 1];
    }

    addBlock(transcations: Transcation, senderPublicKey: string, signature: Buffer) {
        const newBlock = new Block(this.lastBlock.hash, transcations);
        this.chain.push(newBlock);
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
    }
}