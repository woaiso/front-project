/**
 * Created by 收藏相关JS on 2014/5/14.
 */
var Favorite={
    busy:false,
    img:{
        unactive:host+"images/fav-star.png",
        active:host+"images/fav-star-active.png"
    },
    //查询题目是否存在收藏列表
    query:function(topic_id,callback){
        var _$=this;
        if(_$.busy)return;
        Favorite.array=Favorite.array?Favorite.array:{};
        if(Favorite.array["_"+topic_id])
            return;
        else
            Favorite.array['_'+topic_id]=1;
        $.ajax({
            url:"/mobile/favorite_query",
            data:{topic_id:topic_id},
            type:"POST",
            dataType:"JSON",
            success:function(result){
                _$.busy=false;
                if(result&&result.success){ //存在列表
                    callback(result.data);
                }else{ //不存在列表
                    callback();
                }
            },
            error:function(){

            }
        });
    },
    add:function(topic_id,ele){
        var _$=this;
        if(_$.busy)return;
        $.ajax({
            url:"/mobile/favorite_add",
            data:{topic_id:topic_id},
            type:"POST",
            dataType:"JSON",
            success:function(result){
                _$.busy=false;
                if(result&&result.success){ //添加成功
                    var star;
                    if(typeof(ele)!='undefined'){
                        star=$('[topic_id='+ele+']').find(".star");
                    }
                    star.attr("onclick",'Favorite.remove('+result.data+','+ele+')');
                    star.attr("fav_id",result.data);
                    var img=star.find("img");
                    $(img).attr("src",Favorite.img.active);
                    $(star).find(".star_text").text("已收藏");
                    //alert(result.msg);
                }else{ //添加失败
                    alert(result.msg);
                }
            },
            error:function(){

            }
        });
    },
    remove:function(fav_id,ele){
        var _$=this;
        if(_$.busy)return;
        $.ajax({
            url:"/mobile/favorite_remove",
            data:{fav_id:fav_id},
            type:"POST",
            dataType:"JSON",
            success:function(result){
                _$.busy=false;
                if(result) { //移除成功
                    var star;
                    var sign;
                    if(typeof(ele)!='undefined'){
                        star=$('[topic_id='+ele+']').find(".star");
                        sign=$('[topic_id='+ele+']').attr("topic_id")
                    }
                    star.attr("onclick",'Favorite.add('+sign+','+ele+')');
                    var img=star.find("img");
                    $(img).attr("src",Favorite.img.unactive);
                    $(star).find(".star_text").text("点击收藏");
                    //alert(result.msg);
                }
            },
            error:function(){

            }
        });
    }
};