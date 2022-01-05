
const merkle = require("merkle")
const {Blocks, getVersion, createHash, getLastBlock,nextBlock,getBlocks} = require('./blockcopy');
// const { nextBlock } = require("./chainedBlock");


//블록구조 유효한지
//blockcopy.js에서 만든 블록체인

//블록의 각각 타입체크 블록구조 유효한지 체크하는 함수
function isValidBlockStructure(block) {
  return typeof (block.header.version) === 'string'
    && typeof (block.header.index) === 'number'
    && typeof (block.header.previousHash) === 'string'
    && typeof (block.header.timestamp) === 'number'
    && typeof (block.header.merkleRoot) === 'string'
    && typeof (block.body) === 'object'
}
//위 함수를 통해 블록구조의 유효성 검사
function isValidNewBlock(newBlock, prevBlock) {
    if (isValidBlockStructure(newBlock)===false){
		console.log('Invalid Block Structure');
		return false;
	} else if (newBlock.header.index !== prevBlock.header.index +1 ){
        console.log('Invalid Index')
        return false;
    } else if (createHash(prevBlock)!==newBlock.header.previousHash) {
        console.log('Invalid previousHash');
        return false;
        //블록길이가 0일경우
    } else if (newBlock.body.length === 0 
        //머클루트는길이가 
        && ('0'.repeat(64) !== newBlock.header.merkleRoot) 
    || newBlock.body.length !== 0 && (merkle("sha256").sync(newBlock.body).root() !==newBlock.header.merkleRoot))
    {
        console.log('Invalid merkleRoot')
        return false
    }
    return true;
}


///0103 미
function isValidChain(newBlocks){
	//제네시스블록부터 확인,0번이 제네시스블록임
	if((JSON.stringify(newBlocks[0])) !== JSON.stringify(Blocks[0])){
		return false;
	}
	var tempBlocks = [newBlocks[0]]
	for(var i = 1; i< newBlocks.length; i++){
		if (isValidNewBlock(newBlock[i],tempBlocks[i-1]))
		{
			tempBlocks.push(newBlocks[i])
		} 
		else {
			return false
		}
	}
	return true
	

}



//검증마친 블록들은 chainedBlock.js의 Blocks배열에 추가한다
function addBlock(newBlock){
    if(isValidNewBlock(newBlock,getLastBlock())){
        Blocks.push(newBlock)
        return true;
    }
    return false;
}

const block = nextBlock(['transaction1'])
addBlock(block)

console.log(block)

// const block = nextBlock(['transaction1'])
// const chain = isValidChain(block)
// console.log(chain)

module.exports = {
    Blocks, getVersion, createHash, getLastBlock,nextBlock, addBlock,getBlocks

}