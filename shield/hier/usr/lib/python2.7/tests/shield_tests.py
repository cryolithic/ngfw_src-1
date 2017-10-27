import unittest2
import time
import sys
import pdb
import os

from jsonrpc import ServiceProxy
from jsonrpc import JSONRPCException
from global_functions import uvmContext
from datetime import datetime
from uvm import Manager
from uvm import Uvm
import remote_control
import test_registry
import global_functions

defaultRackId = 1
app = None
default_enabled = None
orig_netsettings = None

class ShieldTests(unittest2.TestCase):

    @staticmethod
    def appName():
        return "shield"

    @staticmethod
    def initialSetUp(self):
        global app,default_enabled, orig_netsettings
        if orig_netsettings == None:
            orig_netsettings = uvmContext.networkManager().getNetworkSettings()
        if (not uvmContext.appManager().isInstantiated(self.appName())):
            raise Exception('app %s already instantiated' % self.appName())
        app = uvmContext.appManager().app(self.appName())
        default_enabled = app.getSettings()['shieldEnabled']

    def setUp(self):
        pass

    def test_010_clientIsOnline(self):
        result = remote_control.is_online()
        assert (result == 0)

    def test_011_license_valid(self):
        assert(uvmContext.licenseManager().isLicenseValid(self.appName()))

    def test_020_shieldDetectsNmap(self):
        # enable logging of blocked settings
        netsettings = uvmContext.networkManager().getNetworkSettings()
        netsettings['logBlockedSessions'] = True
        netsettings['logBypassedSessions'] = True
        uvmContext.networkManager().setNetworkSettings(netsettings)

        settings = app.getSettings()
        settings['shieldEnabled'] = True
        app.setSettings(settings)

        start_time = datetime.now()
        result = remote_control.run_command("nmap -PN -sT -T5 --min-parallelism 15 -p10000-11000 1.2.3.4 2>&1 >/dev/null")
        assert (result == 0)

        events = global_functions.get_events('Shield','Blocked Session Events',None,1)
        assert(events != None)
        found = global_functions.check_events( events.get('list'), 5,
                                               'c_client_addr', remote_control.clientIP,
                                               min_date=start_time)
        assert( found )

    def test_021_shieldOffNmap(self):
        # enable logging of blocked settings
        netsettings = uvmContext.networkManager().getNetworkSettings()
        netsettings['logBlockedSessions'] = True
        netsettings['logBypassedSessions'] = True
        uvmContext.networkManager().setNetworkSettings(netsettings)

        settings = app.getSettings()
        settings['shieldEnabled'] = False
        app.setSettings(settings)

        start_time = datetime.now()
        result = remote_control.run_command("nmap -PN -sT -T5 --min-parallelism 15 -p10000-10100 1.2.3.5 2>&1 >/dev/null")
        assert (result == 0)

        events = global_functions.get_events('Shield','Blocked Session Events',None,1)
        assert(events != None)
        found = global_functions.check_events( events.get('list'), 5,
                                               'c_client_addr', remote_control.clientIP,
                                               's_server_addr', '1.2.3.5',
                                               min_date=start_time)
        assert( not found )

    @staticmethod
    def finalTearDown(self):
        global orig_netsettings
        # Restore original settings to return to initial settings
        # print "orig_netsettings <%s>" % orig_netsettings
        uvmContext.networkManager().setNetworkSettings(orig_netsettings)

        settings = app.getSettings()
        settings['shieldEnabled'] = default_enabled
        app.setSettings(settings)

        # sleep so the reputation goes down so it will not interfere with any future tests
        time.sleep(3)
        # shield is always installed, do not remove it
        

test_registry.registerApp("shield", ShieldTests)
