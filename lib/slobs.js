
const jaysonTcpClient = require('jayson/promise/lib/client/tcp');
const PIPE_NAME='slobs';
const PIPE_PATH=`\\\\.\\pipe\\${PIPE_NAME}`;

module.exports = class Slobs {
    constructor(config) {
         
        //so far nothing to do here - may do dynamic creation of methods if it sounds fun later.
         return this;
    }
    init() {
        this.client = jaysonTcpClient(PIPE_PATH);
    }

    async basicRequest(resource,method){
        
        return this.client.request(method,{resource});

    }
    async setValues(resource,method,args){
        return this.client.request(method,{resource,"args":args})
    }
    

}