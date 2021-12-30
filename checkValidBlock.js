//블록구조 유효ㅛ한지
//이 조건 다 맞으면 올바른 구조체이다
const {Blocks,getLastBlock,createHash,nextBlock}= require("./chinedBlock.js")
const merkle = require("merkle")

function isValidBlockStructure(block){
        return typeof(block.header.version) === 'string'
        && typeof(block.header.index) === 'number'
	&& typeof(block.header.previousHash) === 'string'
       	&& typeof(block.header.timestamp) === 'number'
	&& typeof(block.header.merkleRoot) === 'string'
	&& typeof(block.body) === 'object'

}

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
	}return false;
}
//블럭만들기 
const block = nextBlock(['new Transaction'])
addBlock(block)


