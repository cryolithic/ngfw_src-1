{
    "settingsVersion":5,
    "configured":true,
    "javaClass":"com.untangle.app.bandwidth_control.BandwidthControlSettings",
    "rules":{
        "javaClass":"java.util.LinkedList",
        "list":[{
            "set" : "standard",
            "ruleId":12345,
            "description":"Apply Penalty Box Penalties",
            "conditions":{
                "javaClass":"java.util.LinkedList",
                "list":[{
                    "value":"penalty-box",
                    "javaClass":"com.untangle.app.bandwidth_control.BandwidthControlRuleCondition",
                    "conditionType":"TAGGED"
                }]
            },
            "action": {
                "actionType": "SET_PRIORITY", 
                "javaClass": "com.untangle.app.bandwidth_control.BandwidthControlRuleAction", 
                "priority": 7
            }, 
            "javaClass":"com.untangle.app.bandwidth_control.BandwidthControlRule",
            "enabled":true
        }, {
            "set" : "standard",
            "ruleId":12345,
            "description":"Prioritize DNS",
            "conditions":{
                "javaClass":"java.util.LinkedList",
                "list":[{
                    "value":"53",
                    "javaClass":"com.untangle.app.bandwidth_control.BandwidthControlRuleCondition",
                    "conditionType":"DST_PORT"
                }]
            },
            "action":{
                "priority":1,
                "javaClass":"com.untangle.app.bandwidth_control.BandwidthControlRuleAction",
                "actionType":"SET_PRIORITY"
            },
            "javaClass":"com.untangle.app.bandwidth_control.BandwidthControlRule",
            "enabled":true
        }, {
            "set" : "standard",
            "ruleId":12345,
            "description":"Prioritize SSH",
            "conditions":{
                "javaClass":"java.util.LinkedList",
                "list":[{
                    "value":"TCP",
                    "javaClass":"com.untangle.app.bandwidth_control.BandwidthControlRuleCondition",
                    "conditionType":"PROTOCOL"
                }, {
                    "value":"22",
                    "javaClass":"com.untangle.app.bandwidth_control.BandwidthControlRuleCondition",
                    "conditionType":"DST_PORT"
                }]
            },
            "action":{
                "priority":2,
                "javaClass":"com.untangle.app.bandwidth_control.BandwidthControlRuleAction",
                "actionType":"SET_PRIORITY"
            },
            "javaClass":"com.untangle.app.bandwidth_control.BandwidthControlRule",
            "enabled":true
        }, {
            "set" : "standard",
            "ruleId":12345,
            "description":"Prioritize Remote Desktop (RDP,VNC)",
            "conditions":{
                "javaClass":"java.util.LinkedList",
                "list":[{
                    "value":"TCP",
                    "javaClass":"com.untangle.app.bandwidth_control.BandwidthControlRuleCondition",
                    "conditionType":"PROTOCOL"
                }, {
                    "value":"3389,5300",
                    "javaClass":"com.untangle.app.bandwidth_control.BandwidthControlRuleCondition",
                    "conditionType":"DST_PORT"
                }]
            },
            "action":{
                "priority":1,
                "javaClass":"com.untangle.app.bandwidth_control.BandwidthControlRuleAction",
                "actionType":"SET_PRIORITY"
            },
            "javaClass":"com.untangle.app.bandwidth_control.BandwidthControlRule",
            "enabled":true
        }, {
            "set" : "standard",
            "ruleId":12345,
            "description":"Prioritize eMail (POP3,POP3S,IMAP,IMAPS)",
            "conditions":{
                "javaClass":"java.util.LinkedList",
                "list":[{
                    "value":"110,995,143,993",
                    "javaClass":"com.untangle.app.bandwidth_control.BandwidthControlRuleCondition",
                    "conditionType":"DST_PORT"
                }]
            },
            "action":{
                "priority":2,
                "javaClass":"com.untangle.app.bandwidth_control.BandwidthControlRuleAction",
                "actionType":"SET_PRIORITY"
            },
            "javaClass":"com.untangle.app.bandwidth_control.BandwidthControlRule",
            "enabled":true
        }, {
            "set" : "standard",
            "ruleId":12345,
            "description":"Prioritize \"Remote Access\" traffic (requires Application Control)",
            "conditions":{
                "javaClass":"java.util.LinkedList",
                "list":[{
                    "value":"Remote Access",
                    "javaClass":"com.untangle.app.bandwidth_control.BandwidthControlRuleCondition",
                    "conditionType":"APPLICATION_CONTROL_CATEGORY"
                }]
            },
            "action":{
                "priority":2,
                "javaClass":"com.untangle.app.bandwidth_control.BandwidthControlRuleAction",
                "actionType":"SET_PRIORITY"
            },
            "javaClass":"com.untangle.app.bandwidth_control.BandwidthControlRule",
            "enabled":true
        }, {
            "set" : "business,school,metered",
            "ruleId":12345,
            "description" : "Deprioritize \"Unproductive\" Applications (requires Application Control)",
            "conditions":{
                "javaClass":"java.util.LinkedList",
                "list":[{
                    "invert":false,
                    "javaClass":"com.untangle.app.bandwidth_control.BandwidthControlRuleCondition",
                    "value":"<2",
                    "conditionType":"APPLICATION_CONTROL_PRODUCTIVITY"
                }]
            },
            "javaClass":"com.untangle.app.bandwidth_control.BandwidthControlRule",
            "action":{
                "quotaBytes":null,
                "priority":4,
                "javaClass":"com.untangle.app.bandwidth_control.BandwidthControlRuleAction",
                "quotaTime":null,
                "actionType":"SET_PRIORITY",
                "tagTime":null
            },
            "enabled":true
        }, {
            "set" : "standard",
            "ruleId":12345,
            "description":"Deprioritize site violations (requires Web Filter)",
            "conditions":{
                "javaClass":"java.util.LinkedList",
                "list":[{
                    "value":"",
                    "javaClass":"com.untangle.app.bandwidth_control.BandwidthControlRuleCondition",
                    "conditionType":"WEB_FILTER_FLAGGED"
                }]
            },
            "action":{
                "priority":3,
                "javaClass":"com.untangle.app.bandwidth_control.BandwidthControlRuleAction",
                "actionType":"SET_PRIORITY"
            },
            "javaClass":"com.untangle.app.bandwidth_control.BandwidthControlRule",
            "enabled":true
        }, {
            "set" : "business,school,home",
            "ruleId":12345,
            "description":"Deprioritize Windows updates (download.windowsupdate.com)",
            "conditions":{
                "javaClass":"java.util.LinkedList",
                "list":[{
                    "value":"*windowsupdate.com",
                    "javaClass":"com.untangle.app.bandwidth_control.BandwidthControlRuleCondition",
                    "conditionType":"HTTP_HOST"
                }]
            },
            "action":{
                "priority":4,
                "javaClass":"com.untangle.app.bandwidth_control.BandwidthControlRuleAction",
                "actionType":"SET_PRIORITY"
            },
            "javaClass":"com.untangle.app.bandwidth_control.BandwidthControlRule",
            "enabled":true
        }, {
            "set" : "business,school,home",
            "ruleId":12345,
            "description":"Deprioritize Microsoft updates (update.microsoft.com)",
            "conditions":{
                "javaClass":"java.util.LinkedList",
                "list":[{
                    "value":"*update.microsoft.com",
                    "javaClass":"com.untangle.app.bandwidth_control.BandwidthControlRuleCondition",
                    "conditionType":"HTTP_HOST"
                }]
            },
            "action":{
                "priority":4,
                "javaClass":"com.untangle.app.bandwidth_control.BandwidthControlRuleAction",
                "actionType":"SET_PRIORITY"
            },
            "javaClass":"com.untangle.app.bandwidth_control.BandwidthControlRule",
            "enabled":true
        }, {
            "set" : "metered",
            "ruleId":12345,
            "description":"Limit Microsoft updates (windowsupdates.com)",
            "conditions":{
                "javaClass":"java.util.LinkedList",
                "list":[{
                    "value":"*windowsupdates.com",
                    "javaClass":"com.untangle.app.bandwidth_control.BandwidthControlRuleCondition",
                    "conditionType":"HTTP_HOST"
                }]
            },
            "action":{
                "priority":6,
                "javaClass":"com.untangle.app.bandwidth_control.BandwidthControlRuleAction",
                "actionType":"SET_PRIORITY"
            },
            "javaClass":"com.untangle.app.bandwidth_control.BandwidthControlRule",
            "enabled":true
        }, {
            "set" : "metered",
            "ruleId":12345,
            "description":"Limit Microsoft updates (update.microsoft.com)",
            "conditions":{
                "javaClass":"java.util.LinkedList",
                "list":[{
                    "value":"*update.microsoft.com",
                    "javaClass":"com.untangle.app.bandwidth_control.BandwidthControlRuleCondition",
                    "conditionType":"HTTP_HOST"
                }]
            },
            "action":{
                "priority":6,
                "javaClass":"com.untangle.app.bandwidth_control.BandwidthControlRuleAction",
                "actionType":"SET_PRIORITY"
            },
            "javaClass":"com.untangle.app.bandwidth_control.BandwidthControlRule",
            "enabled":true
        }, {
            "set" : "business,school,metered",
            "ruleId":12345,
            "description":"Tag Bittorrent users for 30 minutes (requires Application Control)",
            "conditions":{
                "javaClass":"java.util.LinkedList",
                "list":[{
                    "value":"BITTORRE",
                    "javaClass":"com.untangle.app.bandwidth_control.BandwidthControlRuleCondition",
                    "conditionType":"APPLICATION_CONTROL_APPLICATION"
                }]
            },
            "action":{
                "javaClass":"com.untangle.app.bandwidth_control.BandwidthControlRuleAction",
                "actionType":"TAG_HOST",
                "tagName":"penalty-box",
                "tagTime":1800
            },
            "javaClass":"com.untangle.app.bandwidth_control.BandwidthControlRule",
            "enabled":true
        }, {
            "set" : "business,school,metered",
            "ruleId":12345,
            "description":"Deprioritize P2P traffic (requires Application Control Lite)",
            "conditions":{
                "javaClass":"java.util.LinkedList",
                "list":[{
                    "value":"Peer to Peer",
                    "javaClass":"com.untangle.app.bandwidth_control.BandwidthControlRuleCondition",
                    "conditionType":"PROTOCOL_CONTROL_CATEGORY"
                }]
            },
            "action":{
                "priority":4,
                "javaClass":"com.untangle.app.bandwidth_control.BandwidthControlRuleAction",
                "actionType":"SET_PRIORITY"
            },
            "javaClass":"com.untangle.app.bandwidth_control.BandwidthControlRule",
            "enabled":true
        }, {
            "set" : "business,school,metered",
            "ruleId":12345,
            "description":"Deprioritize File Transfers (requires Application Control)",
            "conditions":{
                "javaClass":"java.util.LinkedList",
                "list":[{
                    "value":"File Transfer",
                    "javaClass":"com.untangle.app.bandwidth_control.BandwidthControlRuleCondition",
                    "conditionType":"APPLICATION_CONTROL_CATEGORY"
                }]
            },
            "action":{
                "priority":4,
                "javaClass":"com.untangle.app.bandwidth_control.BandwidthControlRuleAction",
                "actionType":"SET_PRIORITY"
            },
            "javaClass":"com.untangle.app.bandwidth_control.BandwidthControlRule",
            "enabled":true
        }, {
            "set" : "business,school,metered",
            "ruleId":12345,
            "description":"Deprioritize HTTP to Download Sites (requires Web Filter)",
            "conditions":{
                "javaClass":"java.util.LinkedList",
                "list":[{
                    "value":"Download Sites",
                    "javaClass":"com.untangle.app.bandwidth_control.BandwidthControlRuleCondition",
                    "conditionType":"WEB_FILTER_CATEGORY"
                }]
            },
            "action":{
                "priority":4,
                "javaClass":"com.untangle.app.bandwidth_control.BandwidthControlRuleAction",
                "actionType":"SET_PRIORITY"
            },
            "javaClass":"com.untangle.app.bandwidth_control.BandwidthControlRule",
            "enabled":true
        }, {
            "set" : "home",
            "ruleId":12345,
            "description":"Prioritize pandora streaming audio",
            "conditions":{
                "javaClass":"java.util.LinkedList",
                "list":[{
                    "value":"*pandora.com",
                    "javaClass":"com.untangle.app.bandwidth_control.BandwidthControlRuleCondition",
                    "conditionType":"HTTP_HOST"
                }]
            },
            "action":{
                "priority":2,
                "javaClass":"com.untangle.app.bandwidth_control.BandwidthControlRuleAction",
                "actionType":"SET_PRIORITY"
            },
            "javaClass":"com.untangle.app.bandwidth_control.BandwidthControlRule",
            "enabled":true
        }, {
            "set" : "home",
            "ruleId":12345,
            "description":"Prioritize last.fm streaming audio",
            "conditions":{
                "javaClass":"java.util.LinkedList",
                "list":[{
                    "value":"*last.fm",
                    "javaClass":"com.untangle.app.bandwidth_control.BandwidthControlRuleCondition",
                    "conditionType":"HTTP_HOST"
                }]
            },
            "action":{
                "priority":1,
                "javaClass":"com.untangle.app.bandwidth_control.BandwidthControlRuleAction",
                "actionType":"SET_PRIORITY"
            },
            "javaClass":"com.untangle.app.bandwidth_control.BandwidthControlRule",
            "enabled":true
        }, {
            "set" : "home",
            "ruleId":12345,
            "description":"Prioritize HTTP to Games sites",
            "conditions":{
                "javaClass":"java.util.LinkedList",
                "list":[{
                    "value":"Games",
                    "javaClass":"com.untangle.app.bandwidth_control.BandwidthControlRuleCondition",
                    "conditionType":"WEB_FILTER_CATEGORY"
                }]
            },
            "action":{
                "priority":2,
                "javaClass":"com.untangle.app.bandwidth_control.BandwidthControlRuleAction",
                "actionType":"SET_PRIORITY"
            },
            "javaClass":"com.untangle.app.bandwidth_control.BandwidthControlRule",
            "enabled":true
        }, {
            "set" : "home",
            "ruleId":12345,
            "description":"Prioritize Hulu streaming video",
            "conditions":{
                "javaClass":"java.util.LinkedList",
                "list":[{
                    "value":"*hulu.com",
                    "javaClass":"com.untangle.app.bandwidth_control.BandwidthControlRuleCondition",
                    "conditionType":"HTTP_HOST"
                }]
            },
            "action":{
                "priority":1,
                "javaClass":"com.untangle.app.bandwidth_control.BandwidthControlRuleAction",
                "actionType":"SET_PRIORITY"
            },
            "javaClass":"com.untangle.app.bandwidth_control.BandwidthControlRule",
            "enabled":true
        }, {
            "set" : "home",
            "ruleId":12345,
            "description":"Prioritize Netflix streaming video",
            "conditions":{
                "javaClass":"java.util.LinkedList",
                "list":[{
                    "value":"netflix.com",
                    "javaClass":"com.untangle.app.bandwidth_control.BandwidthControlRuleCondition",
                    "conditionType":"HTTP_HOST"
                }]
            },
            "action":{
                "priority":1,
                "javaClass":"com.untangle.app.bandwidth_control.BandwidthControlRuleAction",
                "actionType":"SET_PRIORITY"
            },
            "javaClass":"com.untangle.app.bandwidth_control.BandwidthControlRule",
            "enabled":true
        }, {
            "set" : "standard",
            "ruleId":12345,
            "description":"Limit dropbox.com sync",
            "conditions":{
                "javaClass":"java.util.LinkedList",
                "list":[{
                    "value":"*dropbox.com",
                    "javaClass":"com.untangle.app.bandwidth_control.BandwidthControlRuleCondition",
                    "conditionType":"HTTP_HOST"
                }]
            },
            "action":{
                "priority":6,
                "javaClass":"com.untangle.app.bandwidth_control.BandwidthControlRuleAction",
                "actionType":"SET_PRIORITY"
            },
            "javaClass":"com.untangle.app.bandwidth_control.BandwidthControlRule",
            "enabled":true
        },{
            "set" : "standard",
            "ruleId": 12345, 
            "description": "Do not Prioritize large HTTP downloads (>10meg)", 
            "conditions": {
                "javaClass": "java.util.LinkedList", 
                "list": [
                    {
                        "invert": false, 
                        "javaClass": "com.untangle.app.bandwidth_control.BandwidthControlRuleCondition", 
                        "conditionType": "HTTP_CONTENT_LENGTH", 
                        "value": ">10000000"
                    }
                ]
            },
            "action": {
                "actionType": "SET_PRIORITY", 
                "javaClass": "com.untangle.app.bandwidth_control.BandwidthControlRuleAction", 
                "priority": 3
            }, 
            "javaClass": "com.untangle.app.bandwidth_control.BandwidthControlRule", 
            "enabled": true
        }, {
            "set" : "standard",
            "ruleId":12345,
            "description":"Prioritize HTTP",
            "conditions":{
                "javaClass":"java.util.LinkedList",
                "list":[{
                    "value":"80",
                    "javaClass":"com.untangle.app.bandwidth_control.BandwidthControlRuleCondition",
                    "conditionType":"DST_PORT"
                }]
            },
            "action":{
                "priority":2,
                "javaClass":"com.untangle.app.bandwidth_control.BandwidthControlRuleAction",
                "actionType":"SET_PRIORITY"
            },
            "javaClass":"com.untangle.app.bandwidth_control.BandwidthControlRule",
            "enabled":true
        }, {
            "set" : "standard",
            "ruleId":12345,
            "description":"Prioritize HTTPS",
            "conditions":{
                "javaClass":"java.util.LinkedList",
                "list":[{
                    "value":"443",
                    "javaClass":"com.untangle.app.bandwidth_control.BandwidthControlRuleCondition",
                    "conditionType":"DST_PORT"
                }]
            },
            "action":{
                "priority":2,
                "javaClass":"com.untangle.app.bandwidth_control.BandwidthControlRuleAction",
                "actionType":"SET_PRIORITY"
            },
            "javaClass":"com.untangle.app.bandwidth_control.BandwidthControlRule",
            "enabled":true
        }]
    }
}
