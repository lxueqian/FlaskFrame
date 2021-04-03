#_*_coding:utf-8 _*_
import sys 
import json
import time
import datetime

sys.append('../..')
reload(sys)
sys.setdefaultencoding('utf-8')

from collections import Counter
from elasticsearch import Elasticsearch
