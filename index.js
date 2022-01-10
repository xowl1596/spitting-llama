const fs = require('fs');
const http = require('http');
const Llamabot = require('./Modules/LlamaBot.js');
let schedule = require('node-schedule');
const DbManager = require('./Modules/DbManager.js');
require("dotenv").config();

// setInterval(()=>{
//   console.log("???")
//   DbManager.updateStockPrice();
// }, 1000);

let llama = new Llamabot();

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Bot is active now');
});

server.listen(process.env.PORT || 5000);