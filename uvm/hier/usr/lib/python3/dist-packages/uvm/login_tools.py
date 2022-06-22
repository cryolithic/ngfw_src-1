import hashlib
import html
import base64
import sys
import re
import pycurl
import json
import crypt
import sys
import urllib.parse
from io import StringIO

def get_app_settings_item(a,b):
    return None
def get_uvm_settings_item(a,b):
    return None

try:
    from uvm.settings_reader import get_app_settings_item
    from uvm.settings_reader import get_uvm_settings_item
except ImportError:
    pass

class UVMLoginLogger:
    def __init__(self, should_log):
        self._request = None
        self._realm = None
        self._username = None
        self._should_log = should_log

    def set_request(self, request):
        self._request = request

    def set_realm(self, realm):
        self._realm = realm

    def set_username(self, username):
        self._username = username

    def log_failure(self, reason):
        if self._should_log:
            uvm_login.log_login(self._request,
                                self._username,
                                False,
                                reason)

    def log_success(self):
        if self._should_log:
            uvm_login.log_login(self._request,
                                self._username,
                                True,
                                None)

class StderrLoginLogger:
    def __init__(self, should_log):
        self._realm = None
        self._username = None
        self._should_log = should_log

    def set_request(self, request):
        return

    def set_realm(self, realm):
        self._realm = realm

    def set_username(self, username):
        self._username = username

    def log_success(self):
        if self._should_log:
            print(f"Successful login  of user: {self._username}"
                  f" on realm: {self._realm}",
                  file=sys.stderr)

    def log_failure(self, reason):
        if self._should_log:
            print(
                f"Failure to log in user: {self._username}"
                f" on realm: {self._realm}"
                f"reason: {reason}",
                file=sys.stderr)

class NullLogger:
    def log_success(self):
        pass

    def log_failure(self, reason):
        pass

loggerFactory = StderrLoginLogger
try:
    import uvm_login
    loggerFactory = UVMLoginLogger
except:
    pass


def get_logger(req, realm, username, password):
    logger = loggerFactory(True)
    logger.set_request(req)
    logger.set_realm(realm)
    logger.set_username(username)
    return logger

def valid_login(req, realm, username, password):
    logger = get_logger(req, realm, username, password)
    if realm == 'Administrator':
        return admin_valid_login(req, realm, username, password, logger)
    elif realm == 'Reports':
        if admin_valid_login(req, 'Administrator', username, password, NullLogger()):
            return True
        else:
            return reports_valid_login(req, realm, username, password,
                                       logger)
    else:
        return False

def valid_token(req, token):
    try:
        uid=None
        with open('/usr/share/untangle/conf/uid', 'r') as uidfile:
            uid=uidfile.read().replace('\n', '')

        buffer = StringIO()
        postdata = json.dumps({ "token": token, "resourceId": uid  })

        curl = pycurl.Curl()
        curl.setopt( pycurl.POST, 1 )
        curl.setopt( pycurl.POSTFIELDS, postdata )
        curl.setopt( pycurl.NOSIGNAL, 1 )
        curl.setopt( pycurl.CONNECTTIMEOUT, 30 )
        curl.setopt( pycurl.TIMEOUT, 30 )
        #curl.setopt( pycurl.URL, "http://54.152.2.165:1337/AuthenticationService/1/CheckTokenAccess")
        curl.setopt( pycurl.URL, "https://auth.untangle.com/v1/CheckTokenAccess")
        curl.setopt( pycurl.HTTPHEADER, ["Content-type: application/json", "Accept: application/json", "AuthRequest: 4E6FAB77-B2DF-4DEA-B6BD-2B434A3AE981"])
        #curl.setopt( pycurl.VERBOSE, True )
        curl.setopt( pycurl.WRITEDATA, buffer )

        curl.perform()

        body = buffer.getvalue()
        print(body)
        return (body == "true")
    except:
        return False



def reports_valid_login(req, realm, username, password, logger=StderrLoginLogger(True)):
    users = get_app_settings_item('reports','reportsUsers')
    if users == None:
        return False;
    if users['list'] == None:
        return False;
    for user in users['list']:
        if user['emailAddress'] != username:
            continue;
        if check_password(user, password, logger):
            return True
        else:
            return False

    logger.log_failure("U")
    return False

def admin_valid_login(req, realm, username, password, logger=StderrLoginLogger(True)):
    """
    Returns True if this request with username/password is a valid
    login.
    """
    users = get_uvm_settings_item('admin','users')
    if users == None:
        return False;
    if users['list'] == None:
        return False;
    for user in users['list']:
        if user['username'] != username:
            continue;
        if check_password(user, password, logger):
            return True
        else:
            return False

    logger.log_failure("U")
    return False



def check_password(user_dict, password, logger):
    pw_hash_shadow = user_dict.get('passwordHashShadow')
    if pw_hash_shadow:
        if pw_hash_shadow == crypt.crypt(password, pw_hash_shadow):
            logger.log_success()
            return True
        else:
            logger.log_failure("P")
            return False
    else:
        pw_hash_base64 = user_dict['passwordHashBase64']
        pw_hash = base64.b64decode(pw_hash_base64)
        raw_pw = pw_hash[0:len(pw_hash) - 8]
        salt = pw_hash[len(pw_hash) - 8:]
        b = password.encode('utf-8') + salt
        if raw_pw == hashlib.md5(b).digest():
            logger.log_success()
            return True
        else:
            logger.log_failure("P")
            return False



def write_login_form(req, title, host, error_msg):
    login_url = html.escape(req.unparsed_uri)
    req.content_type = "text/html; charset=utf-8"
    req.send_http_header()

    if error_msg == None:
        error_msg = ''

    server_str = html.escape(_("Server:"))
    username_str = html.escape(_("Username:"))
    password_str = html.escape(_("Password:"))
    login_str = html.escape(_("Login"))

    if not type(title) is str:
        title = html.escape(title).encode("utf-8")
    if not type(host) is str:
        host = html.escape(host).encode("utf-8")

    try:
        default_username = get_uvm_settings_item('admin','defaultUsername')
        if default_username == None:
            default_username = "admin"
        else:
            default_username = str(default_username)
    except:
        default_username = ""

    focus_field_id = "password"
    if default_username == "":
        focus_field_id = "username"

    banner_msg = get_app_settings_item('branding-manager','bannerMessage')
    if banner_msg != None and banner_msg != "":
        banner_msg = banner_msg.replace("\n", "<br/>")
        banner_msg = "<p>" + banner_msg.encode('utf-8') + "</p>"
    else:
        banner_msg = ""

    html_string = """\
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="initial-scale=1.0, width=device-width">
<meta name="description" content="loginPage">
<title>%s</title>
<script type="text/javascript">if (top.location!=location) top.location.href=document.location.href;</script>
<style type="text/css">
/* <![CDATA[ */
@import url(/images/base.css);
/* ]]> */
</style>
</head>
<body>

<header>
    <img src="/images/BrandingLogo.png" style="max-width: 150px; max-height: 140px;">
</header>

<div class="form-login">
    <form method="post" action="%s">
        <h2>%s</h2>
        <p class="server">%s</p>
        <div class="banner">%s</div>
        <p class="error">%s</p>
        <input id="fragment" type="hidden"   name="fragment" value=""/>
        <input id="username" type="text"     name="username" value="%s" placeholder="%s"/>
        <input id="password" type="password" name="password" placeholder="%s"/>
        <button type="submit">%s</button>
    </form>
</div>

<script type="text/javascript">document.getElementById('%s').focus();</script>
<script type="text/javascript">document.getElementById('fragment').value=window.location.hash;</script>

</body>
</html>""" % (title, login_url, title, host, banner_msg, error_msg, default_username, username_str, password_str, login_str, focus_field_id)

    req.write(html_string)
