/**
 * $Id$
 */
package com.untangle.app.intrusion_prevention;

import org.json.JSONObject;
import org.json.JSONString;
import java.io.Serializable;
import java.util.List;
import java.util.LinkedList;
import java.util.HashMap;
import java.util.Map;

/**
 * Settings for Intrusion Prevenion.
 */
@SuppressWarnings("serial")
public class IntrusionPreventionSettings implements Serializable, JSONString
{
    private Integer version = 3;
    private String defaultsMd5sum = "";
    private String classificationMd5sum = "";
    private List<IntrusionPreventionRule> rules = new LinkedList<>();
    private List<String> signatures = new LinkedList<>();
    private Map<String, String> variables = new HashMap<String, String>();
    private Integer iptablesNfqNumber = 2930;
    private Integer iptablesMaxScanSize = 1024;
    private JSONObject suricataSettings = new JSONObject();

    public IntrusionPreventionSettings() { }

    public IntrusionPreventionSettings(List<IntrusionPreventionRule> rules, List<String> signatures, Map<String, String> variables, Integer iptablesNfqNumber, Integer iptablesMaxScanSize)
    {
        this.rules = rules;
        this.signatures = signatures;
        this.variables = variables;
        this.iptablesNfqNumber = iptablesNfqNumber;
        this.iptablesMaxScanSize = iptablesMaxScanSize;
    }

    public Integer getVersion() { return version; }
    public void setVersion(Integer version) { this.version = version; }

    public String getDefaultsMd5sum() { return defaultsMd5sum; }
    public void setDefaultsMd5sum(String defaultsMd5sum) { this.defaultsMd5sum = defaultsMd5sum; }

    public String getClassificationMd5sum() { return classificationMd5sum; }
    public void setClassificationMd5sum(String classificationMd5sum) { this.classificationMd5sum = classificationMd5sum; }

    public List<IntrusionPreventionRule> getRules() { return rules; }
    public void setRules(List<IntrusionPreventionRule> signatures) { this.rules = rules; }

    public List<String> getSignatures() { return signatures; }
    public void setSignatures(List<String> signatures) { this.signatures = signatures; }

    public Map<String,String> getVariables() { return variables; }
    public void setVariables(Map<String, String> variables) { this.variables = variables; }

    public JSONObject getSuricataSettings() { return suricataSettings; }
    public void setSuricataSettings(JSONObject suricataSettings) { this.suricataSettings = suricataSettings; }

    public Integer getIptablesNfqNumber() { return iptablesNfqNumber; }
    public void setIptablesNfqNumber(Integer iptableNfqNumber) { this.iptablesNfqNumber = iptablesNfqNumber; }

    public Integer getIptablesMaxScanSize() { return iptablesMaxScanSize; }
    public void setIptablesMaxScanSize(Integer iptablesMaxScanSize) { this.iptablesMaxScanSize = iptablesMaxScanSize; }

    /**
     * Returns settings as a JSON string.
     *
     * @return
     *      Server settings in JSON form.
     */
    public String toJSONString()
    {
        JSONObject jO = new JSONObject(this);
        return jO.toString();
    }
}
