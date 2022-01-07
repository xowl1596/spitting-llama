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

    async llamacoinRegister(id, name){
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

    async llamacoinActiveGuild(id){
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

    async llamacoinInactiveGuild(id){
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

    async llamacoinCreateWallet(){}
}