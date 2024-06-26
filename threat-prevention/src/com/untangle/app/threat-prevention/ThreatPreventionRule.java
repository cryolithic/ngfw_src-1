/**
 * $Id$
 */
package com.untangle.app.threat_prevention;

import java.util.List;
import java.io.Serializable;
import java.net.InetAddress;


import org.json.JSONObject;
import org.json.JSONString;
import org.apache.logging.log4j.Logger;
import org.apache.logging.log4j.LogManager;

import com.untangle.uvm.vnet.SessionAttachments;
import com.untangle.uvm.vnet.AppSession;

/**
 * This in the implementation of an Threat Prevention Action Rule
 *
 * A rule is basically a collection of ThreatPreventionRuleConditions (matchers)
 * and what to do if the matchers match (block, log, etc)
 */
@SuppressWarnings("serial")
public class ThreatPreventionRule implements JSONString, Serializable
{
    private final Logger logger = LogManager.getLogger(getClass());

    private List<ThreatPreventionRuleCondition> matchers;

    private Integer ruleId;
    private Boolean enabled;
    private Boolean flag;
    private String action;
    private String description;
    
    public ThreatPreventionRule()
    {
    }

    public ThreatPreventionRule(boolean enabled, List<ThreatPreventionRuleCondition> matchers, boolean flag, String action, String description)
    {
        this.setConditions(matchers);
        this.setEnabled(Boolean.valueOf(enabled));
        this.setFlag(Boolean.valueOf(flag));
        this.setAction(action);
        this.setDescription(description);
    }
    
    public List<ThreatPreventionRuleCondition> getConditions() { return this.matchers; }
    public void setConditions( List<ThreatPreventionRuleCondition> newValue ) { this.matchers = newValue; }

    public Integer getRuleId() { return this.ruleId; }
    public void setRuleId( Integer newValue ) { this.ruleId = newValue; }

    public Boolean getEnabled() { return enabled; }
    public void setEnabled( Boolean newValue ) { this.enabled = newValue; }

    public String getAction() { return action; }
    public void setAction( String newValue ) { this.action = newValue; }

    public Boolean getFlag() { return flag; }
    public void setFlag( Boolean newValue ) { this.flag = newValue; }
    
    public String getDescription() { return description; }
    public void setDescription( String newValue ) { this.description = newValue; }
    
    public String toJSONString()
    {
        JSONObject jO = new JSONObject(this);
        return jO.toString();
    }
    
    public boolean isMatch( short protocol,
                            int srcIntf, int dstIntf,
                            InetAddress srcAddress, InetAddress dstAddress,
                            int srcPort, int dstPort,
                            SessionAttachments attachments)
    {
        if (!getEnabled())
            return false;

        //logger.debug("Checking rule " + getRuleId() + " against [" + protocol + " " + srcAddress + ":" + srcPort + " -> " + dstAddress + ":" + dstPort + "]");
            
        /**
         * If no matchers return true
         */
        if (this.matchers == null) {
            logger.warn("Null matchers - assuming true");
            return true;
        }

        /**
         * It everything doesn't match, then return false.
         */
        for ( ThreatPreventionRuleCondition matcher : matchers ) {
            if (!matcher.matches(protocol,
                            srcIntf, dstIntf,
                            srcAddress, dstAddress,
                            srcPort, dstPort,
                            attachments) ){

                return false;
            }
        }

        /**
         * Otherwise these all match.
         */
        return true;
    }

    public boolean isMatch( AppSession session)
    {
        if (!getEnabled())
            return false;

        //logger.debug("Checking rule " + getRuleId() + " against [" + protocol + " " + srcAddress + ":" + srcPort + " -> " + dstAddress + ":" + dstPort + "]");
            
        /**
         * If no matchers return true
         */
        if (this.matchers == null) {
            logger.warn("Null matchers - assuming true");
            return true;
        }

        /**
         * IF any matcher doesn't match - return false
         */
        for (ThreatPreventionRuleCondition item : matchers) {
            if (!item.matches(session)) return false;
        }

        /**
         * Otherwise everything is matching.
         */
        return true;
    }

    
}

