import unittest2
import time
import sys
import pdb
import os
import subprocess

from jsonrpc import ServiceProxy
from jsonrpc import JSONRPCException
from global_functions import uvmContext
from uvm import Manager
from uvm import Uvm
from datetime import datetime
import remote_control
import test_registry
import global_functions

default_policy_id = 1
appSettings = None
app = None

#pdb.set_trace()

def create_signature( gid = "1", sid = "1999999", classtype="attempted-admin", category="app-detect",  msg="Msg", log=True, block=False, 
    action="alert", type="tcp", source_ip="any", source_port="any", dest_ip="any", dest_port="any"):
    if block:
        action = "drop"
    else:
        action = "alert"
    signature =   action + " " + type + " " + source_ip + " " + source_port + " -> " + dest_ip + " " + dest_port + " (" + \
            "msg:\"" + msg + "\";" + \
            "classtype:" + classtype + ";" + \
            "sid:" + sid + ";" + \
            "gid:" + gid + ";" + \
            "classtype:" + classtype + ";" + \
            "category:" + category + ";" +  \
            "content:\"matchme\";nocase;)"
    return signature


class IntrusionPreventionTests(unittest2.TestCase):

    @staticmethod
    def appName():
        return "intrusion-prevention"

    @staticmethod
    def vendorName():
        return "Untangle"

    @staticmethod
    def initialSetUp(self):
        global app, appSettings
        if (uvmContext.appManager().isInstantiated(self.appName())):
            raise Exception('app %s already instantiated' % self.appName())
        app = uvmContext.appManager().instantiate(self.appName(), default_policy_id)
        app.start()
        appSettings = app.getSettings()

    def setUp(self):
        pass
            
    def test_010_clientIsOnline(self):
        result = remote_control.is_online()
        assert (result == 0)

    def test_011_license_valid(self):
        assert(uvmContext.licenseManager().isLicenseValid(self.appName()))

    def test_050_functional_tcp_log(self):
        global app, appSettings
        appSettings['signatures']['list'].append(create_signature( gid = "1", 
                                                sid = "1999999", 
                                                classtype="attempted-admin", 
                                                category="app-detect",  
                                                msg="CompanySecret", 
                                                log=True, 
                                                block=False, 
                                                action="alert", 
                                                type="tcp"))
        app.setSettings(appSettings)

        startTime = datetime.now()
        loopLimit = 10
        result = 4 # Network failure
        # If there is a network error with wget, retry up to ten times.
        while (result == 4 and loopLimit > 0):
            time.sleep(1)
            result = remote_control.run_command("wget -q -O /dev/null -t 1 --timeout=3 http://test.untangle.com/CompanySecret")

        app.forceUpdateStats()
        events = global_functions.get_events('Intrusion Prevention','All Events',None,1)
        found = global_functions.check_events( events.get('list'), 5,
                                               'msg', "CompanySecret",
                                               'blocked', False,
                                               min_date=startTime)
        assert(found)

    @staticmethod
    def finalTearDown(self):
        global app
        if app != None:
            uvmContext.appManager().destroy( app.getAppSettings()["id"] )
            app = None

test_registry.registerApp("intrusion-prevention", IntrusionPreventionTests)
