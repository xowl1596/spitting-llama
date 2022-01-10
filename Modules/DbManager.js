const client = require('pg').Client;
require("dotenv").config();

module.exports = class DbManager{
    //raw쿼리로 처리되는 함수들에 사용되는 설정 - knex로 모두 바뀌면 없앨 것
    static dbconfig = { 
        host: process.env.DB_HOST, 
        user: process.env.DB_USER, 
        password: process.env.DB_PW, 
        database: process.env.DB_NAME, 
        port: process.env.DB_PORT, 
        ssl: {
            rejectUnauthorized: false
        }
    };

    static knex = require('knex')({
        client: 'pg', 
        connection: {
            host: process.env.DB_HOST, 
            user: process.env.DB_USER, 
            password: process.env.DB_PW, 
            database: process.env.DB_NAME, 
            port: process.env.DB_PORT,
            connectionString: process.env.DB_URL,
            ssl: {
                rejectUnauthorized: false
            }
        }
    })

    constructor(){
        this.client = new client(DbManager.dbconfig);

        this.client.connect(err => { 
            if (err) { 
                console.log('[DB] : Failed to connect db ' + err);
            } 
            else { 
                console.log('[DB] : Connect to db done!');
            } 
        });
    }

    async register(id, name){
        let guild = await this.getGuildById(id);
        let result = this.checkGuildAndRegister(guild);

        if(result == 'SUCCESS') {
            await DbManager.knex('guilds').insert({'id':id, 'name':name});
        }

        return result;
    }

    async getGuildById(id){
        let guild = await DbManager.knex.select('id', 'is_active').from('guilds').where('id', id).first();
        return guild;
    }

    checkGuildAndRegister(guild){
        if (typeof guild == 'undefined') {
            return 'SUCCESS';
        }

        if (guild.is_active == false){
            return 'INACTIVE';
        }
        else {
            return 'ALREADY_EXIST';
        }
    }

    async activeGuild(id){
        let guild = await this.getGuildById(id);
        
        if(typeof guild == 'undefined') {
            return 'NO_REGIST';
        }
        else{
            await DbManager.knex('guilds').update({is_active:true}).where('id', id)
            return 'SUCCESS';
        }
    }

    async inactiveGuild(id){
        let guild = await this.getGuildById(id);
        
        if(typeof guild == 'undefined') {
            return 'NO_REGIST';
        }
        else{
            await DbManager.knex('guilds').update({is_active:false}).where('id', id)
            return 'SUCCESS';
        }
    }

    async createWallet(guildId, userId, userName){
        let checkGuildResult = await this.checkGuild(guildId);

        if (checkGuildResult == 'READY') {
            let wallet =  await DbManager.knex.select()
                .from('wallets')
                .where({guild_id : guildId, user_id : userId})
                .first();

            if(typeof wallet == 'undefined') {
                await DbManager.knex('wallets').insert({guild_id:guildId, user_id:userId, user_name:userName, coin:1000});
                return 'SUCCESS';
            }
            else{
                return 'ALREADY_EXIST';
            }
        }
        else {
            return checkGuildResult;
        }
    }

    async getWallet(guildId, userId){
        let result = '';
        let checkGuildResult = await this.checkGuild(guildId);
        if (checkGuildResult == 'READY') {
            //해당 유저의 지갑이 있는지 확인
            let searchWalletQuery = `SELECT * FROM wallets WHERE guild_id = ${guildId} AND user_id = ${userId}`;
            let searchWalletResult = await this.client.query(searchWalletQuery);
            if(searchWalletResult.rowCount == 0) {
                result = 'WALLET_NOT_FOUND';
            }
            else{
                result = searchWalletResult.rows[0].coin;
            }

            return result;
        }
        else{
            return checkGuildResult;
        }
    }

    async mining(guildId, userId, nonce){
        let checkGuildResult = await this.checkGuild(guildId);
        if (checkGuildResult === 'READY') {
            let mineKeyQuery = `SELECT mine_key FROM guilds WHERE id = ${guildId}`;
            let mineKeyResult = await this.client.query(mineKeyQuery);
            let mineKey = mineKeyResult.rows[0].mine_key;

            if(mineKey == nonce){
                let minigSuccessQuery = `UPDATE wallets SET coin = coin + 500 WHERE guild_id=${guildId} AND user_id=${userId}`;
                this.client.query(minigSuccessQuery);

                let newMineKey = Math.floor(Math.random() * 100);
                let updateMineKeyQuery = `UPDATE guilds SET mine_key = ${newMineKey}`;
                this.client.query(updateMineKeyQuery);

                return 'MINING_SUCCESS';
            }
            else{ //채굴 실패
                let minigFailQuery = `UPDATE wallets SET coin = coin + 1 WHERE guild_id=${guildId} AND user_id=${userId}`;
                this.client.query(minigFailQuery);

                return 'MINING_FAIL';
            }
        }
        else {
            return checkGuildResult;
        }
    }

    async proccessRoullet(guildId, userId, coin){
        let val = ''
        if(coin > 0){
            val = `+${coin}`; 
        }
        else{
            val = `${coin}`
        }
        
        let updateCoinQuery = `UPDATE wallets SET coin = coin${val} WHERE guild_id=${guildId} AND user_id=${userId}`
        this.client.query(updateCoinQuery);
    }

    async getCoinRank(guildId) {
        let coinRankQuery = `SELECT * FROM wallets WHERE guild_id=${guildId} ORDER BY coin DESC LIMIT 10`
        let coinRankResult = await this.client.query(coinRankQuery);
        return coinRankResult.rows;
    }

    async checkGuild(guildId){
        let guild = await this.getGuildById(guildId);

        if(typeof guild == 'undefined') { 
            return 'NO_REGIST'; 
        }
        else if(!guild.is_active) {
            return 'INACTIVE';
        }
        else {
            return 'READY';
        }
    }

    async getStockList(guildId){
        let stocks = await DbManager.knex.select().from('stocks').where('guild_id', guildId);
        return stocks;
    }

    async buyStock(param){
        let checkGuildResult = await this.checkGuild(param.guildId);
        
        if(checkGuildResult == 'READY'){
            //해당 주식이 있는지 확인
            let stock = await DbManager.knex.select().from('stocks').where({guild_id: param.guildId, stock_name: param.stockName}).first();

            if(typeof stock == 'undefined'){
                return 'STOCK_NOT_FOUND';
            }
            
            //유저가 지갑이 있는지 확인
            let wallet = await DbManager.knex.select().from('wallets').where({guild_id: param.guildId, user_id: param.userId}).first();
            if(typeof wallet == 'undefined'){
                return 'WALLET_NOT_FOUND';
            }
            //유저가 돈이 충분한지 확인
            if (wallet.coin < stock.price * param.count ){
                return 'CANNOT_BUY'
            }

            //구매 진행
            //해당 유저가 이미 구매한 주식인지 확인
            let userStock = await DbManager.knex.select().from('user_stocks').where({guild_id:param.guildId, user_id: param.userId, stock_name: param.stockName}).first();

            if(typeof userStock == 'undefined') { //구매한 주식이 아니면 생성
                await DbManager.knex('user_stocks').insert({guild_id:param.guildId, user_id: param.userId, stock_name: param.stockName, amount: param.count});
            }else{ //이미 구매한 주식이면 업데이트
                await DbManager.knex('user_stocks').update({amount: parseInt(userStock.amount) + parseInt(param.count)}).where({guild_id:param.guildId, user_id: param.userId, stock_name: param.stockName});
                await DbManager.knex('wallets').update({coin: parseInt(wallet.coin) - (parseInt(stock.price) * parseInt(param.count))}).where({guild_id:param.guildId, user_id: param.userId});
            }

            return 'SUCCESS';
        }
        else {
            return checkGuildResult;
        }
    }

    async sellStock(param){
        let checkGuildResult = await this.checkGuild(param.guildId);
        
        if(checkGuildResult == 'READY'){
            //해당 주식이 있는지 확인
            let stock = await DbManager.knex.select().from('stocks').where({guild_id: param.guildId, stock_name: param.stockName}).first();

            if(typeof stock == 'undefined'){
                return 'STOCK_NOT_FOUND';
            }
            
            //유저가 지갑이 있는지 확인
            let wallet = await DbManager.knex.select().from('wallets').where({guild_id: param.guildId, user_id: param.userId}).first();
            if(typeof wallet == 'undefined'){
                return 'WALLET_NOT_FOUND';
            }

            //판매 진행
            //해당 유저가 이미 구매한 주식인지 확인
            let userStock = await DbManager.knex.select().from('user_stocks').where({guild_id:param.guildId, user_id: param.userId, stock_name: param.stockName}).first();

            if(typeof userStock == 'undefined') { //구매한 주식이 아니면 판매 불가
                return 'HAS_NOT_STOCK';
            }
            
            if(parseInt(userStock.amount) < parseInt(param.count)){
                return 'NOT_STOCK_ENOUGH';
            }
            else{ //구매한 주식이면 업데이트
                //주식수량 감소
                await DbManager.knex('user_stocks').update({amount: parseInt(userStock.amount) - parseInt(param.count)}).where({guild_id:param.guildId, user_id: param.userId, stock_name: param.stockName});
                //코인 증가
                await DbManager.knex('wallets').update({coin: parseInt(wallet.coin) + (parseInt(stock.price) * parseInt(param.count))}).where({guild_id:param.guildId, user_id: param.userId});
            }

            return 'SUCCESS';
        }
        else {
            return checkGuildResult;
        }
    }

    async getMyStockList(param){
        let stockList = await DbManager.knex.select().from('user_stocks').where({guild_id: param.guildId, user_id: param.userId});
        return stockList; 
    }

    static async updateStockPrice(){
        let stockList = await DbManager.knex.select().from('stocks');

        for(let i=0; i < stockList.length; i++){
            let price = Math.floor(Math.random() * 101); 
            let chk = Math.floor(Math.random() * 100);
            if(chk >= 50){
                price *= -1
            }
            await DbManager.knex('stocks').update({price : parseInt(stockList[i].price) + price}).where({guild_id: stockList[i].guild_id, stock_name: stockList[i].stock_name});
        }
    }
}