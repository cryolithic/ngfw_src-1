import socket
import unittest2
import os
import subprocess
import sys
import re
import urllib2
import time
import copy
reload(sys)
sys.setdefaultencoding("utf-8")
import re
import subprocess
import ipaddr
import time
import ssl
import json
import glob

from jsonrpc import ServiceProxy
from jsonrpc import JSONRPCException
from global_functions import uvmContext
from uvm import Manager
from uvm import Uvm
import test_registry
import remote_control
import global_functions

app = None
appFW = None

defaultRackId = 1
origMailsettings = None
test_untangle_com_ip = socket.gethostbyname("test.untangle.com")

def get_latest_mail_pkg():
    remote_control.run_command("rm -f mailpkg.tar*") # remove all previous mail packages
    results = remote_control.run_command("wget -q -t 1 --timeout=3 http://test.untangle.com/test/mailpkg.tar")
    # print "Results from getting mailpkg.tar <%s>" % results
    results = remote_control.run_command("tar -xvf mailpkg.tar")
    # print "Results from untaring mailpkg.tar <%s>" % results

def create_alert_rule(description, field, operator, value, field2, operator2, value2, thresholdEnabled=False, thresholdLimit=None, thresholdTimeframeSec=None, thresholdGroupingField=None):
    return {
            "email": False,
            "emailLimitFrequency": False,
            "emailLimitFrequencyMinutes": 60,
            "thresholdEnabled": thresholdEnabled,
            "thresholdLimit": thresholdLimit,
            "thresholdTimeframeSec": thresholdTimeframeSec,
            "thresholdGroupingField": thresholdGroupingField,
            "description": description,
            "enabled": True,
            "javaClass": "com.untangle.uvm.event.AlertRule",
            "log": True,
            "conditions": {
                "javaClass": "java.util.LinkedList",
                "list": [{
                    "javaClass": "com.untangle.uvm.event.EventRuleCondition",
                    "comparator": operator,
                    "field": field,
                    "fieldValue": value
                }, {
                    "javaClass": "com.untangle.uvm.event.EventRuleCondition",
                    "comparator": operator2,
                    "field": field2,
                    "fieldValue": value2
                }]
            },
            "ruleId": 1
        }

def create_trigger_rule(action, tag_target, tag_name, tag_lifetime_sec, description, field, operator, value, field2, operator2, value2):
    return {
        "description": description,
        "action": action,
        "tagTarget": tag_target,
        "tagName": tag_name,
        "tagLifetimeSec": tag_lifetime_sec,
        "enabled": True,
        "javaClass": "com.untangle.uvm.event.TriggerRule",
        "conditions": {
            "javaClass": "java.util.LinkedList",
            "list": [{
                "javaClass": "com.untangle.uvm.event.EventRuleCondition",
                "comparator": operator,
                "field": field,
                "fieldValue": value
            }, {
                "javaClass": "com.untangle.uvm.event.EventRuleCondition",
                "comparator": operator2,
                "field": field2,
                "fieldValue": value2
            }]
        },
        "ruleId": 1
    }

class UvmTests(unittest2.TestCase):

    @staticmethod
    def appName():
        return "uvm"

    @staticmethod
    def vendorName():
        return "Untangle"

    @staticmethod
    def appNameSpamCase():
        return "smtp"

    @staticmethod
    def initialSetUp(self):
        pass

    def setUp(self):
        pass

    def test_010_client_is_online(self):
        result = remote_control.is_online()
        assert (result == 0)

    def test_011_help_links(self):
        helpLinkFile = "/tmp/helpLinks.json"
        subprocess.call("wget -q -4 -t 2 --timeout=5 http://test.untangle.com/test/help_links.json -O " + helpLinkFile, shell=True)
        # if the links file was not found skip this test
        if not os.path.isfile(helpLinkFile):
            raise unittest2.SkipTest("Skipping test since " + helpLinkFile + " is missing")
        # read file as JSON object and delete the temp file.
        with open(helpLinkFile) as dataFile:    
            helpLinks = json.load(dataFile)    
        if os.path.isfile(helpLinkFile):
            os.remove(helpLinkFile)
        
        # Check all the links in JSON
        linkCount = 0
        failedLinks = 0
        testResults = True
        for link in helpLinks["links"]:
            subLinks = [""]
            hdr = {'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.11 (KHTML, like Gecko) Chrome/23.0.1271.64 Safari/537.11',
                   'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                   'Accept-Charset': 'ISO-8859-1,utf-8;q=0.7,*;q=0.3',
                   'Accept-Encoding': 'none',
                   'Accept-Language': 'en-US,en;q=0.8',
                   'Connection': 'keep-alive'}

            ctx = ssl.create_default_context()
            ctx.check_hostname = False
            ctx.verify_mode = ssl.CERT_NONE

            pat = re.compile(r'''.*URL=http://wiki.*.untangle.com/(.*)">.*$''')
            version = uvmContext.getFullVersion()
            print "------------------------------------------------------"
            if ('subcat' in link):
                subLinks.extend(link['subcat'])
            for i, subLink in enumerate(subLinks):
                if (subLink != ""):
                    subLink = link['fragment'] + "/" + subLink
                else:
                    subLink = link['fragment']
                url = "http://wiki.untangle.com/get.php?fragment=" + subLink + "&uid=0000-0000-0000-0000&version=" + version + "&webui=true&lang=en"
                print "Checking %s = %s " % (subLink, url)
                req = urllib2.Request( url, headers=hdr) 
                ret = urllib2.urlopen( req, context=ctx )
                time.sleep(.1) # dont flood wiki
                assert(ret)
                result = ret.read()
                assert(result)
                patmatch = pat.match( result )
                assert(patmatch)
                page = link['page'][i] #set 'page' to expected wiki page value from page array
                if (patmatch.group(1)):
                    print "Result: \"%s\"" % patmatch.group(1)
                    
                    if (patmatch.group(1) == "index.php/%s" % (page)):
                        print "Page is correct: %s" % (page)
                    else:
                        print "******Sent to wrong page. Page should be %s, but you were sent to index.php/%s" % (page, patmatch.group(1))
                        testResults = False
                        failedLinks += 1
                else:
                    print "******Failed to get result for %s.  Expecting: %s" % (subLink,page)
                    # check all help links before failing the test
                    testResults = False
                    failedLinks += 1
                linkCount += 1
                print "------------------------------------------------------"
        print "%d Help Links were checked" % (linkCount)
        print "%d Links failed to resolve correctly" % (failedLinks)
        assert(testResults)

    def test_020_about_info(self):
        uid =  uvmContext.getServerUID()
        match = re.search(r'\w{4}-\w{4}-\w{4}.\w{4}', uid)
        assert( match )

        kernel = uvmContext.adminManager().getKernelVersion()
        match = re.search(r'\d.*', kernel)
        assert(match)

        reboot_count = uvmContext.adminManager().getRebootCount()
        match = re.search(r'\d{1,2}', reboot_count)
        assert(match)

        num_hosts = str(uvmContext.hostTable().getCurrentActiveSize())
        match = re.search(r'\d{1,2}', num_hosts)
        assert(match)

        max_num_hosts = str(uvmContext.hostTable().getMaxActiveSize())
        match = re.search(r'\d{1,2}', max_num_hosts)
        assert(match)

    def test_030_test_smtp_settings(self):
        if remote_control.quickTestsOnly:
            raise unittest2.SkipTest('Skipping a time consuming test')
        # Test mail setting in config -> email -> outgoing server
        if (uvmContext.appManager().isInstantiated(self.appNameSpamCase())):
            print "smtp case present"
        else:
            print "smtp not present"
            uvmContext.appManager().instantiate(self.appNameSpamCase(), 1)
        appSP = uvmContext.appManager().app(self.appNameSpamCase())
        origAppDataSP = appSP.getSmtpSettings()
        origMailsettings = uvmContext.mailSender().getSettings()
        # print appDataSP
        newMailsettings = copy.deepcopy(origMailsettings)
        newMailsettings['smtpHost'] = global_functions.testServerHost
        newMailsettings['smtpPort'] = "6800"
        newMailsettings['sendMethod'] = 'CUSTOM'

        uvmContext.mailSender().setSettings(newMailsettings)
        time.sleep(10) # give it time for exim to restart

        appDataSP = appSP.getSmtpSettings()
        appSP.setSmtpSettingsWithoutSafelists(appDataSP)
        recipient = global_functions.random_email()
        uvmContext.mailSender().sendTestMessage(recipient)
        time.sleep(2)
        # force exim to flush queue
        subprocess.call(["exim -qff >/dev/null 2>&1"],shell=True,stdout=None,stderr=None)
        time.sleep(10)

        uvmContext.mailSender().setSettings(origMailsettings)
        appSP.setSmtpSettingsWithoutSafelists(origAppDataSP)
        emailContext = remote_control.run_command("wget -q --timeout=5 -O - http://test.untangle.com/cgi-bin/getEmail.py?toaddress=" + recipient + " 2>&1" ,stdout=True)
        assert('Test Message' in emailContext)

    def test_040_trigger_rule_tag_host(self):
        settings = uvmContext.eventManager().getSettings()
        orig_settings = copy.deepcopy(settings)
        new_rule = create_trigger_rule("TAG_HOST", "localAddr", "test-tag", 30, "test tag rule", "class", "=", "*SessionEvent*", "localAddr", "=", "*"+remote_control.clientIP+"*")
        settings['triggerRules']['list'] = [ new_rule ]
        uvmContext.eventManager().setSettings( settings )

        result = remote_control.is_online()
        time.sleep(4)

        entry = uvmContext.hostTable().getHostTableEntry( remote_control.clientIP )
        tag_test = entry.get('tagsString')
        uvmContext.eventManager().setSettings( orig_settings )
        assert( tag_test != None )
        assert( "test-tag" in tag_test )

    def test_041_trigger_rule_untag_host(self):
        settings = uvmContext.eventManager().getSettings()
        orig_settings = copy.deepcopy(settings)
        new_rule = create_trigger_rule("TAG_HOST", "localAddr", "test-tag", 30, "test tag rule", "class", "=", "*SessionEvent*", "localAddr", "=", "*"+remote_control.clientIP+"*")
        settings['triggerRules']['list'] = [ new_rule ]
        uvmContext.eventManager().setSettings( settings )

        result = remote_control.is_online()
        time.sleep(4)

        entry = uvmContext.hostTable().getHostTableEntry( remote_control.clientIP )
        tag_test = entry.get('tagsString')
        uvmContext.eventManager().setSettings( orig_settings )

        new_rule = create_trigger_rule("UNTAG_HOST", "localAddr", "test*", 30, "test tag rule", "class", "=", "*SessionEvent*", "localAddr", "=", "*"+remote_control.clientIP+"*")
        settings['triggerRules']['list'] = [ new_rule ]
        uvmContext.eventManager().setSettings( settings )

        result = remote_control.is_online()
        time.sleep(4)

        entry = uvmContext.hostTable().getHostTableEntry( remote_control.clientIP )
        tag_test2 = entry.get('tagsString')

        uvmContext.eventManager().setSettings( orig_settings )
        assert( tag_test != None )
        assert( "test-tag" in tag_test )
        assert( tag_test2 == None or "test-tag" not in tag_test2)

    def test_042_trigger_rule_tag_host_subcondition(self):
        settings = uvmContext.eventManager().getSettings()
        orig_settings = copy.deepcopy(settings)
        new_rule = create_trigger_rule("TAG_HOST", "sessionEvent.localAddr", "test-tag-2", 30, "test tag rule", "class", "=", "*SessionStatsEvent*", "sessionEvent.localAddr", "=", "*"+remote_control.clientIP+"*")
        settings['triggerRules']['list'] = [ new_rule ]
        uvmContext.eventManager().setSettings( settings )

        result = remote_control.is_online()
        time.sleep(4)

        entry = uvmContext.hostTable().getHostTableEntry( remote_control.clientIP )

        uvmContext.eventManager().setSettings( orig_settings )
        tag_test = entry.get('tagsString')
        assert( tag_test != None )
        assert( "test-tag-2" in tag_test )

    def test_050_alert_rule(self):
        settings = uvmContext.eventManager().getSettings()
        orig_settings = copy.deepcopy(settings)
        new_rule = create_alert_rule("test alert rule", "class", "=", "*SessionEvent*", "localAddr", "=", "*"+remote_control.clientIP+"*")
        settings['alertRules']['list'].append( new_rule )
        uvmContext.eventManager().setSettings( settings )

        result = remote_control.is_online()
        time.sleep(4)

        events = global_functions.get_events('Events','Alert Events',None,10)
        found = global_functions.check_events( events.get('list'), 5,
                                            'description', 'test alert rule' )
        uvmContext.eventManager().setSettings( orig_settings )
        assert(events != None)
        assert ( found )

    def test_100_account_login(self):
        untangleEmail, untanglePassword = global_functions.get_live_account_info("Untangle")
        if untangleEmail == "message":
            raise unittest2.SkipTest('Skipping no accound found:' + str(untanglePassword))

        result = uvmContext.cloudManager().accountLogin( untangleEmail, untanglePassword )
        assert result.get('success')

    def test_101_account_login_invalid(self):
        result = uvmContext.cloudManager().accountLogin( "foobar@untangle.com", "badpassword" )
        assert not result.get('success')

    def test_102_admin_login_event(self):
        uvmContext.adminManager().logAdminLoginEvent( "admin", True, "127.0.1.1", True, 'X' )
        events = global_functions.get_events('Administration','Admin Login Events',None,10)
        assert(events != None)
        for i in events.get('list'):
            print i
        found = global_functions.check_events( events.get('list'), 10,
                                               'client_addr', "127.0.1.1",
                                               'reason', 'X',
                                               'local', True,
                                               'succeeded', True,
                                               'login', 'admin' )
        assert( found )

    # Make sure the HostsFileManager is working as expected
    def test_110_hosts_file_manager(self):
        # get the hostname and settings from the network manager
        fullName = uvmContext.networkManager().getFullyQualifiedHostname()
        netsettings = uvmContext.networkManager().getNetworkSettings()

        print "Checking HostsFileManager records for " + fullName

        # perform a DNS lookup for our hostname against every non-WAN interface
        # and make sure the value returned matches the address of the interface
        for interface in netsettings['interfaces']['list']:
            if interface['isWan'] == False and interface['configType'] == "Addressed":
                if 'v4StaticAddress' in interface:
                    netaddr = interface['v4StaticAddress']
                    if netaddr:
                        print "Checking hostname resolution for %s" % netaddr
                        output = subprocess.check_output("dig +short @" + netaddr + " " + fullName, shell=True)
                        result = output.strip()
                        assert(result == netaddr)
    
    def test_120_cert_is_in_backup(self):
        """check that the Server Certificate exists in the backup"""

        #copy a backup of apache.pem
        certFilePath = "/usr/share/untangle/settings/untangle-certificates/apache.pem"
        os.system("cp "+certFilePath+" "+certFilePath+".backup")

        #Modify apache.pem a little to verify the change is in the backup
        certFile = open(certFilePath)
        lines = certFile.read().splitlines()
        newline = "AAAAA" + lines[1][5:]
        lines[1] = newline
        open(certFilePath, "w").write('\n'.join(lines))

        #Download backup
        os.system("rm -f /tmp/untangleBackup.backup") # remove old backup file
        result = os.system("wget -o /dev/null -t 1 --timeout=3 --post-data 'type=backup' http://localhost/admin/download -O /tmp/untangleBackup.backup")
        assert(result == 0)

        #remove any old files associated with backup
        os.system("rm -f /tmp/files*")
        os.system("rm -f /tmp/PUBVERSION")
        os.system("rm -fr /tmp/usr")

        #extract backup
        os.system("tar -xf /tmp/untangleBackup.backup -C /tmp")
        os.system("tar -xf "+glob.glob("/tmp/files*.tar.gz")[0] + " -C /tmp") #use glob since extracted file has timestamp

        #Check the cert in the backup
        newCertFilePath = "/tmp/usr/share/untangle/settings/untangle-certificates/apache.pem"
        newCertFile = open(newCertFilePath, "r")
        newCertFileLines = newCertFile.read().splitlines()

        #replace modified cert with backed-up original before testing.
        os.system("cp "+certFilePath+".backup "+certFilePath)

        #compare original and modified certs
        assert(newline == newCertFileLines[1])

test_registry.registerApp("uvm", UvmTests)
