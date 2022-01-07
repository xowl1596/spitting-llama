const client = require('pg').Client;

module.exports = class DbManager{
    constructor(){
        this.dbconfig = { 
            host: process.env.DB_HOST, 
            user: process.env.DB_USER, 
            password: process.env.DB_PW, 
            database: process.env.DB_NAME, 
            port: process.env.DB_PORT, 
            ssl: { rejectUnauthorized: false } 
        };

        this.client = new client(this.dbconfig);

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
        let searchGuildQuery = `SELECT id, is_active FROM guilds WHERE id = ${id}`;
        let searchResult = await this.client.query(searchGuildQuery);

        if (searchResult.rowCount == 0) {
            this.llamacoinInsertGuild([id, name]);
            return 'SUCCESS';
        }
        else if (!searchResult.rows[0].is_active){
            return 'INACTIVE';
        }
        else {
            return 'ALREADY_EXIST';
        }
    }

    llamacoinInsertGuild(values){
        let insertGuildQuery = `INSERT INTO guilds(id, name, is_active) VALUES($1, $2,true)`;
        this.client.query(insertGuildQuery, values);
    }

    async activeGuild(id){
        let searchGuildQuery = `SELECT id, is_active FROM guilds WHERE id = ${id}`;
        let activeGuildQuery = `UPDATE guilds SET is_active = true WHERE id = ${id}`;
        
        let searchResult = await this.client.query(searchGuildQuery);
        if(searchResult.rowCount == 0) {
            return 'NO_REGIST';
        }
        else{
            this.client.query(activeGuildQuery);
            return 'SUCCESS';
        }
    }

    async inactiveGuild(id){
        let searchGuildQuery = `SELECT id, is_active FROM guilds WHERE id = ${id}`;
        let activeGuildQuery = `UPDATE guilds SET is_active = false WHERE id = ${id}`;
        
        let searchResult = await this.client.query(searchGuildQuery);
        if(searchResult.rowCount == 0) {
            return 'NO_REGIST';
        }
        else{
            this.client.query(activeGuildQuery);
            return 'SUCCESS';
        }
    }

    async createWallet(guildId, userId){
        let result = '';
        //서버가 등록되어 있거나 활성화되어있는 지 확인
        let searchGuildQuery = `SELECT id, is_active FROM guilds WHERE id = ${guildId}`;
        let searchGuildResult = await this.client.query(searchGuildQuery);

        if(searchGuildResult.rowCount == 0) { result = 'NO_REGIST'; }
        else if(!searchGuildResult.rows[0].is_active) {result = 'INACTIVE';}

        
        let searchWalletQuery = `SELECT * FROM wallets WHERE guild_id = ${guildId} AND user_id = ${userId}`;
        let createWalletQuery = `INSERT INTO wallets(guild_id, user_id, coin) VALUES($1, $2, $3)`;
        let createWalletValues = [guildId, userId, 1000];
        
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

    async getWallet(guildId, userId){
        let result = '';
        //서버가 등록되어 있거나 활성화되어있는 지 확인
        let searchGuildQuery = `SELECT id, is_active FROM guilds WHERE id = ${guildId}`;
        let searchGuildResult = await this.client.query(searchGuildQuery);

        if(searchGuildResult.rowCount == 0) { result = 'NO_REGIST'; }
        else if(!searchGuildResult.rows[0].is_active) {result = 'INACTIVE';}

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
}