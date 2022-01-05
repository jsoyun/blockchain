const fs = require('fs')
const merkle = require('merkle')
const cryptojs =require('crypto-js') 
// const { randomBytes } = require('crypto')
const random = require('random')
const { get } = require('http')

//예상 채굴 시간과 난이도 조절 단위수를 변수로 설정한다
const BLOCK_GENERATION_INTERVAL = 10  //second
const DIFFICULT_ADJUSTMENT_INTERVAL = 10 //in blocks




//블럭 형태 (헤더, 바디)
class Block{
        constructor(header, body){
		this.header = header
		this.body = body
	}
}

class BlockHeader{
        constructor(version,index, previousHash, 
			timestamp, merkleRoot,difficulty, nonce){
	     this.version = version
	     this.index = index
	     this.previousHash = previousHash
	     this.timestamp = timestamp //블럭만들어진 시간
	     this.merkleRoot = merkleRoot
	    //  this.bit = bit
		this.difficulty = difficulty //채굴난이도. 아직안씀
	     this.nonce = nonce //넌스(문제풀기위해 대입한 횟수) 아직 안씀

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
	const index= 0 //맨처음이라 인덱스0
	const previousHash = '0'.repeat(64) //sha256암호가 64자리니까 0을 64자리로 바꿔줌
	// const timestamp = parseInt(Date.now()/1000)
	//비트코인 날짜로..비트코인최초탄생일 2009/01/03 6:15pm (UTC)
	const timestamp = 1231006505  
	const body = ['제네시스블록 바디임요']
	const tree = merkle('sha256').sync(body) //바디값불러와서 sha256으로 암호화
	const merkleRoot = tree.root() || '0'.repeat(64)
	//루트값없으면 || 뒤에값 출력
	const difficulty = 0 //헤더값에 난이도 아직 0임
	const nonce = 0

	// console.log("version : %s, timestamp: %d, body : %s",version,timestamp,body)
	// console.log("previousHash : %d", previousHash);
	// console.log("merkleRoot : %d", merkleRoot);

	const header = new BlockHeader(version,index, previousHash, timestamp, merkleRoot, difficulty,nonce)
	return new Block(header, body)

}

//const block = createGenesisBlock()
//console.log(block)


//블록저장할수있는애들, 여러개 들어갈 수 있는 배열을 만들어줌
let Blocks = [createGenesisBlock()]


//현재 있는 블록을 다 리턴해주는 함수, 블럭목록 부르는 함수
function getBlocks(){
	return Blocks
}
//제일 마지막에 만든 블록 가져오기
function getLastBlock(){
	//길이 1이니까 1-1 =0 즉 첫번째배열 불러와 
	return Blocks[Blocks.length - 1]

}

//data에는 블록이 들어오는거임, 이블록을 가지고 해시값을 만들어내는 것임
// function createHash(data){
// 	const {version, index,previousHash,timestamp,merkleRoot,difficulty,nonce}= data.header
// 	const blockString = version + index + previousHash + timestamp + merkleRoot + difficulty + nonce
// 	const hash = cryptojs.SHA256(blockString).toString()
// 	return hash
// }
function createHash(data){
	//인자로 받은 것중에 헤더를 뽑아내서
	const {version, index, previousHash, timestamp, merkleRoot, difficulty, nonce} = data.header
	const blockString = version + index + previousHash + timestamp + merkleRoot + difficulty + nonce
	//다 합쳐서 해시로 만들고 리턴
	const hash = cryptojs.SHA256(blockString).toString()
	return hash
}

function calculateHash(version, index, 
		previousHash,timestamp,merkleRoot,difficulty,nonce){
//헤더의 값에 nonce값을 추가해서 모두 더한 string을 가지고 암호화 
//한 결과 hash를 내보낸다
	const blockString = version + index + previousHash + timestamp + merkleRoot + difficulty + nonce
	const hash = cryptojs.SHA256(blockString).toString()
	return hash
}
// const genesisBlock =createGenesisBlock()
//const testHash = createHash(block)
// console.log(genesisBlock)


//다음블록 만들었을 때 기존 블록 정보 가져와
function nextBlock(bodyData){
	//마지막 블럭, 이전블록으로
	const prevBlock = getLastBlock()
	const version = getVersion()
	const index = prevBlock.header.index + 1
	//이전 블록의 해시값
	const previousHash = createHash(prevBlock)
	const timestamp = parseInt(Date.now()/1000)
	const tree = merkle('sha256').sync(bodyData)
	const merkleRoot = tree.root() || '0'.repeat(64)
	//난이도 조절하는 함수 추가 
	const difficulty = getDifficulty(getBlocks())
    // const nonce = 0
    // const header = new BlockHeader(version, index, previousHash,timestamp,merkleRoot,bit,nonce)
	const header = findBlock(version, index, 
		previousHash,timestamp,merkleRoot,difficulty)
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
// function replaceChain(newBlocks){
// 	if (isValidChain(newBlocks)){
// if 	((newBlocks.length> Blocks.length) ||
// (newBlocks.length=== Blocks.length) && random.boolean()){
// 	Blocks = newBlocks
// 	broadcast(responseLatestMsg())
// 	} 
// }
// 	else {
// 		console.log("받은 원장에 문제가 있음")
// 	}
// }
function hexToBinary(s) {
	//헤더부분을 sha256 암호화한 결과
	//16진수 64자리를 2진수로 변환하기
	const lookupTable = {
		'0' : '0000', '1' : '0001', '2': '0010', '3' : '0011',
		'4' : '0100', '5' : '0101', '6': '0110', '7' : '0111',
		'8' : '1000', '9' : '1001', 'A': '1010', 'B' : '1011',
		'C' : '1100', 'D' : '1101', 'E': '1110', 'F' : '1111'
	}

	let ret = "";
	for(let i = 0; i < s.length; i++){
		if (lookupTable[s[i]]) {
			ret += lookupTable[s[i]];
		}
		else { return null; }
	}
	return ret;
}
function hashMatchesDifficulty(hash, difficulty) {
	//difficulty를 이용해 만든 조건을 만족하는지 hash값과 대조해
	//조건에 해당되면 블록 생성
	const hashBinary = hexToBinary(hash.toUpperCase())
	 //difficulty 난이도가 높아짐에 따라 0개수가 늘어남 
	const requirePrefix = '0'.repeat(difficulty)
	//높으면 높을수록 조건을 맞추기가 까다로워짐(nonce값과 time값이 바뀌면서 암호화값이 달라진다.)
	return hashBinary.startsWith(requirePrefix)

}

function findBlock(currentVersion, nextIndex, previousHash, nextTimestamp,
	merkleRoot, difficulty) {
		//calculateHash값이 조건이 맞을때까지 while문으로 반복
		//조건문 반복할때마다 nonce값 증가
		let nonce = 0;
		while (true) {
			var hash = calculateHash(currentVersion, nextIndex, previousHash, nextTimestamp,
				merkleRoot, difficulty,nonce)
				if (hashMatchesDifficulty(hash,difficulty)){
					return new BlockHeader(currentVersion, nextIndex, previousHash, nextTimestamp,
						merkleRoot, difficulty,nonce)

				}
				nonce++ ;
				
		}
	}

	function getDifficulty(blocks){
		const lastBlock = blocks[blocks.length -1]
		if (lastBlock.header.index !==0 && lastBlock.header.index
			% DIFFICULT_ADJUSTMENT_INTERVAL === 0){
				//마지막 블럭헤더인덱스가 0이 아니고
				//난이도 조절수만큼 나누고 나머지가 0이면

				//난이도 조정함수 실행
				return getAdjustDifficulty(lastBlock,blocks)
			}
			//난이도 리턴
			return lastBlock.header.difficulty
	}

	function getAdjustDifficulty(lastBlock, blocks){
     // 지금 블록에서 난이도 조절 단위 수만큼의 전 블록과의 time 
	 //즉, 생성시간을 비교해서 자신의 예상 시간보다 느리거나 빠르면 난이도를 조절한다.
    //적당하면 난이도가 유지되고 블럭의 생성시간이 느리면 난이도를 낮추고, 빠르면 난이도를 높인다.
		const preAdjustmentBlock = blocks[blocks.length - DIFFICULT_ADJUSTMENT_INTERVAL];
		//시간
		const elapsedTime = lastBlock.header.timestamp - preAdjustmentBlock.header.timestamp
		const expectedTime = BLOCK_GENERATION_INTERVAL * DIFFICULT_ADJUSTMENT_INTERVAL;

		if (elapsedTime/2 > expectedTime) {
			return preAdjustmentBlock.header.difficulty +1;
		}
		else if (elapsedTime * 2 < expectedTime){
			return preAdjustmentBlock.header.difficulty -1 
		}
		else {
			return preAdjustmentBlock.header.difficulty
		}
	}

	function getCurrentTimestamp(){
		//Math.round 반올림함수
		return Math.round(new Date().getTime()/ 1000);
	}

	function isValidTimestamp(newBlock, prevBlock){
		console.log("뺀거:", newBlock.header.timestamp - prevBlock.header.timestamp)
		console.log(getCurrentTimestamp())
		//5이내에 또 만드는 걸 안되게 방지!
		if (newBlock.header.timestamp - prevBlock.header.timestamp < 5){
			return false
		}
		//검증자의 시간과 새로운 블록의 시간과 비교! 검증자가 검증하는데
		//검증하는 시간이랑 만들어진 블록의 시간이 너무 차이가 나면 버림
		if (getCurrentTimestamp()- newBlock.header.timestamp > 60 )
		{
			return false
		}
		 
		return true
		

	}




module.exports = { hashMatchesDifficulty, isValidTimestamp, getBlocks, createHash,
	 Blocks, getLastBlock, nextBlock, addBlock, getVersion, 
	 createGenesisBlock };    //내보내주는거
