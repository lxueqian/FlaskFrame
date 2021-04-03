# -*- coding: utf-8 -*-
from flask import Blueprint, render_template, request
import json
# from TeleFraudSys.event_base.utils import *

from elasticsearch import Elasticsearch
es = Elasticsearch("219.224.134.214:9202",timeout=1200)
import random

mod = Blueprint('event_base',__name__,url_prefix='/eventBase')

def get_event_class():
    query_body={
        "query":{
            "match_all":{}
        },
        "_source": "event_cluster_name",
        "size": 20000
    }
    result = es.search(index = 'event_attribute', doc_type = 'attribute', body = query_body)['hits']['hits']
    event_class_list=[]
    for r in result:
        event_class_list.append(r['_source']['event_cluster_name'])
    return event_class_list

@mod.route('/eventClass',methods=['POST','GET'])
def event_class(): 
    #返回所有事件类别
    return json.dumps(get_event_class()+['整体'],ensure_ascii=False)

@mod.route('/eventDisplay',methods=['POST','GET'])
def event_display(): 
    #事件的展示
    classname = request.args.get('classname')
    display_way = request.args.get('display_way')
    print(classname)
    if display_way == 'map':
        seq = ["内蒙古","广西","西藏","宁夏","新疆",
                "河北","山西","辽宁","吉林","黑龙江","江苏","浙江","安徽","福建","江西",
                "山东","河南","湖北","湖南","广东","海南","四川","贵州","云南","陕西",
                "甘肃","青海","台湾","北京","天津","上海","重庆","香港","澳门"]
        return_list=[]
        for name in seq:
            temp = {}
            temp['name'] = name
            temp['value'] = random.randint(1,200)
            return_list.append(temp)

        return json.dumps(return_list,ensure_ascii=False)

    elif display_way=='bar':
        time_dic={'时间':[]}
        for i in range(1,10):
            time_dic['时间'].append('2020-04-0'+str(i))
        for i in range(10,31):
            time_dic['时间'].append('2020-04-'+str(i))

        if classname=='整体':
            event_class_list=get_event_class()
            for e in event_class_list:
                time_dic[e]=[]
                for i in range(1,31):
                    time_dic[e].append(random.randint(1,50))
        else:
            time_dic['主叫数量']=[]
            time_dic['事件数量']=[]
            for i in range(1,31):
                t=random.randint(5,120)
                time_dic['主叫数量'].append(random.randint(5,120))
                time_dic['事件数量'].append(random.randint(1,t))

        return json.dumps(time_dic,ensure_ascii=False)

    else:
        return 'ERROR! YOU CAN ONLY CHOOSE map OR bar'