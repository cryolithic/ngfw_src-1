/**
 * $Id: IpsSettings.java 38161 2014-07-23 23:01:44Z dmorris $
 */
package com.untangle.app.intrusion_prevention;

import java.io.Serializable;
import java.util.LinkedList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * IntrusionPrevention event rule mapping
 */
@SuppressWarnings("serial")
public class IntrusionPreventionEventMap implements Serializable
{
    private Set<IntrusionPreventionEventMapRule> rules = new HashSet<IntrusionPreventionEventMapRule>();

    /**
     * Read the rules.
     *
     * @return
     *  List of event map type rules.
     */
    public List<IntrusionPreventionEventMapRule> getRules() { 
        return new LinkedList<IntrusionPreventionEventMapRule>(this.rules); 
    }
    /**
     * Set the rules.
     *
     * @param newValue
     *  List of event map type rules.
     */
    public void setRules( List<IntrusionPreventionEventMapRule> newValue ) { this.rules = new HashSet<IntrusionPreventionEventMapRule>(newValue); }

    /**
     * Look for rule signature.
     *
     * @param signatureId
     *  Signature id to match.
     * @param generatorId
     *  Generator id to match.
     * @return
     *  MapRule containing the best match.
     */
    public IntrusionPreventionEventMapRule getRuleBySignatureAndGeneratorId( long signatureId, long generatorId ){
        IntrusionPreventionEventMapRule bestMatchRule = null;
    	for( IntrusionPreventionEventMapRule rule : this.rules ){
            if( ( rule.getSid() == signatureId ) &&
                ( rule.getGid() == generatorId ) ){
                /*
                 * Explicit signature and signature match.
                 */
                return rule;                
            }
    		if( rule.getSid() == signatureId ){
                /*
                 * Fall back to just a signature match
                 */
    			bestMatchRule = rule;
    		}
    	}
    	return bestMatchRule;
    }
    
}
