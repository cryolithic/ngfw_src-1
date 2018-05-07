<!DOCTYPE html>
<%@ page contentType="text/html; charset=utf-8" %>
<%@ taglib uri="http://java.untangle.com/jsp/uvm" prefix="uvm" %>
<html xmlns:uvm="http://java.untangle.com/jsp/uvm">
  <head>
    <meta charset="UTF-8"/>
    <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
    <title>Select Language</title>
    <style type="text/css">
      @import "/ext6.2/classic/theme-${extjsTheme}/resources/theme-${extjsTheme}-all.css?s=${buildStamp}";
    </style>

    <!-- FontAwesome -->
    <link href="/ext6.2/fonts/font-awesome/css/font-awesome.min.css" rel="stylesheet" />
    <style>
        span.fa:before {
          position: relative;
          top: 50%;
          transform: translateY(-50%);
          display: block;
        }
    </style>

    <script type="text/javascript" src="/ext6.2/ext-all-debug.js?s=${buildStamp}"></script>
    <script type="text/javascript" src="/ext6.2/classic/theme-${extjsTheme}/theme-${extjsTheme}.js?s=${buildStamp}"></script>

    <script type="text/javascript" src="/jsonrpc/jsonrpc.js?s=${buildStamp}"></script>

    <script type="text/javascript">
        var rpc = {};
        Ext.onReady(function(){
            Ext.Loader.loadScript({
                url: 'script/language.js',
                onLoad: function () {
                    Ext.application({
                        name: 'Ung',
                        extend: 'Ung.Lang',
                        languageList: ${languageList},
                        language: "${language}",
                        languageSource: "${languageSource}"
                    });
                }
            });
        });
    </script>
  </head>
</html>
