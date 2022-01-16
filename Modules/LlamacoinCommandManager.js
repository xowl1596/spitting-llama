const DbManager = require('./DbManager.js');

module.exports = class LlamaCommandManger{
    constructor(){
        this.llamacoinHelpMsg = 
            '라마코인 등록 : 라마코인 시스템에 서버를 등록시키고 활성화 합니다.\n'+
            '라마코인 활성화 / 비활성화 : 라마코인 시스템을 활성화/비활성화 합니다.\n'+
            '라마코인 지갑생성 : 해당서버에 자신의 지갑을 생성합니다. 지갑을 생성해야 라마코인 시스템이 사용 가능합니다.\n'+
            '라마코인 잔액확인 : 자신이 얼마나 코인을 가지고 있는지 확인합니다.\n'+
            '라마코인 랭크 : 우리 서버 빌게이츠는 누구?\n'+
            '라마코인 룰렛(비활성됨) : 200포인트로 도박을 합니다. 잭팟은 12000코인, 당첨되면 600코인입니다. 가즈아~~!\n\n'+
            '라마코인 주식 목록 : 이 서버에 있는 주식을 보여줍니다.\n'+
            '라마코인 주식 구매/판매 <주식이름> <개수> : 주식을 구매/판매합니다.\n'+
            '라마코인 주식 확인 : 구매한 주식들을 볼 수 있습니다.'
    }
    
    detectCommand(content){
        switch(content) {
            case '라마코인 도움말' :
                return this.llamacoinHelpMsg;
        }
    }
}