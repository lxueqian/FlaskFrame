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
//基本信息
function inforBase() {
    var infor_url='/Ncaller/NcallerFeature?FromDate=2019-01-22&ToDate=2019-01-23';
    public_ajax.call_request('GET',infor_url,phoneInfor);
}
inforBase();
function phoneInfor(data){
    $("#totalNum .n-1").text(data['Ncaller']);
    $("#totalNum .n-2").text(data['CallGap']);
    $("#totalNum .n-3").text(data['talklength']);
    $("#totalNum .n-4").text(data['discreCallGap']);
    $("#totalNum .n-5").text(data['activeday']);
    $("#totalNum .n-6").text(data['Ncaller']);
    $("#totalNum .n-7").text(data['TalkLengthradio']);
    $("#totalNum .n-8").text(data['AvgRisk']);
}
//箱线图
function boxPlot() {
    var boxPlot_url='/Ncaller/NcallerCallRiskPic?Type=D';
    public_ajax.call_request('GET',boxPlot_url,boxPlotChart);
}
boxPlot();
function boxPlotChart(data){
    console.log(data)
    if(isEmptyObject(data)){
        $('#Boxplot').html('<p style="text-align: center;margin:50px 0;">暂无数据</p>');
        return false;
    }
    var loadingOption = {
        text: '加载中...',
        color: '#fff',
        textColor: '#fff',
        maskColor: 'rgba(0,0,0,.1)',
    }
    var myChart = echarts.init(document.getElementById('Boxplot'))
    myChart.showLoading(loadingOption)
    var data = echarts.dataTool.prepareBoxplotData([
        data['data']
    ], {
        layout: 'vertical'
    });
    console.log(data)
    var chartOption = {
        title: {
            text: '',
            left: 'center',
        },
        tooltip: {
            trigger: 'item',
            axisPointer: {
                type: 'shadow'
            }
        },
        grid: {
            left: '6%',
            right: '5%',
            bottom: '5%',
            top:'3%',
        },
        xAxis: {
            name:'时间',
            type: 'category',
            data: data['axisData'],
            boundaryGap: true,
            // nameGap: 20,
            splitArea: {
                show: false,
            },
            axisLabel: {
                // formatter: 'expr {value}',
                // formatter: function (param) {
                //     return Number(param)+1;
                // },
            },
            splitLine: {
                show: false
            }
        },
        yAxis: {
            type: 'value',
            // name: 'km/s minus 299,000',
            name: '风险值',
            splitArea: {
                show: true
            },
        },
        series: [
            {
                name: 'boxplot',
                type: 'boxplot',
                data: data.boxData,
                tooltip: {
                    formatter: function (param) {
                        return [
                            'Experiment ' + param.name + ': ',
                            'upper: ' + param.data[5],
                            'Q3: ' + param.data[4],
                            'median: ' + param.data[3],
                            'Q1: ' + param.data[2],
                            'lower: ' + param.data[1]
                        ].join('<br/>');
                    }
                }
            },
            {
                name: 'outlier',
                type: 'scatter',
                data: data.outliers
            }
        ]
    };
    myChart.hideLoading();
    myChart.setOption(chartOption);
    myChart.on('click',function(param){
        var t = param.name;
        var cloud_url='/Ncaller/NcallerCallText?time='+t;
        public_ajax.call_request('GET',cloud_url,cloudFnc);
        net_chart('startTime-box','开始时间',t,'NcallerCallNetwork_Before');
        setTimeout(function () {
            net_chart('endTime-box','结束时间',t,'NcallerCallNetwork_After');
            $('div.chartsBox').show();
        },500);
    })
};
var divID,titleText;
function net_chart(div,title,x_time,mid) {
    divID=div,titleText=title;
    var netWork_url='/Ncaller/'+mid+'?time='+x_time;
    public_ajax.call_request('GET',netWork_url,graphChart);
}
var backgroundColor = 'rgb(232, 232, 232)';
//关系图
function graphChart(data){
    if(isEmptyObject(data)){
        $('#'+divID).html('<p style="text-align: center;margin:50px 0;">暂无数据</p>');
        return false;
    }
    var node=[],categories=[];
    $.each(data['node'],function (index,item) {
        node.push({
            "name": item,
            "value": 5,
            "symbolSize": 20,
            "category": item,
            "draggable": "true"
        });
        categories.push({name:item})
    })
    var myChart = echarts.init(document.getElementById(divID));
    var option = {
        backgroundColor:backgroundColor,
        title:{
            text:titleText,
            left:'center'
        },
        tooltip: {},
        animationDuration: 3000,
        animationEasingUpdate: 'quinticInOut',
        series: [{
            name: '',
            type: 'graph',
            // height:'70%',
            // top:120,
            layout: 'force',
            force: {
                repulsion: 50,
                edgeLength: 100,
            },
            data: node,
            links:data['link'],
            categories: categories,
            focusNodeAdjacency: true,
            roam: true,
            label: {
                normal: {
                    show: true,
                    position: 'top',
                }
            },
            lineStyle: {
                normal: {
                    color: 'source',
                    curveness: 0,
                    type: "solid",
                    width:2
                }
            }
        }]
    };
    myChart.setOption(option);
}
//词云图
function cloudFnc(data){
    if(data.length==0){
        $('#keyWord-box').html('<p style="text-align: center;margin:50px 0;">暂无数据</p>');
        return false;
    }
    var wordList=[];
    data.forEach(function (item,index) {
        wordList.push({name:item.word,value:item.value});
    })
    var myChart = echarts.init(document.getElementById('keyWord-box'));
    var option_cloud = {
        backgroundColor:backgroundColor,
        title: {
            text: '关键词云',
            left: 'center',
        },
        tooltip: {
            show: true
        },
        series: [{
            name: '',
            type: 'wordCloud',
            size: ['80%', '80%'],
            textRotation : [0,0],
            rotationRange: [0, 0],
            textPadding: 0,
            // autoSize: {
            //     enable: true,
            //     minSize: 14
            // },
            textStyle : {
                normal : {
                    fontFamily:'sans-serif',
                    color : function() {
                        return 'rgb('
                                + [ Math.round(Math.random() * 160),
                                        Math.round(Math.random() * 160),
                                        Math.round(Math.random() * 160) ]
                                        .join(',') + ')';
                        // return 'rgb('
                        //     + [ Math.round(Math.random() * 360),
                        //         Math.round(Math.random() * 360),
                        //         Math.round(Math.random() * 360) ]
                        //         .join(',') + ')';
                    }
                },
                emphasis : {
                    shadowBlur : 5,  //阴影距离
                    shadowColor : '#333'  //阴影颜色
                }
            },
            data:wordList
        }]
    };
    // 使用刚指定的配置项和数据显示图表。
    myChart.setOption(option_cloud);
}
//==========表格
//按钮选择
$('.timeBox button').on('click',function (){
    $(this).addClass('btn-primary').removeClass('btn-default').siblings('button').addClass('btn-default').removeClass('btn-primary');
    if($(this).prop('id') != 'timeBtn'){
        $('.diy-time').fadeOut(40);
    }else{
        $('.diy-time').show();
    }
    $(".form_datetime").val('');
})
$(".timeChoose button").click(function () {
    $(this).addClass('btn-primary').removeClass('btn-default').siblings('button').addClass('btn-default').removeClass('btn-primary');
});
var table_obj;
function search_param() {
    var start='',end='';
    if($('.timeBox button.btn-primary').attr("value")=='chooseTIME'){
        start=$(".start").val();
        end=$(".end").val();
    }else {
        start=calculationTime(checkStr($('.timeBox button.btn-primary').attr("value")));
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
        OrderItem:'OverallRisk',
        Order:'desc',
    }
}
search_param();
function tableModalFnc(){
    var riskTable_url='/Ncaller/NcallerCallHistory';
    $("#tableModal-content").bootstrapTable('destroy');
    $('#tableModal-content').bootstrapTable({
        url:riskTable_url,
        method:'GET',
        // contentType: "application/x-www-form-urlencoded",//如果是post要加上这句话
        catch:false,
        ortable: true,                     //是否启用排序
        // sortOrder: "desc",                   //排序方式
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
                field: "Ncaller",//键名
                sortable: true,//是否可排序
                order: "desc",//默认排序方式
                align: "center",//水平
                valign: "middle",//垂直
                formatter: function (value,row) {
                    return hasNoWord(row.Ncaller);
                }
            },
            {
                title: "被叫号码",//标题
                field: "Vcaller",//键名
                sortable: true,//是否可排序
                order: "desc",//默认排序方式
                align: "center",//水平
                valign: "middle",//垂直
                formatter: function (value,row) {
                    return hasNoWord(row.Vcaller);
                }
            },
            {
                title: "开始时间",
                field: "CallStartTime",
                sortable: true,//是否可排序
                align: "center",//水平
                valign: "middle",//垂直
                formatter: function (value,row) {
                    return hasNoWord(row.CallStartTime);
                }
            },
            {
                title: "结束时间",
                field: "CallEndTime",
                sortable: true,
                align: "center",//水平
                valign: "middle",//垂直
                formatter: function (value,row) {
                    return hasNoWord(row.CallEndTime);
                }
            },
            {
                title: "通话时长",
                field: "TalkLength",
                sortable: true,
                align: "center",//水平
                valign: "middle",//垂直
                formatter: function (value,row) {
                    return hasNoNum(row.TalkLength);
                }
            },
            {
                title: "主叫地",
                field: "NcallerArea",
                sortable: true,
                align: "center",//水平
                valign: "middle",//垂直
                formatter: function (value,row) {
                    return hasNoWord(row.NcallerArea);
                }
            },
            {
                title: "被叫地",
                field: "VcallerArea",
                sortable: true,
                align: "center",//水平
                valign: "middle",//垂直
                formatter: function (value,row) {
                    return hasNoWord(row.VcallerArea);
                }
            },
            {
                title: "诈骗概率",
                field: "FraudProb",
                sortable: true,
                align: "center",//水平
                valign: "middle",//垂直
                formatter: function (value,row) {
                    return hasNoNum(row.FraudProb);
                }
            },
            {
                title: "黑名单",
                field: "BlackSheet",
                sortable: true,
                align: "center",//水平
                valign: "middle",//垂直
                formatter: function (value,row) {
                    var black;
                    if (row.BlackSheet=='No'){
                        black='否';
                    }else {
                        black='是';
                    }
                    return black;
                }
            },
            {
                title: "操作",
                field: "",
                sortable: true,
                align: "center",//水平
                valign: "middle",//垂直
                formatter: function (value,row) {
                    return '<span title="通话记录" style="cursor: pointer;display: inline-block;margin-right: 20px;" onclick="lookDetails()"><i class="icon icon-file"></i></span>'+
                        '<span title="查看被叫序列风险" style="cursor: pointer;display:inline-block;" onclick="lookRisk()"><i class="icon icon-asterisk"></i></span>';
                }
            },

        ],
    });
    $("#tableModal-content thead tr th").click(function () {
        var sort_field=$(this).attr("data-field");
        var desc_asc= $(this).find('.sortable').hasClass('desc')?'desc':'asc';
        search_param(sort_field,desc_asc)
    });
}
tableModalFnc();
function lookRisk() {
    window.open('/pages_index/calledAnalysis/');
}
function lookDetails() {
    $('#phoneNumber').modal('show');
}

