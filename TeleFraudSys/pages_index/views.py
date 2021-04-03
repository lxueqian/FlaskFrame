#-*- coding:utf-8 -*-
import json
from flask import Blueprint, url_for, render_template, request
# from utils import extract_risky_callees, extract_rule_risky_callees

mod = Blueprint('pages_index', __name__, url_prefix='/pages_index')

@mod.route('/abnormalSequenceCaller/')
def abnormalSequenceCaller():
    return render_template('abnormal_sequence_caller.html')

@mod.route('/callerAnalysis/')
def callerAnalysis():
    return render_template('caller_analysis.html')

@mod.route('/calledAnalysis/')
def calledAnalysis():
    return render_template('called_analysis.html')
