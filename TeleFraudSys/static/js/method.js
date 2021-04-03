//判断空字典
function isEmptyObject(obj) {
    let t;
    for (t in obj)
        return !1;
    return !0
};
//匹配url字符
function checkStr(s) {
    let str = s.replace(/%/g, "%25").replace(/\+/g, "%2B").replace(/\s/g, "+"); // % + \s 3
    str = str.replace(/-/g, "%2D").replace(/\*/g, "%2A").replace(/\//g, "%2F"); // - * / 4
    str = str.replace(/\&/g, "%26").replace(/!/g, "%21").replace(/\=/g, "%3D"); // & ! = 5
    str = str.replace(/\?/g, "%3F").replace(/:/g, "%3A").replace(/\|/g, "%7C"); // ? : | 6
    str = str.replace(/\,/g, "%2C").replace(/\./g, "%2E").replace(/#/g, "%23"); // , . # 7
    return str;
};
//计算时间
function calculationTime(aa){
    aa=Number(aa);
    var date1 = new Date(),
        time1=date1.getFullYear()+"-"+(date1.getMonth()+1)+"-"+date1.getDate();//time1表示当前时间
    var date2 = new Date(date1);
    date2.setDate(date1.getDate()+aa);
    var month=date2.getMonth()+1<10?'0'+(date2.getMonth()+1):date2.getMonth()+1;
    var day=date2.getDate()<10?'0'+(date2.getDate()):date2.getDate();
    var time2 = date2.getFullYear()+"-"+month+"-"+day;
    return time2;
};
//fun_date(7);//7天后的日期
//fun_date(-7);//7天前的日期
//ajax请求
var public_ajax={
    call_request:function(ajax_method,url,callback) {
        $.ajax({
            type:ajax_method,
            url:url,
            async:true,
            //timeout:300,
            //data:{"name":"xm"},//传参数
            dataType:"json",
            success:callback,
            //cache:false,//不会从浏览器缓存中加载请求信息
            error:function (xhr,textStatus,errorThrown) {
                //请求失败执行的函数
                $('#promptInfor p').text('数据请求失败，请后台人员检查。');
                $('#promptInfor').modal('show');
            },
            global:false//是否触发全局请求,需要触发就是true,不需要false
        });
    },
};
function hasNoWord(k){
    if (k==''||k=='unknown'||k=='null'||!k){
        return '-';
    }else {
        return k;
    }
}
function hasNoNum(m) {
    if (m==''||m=='unknown'||m=='null'||!m){
        return 0;
    }else {
        return Number(m).toFixed(2);
    }
}