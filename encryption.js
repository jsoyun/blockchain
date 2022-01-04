const fs = require("fs")
//타원곡선개념을 사용한 디지털 터널알고르짐을 짤거임
//타원 곡선 디지털 서명 알고리즘
const ecdsa = require("elliptic")
const ec = new ecdsa.ec("secp256k1")

const privateKeyLocation = "wallet/"+
(process.env.PRIVATE_KEY || "default");
const privateKeyFile = privateKeyLocation + "/private_key"


function initWallet(){
    if (fs.existsSync(privateKeyFile)){
        console.log("기존 지갑 private key 경로 :" + privateKeyFile)
        return;
    }
    if (!fs.existsSync("wallet/")){
        fs.mkdirSync("wallet/")
    }
    if (!fs.existsSync(privateKeyLocation)){ //wallet/default 파일없다면
        fs.mkdirSync(privateKeyLocation)
        //만들어줘.
       
    }
    if (!fs.existsSync(privateKeyFile)){//프라이빗키없으면
        console.log('주소값 키값을 생성중')
        const newPrivatekey = generatePrivatekey()
        fs.writeFileSync(privateKeyFile, newPrivatekey)
        console.log('개인키 생성이 완료됐습니다')

    }
    const newPrivatekey = generatePrivatekey()
    fs.writeFileSync(privateKeyFile,newPrivatekey)
    console.log("새로운 지갑 생성 private key 경로 :" + privateKeyFile)

}

// initWallet()

//비밀키 생성
function generatePrivatekey(){
    const keyPair = ec.genKeyPair();
    const privateKey = keyPair.getPrivate();
    //16진수로 만들어서 리턴
    return privateKey.toString(16);
}
//비밀키(인증서) 출력하는 함수
function getPrivateKeyFromWallet(){
    //지갑에 만들어놓은 걸 읽을 수 있게 해줌
   const buffer = fs.readFileSync(privateKeyFile,"utf8")
   return buffer.toString();
}
//공개키(지갑주소) 만들기
function getPublicKeyFromWallet(){
    const privateKey = getPrivateKeyFromWallet();
    const key = ec.keyFromPrivate(privateKey, "hex");
    return key.getPublic().encode("hex")
}

module.exports= {getPublicKeyFromWallet,initWallet}