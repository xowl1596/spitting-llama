const DBClient = require('pg').Client;
const { Client, Intents } = require('discord.js');
const client = new Client({ intents: [
  Intents.FLAGS.GUILDS, 
  Intents.FLAGS.GUILD_MESSAGES,
] });

require("dotenv").config();

let fs = require('fs');
const http = require('http');

const dbconfig = { 
  host: process.env.DB_HOST, 
  user: process.env.DB_USER, 
  password: process.env.DB_PW, 
  database: process.env.DB_NAME, 
  port: process.env.DB_PORT, 
  ssl: { rejectUnauthorized: false } 
};

const dbClient = new DBClient(dbconfig) 

dbClient.connect(err => { 
  if (err) { 
    console.log('Failed to connect db ' + err) 
  } 
  else { 
    console.log('Connect to db done!') 
  } 
});

cmds = ['캬악', '칵', '카악', '캭'];
imgCmds = ['캬악!', '칵!', '카악!','캭!'];
img2Cmds = ['낼름', '냘름', '핥', '핥짝', '핥쨕'];
magicGodong = ['언젠가는','다시 한번 물어봐','그럼!','그래', '당연하지', '물론', '...푸흡!!', '아니','안돼','가만히 있어','그것도 안돼','No','Yes','뭐라고?', '퉤엣']
foods = ['스팸에 햇반!!', '치킨은 언제나 옳지', '햄버거 머겅', '피자가 아니라 핏ㅈ짜!', '뜨끄~은한 국밥 든드~은하게 먹자']

helpMsg = 
`침뱉기 : 캬악 칵 카악 캭 (!붙이면 이미지가 나옵니다.)
핥기 : 낼름 냘름 핥 핥짝 핥쨕
경고 : 건들지마!
매력어필 : 난멋져 난예뻐
질문 : 마법의 라마고동님 (질문)
뭐먹지 : 라마님 오늘 뭐먹을까요 (뒤에 ?붙여도 작동)
소스코드 : https://github.com/xowl1596/spitting-llama
`


client.on('ready', () => {
  console.log('[llama Bot] : bot is start now!!!');
});

client.on('messageCreate', message => {
    if (message.content === '라마도움말') {
      message.channel.send(helpMsg);
    }

    if (message.content === '건들지마!') {
      message.channel.send('건들면 침뱉을거야!');
    }

    if (message.content === '난멋져') {
      message.channel.send({ files: [{ attachment: './llama3.jpg' }] });
    }

    if (message.content === '난예뻐') {
      message.channel.send({ files: [{ attachment: './llama4.jpg' }] });
    }

    if (message.content.startsWith('라마님 오늘 뭐먹을까요')) {
      message.channel.send(foods[Math.floor(Math.random() * foods.length)]);
    }

    if (message.content.startsWith('마법의 라마고동님')) {
        message.channel.send(magicGodong[Math.floor(Math.random() * magicGodong.length)]);
    }

    if (cmds.includes(message.content)){
      message.channel.send('퉤엣!');
    }

    if (imgCmds.includes(message.content)){
      message.channel.send({ files: [{ attachment: './llama.png' }] });
    }

    if (img2Cmds.includes(message.content)){
      message.channel.send({ files: [{ attachment: './llama2.png' }] });
    }
});
client.login(process.env.TOKEN);

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Bot is active now');
});

server.listen(process.env.PORT || 5000);