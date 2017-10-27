import unittest2
import os
import re
import urllib
import sys
reload(sys)
sys.setdefaultencoding("utf-8")

from jsonrpc import ServiceProxy
from jsonrpc import JSONRPCException
from uvm import Manager
from uvm import Uvm
import test_registry
import remote_control
import global_functions
from global_functions import uvmContextLongTimeout
import pdb

app = None
appWeb = None
newCompanyName = "Some new long name"
newURL = "https://test.untangle.com/cgi-bin/myipaddress.py"
newContactName = "Skynet"
newContactEmail = "skynet@untangle.com"

defaultRackId = 1

def setDefaultBrandingManagerSettings():
    appData = {
        "javaClass": "com.untangle.app.branding_manager.BrandingManagerSettings",
        "companyName": "Untangle",
        "companyUrl": "http://untangle.com/",
        "contactName": "your network administrator",
        "contactEmail": None,
        "bannerMessage": None,
        "defaultLogo": True
    }
    app.setSettings(appData)
    
class BrandingManagerTests(unittest2.TestCase):
    
    @staticmethod
    def appName():
        return "branding-manager"

    @staticmethod
    def appNameWeb():
        return "web-filter"

    @staticmethod
    def vendorName():
        return "Untangle"

    @staticmethod
    def initialSetUp(self):
        global appData, app, appWeb
        if (uvmContextLongTimeout.appManager().isInstantiated(self.appName())):
            print "ERROR: App %s already installed" % self.appName()
            raise Exception('app %s already instantiated' % self.appName())
        app = uvmContextLongTimeout.appManager().instantiate(self.appName(), defaultRackId)
        appData = app.getSettings()
        if (uvmContextLongTimeout.appManager().isInstantiated(self.appNameWeb())):
            print "ERROR: App %s already installed" % self.appNameWeb()
            raise Exception('app %s already instantiated' % self.appNameWeb())
        appWeb = uvmContextLongTimeout.appManager().instantiate(self.appNameWeb(), defaultRackId)

    def setUp(self):
        pass

    # verify client is online
    def test_010_clientIsOnline(self):
        result = remote_control.is_online()
        assert (result == 0)

    def test_011_license_valid(self):
        assert(uvmContextLongTimeout.licenseManager().isLicenseValid(self.appName()))

    def test_020_changeBranding(self):
        global app, appWeb, appData
        appData['companyName'] = newCompanyName;
        appData['companyUrl'] = newURL;
        appData['contactName'] = newContactName;
        appData['contactEmail'] = newContactEmail;
        app.setSettings(appData)
        # test blockpage has all the changes
        result = remote_control.run_command("wget -q -O - \"$@\" www.playboy.com",stdout=True)

        # Verify Title of blockpage as company name
        myRegex = re.compile('<title>(.*?)</title>', re.IGNORECASE|re.DOTALL)
        matchText = myRegex.search(result).group(1)
        matchText = matchText.split("|")[0]
        matchText = matchText.strip()
        print "looking for: \"%s\""%newCompanyName
        print "in :\"%s\""%matchText
        assert(newCompanyName in matchText)

        # Verify email address is in the contact link
        myRegex = re.compile('mailto:(.*?)\?', re.IGNORECASE|re.DOTALL)
        matchText = myRegex.search(result).group(1)
        matchText = matchText.strip()
        print "looking for: \"%s\""%newContactEmail
        print "in :\"%s\""%matchText
        assert(newContactEmail in matchText)

        # Verify contact name is in the mailto
        myRegex = re.compile('mailto:.*?>(.*?)<\/a>', re.IGNORECASE|re.DOTALL)
        matchText = myRegex.search(result).group(1)
        matchText = matchText.strip()
        print "looking for: \"%s\""%newContactName
        print "in :\"%s\""%matchText
        assert(newContactName in matchText)

        # Verify URL is in the Logo box
        myRegex = re.compile('<a href\=\"(.*?)\"><img .* src\=\"\/images\/BrandingLogo', re.IGNORECASE|re.DOTALL)
        matchText = myRegex.search(result).group(1)
        print "looking for: \"%s\""%newURL
        print "in :\"%s\""%matchText
        assert(newURL in matchText)
       
        # Check login page for branding
        internalAdmin = None
        # print "IP address <%s>" % internalAdmin
        result = remote_control.run_command("wget -q -O - \"$@\" " + global_functions.get_http_url() ,stdout=True)
        # print "page is <%s>" % result
        # Verify Title of blockpage as company name
        myRegex = re.compile('<title>(.*?)</title>', re.IGNORECASE|re.DOTALL)
        matchText = myRegex.search(result).group(1)
        matchText = matchText.split("|")[0]
        matchText = matchText.strip()
        print "looking for: \"%s\""%newCompanyName
        print "in :\"%s\""%matchText
        assert(newCompanyName in matchText)

    def test_021_changeBranding_bannerMessage_added(self):
        global app, appWeb, appData
        appData['companyName'] = newCompanyName;
        appData['companyUrl'] = newURL;
        appData['contactName'] = newContactName;
        appData['contactEmail'] = newContactEmail;
        appData['bannerMessage'] = "A regulation banner requirement containing a mix of text including <b>html</b> and\nmultiple\nlines"
        app.setSettings(appData)

        internalAdmin = None
        result = remote_control.run_command("wget -q -O - \"$@\" " + global_functions.get_http_url() ,stdout=True)
        myRegex = re.compile('.*A regulation banner requirement containing a mix of text including <b>html<\/b> and<br\/>multiple<br\/>lines.*', re.DOTALL|re.MULTILINE)
        if re.match(myRegex,result):
            assert(True)
        else:
            assert(False)
        
    def test_022_changeBranding_bannerMessage_removed(self):
        global app, appWeb, appData
        appData['companyName'] = newCompanyName;
        appData['companyUrl'] = newURL;
        appData['contactName'] = newContactName;
        appData['contactEmail'] = newContactEmail;
        appData['bannerMessage'] = ""
        app.setSettings(appData)

        internalAdmin = None
        result = remote_control.run_command("wget -q -O - \"$@\" " + global_functions.get_http_url() ,stdout=True)
        myRegex = re.compile('.*A regulation banner requirement containing a mix of text including <b>html<\/b> and<br\/>multiple<br\/>lines.*', re.DOTALL|re.MULTILINE)
        if re.match(myRegex,result):
            assert(False)
        else:
            assert(True)
        
    @staticmethod
    def finalTearDown(self):
        global app, appWeb
        if app != None:
            # Restore original settings to return to initial settings
            setDefaultBrandingManagerSettings()
            uvmContextLongTimeout.appManager().destroy( app.getAppSettings()["id"] )
            app = None
        if appWeb != None:
            uvmContextLongTimeout.appManager().destroy( appWeb.getAppSettings()["id"] )
            appWeb = None

test_registry.registerApp("branding-manager", BrandingManagerTests)
