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
            DbManager.knex('guilds').update({is_active:true}).where('id', id)
            return 'SUCCESS';
        }
    }

    async inactiveGuild(id){
        let guild = await this.getGuildById(id);
        
        if(typeof guild == 'undefined') {
            return 'NO_REGIST';
        }
        else{
            DbManager.knex('guilds').update({is_active:false}).where('id', id)
            return 'SUCCESS';
        }
    }

    async createWallet(guildId, userId, userName){
        let result = '';
        let checkGuildResult = await this.checkGuild(guildId);
        if (checkGuildResult == 'READY') {
            let searchWalletQuery = `SELECT * FROM wallets WHERE guild_id = ${guildId} AND user_id = ${userId}`;
            let createWalletQuery = `INSERT INTO wallets(guild_id, user_id, user_name, coin) VALUES($1, $2, $3, $4)`;
            let createWalletValues = [guildId, userId, userName, 1000];
            
            //이미 생성된 지갑이 있는 지 확인
            let searchResult = await this.client.query(searchWalletQuery);
            
            //지갑이 없으면 생성, 아니면 그대로 둠
            if(searchResult.rowCount == 0) {
                this.client.query(createWalletQuery, createWalletValues);
                result = 'SUCCESS';
            }
            else{
                result = 'ALREADY_EXIST';
            }
        
            return result;
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
            val = `-${coin}`
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
        //서버가 등록되어 있거나 활성화되어있는 지 확인
        let searchGuildQuery = `SELECT id, is_active FROM guilds WHERE id = ${guildId}`;
        let searchGuildResult = await this.client.query(searchGuildQuery);

        if(searchGuildResult.rowCount == 0) { 
            return 'NO_REGIST'; 
        }
        else if(!searchGuildResult.rows[0].is_active) {
            return 'INACTIVE';
        }
        else {
            return 'READY';
        }
    }
}