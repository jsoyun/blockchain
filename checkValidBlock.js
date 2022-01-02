//블록구조 유효한지
//현재 블록의 인덱스가 이전 블록의 인덱스보다 1만큼 큰지
//이전블록의 해시값과 현재 블록의 이전해시가 같은지
//데이터 필드로부터 계산한 머클루트와 블록헤더의 머클루트가 동일한지
//이 조건 다 맞으면 올바른 구조체이다
const {Blocks,getLastBlock,createHash,nextBlock}= require("./chainedBlock.js")
const merkle = require("merkle")

function isValidBlockStructure(block){
return typeof(block.header.version) === 'string'
 && typeof(block.header.index) === 'number'
	&& typeof(block.header.previousHash) === 'string'
       	&& typeof(block.header.timestamp) === 'number'
	&& typeof(block.header.merkleRoot) === 'string'
	&& typeof(block.body) === 'object'

}

///dfdfdfdfdfdfdfdfddf
//dfdfdfdfdff

function isValidNewBlock(newBlock,previousBlock){
	if (isValidBlockStructure(newBlock)===false){
		console.log('Invalid Block Structure')
		return false;
	}
	//현재 블록 이전블록 비교 
	else if (newBlock.header.index !== previousBlock.header.index+1){
		console.log('Invalid Index')
		return false;
	}
	//이전블록의 해시값과 현재 블록의 해시
	else if (createHash(previousBlock) !== newBlock.header.previousHash){
		console.log('Invalid previousHash')
		return false
	}
	else if ((newBlock.body.length === 0 && ('0', repeat(64) !==newBlock.header.merkleRoot)||
		newBlock.body.length !==0 && (merkle('sha256').sync(newBlock.body).root() !== newBlock.header.merkleRoot))){

			console.log('Invalid merkleRoot')
			return false;
		}
                return true;
}

function addBlock(newBlock){

	if(isValidNewBlock(newBlock,getLastBlock())){

		Blocks.push(newBlock)
		return true;
	} return false;
}
// //블럭만들기 
// const block = nextBlock(['new Transaction'])
// addBlock(block)


module.exports = {
	addBlock
}


