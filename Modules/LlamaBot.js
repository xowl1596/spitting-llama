const { Client, Intents } = require('discord.js');
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
            '매력어필 : 난멋져 난예뻐\n'+
            '질문 : 마법의 라마고동님 (질문)\n'+
            '라마코인 도움말 : 라마코인 도움말'+
            '소스코드 : https://github.com/xowl1596/spitting-llama';  
        
        this.llamacoinHelpMsg = 
            '라마코인 등록 : 라마코인 시스템에 서버를 등록시키고 활성화 합니다.\n'+
            '라마코인 활성화 / 비활성화 : 라마코인 시스템을 활성화/비활성화 합니다.\n'+
            '라마코인 지갑생성 : 해당서버에 자신의 지갑을 생성합니다. 지갑을 생성해야 라마코인 시스템이 사용 가능합니다.\n'+
            '라마코인 잔액확인 : 자신이 얼마나 코인을 가지고 있는지 확인합니다.\n';
        this.startBot();
    }
    
    startBot(){
        client.on('ready', () => {
            console.log('[llama Bot] : bot is start now!!!');
        });
          
        client.on('messageCreate', message => {
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
                message.channel.send({ files: [{ attachment: './llama3.jpg' }] });
                break;
            case '난예뻐' :
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
                let createWalletResult = await this.dbManager.createWallet(message.guild.id, message.member.user.id)
                let createWalletMessage = this.getLlamacoinCreateWalletMessage(createWalletResult);
                message.channel.send(createWalletMessage);
                break;
            case '라마코인 잔액확인' :
                let getWalletResult = await this.dbManager.getWallet(message.guild.id, message.member.user.id);
                let getWalletMessage = this.getLlamacoinGetWalletMessage(getWalletResult);
                message.channel.send(message.member.user.username + getWalletMessage);
                break;
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
}