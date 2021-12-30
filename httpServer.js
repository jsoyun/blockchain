const express = require("express")
const bodyParser = require("body-parser")
const {getBlocks, nextBlock,getVersion} = require('./chainedBlock.js')
const {addBlock}= require('./checkValidBlock')
const { connectToPeers, getSockets } = require("./p2pServer.js")
const http_port = process.env.HTTP_PORT || 3001

function initHttpServer(){
	const app = express()
	app.use(bodyParser.json())
	//추가
	app.post("/addPeers", (req,res)=>{
		const data = req.body.data || []
		console.log(data);
		connectToPeers(data);
		res.send(data);

	})
	app.get("/peers", (req, res)=> {
		let sockInfo = []

		getSockets().forEach(
			(s)=>{
				sockInfo.push(s._socket.remoteAddress+":"+s._socket.remotePort)
			}
		)
		res.send(sockInfo)
	})

	app.get("/blocks",(req,res)=>{
 
		res.send(getBlock())

	})
	app.post("/mineBlock",(req,res)=>{
		const data = req.body.data || []
		console.log(data)
		const block = nextBlock(data)
		addBlock(block)
		res.send(block)
	})
	app.get("/version",(req, res)=>{
		res.send(getVersion())
	})
	app.post("/stop", (req,res)=>{
		res.send({"msg":"Stop Server!"})
		process.exit()
	})
	app.listen(http_port,()=>{
		console.log("Listening Http Port : "+ http_port)
	})


}

initHttpServer()
