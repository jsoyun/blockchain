const fs = require('fs')
const merkle = require('merkle')
const cryptojs =require('crypto-js')
// const { randomBytes } = require('crypto')
const random = require('random')
const { response } = require('express')
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
	// console.log(JSON.parse(package).version)
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

	// console.log("version : %s, timestamp: %d, body : %s",version,timestamp,body)
	// console.log("previousHash : %d", previousHash);
	// console.log("merkleRoot : %d", merkleRoot);

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
	const {version, difficulty, previousHash, timestamp,merkleRoot,bit,nonce}= data.header
	const blockString = version +difficulty + previousHash + timestamp + merkleRoot + bit + nonce
	const hash = cryptojs.SHA256(blockString).toString()
	return hash
}
const genesisBlock =createGenesisBlock()
//const testHash = createHash(block)
console.log(genesisBlock)


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
    // const nonce = 0
	const difficulty = 0
    // const header = new BlockHeader(version, index, previousHash,timestamp,merkleRoot,bit,nonce)
	const header = findBlock(version, index, 
		previousHash,timestamp,merkleRoot,bit,difficulty)
	return new Block(header,bodyData)


}
// const block1 = nextBlock(["tranjaction1"])
// console.log(block1)


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

//0103
function replaceChain(newBlocks){
	if (isValidChain(newBlocks)){
if 	((newBlocks.length> Blocks.length) ||
(newBlocks.length=== Blocks.length) && random.boolean()){
	Blocks = newBlocks
	broadcast(responseLatestMsg())
	} 
}
	else {
		console.log("받은 원장에 문제가 있음")
	}
}
function hexToBinary(s){
	const lookupTable = {
		'0' : '0000' , '1' : '0001' , '2' : '0010', '3':'0011',
		'4' : '0100' , '5' : '0101' , '6' : '0110', '7':'0111',
		'8' : '1000' , '9' : '1001' , 'A' : '1010', 'B':'1011',
		'C' : '1100' , 'D' : '1101' , 'E' : '1110', 'F':'1111'

	}
	var ret = "";
	for(var i = 0; i<s.length; i++){
		if(lookupTable[s[i]]){
			ret += lookupTable[s[i]];

		}
		else {return null;}
	}
	return ret;
}
function hashMatchesDifficulty(hash, difficulty) {
	const hashBinary = hexToBinary(hash.toUpperCase())
	const requirePrefix = '0'.repeat(difficulty)
	hashBinary.startsWith(requirePrefix)

}

function findBlock(currentVersion, nextIndex, previousHash, nextTimestamp,
	merkleRoot, difficulty) {
		var nonce = 0;
		while (true) {
			var hash = createHash(currentVersion, nextIndex, previousHash, nextTimestamp,
				merkleRoot, difficulty,nonce)
				if (hashMatchesDifficulty(hash,difficulty)){
					return new BlockHeader(currentVersion, nextIndex, previousHash, nextTimestamp,
						merkleRoot, difficulty,nonce)

				}
				nonce++ ;
				
		}
	}
module.exports={
	Blocks,getLastBlock, createHash, nextBlock, addBlock,getVersion,getBlocks
}

