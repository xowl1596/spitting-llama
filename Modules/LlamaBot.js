const { Client, Intents, CommandInteractionOptionResolver } = require('discord.js');
const DbManager = require('./DbManager.js');
const client = new Client({ intents: [
  Intents.FLAGS.GUILDS, 
  Intents.FLAGS.GUILD_MESSAGES,
] });

module.exports = class LlamaBot{
    constructor() {
        this.dbManager = new DbManager();
        
        this.cmds = ['캬악', '칵', '카악', '캭'];
        this.imgCmds = ['캬악!', '칵!', '카악!','캭!'];
        this.img2Cmds = ['낼름', '냘름', '핥', '핥짝', '핥쨕'];
        
        this.magicGodong = [
            '언젠가는','다시 한번 물어봐','그럼!','그래', '당연하지', '물론', '...푸흡!!',
            '아니','안돼','가만히 있어','그것도 안돼','No','Yes','뭐라고?', '퉤엣'
        ];
        
        this.helpMsg = 
            '침뱉기 : 캬악 칵 카악 캭 (!붙이면 이미지가 나옵니다.)\n'+
            '핥기 : 낼름 냘름 핥 핥짝 핥쨕\n'+
            '경고 : 건들지마!\n'+
            '고백으로 혼내주기 : 난멋져 난예뻐\n'+
            '질문 : 마법의 라마고동님 (질문)\n'+
            '라마코인 도움말 : 라마코인 도움말'+
            '소스코드 : https://github.com/xowl1596/spitting-llama';  
        
        this.llamacoinHelpMsg = 
            '라마코인 등록 : 라마코인 시스템에 서버를 등록시키고 활성화 합니다.\n'+
            '라마코인 활성화 / 비활성화 : 라마코인 시스템을 활성화/비활성화 합니다.\n'+
            '라마코인 지갑생성 : 해당서버에 자신의 지갑을 생성합니다. 지갑을 생성해야 라마코인 시스템이 사용 가능합니다.\n'+
            '라마코인 잔액확인 : 자신이 얼마나 코인을 가지고 있는지 확인합니다.\n'+
            '라마코인 랭크 : 우리 서버 빌게이츠는 누구?\n'+
            '라마코인 룰렛 : 200포인트로 도박을 합니다. 잭팟은 12000코인, 당첨되면 600코인입니다. 가즈아~~!\n\n'+
            '라마코인 주식 목록 : 이 서버에 있는 주식을 보여줍니다.\n'+
            '라마코인 주식 구매/판매 <주식이름> <개수> : 주식을 구매/판매합니다.\n'+
            '라마코인 주식 확인 : 구매한 주식들을 볼 수 있습니다.'

        this.startBot();
    }
    
    startBot(){
        client.on('ready', () => {
            console.log('[llama Bot] : bot is start now!!!');
        });
          
        client.on('messageCreate', message => {
            this.mining(message);
            this.processingCommands(message);
            this.processingLlamacoinCommands(message);
        });
          
        client.login(process.env.TOKEN);
    }

    processingCommands(message){
        switch (message.content){
            case '라마도움말' :
                message.channel.send(this.helpMsg);
                break;
            case '건들지마!' :
                message.channel.send('건들면 침뱉을거야!');
                break;
            case '난멋져' :
                message.channel.send("그대의 눈동자에 치얼쓰");
                message.channel.send({ files: [{ attachment: './llama3.jpg' }] });
                break;
            case '난예뻐' :
                message.channel.send("그대의 눈동자에 치얼쓰");
                message.channel.send({ files: [{ attachment: './llama4.jpg' }] });
                break;
        }
    
        if (message.content.startsWith('마법의 라마고동님')) {
            message.channel.send(this.magicGodong[Math.floor(Math.random() * this.magicGodong.length)]);
        }
    
        if (this.cmds.includes(message.content)){
            message.channel.send('퉤엣!');
        }
    
        if (this.imgCmds.includes(message.content)){
            message.channel.send({ files: [{ attachment: './llama.png' }] });
        }
    
        if (this.img2Cmds.includes(message.content)){
            message.channel.send({ files: [{ attachment: './llama2.png' }] });
        }
    }
    
    async processingLlamacoinCommands(message){
        switch(message.content) {
            case '라마코인 도움말' :
                message.channel.send(this.llamacoinHelpMsg);
                break;
            case '라마코인 등록':
                let registerResult = await this.dbManager.register(message.guild.id, message.guild.name);
                let registerMassage = this.getLlamacoinRegisterMessage(registerResult);
                message.channel.send(registerMassage);
                break;
            case '라마코인 활성화' :
                let activateResult = await this.dbManager.activeGuild(message.guild.id);
                let activateMessage = this.getLlamacoinActivateMessage(activateResult);
                message.channel.send(activateMessage);
                break;
            case '라마코인 비활성화' :
                let inactivateResult = await this.dbManager.inactiveGuild(message.guild.id);
                let inactivateMessage = this.getLlamacoinInactivateMessage(inactivateResult);
                message.channel.send(inactivateMessage);
                break;
            case '라마코인 지갑생성' :
                let createWalletResult = await this.dbManager.createWallet(message.guild.id, message.member.user.id, message.member.user.username)
                let createWalletMessage = this.getLlamacoinCreateWalletMessage(createWalletResult);
                message.channel.send(createWalletMessage);
                break;
            case '라마코인 잔액확인' :
                let getWalletResult = await this.dbManager.getWallet(message.guild.id, message.member.user.id);
                let getWalletMessage = this.getLlamacoinGetWalletMessage(getWalletResult);
                message.channel.send(message.member.user.username + getWalletMessage);
                break;
            case '라마코인 랭크' : 
                let rankData = await this.dbManager.getCoinRank(message.guild.id);
                let msg = message.guild.name + ' 서버 부자 TOP 10\n'
                
                rankData.map((data, index)=>{
                    msg += (index+1) + '위 : ' + data.user_name + ' - ' + data.coin+ '코인\n';
                });

                message.channel.send(msg);
                break;
            case '라마코인 룰렛' :
                let checkGuild = await this.dbManager.checkGuild(message.guild.id);

                if(checkGuild == 'READY'){
                    let coin = await this.dbManager.getWallet(message.guild.id, message.member.user.id);
                    
                    if (coin < 200) {
                        message.channel.send('코인이 모자라잖아! 퉷!');
                    }
                    else {
                        let roulletResultCoin = this.roullet(message);
                        this.dbManager.proccessRoullet(message.guild.id, message.member.user.id, roulletResultCoin)
                    }
                }else {
                    message.channel.send('서버가 등록되지 않거나 시스템이 활성화되어있지 않습니다.');
                }
                
                break;
            case '라마코인 주식 목록' : 
                let stockList = await this.dbManager.getStockList(message.guild.id);
                let stockListMessage = this.createStockListMessage(stockList);
                message.channel.send(stockListMessage);
                break;
        }

        if(message.content.startsWith('라마코인 주식 구매')){
            let buyMessageSplit = message.content.split(' ');
            if(buyMessageSplit.length != 5) {
                message.channel.send("명령어가 맞지 않습니다 : 라마코인 주식 구매 <주식이름> <수량>")
            }
            else {
                let stockBuyParam = {
                    guildId : message.guild.id,
                    userId : message.member.user.id,
                    stockName : buyMessageSplit[3],
                    count : buyMessageSplit[4]
                }

                let buyStockResult = await this.dbManager.buyStock(stockBuyParam);
                let msg = this.getBuyStockMessage(buyStockResult);
                message.channel.send(msg);
            }
        }
        
        if(message.content.startsWith('라마코인 주식 판매')){
            let sellMessageSplit = message.content.split(' ');
            if(sellMessageSplit.length != 5) {
                message.channel.send("명령어가 맞지 않습니다 : 라마코인 주식 구매 <주식이름> <수량>")
            }
            else {
                let stockSellParam = {
                    guildId : message.guild.id,
                    userId : message.member.user.id,
                    stockName : sellMessageSplit[3],
                    count : sellMessageSplit[4]
                }

                let sellStockResult = await this.dbManager.buyStock(stockSellParam);
                let msg = this.getSellStockMessage(sellStockResult);
                message.channel.send(msg);
            }
        }
    }

    getLlamacoinRegisterMessage(result){
        switch (result) {
            case 'SUCCESS' :
                return `라마코인 시스템에 서버가 등록되었습니다.`
            case 'INACTIVE' :
                return `시스템이 비활성화 상태입니다. '라마코인 활성화'를 입력해  시스템을 활성화 시켜야 합니다.`
            case 'ALREADY_EXIST' :
                return `이미 등록된 서버입니다.`
        }
    }

    getLlamacoinActivateMessage(result){
        switch (result) {
            case 'NO_REGIST' :
                return `라마코인 시스템에 서버를 등록해 주십시오(명령어 : 라마코인 등록).`
            case 'SUCCESS' :
                return `라마코인 시스템이 활성화 되었습니다.`
        }
    }

    getLlamacoinInactivateMessage(result){
        switch (result) {
            case 'NO_REGIST' :
                return `라마코인 시스템에 서버를 등록해 주십시오(명령어 : 라마코인 등록).`
            case 'SUCCESS' :
                return `라마코인 시스템이 비활성화 되었습니다.`
        }
    }

    getLlamacoinCreateWalletMessage(result){
        switch (result) {
            case 'INACTIVE' :
                return `시스템이 비활성화 상태입니다. '라마코인 활성화'를 입력해  시스템을 활성화 시켜야 합니다.`
            case 'NO_REGIST' :
                return `라마코인 시스템에 서버를 등록해 주십시오(명령어 : 라마코인 등록).`
            case 'SUCCESS' :
                return `지갑이 생성되었습니다. 지갑생성 기념 1000코인을 드립니다.`
            case 'ALREADY_EXIST' :
                return `이미 지갑을 가지고 있습니다.`
        }
    }

    getLlamacoinGetWalletMessage(result){
        switch (result) {
            case 'INACTIVE' :
                return `시스템이 비활성화 상태입니다. '라마코인 활성화'를 입력해  시스템을 활성화 시켜야 합니다.`
            case 'NO_REGIST' :
                return `라마코인 시스템에 서버를 등록해 주십시오(명령어 : 라마코인 등록).`
            case 'WALLET_NOT_FOUND' :
                return `지갑이 존재하지 않습니다.`
            default :
                return `님의 총 코인은 ${result}입니다.`
        }
    }

    async mining(message){
        let nonce = Math.floor(Math.random() * 100);
        let miningResult = await this.dbManager.mining(message.guild.id, message.member.user.id, nonce);
        if (miningResult == 'MINING_SUCCESS') {
            message.channel.send(message.member.user.username + "님이 채굴에 성공하였습니다! 500코인이 지급됩니다.");
        }
    }
    
    roullet(message){
        let roulletNumbers = []
        message.channel.send('룰렛을 돌립니다!');
        let msg = '';
        for(let i = 0; i < 3; i++){
            roulletNumbers.push(Math.floor(Math.random() * 10));
            msg += (i+1) + '번째 숫자! : ' + roulletNumbers[i] + '\n'
        }
        message.channel.send(msg);

        if(roulletNumbers[0]==roulletNumbers[1] && roulletNumbers[0]==roulletNumbers[2]){
            message.channel.send('잭팟! 12000포인트 지급!');
            return 11800;
        }else if(roulletNumbers[0]==roulletNumbers[1] || roulletNumbers[0]==roulletNumbers[2] || roulletNumbers[2]==roulletNumbers[1]) {
            message.channel.send('당첨! 600포인트 지급!');
            return 400;
        }
        else{
            message.channel.send('꽝이지롱 퉤엣!');
            return -200;
        }
    }

    createStockListMessage(stocks){
        let msg = '주식 목록\n=========================\n';
        for(let i=0; i<stocks.length; i++){
            msg += stocks[i].stock_name + " - 주가 : " + stocks[i].price + "코인\n";
        }

        return msg;
    }

    getBuyStockMessage(result){
        switch(result){
            case 'INACTIVE' :
                return `시스템이 비활성화 상태입니다. '라마코인 활성화'를 입력해  시스템을 활성화 시켜야 합니다.`
            case 'NO_REGIST' :
                return `라마코인 시스템에 서버를 등록해 주십시오(명령어 : 라마코인 등록).`
            case 'STOCK_NOT_FOUND':
                return '주식을 찾을 수 없습니다.';
            case 'WALLET_NOT_FOUND':
                return '지갑이 없습니다.';
            case 'CANNOT_BUY':
                return '코인이 부족하잖아 퉤엣!!!';
            case 'SUCCESS' :
                return '주식을 구매하였습니다.'
        }
    }

    getSellStockMessage(result){
        switch(result){
            case 'INACTIVE' :
                return `시스템이 비활성화 상태입니다. '라마코인 활성화'를 입력해  시스템을 활성화 시켜야 합니다.`
            case 'NO_REGIST' :
                return `라마코인 시스템에 서버를 등록해 주십시오(명령어 : 라마코인 등록).`
            case 'STOCK_NOT_FOUND':
                return '주식을 찾을 수 없습니다.';
            case 'WALLET_NOT_FOUND':
                return '지갑이 없습니다.';
            case 'HAS_NOT_STOCK':
                return '구매한 주식이 없잖아 퉤엣!!!';
            case 'NOT_STOCK_ENOUGH':
                return '가지고 있는게 모자라잖아 퉤엣!!';
            case 'SUCCESS' :
                return '주식을 판매하였습니다.';
        }
    }
}