const cryptojs = require('crypto-js')
const fs = require('fs')
const merkle = require('merkle')


class Block{
        constructor(header, body){
		this.header = header
		this.body = body
	}
}

//블록헤더 구조체 선언 : 헤더 구성 요소 나열
class BlockHeader {
	constructor(index, version, previousHash, timestamp, merkleRoot, bit, nonce) {
	  this.index = index
	  this.version = version
	  this.previousHash = previousHash
	  this.timestamp = timestamp
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

function createGenesisBlock() {
  const index = 0
  const version = getVersion()
  const previousHash = '0'.repeat(64) // 0을 64번 반복
  const timestamp = parseInt(Date.now() / 1000) // 1000 나눈 이유 : 초 단위로 환산하기 위해
  const body = ['Hello block!']
  const tree = merkle('sha256').sync(body)
  const merkleRoot = tree.root() || '0'.repeat(64)
  const bit = 0
  const nonce = 0

  // console.log("version : %s, timestamp : %d, body: %s", version, timestamp, body);
  // console.log("previousHash : %d", previousHash);
  // console.log(tree);
  // console.log("merkleRoot: %s", merkleRoot);

  const header = new BlockHeader(index, version, previousHash, timestamp, merkleRoot, bit, nonce)
  return new Block(header, body)
}

//값넣어서 블록생성

let Blocks = [createGenesisBlock()]

function getBlocks() {
  return Blocks
}
function getLastBlock() {
  return Blocks[Blocks.length - 1]
}



//블록해시 값 구하기
function createHash (data){
	const {version,previousHash,timestamp, merkleRoot, bit, nonce}= data.header
	const blockString = version +previousHash +timestamp+ merkleRoot+ bit+ nonce
	const hash = cryptojs.SHA256(blockString).toString()
	return hash
}



// const block = createGenesisBlock()
// const testHash = createHash(block)
// console.log(testHash)

//다음블록 생성하기 
function nextBlock(bodyData) {
	const prevBlock = getLastBlock()
	const version = getVersion()
	//다음순서니까 하나 추가됨
	const index = prevBlock.header.index + 1
	//createHash함수에 이전블록 정보를 넣어 블록해시값을 구해넣는다.
	const previousHash = createHash(prevBlock)
	const timestamp = parseInt(Date.now() / 1000)
	//블록body부분에 저장될 트랜잭션(거래정보)인 bodyData를
	//merkle몯ㄹ을 사용하여 트랜잭션들의 해시트리를 만들어 tree에 넣어
	const tree = merkle('sha256').sync(bodyData)
	//여기서 최종적으로 구해진 해시값인 머클루트 해시값을 merkleRoot변수에 넣어
	const merkleRoot = tree.root() || '0'.repeat(64)
	const bit = 0
	const nonce = 0

	const header = new BlockHeader
	(index,version,previousHash,timestamp, 
		merkleRoot, bit, nonce)
    return new Block(header,bodyData)

}
//다음블록생성 출력하기
// const block1 = nextBlock(["tranjaction1"])
// console.log(block1)

//addblock함수를 통해 순차적으로 트랜잭션값 전달해 블록생성하고
function addBlock(bodyData) {
	const newBlock = nextBlock([bodyData])
	Blocks.push(newBlock)
  
  }

// addBlock(['transaction1'])
// addBlock(['transaction2'])
// addBlock(['transaction3'])
// addBlock(['transaction4'])
// addBlock(['transaction5'])

// console.log(Blocks);

//이전블록 해시값과 현재 블록해시값의 이전해시가 같은지
//보려고 내보내줘야함 
module.exports = { nextBlock, getLastBlock, createHash, Blocks, getVersion, getBlocks }


// function addBlock(newBlock){

// 	if(isValidNewBlock(newBlock,getLastBlock())){

// 		Blocks.push(newBlock)
// 		return true;
// 	} return false;
// }