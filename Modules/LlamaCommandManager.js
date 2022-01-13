module.exports = class LlamaCommandManger{
    constructor(){
        this.cmds = ['캬악', '칵', '카악', '캭'];
        this.imgCmds = ['캬악!', '칵!', '카악!','캭!'];
        this.img2Cmds = ['낼름', '냘름', '핥', '핥짝', '핥쨕'];
    
        this.magicGodong = [
            '언젠가는','다시 한번 물어봐','그럼!','그래', '당연하지', '물론', '...푸흡!!',
            '아니','안돼','가만히 있어','그것도 안돼','No','Yes','뭐라고?', '퉤엣'
        ];
        
        this.helpMsg = 
            '침뱉기 : 캬악 칵 카악 캭 (!붙이면 이미지가 나옵니다.)\n'+
            '핥기 : 낼름 냘름 핥 핥짝 핥쨕\n'+
            '경고 : 건들지마!\n'+
            '고백으로 혼내주기 : 난멋져 난예뻐\n'+
            '질문 : 마법의 라마고동님 (질문)\n'+
            '라마코인 도움말 : 라마코인 도움말'+
            '소스코드 : https://github.com/xowl1596/spitting-llama';
    }
    
    detectCommand(content){
        switch (content){
            case '라마도움말' :
                return this.helpMsg;
            case '건들지마!' :
                return '건들면 침뱉을거야!';
            case '난멋져' :
                return { files: [{ attachment: './llama3.jpg' }] };
            case '난예뻐' :
                return { files: [{ attachment: './llama4.jpg' }] };
        }
    
        if (content.startsWith('마법의 라마고동님')) {
            return this.magicGodong[Math.floor(Math.random() * this.magicGodong.length)];
        }
    
        if (this.cmds.includes(content)){
            return ('퉤엣!');
        }
    
        if (this.imgCmds.includes(content)){
            return { files: [{ attachment: './llama.png' }] };
        }
    
        if (this.img2Cmds.includes(content)){
            return { files: [{ attachment: './llama2.png' }] };
        }

        return undefined;
    }
}