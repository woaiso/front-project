(function($) {
    var str="答:甲原来领奖金39元，乙原来领奖金21元，丙原来领奖金12元。";
    var strArray=["原来","奖金","甲","乙","丙","丁","39","21","12","元","领"];
    function getRandHanzi(){
        var random=Math.random()*(strArray.length-1);
        return strArray[Math.round(random)];
    }
	$.keyboard.keyboards.qwerty	= [
		['7','8','9','÷',{text:'⌫',name:'backSpace',action:function(e){return false;}}],
		['4','5','6','×','('],
		['1','2','3','-',")"],
        ['0','.','=','+',{text:'文',name:'numbers',action:function(e){e.keyboard('enterToggle',true);
            $('body').keyboard('keyboard', 'random');
            return false;
        }}]
	];
	//测试随机数字键盘
	var random=[];
	var line=4;
	var colum=4;
	for(var i=0;i<line;i++){
		var array=[];
		for(var j=0;j<colum;j++){
			array[j]=getRandHanzi();
            //这里需要对数字进行处理
            switch (array[j].length){ //根据字数长短进行处理
                case 1:
                    break;
                case 2:
                    console.log(array[j]);
                    var temp=new String(array[j]);
                    array[j]={
                        text:temp,
                        name:"w-2"
                    };
                    break;
                case 3:
                    break;
                default :
                    break;
            }
		}
		random[i]=array;
	}
    console.log(random);

	random[0][colum-1]={text:'⌫',name:'backSpace',action:function(e){return false;}};
    random[line-1][colum-1]={text:'123',name:'numbers',action:function(e){
        $('body').keyboard('keyboard', 'qwerty');
        return false;
    }};

	$.keyboard.keyboards.random=random;
})(jQuery);
