const fs = require('fs')
const merkle = require('merkle')

class Block{
        constructor(header, body){
		this.header = header
		this.body = body
	}
}

class BlockHeader{
        constructor(version, previousHash, timestamp, merkleRoot, bit, nonce){
	     this.version = version
	     this.previousHash = previousHash
	     this.timetamp = timestamp
	     this.merkleRoot = merkleRoot
	     this.bit = bit
	     this.nonce = nonce

	}
}

//버전계산하는 함수 
function getVersion(){
	const package = fs.readFileSync("package.json")
	console.log(JSON.parse(package).version)
	return JSON.parse(package).version

}


//getVersion()

function createGenesisBlock(){
	const version = getVersion()
	const previousHash = '0'.repeat(64)
	const timestamp = parseInt(Date.now()/1000)
	const body = ['hello block']
	const tree = merkle('sha256').sync(body)
	const merkleRoot = tree.root() || '0'.repeat(64)
	const bit = 0
	const nonce = 0

	console.log("version : %s, timestamp: %d, body : %s",version,timestamp,body)
	console.log("previousHash : %d", previousHash);
	console.log("merkleRoot : %d", merkleRoot);

	const header = new BlockHeader(version, previousHash, timestamp, merkleRoot, bit,nonce)
	return new Block(header, body)

}

const block = createGenesisBlock()
console.log(block)



