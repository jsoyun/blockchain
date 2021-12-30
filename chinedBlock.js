const fs = require('fs')
const merkle = require('merkle')
const cryptojs =require('crypto-js')
class Block{
        constructor(header, body){
		this.header = header
		this.body = body
	}
}

class BlockHeader{
        constructor(version,index, previousHash, timestamp, merkleRoot, bit, nonce){
	     this.version = version
	     this.index = index
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
	const index= 0
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

	const header = new BlockHeader(version,index, previousHash, timestamp, merkleRoot, bit,nonce)
	return new Block(header, body)

}

//const block = createGenesisBlock()
//console.log(block)


//블록저장할수있는애들, 여러개 들어갈 수 있는 배열임 
let Blocks = [createGenesisBlock()]


//현재 있는 블록을 다 리턴해주는 함수
function getBlocks(){
	return Blocks
}

function getLastBlock(){
	//길이 1이니까 1-1 =0 즉 첫번째배열 불러와 
	return Blocks[Blocks.length - 1]

}

//data에는 블록이 들어오는거임, 이블록을 가지고 해시값을 만들어내는 것임
function createHash(data){
	const {version,index, previousHash, timestamp,merkleRoot,bit,nonce}= data.header
	const blockString = version + previousHash + timestamp + merkleRoot + bit + nonce
	const hash = cryptojs.SHA256(blockString).toString()
	return hash
}
const genesisblock =createGenesisBlock()
//const testHash = createHash(block)
console.log(genesisblock)


//다음블록 만들었을 때 기존 블록 정보 가져와
function nextBlock(bodyData){
	const prevBlock = getLastBlock()
	const version = getVersion()
	const index = prevBlock.header.index + 1
	const previousHash = createHash(prevBlock)
	const timestamp = parseInt(Date.now()/1000)
	const tree = merkle('sha256').sync(bodyData)
	const merkleRoot = tree.root() || '0'.repeat(64)
	const bit = 0
	const nonce = 0
        const header = new BlockHeader(version, index, previousHash,timestamp,merkleRoot,bit,nonce)
	
	console.log(tree)
	return new Block(header,bodyData)


}
const block1 = nextBlock(["tranjaction1"])
console.log(block1)


function addBlock(bodyData){
	const newBlock = nextBlock(bodyData)
	Blocks.push(newBlock)
}
// addBlock(['transaction1'])
// addBlock(['transaction2'])
// addBlock(['transaction3'])
// addBlock(['transaction4'])
// addBlock(['transaction5'])
// console.log(Blocks)

module.exports={
	Blocks,getLastBlock, createHash, Blocks, nextBlock, addBlock,getVersion,getBlocks
}

