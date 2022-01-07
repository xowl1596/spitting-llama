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
            this.insertGuild([id, name]);
            return 'SUCCESS';
        }
        else if (!searchResult.rows[0].is_active){
            return 'INACTIVE';
        }
        else {
            return 'ALREADY_EXIST';
        }
    }

    insertGuild(values){
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

    async createWallet(guildId, userId, userName){
        let result = '';
        //서버가 등록되어 있거나 활성화되어있는 지 확인
        let searchGuildQuery = `SELECT id, is_active FROM guilds WHERE id = ${guildId}`;
        let searchGuildResult = await this.client.query(searchGuildQuery);

        if(searchGuildResult.rowCount == 0) { return 'NO_REGIST'; }
        else if(!searchGuildResult.rows[0].is_active) {return 'INACTIVE';}

        
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

    async getWallet(guildId, userId){
        let result = '';
        //서버가 등록되어 있거나 활성화되어있는 지 확인
        let searchGuildQuery = `SELECT id, is_active FROM guilds WHERE id = ${guildId}`;
        let searchGuildResult = await this.client.query(searchGuildQuery);

        if(searchGuildResult.rowCount == 0) { return 'NO_REGIST'; }
        else if(!searchGuildResult.rows[0].is_active) {return 'INACTIVE';}

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

    async mining(guildId, userId, nonce){
        //서버가 등록되어 있거나 활성화되어있는 지 확인
        let searchGuildQuery = `SELECT id, is_active FROM guilds WHERE id = ${guildId}`;
        let searchGuildResult = await this.client.query(searchGuildQuery);
        if(searchGuildResult.rowCount == 0) { return 'NO_REGIST'; }
        else if(!searchGuildResult.rows[0].is_active) {return 'INACTIVE';}

        //채굴 실행
        let mineKeyQuery = `SELECT mine_key FROM guilds WHERE id = ${guildId}`;
        let mineKeyResult = await this.client.query(mineKeyQuery);
        let mineKey = mineKeyResult.rows[0].mine_key;
        if(mineKey == nonce){ //채굴 성공
            let minigSuccessQuery = `UPDATE wallets SET coin = coin + 500 WHERE guild_id=${guildId} AND user_id=${userId}`;
            this.client.query(minigSuccessQuery);

            let newMineKey = Math.floor(Math.random() * 100);
            let updateMineKeyQuery = `UPDATE guilds SET mine_key = ${newMineKey}`;
            this.client.query(updateMineKeyQuery);

            return 'MINING_SUCCESS';
        }else{ //채굴 실패
            let minigFailQuery = `UPDATE wallets SET coin = coin + 1 WHERE guild_id=${guildId} AND user_id=${userId}`;
            this.client.query(minigFailQuery);

            return 'MINING_FAIL';
        }

    }

}