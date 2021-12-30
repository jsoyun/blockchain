//포트설정
const p2p_port = process.env.P2P_PORT || 6001
const { response } = require("express")
const WebSocket = require("ws")
const { getLastBlock } = require("./chinedBlock")



//p2p서버 초기화한는 하뭇
function initP2PServer(){
	const server = new WebSocket.Server({port:p2p_port})
	server.on("connection",(ws)=>{initConnection(ws);})
	console.log("Listening webSocket port : " + p2p_port)
}

let sockets = []
function initConnection(ws){
	sockets.push(ws)
}
function getSockets() {
	return sockets;
  }
  console.log("sockets 확인: ", sockets);
  
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
		ws.on("open", () => { initConnection(ws) })
		ws.on("error", () => { console.log("connection Failed!"); })
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
  function handleBlockChainResponse() {
	 
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

  
  module.exports = { connectToPeers }