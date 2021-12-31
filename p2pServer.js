//포트설정
const p2p_port = process.env.P2P_PORT || 6001
// const { response } = require("express")
const WebSocket = require("ws");
const { createHash, addBlock } = require("./chainedBlock");
// const { getLastBlock } = require("./chainedBlock")



//p2p서버 초기화한는 하뭇
function initP2PServer(test_port){
	const server = new WebSocket.Server({port:test_port})
	server.on("connection",(ws)=>{initConnection(ws);})
	console.log("Listening webSocket port : " + test_port)
}

initP2PServer(6001)
initP2PServer(6002)
initP2PServer(6003)

let sockets = []

function initConnection(ws){
	sockets.push(ws)
	initMessageHandler(ws)
	initErrorHandler(ws)
}
function getSockets() {
	return sockets;
  }

  
  //메세지를 제이슨 형태로 전달 : 내가 가지고 있는 블록체인이 올바르지 않다, 너꺼 줘봐 해서 비교하고 내꺼가 틀리면 교체 등.
  function write(ws, message) {
	ws.send(JSON.stringify(message))
  }
  
  // for (let i = 0; i < 10.; i++) {
  //   arr[i] = i + 1;
  // }
  
  function broadcast(message) {
	// function (socket) {
	//   write(socket,message)
	// }
	///////////////////////
	//위의 소켓함수와 같은 말
	sockets.forEach(
	  (socket) => {
		write(socket, message);
	  }
	)
  }
  
  function connectToPeers(newPeers) {
	newPeers.forEach(
	  (peer) => {
		const ws = new WebSocket(peer)
		ws.on("open", () => { console.log("open"); initConnection(ws); })
		ws.on("error", (errorType) => { console.log("connection Failed!" ) + errorType })
	  }
	)
  }
  
  //message handler
  const MessageType ={
	  //내가 가지고 있는데 가장 최신블록을 담아서 보내줌
	  QUERY_LATEST:0, 
	 //내가 가지고 있는데이터필드 전체에 블록을 담아서 보낼때 
	  QUERY_ALL:1,
	  //데이터필드에 하나 이상의 블록이 있을 때 회신할때는 이타입으로
	  RESPONSE_BLOCKCHAIN:2
  }

  function initMessageHandler(ws){
	  ws.on("message",(data)=>{
		  const message = JSON.parse(data)
		  switch(message.type){
			  case MessageType.QUERY_LATEST:
				  write(ws,responseLastestMsg());
				  break;
			  case MessageType.QUERY_ALL:
				write(ws,responseAllChainMsg());
				  break;
			  case MessageType.RESPONSE_BLOCKCHAIN:
				  handleBlockChainResponse(message);
				  break;
		  }
	  })
  }

  function responseLastestMsg() {
	  return ({
		  "type": RESPONSE_BLOCKCHAIN,
		  "data":JSON.stringify([getLastBlock()])
	  })
  }
  function responseAllChainMsg() {
	  return ({
		  "type": RESPONSE_BLOCKCHAIN,
		  "data":JSON.stringify(getBlocks())
	  })
  }
  function handleBlockChainResponse(message) {
	  const receiveBlocks = JSON.parse(message.data)
	  //받은것중에 마지막꺼
	  const latestReceiveBlock = receiveBlocks[receiveBlocks.length-1]
	  const latesMyBlock = getLastBlock()
	  //데이터로 받은 블럭 중에 마지막 블럭의 인덱스가
	  //내가 보유중인 마지막 블럭의 인덱스보다 클때 / 작을 때 (작은건 사실상 필요없지)
      if (latestReceiveBlock.header.index > latesMyBlock.header.index){
         //받은 마지막 블록의 이전해시값이 내 마지막 블럭일 때
		 //이런경우에는 내꺼에다가 마지막 블록을 추가해주면 됨
		 if (createHash(latesMyBlock)=== latestReceiveBlock.header.previousHash){
			
			if (addBlock(latestReceiveBlock)){
				broadcast(responseLastestMsg())
			} else {
				console.log("Invalid Block")
			}
			
		 }
		 //받은 블럭의 전체 크기가 1일때, 블록 전체 다시 달라고요청
		 else if (receiveBlocks.length ===1 ){
			 broadcast(queryAllMsg())
		 }
		 //아닐때는 내 전체 블록이 다른블록보다 동기화가 안된 상황
		 //지금 받은 걸로 통채를 갈아끼워야함.
		 else {
			 replaceChain(receiveBlocks)

		 }
	  }
	  else {
		  console.log("Do nothing.")
	  }


	 
  }

function queryAllMsg(){
	return ({
		"type": QUERY_ALL,
		"data":null
	})
	
}
function queryLatestMsg(){
	return ({
		"type": QUERY_LATEST,
		"data":null
	})

}

//테스트하려면 서버 2개 열어서 요청하고 받은걸 타입들이 오는지 확인..

function initErrorHandler(ws){
	ws.on("close",()=> {closeConnection(ws);})
	ws.on("error",()=> {closeConnection(ws);})
}

function closeConnection(ws){
	console.log(`Connection close ${ws.url}`)
	//splice는 소켓을 복사해서 뒤에 넣음 초기화한다고 생각
	sockets.splice(sockets.indexOf(ws),1)
}
  
  module.exports = { connectToPeers, getSockets }