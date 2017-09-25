{
    "configured": true,
    "javaClass": "com.untangle.app.bandwidth_control.BandwidthControlSettings",
    "rules": {
        "javaClass": "java.util.LinkedList",
        "list": [
            {
                "action": {
                    "actionType": "SET_PRIORITY",
                    "javaClass": "com.untangle.app.bandwidth_control.BandwidthControlRuleAction",
                    "priority": 7
                },
                "conditions": {
                    "javaClass": "java.util.LinkedList",
                    "list": [
                        {
                            "conditionType": "TAGGED",
                            "javaClass": "com.untangle.app.bandwidth_control.BandwidthControlRuleCondition",
                            "value": "penalty-box"
                        }
                    ]
                },
                "description": "Apply Penalty Box Penalties",
                "enabled": true,
                "id": 1,
                "javaClass": "com.untangle.app.bandwidth_control.BandwidthControlRule",
                "ruleId": 12345
            },
            {
                "action": {
                    "actionType": "SET_PRIORITY",
                    "javaClass": "com.untangle.app.bandwidth_control.BandwidthControlRuleAction",
                    "priority": 1
                },
                "conditions": {
                    "javaClass": "java.util.LinkedList",
                    "list": [
                        {
                            "conditionType": "DST_PORT",
                            "javaClass": "com.untangle.app.bandwidth_control.BandwidthControlRuleCondition",
                            "value": "53"
                        }
                    ]
                },
                "description": "Prioritize DNS",
                "enabled": true,
                "id": 2,
                "javaClass": "com.untangle.app.bandwidth_control.BandwidthControlRule",
                "ruleId": 12345
            },
            {
                "action": {
                    "actionType": "SET_PRIORITY",
                    "javaClass": "com.untangle.app.bandwidth_control.BandwidthControlRuleAction",
                    "priority": 2
                },
                "conditions": {
                    "javaClass": "java.util.LinkedList",
                    "list": [
                        {
                            "conditionType": "PROTOCOL",
                            "javaClass": "com.untangle.app.bandwidth_control.BandwidthControlRuleCondition",
                            "value": "TCP"
                        },
                        {
                            "conditionType": "DST_PORT",
                            "javaClass": "com.untangle.app.bandwidth_control.BandwidthControlRuleCondition",
                            "value": "22"
                        }
                    ]
                },
                "description": "Prioritize SSH",
                "enabled": true,
                "id": 3,
                "javaClass": "com.untangle.app.bandwidth_control.BandwidthControlRule",
                "ruleId": 12345
            },
            {
                "action": {
                    "actionType": "SET_PRIORITY",
                    "javaClass": "com.untangle.app.bandwidth_control.BandwidthControlRuleAction",
                    "priority": 1
                },
                "conditions": {
                    "javaClass": "java.util.LinkedList",
                    "list": [
                        {
                            "conditionType": "PROTOCOL",
                            "javaClass": "com.untangle.app.bandwidth_control.BandwidthControlRuleCondition",
                            "value": "TCP"
                        },
                        {
                            "conditionType": "DST_PORT",
                            "javaClass": "com.untangle.app.bandwidth_control.BandwidthControlRuleCondition",
                            "value": "3389,5300"
                        }
                    ]
                },
                "description": "Prioritize Remote Desktop (RDP,VNC)",
                "enabled": true,
                "id": 4,
                "javaClass": "com.untangle.app.bandwidth_control.BandwidthControlRule",
                "ruleId": 12345
            },
            {
                "action": {
                    "actionType": "SET_PRIORITY",
                    "javaClass": "com.untangle.app.bandwidth_control.BandwidthControlRuleAction",
                    "priority": 2
                },
                "conditions": {
                    "javaClass": "java.util.LinkedList",
                    "list": [
                        {
                            "conditionType": "DST_PORT",
                            "javaClass": "com.untangle.app.bandwidth_control.BandwidthControlRuleCondition",
                            "value": "110,995,143,993"
                        }
                    ]
                },
                "description": "Prioritize eMail (POP3,POP3S,IMAP,IMAPS)",
                "enabled": true,
                "id": 5,
                "javaClass": "com.untangle.app.bandwidth_control.BandwidthControlRule",
                "ruleId": 12345
            },
            {
                "action": {
                    "actionType": "SET_PRIORITY",
                    "javaClass": "com.untangle.app.bandwidth_control.BandwidthControlRuleAction",
                    "priority": 2
                },
                "conditions": {
                    "javaClass": "java.util.LinkedList",
                    "list": [
                        {
                            "conditionType": "APPLICATION_CONTROL_CATEGORY",
                            "javaClass": "com.untangle.app.bandwidth_control.BandwidthControlRuleCondition",
                            "value": "Remote Access"
                        }
                    ]
                },
                "description": "Prioritize \"Remote Access\" traffic (requires Application Control)",
                "enabled": true,
                "id": 6,
                "javaClass": "com.untangle.app.bandwidth_control.BandwidthControlRule",
                "ruleId": 12345
            },
            {
                "action": {
                    "actionType": "SET_PRIORITY",
                    "javaClass": "com.untangle.app.bandwidth_control.BandwidthControlRuleAction",
                    "priority": 3
                },
                "conditions": {
                    "javaClass": "java.util.LinkedList",
                    "list": [
                        {
                            "conditionType": "WEB_FILTER_FLAGGED",
                            "javaClass": "com.untangle.app.bandwidth_control.BandwidthControlRuleCondition",
                            "value": ""
                        }
                    ]
                },
                "description": "Deprioritize site violations (requires Web Filter)",
                "enabled": true,
                "id": 7,
                "javaClass": "com.untangle.app.bandwidth_control.BandwidthControlRule",
                "ruleId": 12345
            },
            {
                "action": {
                    "actionType": "SET_PRIORITY",
                    "javaClass": "com.untangle.app.bandwidth_control.BandwidthControlRuleAction",
                    "priority": 4
                },
                "conditions": {
                    "javaClass": "java.util.LinkedList",
                    "list": [
                        {
                            "conditionType": "HTTP_HOST",
                            "javaClass": "com.untangle.app.bandwidth_control.BandwidthControlRuleCondition",
                            "value": "*windowsupdate.com"
                        }
                    ]
                },
                "description": "Deprioritize Windows updates (download.windowsupdate.com)",
                "enabled": true,
                "id": 8,
                "javaClass": "com.untangle.app.bandwidth_control.BandwidthControlRule",
                "ruleId": 12345
            },
            {
                "action": {
                    "actionType": "SET_PRIORITY",
                    "javaClass": "com.untangle.app.bandwidth_control.BandwidthControlRuleAction",
                    "priority": 4
                },
                "conditions": {
                    "javaClass": "java.util.LinkedList",
                    "list": [
                        {
                            "conditionType": "HTTP_HOST",
                            "javaClass": "com.untangle.app.bandwidth_control.BandwidthControlRuleCondition",
                            "value": "*update.microsoft.com"
                        }
                    ]
                },
                "description": "Deprioritize Microsoft updates (update.microsoft.com)",
                "enabled": true,
                "id": 9,
                "javaClass": "com.untangle.app.bandwidth_control.BandwidthControlRule",
                "ruleId": 12345
            },
            {
                "action": {
                    "actionType": "SET_PRIORITY",
                    "javaClass": "com.untangle.app.bandwidth_control.BandwidthControlRuleAction",
                    "priority": 2
                },
                "conditions": {
                    "javaClass": "java.util.LinkedList",
                    "list": [
                        {
                            "conditionType": "HTTP_HOST",
                            "javaClass": "com.untangle.app.bandwidth_control.BandwidthControlRuleCondition",
                            "value": "*pandora.com"
                        }
                    ]
                },
                "description": "Prioritize pandora streaming audio",
                "enabled": true,
                "id": 10,
                "javaClass": "com.untangle.app.bandwidth_control.BandwidthControlRule",
                "ruleId": 12345
            },
            {
                "action": {
                    "actionType": "SET_PRIORITY",
                    "javaClass": "com.untangle.app.bandwidth_control.BandwidthControlRuleAction",
                    "priority": 1
                },
                "conditions": {
                    "javaClass": "java.util.LinkedList",
                    "list": [
                        {
                            "conditionType": "HTTP_HOST",
                            "javaClass": "com.untangle.app.bandwidth_control.BandwidthControlRuleCondition",
                            "value": "*last.fm"
                        }
                    ]
                },
                "description": "Prioritize last.fm streaming audio",
                "enabled": true,
                "id": 11,
                "javaClass": "com.untangle.app.bandwidth_control.BandwidthControlRule",
                "ruleId": 12345
            },
            {
                "action": {
                    "actionType": "SET_PRIORITY",
                    "javaClass": "com.untangle.app.bandwidth_control.BandwidthControlRuleAction",
                    "priority": 2
                },
                "conditions": {
                    "javaClass": "java.util.LinkedList",
                    "list": [
                        {
                            "conditionType": "WEB_FILTER_CATEGORY",
                            "javaClass": "com.untangle.app.bandwidth_control.BandwidthControlRuleCondition",
                            "value": "Games"
                        }
                    ]
                },
                "description": "Prioritize HTTP to Games sites",
                "enabled": true,
                "id": 12,
                "javaClass": "com.untangle.app.bandwidth_control.BandwidthControlRule",
                "ruleId": 12345
            },
            {
                "action": {
                    "actionType": "SET_PRIORITY",
                    "javaClass": "com.untangle.app.bandwidth_control.BandwidthControlRuleAction",
                    "priority": 1
                },
                "conditions": {
                    "javaClass": "java.util.LinkedList",
                    "list": [
                        {
                            "conditionType": "HTTP_HOST",
                            "javaClass": "com.untangle.app.bandwidth_control.BandwidthControlRuleCondition",
                            "value": "*hulu.com"
                        }
                    ]
                },
                "description": "Prioritize Hulu streaming video",
                "enabled": true,
                "id": 13,
                "javaClass": "com.untangle.app.bandwidth_control.BandwidthControlRule",
                "ruleId": 12345
            },
            {
                "action": {
                    "actionType": "SET_PRIORITY",
                    "javaClass": "com.untangle.app.bandwidth_control.BandwidthControlRuleAction",
                    "priority": 1
                },
                "conditions": {
                    "javaClass": "java.util.LinkedList",
                    "list": [
                        {
                            "conditionType": "HTTP_HOST",
                            "javaClass": "com.untangle.app.bandwidth_control.BandwidthControlRuleCondition",
                            "value": "netflix.com"
                        }
                    ]
                },
                "description": "Prioritize Netflix streaming video",
                "enabled": true,
                "id": 14,
                "javaClass": "com.untangle.app.bandwidth_control.BandwidthControlRule",
                "ruleId": 12345
            },
            {
                "action": {
                    "actionType": "SET_PRIORITY",
                    "javaClass": "com.untangle.app.bandwidth_control.BandwidthControlRuleAction",
                    "priority": 6
                },
                "conditions": {
                    "javaClass": "java.util.LinkedList",
                    "list": [
                        {
                            "conditionType": "HTTP_HOST",
                            "javaClass": "com.untangle.app.bandwidth_control.BandwidthControlRuleCondition",
                            "value": "*dropbox.com"
                        }
                    ]
                },
                "description": "Limit dropbox.com sync",
                "enabled": true,
                "id": 15,
                "javaClass": "com.untangle.app.bandwidth_control.BandwidthControlRule",
                "ruleId": 12345
            },
            {
                "action": {
                    "actionType": "SET_PRIORITY",
                    "javaClass": "com.untangle.app.bandwidth_control.BandwidthControlRuleAction",
                    "priority": 3
                },
                "conditions": {
                    "javaClass": "java.util.LinkedList",
                    "list": [
                        {
                            "conditionType": "HTTP_CONTENT_LENGTH",
                            "invert": false,
                            "javaClass": "com.untangle.app.bandwidth_control.BandwidthControlRuleCondition",
                            "value": ">10000000"
                        }
                    ]
                },
                "description": "Do not Prioritize large HTTP downloads (>10meg)",
                "enabled": true,
                "id": 16,
                "javaClass": "com.untangle.app.bandwidth_control.BandwidthControlRule",
                "ruleId": 12345
            },
            {
                "action": {
                    "actionType": "SET_PRIORITY",
                    "javaClass": "com.untangle.app.bandwidth_control.BandwidthControlRuleAction",
                    "priority": 2
                },
                "conditions": {
                    "javaClass": "java.util.LinkedList",
                    "list": [
                        {
                            "conditionType": "DST_PORT",
                            "javaClass": "com.untangle.app.bandwidth_control.BandwidthControlRuleCondition",
                            "value": "80"
                        }
                    ]
                },
                "description": "Prioritize HTTP",
                "enabled": true,
                "id": 17,
                "javaClass": "com.untangle.app.bandwidth_control.BandwidthControlRule",
                "ruleId": 12345
            },
            {
                "action": {
                    "actionType": "SET_PRIORITY",
                    "javaClass": "com.untangle.app.bandwidth_control.BandwidthControlRuleAction",
                    "priority": 2
                },
                "conditions": {
                    "javaClass": "java.util.LinkedList",
                    "list": [
                        {
                            "conditionType": "DST_PORT",
                            "javaClass": "com.untangle.app.bandwidth_control.BandwidthControlRuleCondition",
                            "value": "443"
                        }
                    ]
                },
                "description": "Prioritize HTTPS",
                "enabled": true,
                "id": 18,
                "javaClass": "com.untangle.app.bandwidth_control.BandwidthControlRule",
                "ruleId": 12345
            }
        ]
    },
    "settingsVersion": 5
}
