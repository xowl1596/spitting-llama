const fs = require('fs');
const http = require('http');
const DbManager = require('./Modules/DbManager.js');

const Llamabot = require('./Modules/LlamaBot.js');
require("dotenv").config();

let llama = new Llamabot();
let dbManager = new DbManager();

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Bot is active now');
});

server.listen(process.env.PORT || 5000);