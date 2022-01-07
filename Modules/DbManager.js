const DBClient = require('pg').Client;

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

        this.dbClient = new DBClient(this.dbconfig) 

        this.dbClient.connect(err => { 
            if (err) { 
                console.log('Failed to connect db ' + err) 
            } 
            else { 
                console.log('Connect to db done!') 
            } 
        });
    }
}