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
        this.magicGodong = ['언젠가는','다시 한번 물어봐','그럼!','그래', '당연하지', '물론', '...푸흡!!', '아니','안돼','가만히 있어','그것도 안돼','No','Yes','뭐라고?', '퉤엣'];
        this.helpMsg = 
            '침뱉기 : 캬악 칵 카악 캭 (!붙이면 이미지가 나옵니다.)\n'+
            '핥기 : 낼름 냘름 핥 핥짝 핥쨕\n'+
            '경고 : 건들지마!\n'+
            '매력어필 : 난멋져 난예뻐\n'+
            '질문 : 마법의 라마고동님 (질문)\n'+
            '소스코드 : https://github.com/xowl1596/spitting-llama';  
        this.startBot();
    }
    
    startBot(){
        client.on('ready', () => {
            console.log('[llama Bot] : bot is start now!!!');
        });
          
        client.on('messageCreate', message => {
            this.checkAndExecuteCommands(message);
        });
          
        client.login(process.env.TOKEN);
    }

    checkAndExecuteCommands(message){
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
    
}