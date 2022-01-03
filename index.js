const { Client, Intents, Attachment } = require('discord.js');
const client = new Client({ intents: [
  Intents.FLAGS.GUILDS, 
  Intents.FLAGS.GUILD_MESSAGES,
] });


cmds = ['캬악', '칵', '카악', '캭'];
imgCmds = ['캬악!', '칵!', '카악!','캭!'];

helpMsg = 
`침뱉기 : 캬악 칵 카악 캭 (!붙이면 이미지가 나옵니다.)
경고 : 건들지마!
소스코드 : https://github.com/xowl1596/spitting-llama
`


client.on('ready', () => {
  console.log('준비되었습니다!');
});

client.on('messageCreate', message => {
    if (message.content === '라마도움말') {
      message.channel.send(helpMsg);
    }

    if (message.content === '건들지마!') {
      message.channel.send(
        `건들면 침뱉을거야!`
      );
    }

    if (cmds.includes(message.content)){
      message.channel.send('퉤엣!');
    }

    if (imgCmds.includes(message.content)){
      message.channel.send({ files: [{ attachment: './llama.png' }] });
    }

});

client.login('token here');