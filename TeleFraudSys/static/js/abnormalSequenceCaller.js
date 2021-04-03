$(".form_datetime").datetimepicker({
    format: "yyyy-mm-dd",
    minView:2,
    autoclose: true,
    todayBtn: true,
    pickerPosition: "bottom-left"
});
$('.start').on('changeDate', function(ev){
    $('.end').datetimepicker('setStartDate',ev.date);
});
$('.end').on('changeDate', function(ev){
    $('.start').datetimepicker('setEndDate',ev.date);
});
//==========时间风险图========
function TimeRisk() {
    var time_risk_url='/RiskAlarm/RiskTimePic?Type=W&YFeature=TalkLength';
    public_ajax.call_request('GET',time_risk_url,time_risk);
}
TimeRisk();
//特征值选择
var yname='特征值1';
$(".featureChoose button").click(function () {
    yname=$(this).text();
    $(this).addClass('btn-primary').removeClass('btn-default').siblings('button').addClass('btn-default').removeClass('btn-primary');
});
var loadingOption = {
    text: '加载中...',
    color: '#fff',
    textColor: '#fff',
    maskColor: 'rgba(0,0,0,.1)',
};
function time_risk(data) {
    if(isEmptyObject(data)){
        $('#Boxplot').html('<p style="text-align: center;margin:50px 0;">暂无数据</p>');
        return false;
    }
    var myChart = echarts.init(document.getElementById('Boxplot'))
    myChart.showLoading(loadingOption)
    var chartOption = {
        title: {
            text: '',
        },
        tooltip: {
            trigger: 'axis'
        },
        legend: {
            data:['正常号码','异常号码']
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            name:'时间',
            type: 'category',
            boundaryGap: false,
            data: data['time'],
        },
        yAxis: {
            name:yname,
            type: 'value',
        },
        series: [
            {
                name:'正常号码',
                data:data['NormalNum'],
                type: 'line',
                smooth: true,
                areaStyle: {normal: {}}
            },
            {
                name:'异常号码',
                data:data['FraudNum'],
                type: 'line',
                smooth: true,
                areaStyle: {normal: {}}
            }
        ]
    };
    myChart.hideLoading();
    myChart.setOption(chartOption);
}

//=========高风险主叫列表=======
$('#sureSearch').on('click',function () {
    search_param();
    riskTable();
    // var than1=$('.opt-3').val();
    // var than2=$('.opt-4').val();
    // var than_num;
    // if (than1==''&&than2==''){
    //     than_num='';
    // }
    // else if(than1==''){
    //     if (than2 < 1 && than2 >= 0){
    //         than_num=than2+'_1';
    //     }else {
    //         $('#promptInfor p').text('请保证风险值在0~1');
    //         $('#promptInfor').modal('show');
    //         return false;
    //     }
    // }
    // else if(than2==''){
    //     if (than1>=0&&than1<1){
    //         than_num='0_'+than1;
    //     }else {
    //         $('#promptInfor p').text('请保证风险值在0~1');
    //         $('#promptInfor').modal('show');
    //         return false;
    //     }
    // }
    // else if (than1!=''&&than2!=''){
    //     if ((than1>=0&&than1<1)&&(than2<1&&than2>=0)&&(than2<=than1)){
    //         than_num=than2+'_'+than1;
    //     }else {
    //         $('#promptInfor p').text('请保证最大风险值比最小风险值大');
    //         $('#promptInfor').modal('show');
    //         return false;
    //     }
    // };

});

//高风险列表
$('#button1').on('click',function(argument) {
    $('#riskList').bootstrapTable('prevPage');
});
$('#button2').on('click',function(argument) {
    $('#riskList').bootstrapTable('selectPage',+$('#page').val());
});
$('#button3').on('click',function(argument) {
    $('#riskList').bootstrapTable('nextPage');
});
$('.timeBox button').on('click',function (){
    $(this).addClass('btn-primary').removeClass('btn-default').siblings('button').addClass('btn-default').removeClass('btn-primary');
    if($(this).prop('id') != 'timeBtn'){
        $('.diy-time').fadeOut(40);
    }else{
        $('.diy-time').show();
    }
    $(".form_datetime").val('');
});
//*[@id="riskList"]/thead/tr/th[1]

var table_obj;
function search_param(orderItem='OverallRisk',order='desc') {
    var start='',end='';
    if($('.timeBox button.btn-primary').attr("value")=='chooseTIME'){
        start=$(".start").val();
        end=$(".end").val();
    }else {
        start=calculationTime($('.timeBox button.btn-primary').attr("value"));
        end=calculationTime(-1);
    }
    var low=$(".opt-3").val(),high=$(".opt-4").val();
    table_obj={
        FromDate:start,
        ToDate:end,
        Ncaller:$(".opt-1").val(),
        NcallerArea:checkStr($(".opt-2").val()),
        RiskLow:low,
        RiskHigh:high,
        OrderItem:orderItem,
        Order:order,
    }
}
search_param();
function riskTable() {
    var riskTable_url='/RiskAlarm/Search';
    // $('#riskList').bootstrapTable('load',data);
    $("#riskList").bootstrapTable('destroy');
    $('#riskList').bootstrapTable({
        url:riskTable_url,
        method:'GET',
        // contentType: "application/x-www-form-urlencoded",//如果是post要加上这句话
        // data:data,
        catch:false,
        ortable: true,                     //是否启用排序
        //sortOrder: "desc",                   //排序方式
        sidePagination: "server",           //分页方式：client客户端分页，server服务端分页（*）
        pageNumber: 1,                      //初始化加载第一页，默认第一页,并记录
        pageSize: 5,                     //每页的记录行数（*）
        search: true,//是否搜索
        pagination: true,//是否分页
        pageList: [10,20,30],//分页步进值
        searchAlign: "left",
        searchOnEnterKey: false,//回车搜索
        showRefresh: false,//刷新按钮
        showColumns: false,//列选择按钮
        buttonsAlign: "right",//按钮对齐方式
        locale: "zh-CN",//中文支持
        detailView: false,
        showToggle:false,
        // sortName:'Num',
        queryParams: function (params) { // 请求服务器数据时发送的参数，可以在这里添加额外的查询参数，返回false则终止请求
            var temp = {
                page_size: params.limit, // 每页要显示的数据条数
                page_number: params.offset / params.limit + 1, // 每页显示数据的开始行号
            };
            var obj=Object.assign(temp,table_obj);
            return obj;
        },
        columns: [
            {
                title: "主叫号码",//标题
                field: "Num",//键名
                sortable: true,//是否可排序
                order: "desc",//默认排序方式
                align: "center",//水平
                valign: "middle",//垂直
                formatter: function (value,row) {
                    return hasNoWord(row.Num);
                }
            },
            {
                title: "所在地区",//标题
                field: "area",//键名
                sortable: true,//是否可排序
                order: "desc",//默认排序方式
                align: "center",//水平
                valign: "middle",//垂直
                formatter: function (value,row) {
                    return hasNoWord(row.area);
                }
            },
            {
                title: "总风险得分",
                field: "OverallRisk",
                sortable: true,//是否可排序
                align: "center",//水平
                valign: "middle",//垂直
                formatter: function (value,row) {
                    return hasNoNum(row.OverallRisk);
                }
            },
            {
                title: "攻击风险",
                field: "AttackRisk",
                sortable: true,
                align: "center",//水平
                valign: "middle",//垂直
                formatter: function (value,row) {
                    return hasNoNum(row.AttackRisk);
                }
            },
            {
                title: "序列风险",
                field: "SequentRisk",
                sortable: true,
                align: "center",//水平
                valign: "middle",//垂直
                formatter: function (value,row) {
                    return hasNoNum(row.SequentRisk);
                }
            },
            {
                title: "通联关系风险",
                field: "ConnectRisk",
                sortable: true,
                align: "center",//水平
                valign: "middle",//垂直
                formatter: function (value,row) {
                    return hasNoNum(row.ConnectRisk);
                }
            },
            {
                title: "语义风险",
                field: "LangRisk",
                sortable: true,
                align: "center",//水平
                valign: "middle",//垂直
                formatter: function (value,row) {
                    return hasNoNum(row.LangRisk);
                }
            },
            {
                title: "操作",
                field: "",
                sortable: true,
                align: "center",//水平
                valign: "middle",//垂直
                formatter: function (value,row) {
                    // return '<span title="详情" style="cursor: pointer;display: inline-block;margin-right: 20px;" onclick="lookDetails()"><i class="icon icon-file"></i></span>'+
                    return '<span title="查看主叫序列风险" style="cursor: pointer;display:inline-block;" onclick="lookRisk()"><i class="icon icon-asterisk"></i></span>';
                }
            },
        ],
    });
    $("#riskList thead tr th").click(function () {
        var sort_field=$(this).attr("data-field");
        var desc_asc= $(this).find('.sortable').hasClass('desc')?'desc':'asc';
        search_param(sort_field,desc_asc)
    });
};
riskTable();
function lookDetails() {
    $('#phoneNumber').modal('show');
}
function lookRisk() {
    window.open('/pages_index/callerAnalysis/');
}