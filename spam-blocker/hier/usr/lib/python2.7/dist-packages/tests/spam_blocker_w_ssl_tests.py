import unittest2
import time
import sys
import os
import subprocess
from jsonrpc import ServiceProxy
from jsonrpc import JSONRPCException
from uvm import Manager
from uvm import Uvm
import remote_control
from tests.spam_blocker_base_tests import SpamBlockerBaseTests
import test_registry
from global_functions import uvmContext

#
# Just extends the spam base tests to include SSL Inspector with default settings
#
class SpamBlockerTests(SpamBlockerBaseTests):

    @staticmethod
    def appName():
        return "spam-blocker"

    @staticmethod
    def shortName():
        return "spam-blocker"

    @staticmethod
    def displayName():
        return "Spam Blocker"

    # verify daemon is running
    def test_009_IsRunningAndSSL(self):
        appSSL = appSP = uvmContext.appManager().app(self.appNameSSLInspector())
        appSSL.start()
        result = subprocess.call("ps aux | grep spamd | grep -v grep >/dev/null 2>&1", shell=True)
        assert (result == 0)
        result = subprocess.call("ps aux | grep spamcatd | grep -v grep >/dev/null 2>&1", shell=True)
        assert ( result == 0 )

test_registry.registerApp("spam-blocker-w-ssl", SpamBlockerTests)
