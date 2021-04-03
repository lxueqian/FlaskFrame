var network_url='/Vcaller/VcallerCallNetwork';
public_ajax.call_request('GET',network_url,network);
var loadingOption = {
    text: '加载中...',
    color: '#fff',
    textColor: '#fff',
    maskColor: 'rgba(0,0,0,.1)',
}
function network(data){
    if(isEmptyObject(data)){
        $('#Boxplot').html('<p style="text-align: center;margin:50px 0;">暂无数据</p>');
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
    });
    var myChart = echarts.init(document.getElementById('Boxplot'));
    var option = {
        title:{
            text:'',
            left:'center'
        },
        backgroundColor:'transparent',
        tooltip: {},
        animationDuration: 3000,
        animationEasingUpdate: 'quinticInOut',
        series: [{
            name: '0088231232',
            type: 'graph',
            // height:'70%',
            layout: 'force',
            force: {
                repulsion: 300,
                edgeLength: 250,
            },
            data:node,
            links: data['link'],
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
                    width:5
                }
            }
        }]
    };
    myChart.setOption(option);
    myChart.on('click',function (params) {
        var line=params.dataType;
        if(line=='edge'){
            var info_url='/Vcaller/VcallerCallInfo?Ncaller=17831101104&Vcaller=17892849223&CallDate=2019-01-23';
            public_ajax.call_request('GET',info_url,info);
        }
    })
};
function info(data) {
    var str='';
    data.forEach(function (item,index) {
        var black=item.BlackSheet=="No"?"否":"是";
        str+='<div style="background:#eee;margin-top:5px;padding:15px 5px 0 30px;">' +
                '<p style="font-size:16px;font-weight:700;margin-bottom:5px;">通话信息-'+(index+1)+'：</p>'+
                '<span>主叫号码：<b class="n-1">'+item.Ncaller+'</b></span>' +
                '<span>被叫号码：<b class="n-2">'+item.Vcaller+'</b></span>' +
                '<span>开始时间：<b class="n-3">'+item.CallStartTime+'</b></span>' +
                '<span>结束时间：<b class="n-4">'+item.CallEndTime+'</b></span>' +
                '<span>通话时长：<b class="n-5">'+item.TalkLength+'</b></span>' +
                '<span>主叫地：<b class="n-6">'+item.NcallerArea+'</b></span>' +
                '<span>被叫地：<b class="n-7">'+item.VcallerArea+'</b></span>' +
                '<span>诈骗概率：<b class="n-8">'+item.FraudProb+'</b></span>' +
                '<span>黑名单：<b class="n-9">'+black+'</b></span>' +
            '</div>'
    });
    $("#totalNum").html(str);
    $(".block-0").show();
}