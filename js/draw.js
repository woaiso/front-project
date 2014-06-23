/**
 * Created by YUN on 2014/5/16.
 * 增加画图板功能
 */

window.Draw = function () {
    var _$=this;
    this.history={
        redo_list: [],
        undo_list: [],
        saveState: function(canvas, list, keep_redo) {
            keep_redo = keep_redo || false;
            if(!keep_redo) {
                this.redo_list = [];
            }
            (list || this.undo_list).push(canvas.toDataURL());
        },
        undo: function(canvas, ctx) {
            this.restoreState(canvas, ctx, this.undo_list, this.redo_list);
        },
        redo: function(canvas, ctx) {
            this.restoreState(canvas, ctx, this.redo_list, this.undo_list);
        },
        restoreState: function(canvas, ctx,  pop, push) {
            if(pop.length) {
                this.saveState(canvas, push, true);
                var restore_state = pop.pop();
                var img=new Image();
                img.src=restore_state;
                img.onload = function() {
                    _$.clear();
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
                    if(pop&&pop.length>0)
                        _$.hasDraw=true;
                    else
                        _$.clear();
                }
            }
        }
    };
    this.colorTool={ //颜色选择插件
        ele:0,
        init:function(){
            var ele=this.ele=$("<span>");
            _$.tools.append(ele);
            ele.css("background",_$.color);
            ele.addClass("color-tool");
        }
    };
    this.$init();
    //this.colorTool.init();
    return this;
};
(function () {

    var $Event = {
        canvas: {},
        hasDraw: false,
        root: $("body"),
        color: "#000000",
        scale:1, //放大的倍数,
        top:0, //距离顶部的距离， 草稿纸翻页,
        maxPage:3,//创建3页草稿纸
        page:1, //当前草稿纸
        pageHeight:0,
        createUUID: function () {
            var d = "0123456789abcdef".split("");
            var b = [];
            var c;
            for (var a = 0; a < 32; a++) {
                c = Math.floor(Math.random() * 16);
                if (a == 16) {
                    b[a] = d[(c & 3) | 8]
                } else {
                    b[a] = d[c]
                }
            }
            b[12] = "4";
            return b.join("")
        },
        over: {
            width: $(document).width(),
            height: $(document).height(),
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            right: 0
        },
        $init: function () {
            var canvas_overlay = this.canvas_overlay = $("<DIV>");
            canvas_overlay.addClass("canvas_overlay");
            //操作区域
            var canvas_wrapper = this.canvas_wrapper = $("<div class='canvas_wrapper'>");
            canvas_wrapper.css(this.over).css({"zIndex":9,"overflow": "hidden"});
            //创建toolbar
            var _canvas = this.canvas = $("<canvas>");
            _canvas.attr({"id": this.createUUID(), width: this.over.width});
            canvas_overlay.css(this.over).css({"zIndex":8});
            _canvas.css(this.over).css("zIndex", 9);
            canvas_wrapper.append(_canvas);

            //添加一个工具栏
            var tools = this.tools = $("<DIV>");
            tools.addClass("canvas_tools");
            canvas_wrapper.append(tools);
            //添加工具操作
            this.createTool("清除", function (_$) {
                _$.clear();
            });
            this.createTool("完成", function (_$) {
                _$.hide();
            });
            //添加撤销和前进按钮
//            this.createTool("撤销", function (_$) {
//                _$.history.undo(_$.canvas,_$.context);
//            });
//            this.createTool("前进", function (_$) {
//                _$.history.redo(_$.canvas,_$.context);
//            });
            this.createTool("上一页", function (_$) {
                 if(_$.page>1){
                     _$.page=_$.page-1;
                     _$.top=_$.top+_$.pageHeight;
                     $(_$.canvas).animate({"top":_$.top},100);
                 }
            });
            this.createTool("下一页", function (_$) {
                if(_$.page<_$.maxPage){
                    _$.top=_$.top-_$.pageHeight;
                    $(_$.canvas).animate({"top":_$.top},100);
                    _$.page=_$.page+1;
                }
            });
//            this.createTool("放大", function (_$) {
//                _$.scaleUp();
//            });
//            this.createTool("缩小", function (_$) {
//                _$.scaleDown();
//            });
            this.hide();
            this.root.append(canvas_overlay).append(canvas_wrapper);
            this.pageHeight=(this.over.height - tools.height());
            var _cheight = this.pageHeight*this.maxPage;
            _canvas.css("height", _cheight).attr("height", _cheight);
            // get the canvas element and its context
            this.canvas = document.getElementById(_canvas.attr("id"));
            this.context = this.canvas.getContext('2d');
            this.context.lineJoin="round"; //线条更平滑
            var isSupportTouch = "ontouchend" in document ? true : false;
            if (isSupportTouch) {
                this.$drawMobile();
            } else {
                this.$drawPc();
            }
            this.drawPageNo();
//            this.drawBoard();
        },
        drawPageNo:function(){ //画草稿纸序号
            for(var i=0;i<this.maxPage;i++){
                this.drawNo(i);
            }
        },
        drawNo:function(num){
            var ctx=this.context;
            var r=20;
            var wHeight=$(window).height()-this.tools.height();
            ctx.fillStyle="#27D0A7";
            ctx.beginPath();
            ctx.arc(r+5,(num+1)*wHeight-r-5,r,0,Math.PI*2,true);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle="#FFFFFF";
            ctx.font = "30px Arial";
            ctx.fillText(num+1,r-4,(num+1)*wHeight-13);
        },
        drawBoard: function () {
            var context=this.context;
            //grid width and height
            var bw = this.canvas.width;;
            var bh = this.canvas.height;
            //padding around grid
            var p = -1;
            //size of canvas
            for (var x = 0; x <= bw; x += 40) {
                context.moveTo(0.5 + x + p, p);
                context.lineTo(0.5 + x + p, bh + p);
            }
            for (var x = 0; x <= bh; x += 40) {
                context.moveTo(p, 0.5 + x + p);
                context.lineTo(bw + p, 0.5 + x + p);
            }
            context.strokeStyle = "#555";
            context.stroke();
        },
        $drawMobile: function () {
            /***手持设备操作方法***/
            var context = this.context;
            context.lineWidth = 1;
            this.context.strokeStyle = this.color;
            var _$ = this;
            // create a drawer which tracks touch movements
            var drawer = {
                isDrawing: false,
                touchstart: function (coors) {
                    _$.hasDraw = true;
                    context.beginPath();
                    context.moveTo(coors.x, coors.y);
                    _$.history.saveState(_$.canvas);
                    this.isDrawing = true;
                },
                touchmove: function (coors) {
                    if (this.isDrawing) {
                        context.lineTo(coors.x, coors.y);
                        context.stroke();
                    }
                },
                touchend: function (coors) {
                    if (this.isDrawing) {
                        this.touchmove(coors);
                        this.isDrawing = false;
                    }
                }
            };
            // create a function to pass touch events and coordinates to drawer
            function draw(event) {
                // get the touch coordinates
                if (event.targetTouches && event.targetTouches.length > 0) {
                    var coors = {
                        x: event.targetTouches[0].pageX,
                        y: event.targetTouches[0].pageY+ document.body.scrollTop - _$.canvas.offsetTop
                    };
                    // pass the coordinates to the appropriate handler
                    drawer[event.type](coors);
                }
            }

            // attach the touchstart, touchmove, touchend event listeners.
            this.canvas.addEventListener('touchstart', draw, false);
            this.canvas.addEventListener('touchmove', draw, false);
            this.canvas.addEventListener('touchend', draw, false);
            document.body.addEventListener('touchmove', function (event) {
                if (event.target.tagName == "CANVAS") {
                    event.preventDefault();
                }
            }, true);
        },
        $drawPc: function () {
            /****PC操作方法****/
            var canvas = this.canvas, ctx = this.context, flag = false,
                prevX = 0,
                currX = 0,
                prevY = 0,
                currY = 0,
                dot_flag = false;
            var _$ = this;
            var x = this.color,
                y = 2;

            function init() {
                w = canvas.width;
                h = canvas.height;
                canvas.addEventListener("mousemove", function (e) {
                    findxy('move', e)
                }, false);

                canvas.addEventListener("mousedown", function (e) {
                    _$.hasDraw = true;
                    findxy('down', e);
                }, false);
                canvas.addEventListener("mouseup", function (e) {
                    findxy('up', e)
                }, false);

                canvas.addEventListener("mouseout", function (e) {
                    findxy('out', e)
                }, false);
            }

            function draw() {
                ctx.beginPath();
                ctx.moveTo(prevX, prevY);
                ctx.lineTo(currX, currY);
                ctx.strokeStyle = x;
                ctx.lineWidth = y;
                ctx.stroke();
                ctx.closePath();
            }
            function findxy(res, e) {
                if (res == 'down') {
                    prevX = currX;
                    prevY = currY;
                    if (e.pageX != undefined && e.pageY != undefined) {
                        currX = e.pageX;
                        currY = e.pageY+ document.body.scrollTop - canvas.offsetTop;
                    } else {
                        currX = e.clientX + document.body.scrollLeft + canvas.offsetLeft;
                        currY = e.clientY + document.body.scrollTop - canvas.offsetTop;
                    }

                    flag = true;
                    dot_flag = true;
                    if (dot_flag) {
                        ctx.beginPath();
                        ctx.fillStyle = x;
                        ctx.fillRect(currX, currY, 2, 2);
                        ctx.closePath();
                        dot_flag = false;
                    };
                    _$.history.saveState(_$.canvas);
                }
                if (res == 'up' || res == "out") {
                    flag = false;
                }
                if (res == 'move') {
                    if (flag) {
                        prevX = currX;
                        prevY = currY;
                        currX = e.clientX + document.body.scrollLeft + canvas.offsetLeft;
                        currY = e.clientY + document.body.scrollTop - canvas.offsetTop;
                        draw();
                    }
                }
            }
            init();
        },
        createTool: function (name, callback) {
            var tool = $("<a>");
            tool.text(name);
            this.tools.append(tool);
            var _$ = this;
            tool.on("click tap", function () {
                callback(_$);
                return false;
            });
        },
        clear: function () {
            this.hasDraw = false;
            //清除当前区域的内容
            var y0=(this.page-1)*this.pageHeight
            var y1=(this.page)*this.pageHeight
            this.context.clearRect(0, y0, this.canvas.width, y1);
            this.drawNo(this.page-1);
        },
        hide: function () {
            this.canvas_overlay.hide();
            this.canvas_wrapper.hide();
            if (this.finishcallback)
                this.finishcallback();
        },
        show: function (callback) {
            this.canvas_overlay.show();
            this.canvas_wrapper.show();
            if (callback)
                this.finishcallback = callback;
        },
        getImg: function () {
            return this.canvas.toDataURL();
        },
        scaleUp: function () { //放大
            //获取到图像；
            var src = this.getImg();
            this.clear();
            var bei=this.scale*1.2;
            var img = new Image();
            img.src = src;
            _$=this;
            var canvas=this.canvas;
            img.onload = function() {
                _$.clear();
                _$.context.drawImage(img, 0, 0, canvas.width, canvas.height, 0, 0, canvas.width*bei, canvas.height*bei);
            }
        },
        scaleDown: function () { //缩小
            //获取到图像；
            var src = this.getImg();
            this.clear();
            var bei=this.scale/1.2;
            var img = new Image();
            img.src = src;
            _$=this;
            var canvas=this.canvas;
            img.onload = function() {
                _$.clear();
                _$.context.drawImage(img, 0, 0, canvas.width, canvas.height, 0, 0, canvas.width*bei, canvas.height*bei);
            }
        }
    };
    Draw.prototype = $Event;
})(Draw.prototype = this);
//拍照模块
var Camera = function () {
    var Event = {
        show: function () {

        },
        zip: function () { //压缩图片

        }
    };
    Camera.prototype = Event;
};
(function () {
    var btns = $("[data-toggle='canvas']");
    $.each(btns, function () {
        var draw = new Draw();
        $(this).data("draw", draw);
        $(this).on("click tap", function () {
            var _btn = this;
            $(this).data().draw.show(function () {
                if (this.hasDraw) {
                    $(_btn).text("已写答题卡");
                } else {
                    $(_btn).text("答题卡");
                }
            });
        });
    });
})(Camera.prototype = this);

