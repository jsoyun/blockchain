const merkle = require("merkle")
const {createHash} = require('./blockcopy');

//블록구조 유효한지
//blockcopy.js에서 만든 블록체인

//블록의 각각 타입체크 블록구조 유효한지 체크하는 함수
function isValidBlockStructure(block) {
    return typeof(block.blockheader.version) === 'string'
    && typeof(block.header.index) === 'number'
    && typeof(block.header.previousHash) === 'string'
    && typeof(block.header.timestamp) === 'number'
    && typeof(block.header.merkleRoot) === 'string'
    && typeof(block.body) === 'object'
}
//위 함수를 통해 블록구조의 유효성 검사
function isValidNewBlock(newBlock, previousBlock) {
    if (isValidBlockStructure(newBlock) === false) {
        console.log('Invalid Block Structure')
        return false;
    } else if (newBlock.header.index !== previousBlock.header.index +1 ){
        console.log('Invalid Index')
        return false;
    } else if (createHash(previousBlock)!==newBlock.header.previousHash) {
        console.log('Invalid previousHash');
        return false;
    } else if (newBlock.body.length === 0 && ('0'.repeat(64) !== newBlock.header.merkleRoot) 
    || newBlock.body.length !== 0 && (merkle("sha256").sync(newBlock.body).root() !==newBlock.header.merkleRoot))
    {
        console.log('Invalid merkleRoot')
        return false
    }
    return true;
}
