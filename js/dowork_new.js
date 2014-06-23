/**
 * 对做作业模块进行重构，结构更清晰，模块化
 * @author YUN
 * @date 2014-05-21 21:23:37
 * @constructor
 */
;
(function ($, window, document, undefined) {
    window.HomeWork = function () {
        this.$init();
    };
    window.HomeWork.prototype = {
        $works: {},//存储的前端每道题目数据
        topics: [], //存储提交的数据
        $works: {},
        hasSubmit:false,
        $markups: [],
        current: {},
        remark:"",
        sigle_time: {},
        glob_time: 0,
        doneModel: {
            hwId: null,
            allTime: null,
            topics: null,
            remark: null
        },
        page: 0,
        $btns: {
            submitBtn: $("#submit-work-btn"),
            nextBtn: $("#btn-next-work"),
            prevBtn: $("#btn-prev-work")
        },
        click: "tap click",
        $init: function () { //对数据进行初始化
            var _$ = this;
            if (typeof Dialog == 'undefined' || Dialog instanceof Function) { //加载Dialog 模块
                $.getScript(host + "js/mobile/web_dialog.js");
            }
            //加载键盘
            this.keyboard();
            /**
             *初始化内容
             **/
            _$.$works = $("#work-warpper > .content")
                , _$.$btns.submitBtn = $("#submit-work-btn")
                , _$.$btns.nextBtn = $("#btn-next-work")
                , _$.$btns.prevBtn = $("#btn-prev-work")
                , _$.$markups = $(".markup")
                , _$.doneModel.hwId = $("input#hwId").val()
                , _$.current = _$.$works[this.page];
            //初始化数据
            _$.$works.each(function () {
                var type=$(this).attr("topic_type");
                var ans=new Array();
                if(type=="1"||type=="7"||type=="8"){ //填空
                    $(this).find(".content-sub .sub-textInput").each(function(){
                        ans.push({
                            answer:"",
                            isright:""
                        })
                    });
                }else if(type=="2"||type=="6"){//单选
                    ans.push({
                        answer:"",
                        isright:""
                    });
                } else if(type=='3'){ //多选题
                    $(this).find(".content-sub :checkbox").each(function(){
                        ans.push({
                            answer:"",
                            isright:""
                        })
                    });
                }
                _$.topics.push({
                    answerModelList:ans,
                    done_time: 0,
                    remark: "",
                    topicId: $(this).attr("topic_id"),
                    topicType:type
                })
            });
            //绑定上一题，下一题按钮
            _$.$btns.prevBtn.on(_$.click, function () {
                _$.show_prev_topic();
                return false;
            });
            _$.$btns.nextBtn.on(_$.click, function () {
                _$.show_next_topic();
                return false;
            });
            //绑定提交作业按钮

            _$.$btns.submitBtn.on(_$.click, function () {
                _$.check_work();
                return false;
            });

            //绑定所有的备注信息
            _$.$markups.on("change blur", function () {
                _$.mark_keyup(this);
            });
            //绑定所有的填空信息
            _$.$works.find("textarea.sub-textInput,input").on("change blur ifChecked ifUnchecked", function () {
                _$.addData(this);
            });
            _$.$works.find("textarea.sub-textInput,input").on("keypress keydown keyup focus", function(e) {
                e.stopPropagation();
            });
            //选择题
            _$.$works.find("input").iCheck({
                checkboxClass: 'icheckbox_square-blue',
                radioClass: 'iradio_square-blue',
                increaseArea: '20%'// optional,
            });
            //开始加载草稿纸相关
            if (typeof Draw == 'undefined' || Draw instanceof Function) {
                $.getScript(host + "js/mobile/draw.js", function () {
                    //开始绑定草稿纸
                    _$.$works.each(function () {
                        var draw = new Draw()
                        $(this).data("draw", draw);
                        var btn = $(this).find(".canvas-btn");
                        btn.on("click", function () {
                            var _btn = this;
                            draw.show(function () {
                                if (this.hasDraw) {
                                    $(_btn).text("答题卡已写");
                                } else {
                                    $(_btn).text("答题卡");
                                }
                            });
                        })
                    })
                });
            }
            //开始加载虚拟数字键盘相关
            if (typeof KeyBoard == 'undefined' || KeyBoard instanceof Function) {
//                $.getScript(host + "js/mobile/keyboard.js", function () {
//                    var keyboard=new KeyBoard();
//                    keyboard.$init();
//                });
            }
            $(".content-title table").attr("border", "1");
            this.show_topic();
            //绑定Textarea 自动增长
            $("textarea").autosize();
            window.onbeforeunload=function(){
                if(_$.hasSubmit!=true){
                    return "还有未提交的作业，是否离开";
                }
            }

        }, /****初始化完成****/
        inputs:function(){ //统计一共有多少空
            this.blank=$(":text[topicdetid]").length;
            this.radio=$(":radio:checked");
        },
        scroll: function () {
            $(window).scroll(function () {
                if ($(this).scrollTop() > 100) {
                    $('#back-top').fadeIn();
                } else {
                    $('#back-top').fadeOut();
                }
            });
        },
        // 动态添加数据
        addData: function (_input) {
            // 答案集合
            var answers = new Array();
            var _li = $(_input).parents(".content");
            var topicId = $(_li).attr("topic_id");
            var topicDetId = $(_input).attr("value");
            var topicType = $(_li).attr("topic_type");
            var isright = $(_input).attr("answer");
            if (topicType && (topicType == "2"||topicType=='6')) {// 单选题
                // 答案对象
                var answerModel = {
                    answer: topicDetId,
                    isright: isright
                };
                answers.push(answerModel);
            } else if (topicType && topicType == "3") {// 多选题
                // 获取到所有的选框
                var _check = $(_input).parents("#topicContent").find("input:checkbox");
                var i = true;// 标识每个选项都是正确的
                $.each(_check, function (_index, _item) {
                    if (_item.checked) {
                        var answerModel = {
                            answer: $(_item).attr("value"),
                            isright: $(_item).attr("answer")
                        };
                        answers.push(answerModel);
                    }
                });
            } else if (topicType && (topicType == "1"||topicType=='7'||topicType=='8')) {// 填空题
                var _check = $(_input).parents("#topicContent").find("textarea.sub-textInput,input.sub-textInput");
                $.each(_check, function (_index, _item) {
                    var answerModel = {
                        answer: $(_item).attr("topicDetId") + "_!_" + $(_item).val(),
                        isright: $(_item).attr("answer")
                    };
                    answers.push(answerModel);
                });
            }
            this.addTopic(topicId, topicType, null, answers, "");
        },
        // 添加一个做题信息
        addTopic: function (topicId, topictype, done_time, answerModeList, mark) {
            var model = {
                topicId: topicId,
                topicType: topictype,
                done_time: done_time,
                answerModelList: answerModeList,
                remark: mark
            }, _$ = this;
            $.each(this.topics, function (i, topic_item) {
                if (topic_item.topicId == topicId) {
                    _$.topics[i] = model;
                    return false;
                }
            });
        },
        // 获取填空题 学生答案
        editor_keyu: function (editor) {
            var kongId = $(editor).attr("id");
            var stu_answer = $(editor).text();
            var input = $("input#" + kongId).val(stu_answer);
            this.addData($("input#" + kongId));
        },
        // 获取备注信息
        mark_keyup: function (mark) {
            var mark_text = $(mark).val();
            var topicId = $(mark).attr("topic_id");
            $.each(this.topics, function (_index, _item) {
                if (_item.topicId == topicId) {
                    _item.remark = mark_text;
                } else {
                    // alert("请先做题,再评论备注此题！");
                }
            });
        },
        // 检查遗漏作业
        check_work: function () {
            var _$ = this;
            var dialog = new Dialog();
            var content = "";
            //改进判断方法
            var do_length = 0;
            $.each(_$.topics, function () {
                if (this.answerModelList && this.answerModelList.length > 0) {
                    do_length++;
                }
            });
            if (_$.$works.length != do_length) {
                content = "<h3>您还有" + (_$.$works.length - do_length) + "题没做!<h3>";
            } else {
                content = "<h3>已做完全部题目。确认提交?</h3>";
            }
            //计算本次题目耗时多少
            var time=Math.ceil(this.getAllTime()/1000),timeStr;
            if(time/60<1){
                timeStr=time+"秒"
            }else{
                timeStr=Math.ceil(time/60)+"分"+time%60+"秒";
            }
            content+="本次作业共耗时"+timeStr;
            content+="<div class='subTextArea'><textarea style='min-width: 250px' col='40' row='8' id='global_remark' data-role='none' class='subButton-textarea' placeholder='输入您对本次作业的看法和建议!'></textarea></div>"
            dialog.create({
                title: "提示信息",
                content: content,
                buttons: [
                    {
                        title: "立即提交",
                        theme: "b",
                        callback: function () {
                            //提交作业的方法
                            _$.submit_work();
                            return true;
                        }
                    },
                    {
                        title: "再检查下",
                        theme: "a",
                        class: 'cancel',
                        callback: function () {
                            return true;
                        }
                    }
                ]
            });
            dialog.show();
        },
        getModel: function () {
            var _$ = this;
            $.each(this.topics, function () {
                this.done_time = _$.sigle_time["tip" + this.topicId];
            });
            //循环获取草稿纸
            this.$works.each(function (index, item) {
                var draw = $(item).data().draw;
                if (draw.hasDraw) {
                    var img = draw.getImg();
                    _$.topics[index].analytic = img;
                }
            });
            _$.doneModel.topics = _$.topics;
            var remark=$("#global_remark");
            if(remark.length>0){
                _$.doneModel.remark = remark.val();
            }
            _$.doneModel.allTime = parseInt(_$.getAllTime() / 1000);
            return _$.doneModel;
        },
        // 提交作业
        submit_work: function () {
            var _$=this;
            var datas = this.getModel();
            $.ajax({
                type: "post",
                url: url,
                dataType: "json",
                data: {
                    json: JSON.stringify(datas)
                },
                success: function (obj) {
                    var status=[["错误","no.png"],["正确","yes.png"],["批改中","not-mark.png"],["未做","not-do.png"]];
                    _$.hasSubmit=true;
                    var content = "<h3>提交成功!</h3>";
                    if (obj && obj.ajaxObject) {
                        var data = obj.ajaxObject.data;
                        if (data == 0 || data == "0") {
                            content = "<h3>此题已经提交成功，无需重复提交！</h3>";
                        }
                        //提交成功
                        var done=obj.doneDatas;
                        if(done&&done.length>0){
                           var table=$("<table class='result-table'>");
                           for(var i=0;i<done.length;i++){
                               var item=done[i];
                               var tr=$("<TR>");
                               table.append(tr);
                               tr.append("<td>"+(parseInt(item[0])+1)+"</td>");
                               if(item[2]==0){
                                   item[1]=2;
                               }
                               tr.append("<td><img width='16px' height='16px' src='"+host+"images/"+status[item[1]][1]+"'></td>");
                               tr.append("<td>"+item[3]+"秒</td>");
                           }
                           var div=$("<DIV>");
                            div.append(content);
                            div.append(table);
                            content=div;
                        }
                    } else {
                        content = "<h3>提交失败!</h3>";
                    }
                    var dialog = new Dialog();
                    dialog.create({
                        title: "提示信息",
                        content: content,
                        buttons: [
                            {
                                title: "返回作业列表",
                                theme: "b",
                                callback: function () {
                                    location.href = host+'mobile/work_list';
                                    return false;
                                }
                            }
                        ]
                    });
                    dialog.show();
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    alert(textStatus);
                }
            });
        },
        // 获取当前显示题目
        getCurrent: function () {
            return $(this.$works[this.page]);
        },
        // 显示下一个题目
        show_next_topic: function () {
            if (this.page < this.$works.length - 1) {
                this.page++;
                this.show_topic();
            } else {//没有题目了
                this.check_work();
            }
        },
        showMsg: function (msg) {
            $(".alert-msg h1").html(msg);
            $(".alert-msg").fadeIn(function () {
                setTimeout(function () {
                    $(".alert-msg").fadeOut();
                }, 1000);
            });
        },
        // 显示上一个题目
        show_prev_topic: function () {
            if (this.page > 0) {
                this.page--;
                this.show_topic();
            } else { //前面没有题目了

            }
        },
        // 显示一个题目
        show_topic: function () {
            $("#title-show-count").html(this.page + 1 + "/" + this.$works.length);
            this.ayalize();
            this.$works.hide();
            var page = $(this.$works[this.page]);
            page.show();
            //显示题目收藏
            this.fav(page);
        },
        /**
         * 收藏题目
         * @param topic_li
         */
        fav: function (topic_li) {
            var _$ = this;
            if (topic_li) {
                var tid = topic_li.attr("topic_id"); //题目ID
                Favorite.query(tid, function (sign) {
                    var dt = _$.getCurrent().find(".star");
                    var img = dt.find("img");
                    var text = $(dt).find(".star_text");
                    if (sign) { //存在
                        dt.attr("onclick", "javascript:Favorite.remove(" + sign + ","+tid+")");
                        $(img).attr("src", Favorite.img.active);
                        text.text("已收藏")
                    } else { //不存在
                        dt.attr("onclick", "javascript:Favorite.add(" + tid + ","+tid+")");
                        $(img).attr("src", Favorite.img.unactive);
                        text.text("点击收藏");
                    }
                });
            }
        },
        //时间统计相关
        _ctime: 0,
        c_start: 0,
        _cClock: {},
        gb_start: new Date().getTime(),
        setColck: function () {
            var tid = this.getCurrent().attr("topic_id"); //题目ID
            var time;
            if (typeof(this.sigle_time["tip" + tid]) != "undefined") { //已存在
                time = this.sigle_time["tip" + tid] + this._ctime;
                this.sigle_time["tip" + tid] = time;
            }
            else {
                this.sigle_time["tip" + tid] = this._ctime;
            }
        }, getAllTime: function () { //获取本次作业总耗时
            this.glob_time = new Date().getTime() - this.gb_start;
            return this.glob_time;
        },
        ayalize: function () {
            if (this._cClock) {
                this.setColck();
                this.clearColck();
            }
            this.c_start = new Date().getTime();
            this.clock(); //打开计时器
        },
        //计时器
        clock: function () {
            this._ctime = 1;
            var _$ = this;
            this._cClock = setTimeout(function () {
                _$.setColck();
                _$.clock();
            }, 1000);
        },
        //清除计时器
        clearColck: function () {
            this._ctime = 0;
            clearTimeout(this._cClock);
        },
        //新内容 ，加载多功能键盘相关
        keyboard:function(){
            $('body').keyboard({keyboard: 'random', plugin: 'form'});
        }
    };
})(jQuery, window, document);
var homework;
$(document).on("pageinit", "#do_work_page", function () {
    $("#do_work_page").die("pageinit"); //销毁事件
    homework = new HomeWork(); //初始化做作业
});