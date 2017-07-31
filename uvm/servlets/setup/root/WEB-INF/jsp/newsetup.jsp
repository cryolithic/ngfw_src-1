<!DOCTYPE html>
<%@ page contentType="text/html; charset=utf-8" %>
<%@ taglib uri="http://java.untangle.com/jsp/uvm" prefix="uvm" %>
<html xmlns:uvm="http://java.untangle.com/jsp/uvm">
  <head>
    <meta charset="UTF-8"/>
    <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
    <title>Setup Wizard</title>

    <style type="text/css">
        @import "/ext6.2/classic/theme-${extjsTheme}/resources/theme-${extjsTheme}-all.css?s=${buildStamp}";
    </style>

    <script type="text/javascript" src="/ext6.2/ext-all.js?s=${buildStamp}"></script>
    <script type="text/javascript" src="/ext6.2/classic/theme-${extjsTheme}/theme-${extjsTheme}.js?s=${buildStamp}"></script>

    <script type="text/javascript" src="/jsonrpc/jsonrpc.js?s=${buildStamp}"></script>

    <!-- FontAwesome -->
    <link href="/ext6.2/fonts/font-awesome/css/font-awesome.min.css" rel="stylesheet" />

    <script>
      var rpc = {};
      Ext.onReady(function () {
        rpc.setup = new JSONRpcClient("/setup/JSON-RPC").SetupContext;
        rpc.setup.getSetupWizardStartupInfo(function (result, exception) {
            // if (Ung.Util.handleException(exception)) { return; }
            Ext.applyIf(rpc, result);

            if (!rpc.wizardSettings.steps) {
                rpc.wizardSettings.steps = ['Welcome', 'ServerSettings', 'Interfaces', 'Internet', 'InternalNetwork', 'AutoUpgrades', 'Complete'];
            }

            // transform timezones string to array
            var tzArray = [];
            Ext.Array.each(eval(rpc.timezones), function (tz) {
                tzArray.push([tz[0], '(' + tz[1] + ') ' + tz[0]]);
            });
            rpc.timezones = tzArray;

            String.prototype.t = function() {
                // return rpc.translations[this.valueOf()] || (lang === 'xx' ? '<cite>' + this.valueOf() + '</cite>' : this.valueOf());
                return rpc.translations[this.valueOf()] || '<cite>' + this.valueOf() + '</cite>';
            };

            window.document.title = 'Setup Wizard'.t();

            Ext.Loader.loadScript({
                url: 'script/newsetup.js',
                onLoad: function () {
                    Ext.application({
                        name: 'Ung',
                        extend: 'Ung.Setup'
                    });
                }
            });


        });
      });
    </script>

    <style type="text/css">
        span.fa:before {
            position: relative;
            top: 50%;
            transform: translateY(-50%);
            display: block;
        }
        cite {
            font-style: normal;
        }

        a {
            color: blue;
        }

        .fa-red { color: red; }
        .fa-green { color: #64D242; }
        .fa-orange { color: orange; }
        .fa-yellow { color: yellow; }
        .fa-gray { color: #999; }
    </style>

  </head>
  <body>
  </body>
</html>
