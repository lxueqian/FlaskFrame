# -*- coding: utf-8 -*-
from TeleFraudSys.pages_index.views import mod as pageIndexModule
from TeleFraudSys.event_base.views import mod as eventBaseModule
from TeleFraudSys.event_search.views import mod as eventSearchModule
from TeleFraudSys.behavior.views import mod as behaviorModule
from TeleFraudSys.cache import cache

from flask import Flask
import os

basedir = os.path.abspath(os.path.dirname(__file__))

def create_app():
    app = Flask(__name__)
    app.debug = True
    # cache.init_app(app)
    app.register_blueprint(pageIndexModule)
    app.register_blueprint(eventBaseModule)
    app.register_blueprint(eventSearchModule)
    app.register_blueprint(behaviorModule)

    return app

