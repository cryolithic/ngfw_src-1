/**
 * $Id: EventManagerImpl.java,v 1.00 2015/03/04 13:59:12 dmorris Exp $
 */
package com.untangle.uvm;

import com.untangle.uvm.app.App;
import com.untangle.uvm.app.IPMatcher;
import com.untangle.uvm.app.Reporting;
import com.untangle.uvm.event.AlertEvent;
import com.untangle.uvm.event.AlertRule;
import com.untangle.uvm.event.EventRule;
import com.untangle.uvm.event.EventRuleCondition;
import com.untangle.uvm.event.EventSettings;
import com.untangle.uvm.event.SyslogRule;
import com.untangle.uvm.event.SyslogServer;
import com.untangle.uvm.event.TriggerRule;
import com.untangle.uvm.logging.LogEvent;
import com.untangle.uvm.util.Constants;
import com.untangle.uvm.util.I18nUtil;
import com.untangle.uvm.util.StringUtil;
import org.apache.commons.io.IOUtils;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.json.JSONArray;
import org.json.JSONObject;
import org.json.JSONString;

import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.io.Serializable;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Date;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.SortedSet;
import java.util.TreeSet;
import java.util.concurrent.LinkedTransferQueue;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * Event prcessor
 */
public class EventManagerImpl implements EventManager
{
    private static final Integer SETTINGS_CURRENT_VERSION = 6;

    private static final Logger logger = LogManager.getLogger(EventManagerImpl.class);

    /**
     * If the event queue length reaches the high water mark
     * Then the eventWriter is not able to keep up with demand
     * In this case the overloadedFlag is set to true
     */
    private static int HIGH_WATER_MARK = 1000000;

    /**
     * If overloadedFlag is set to true and the queue shrinks to this size
     * then overloadedFlag will be set to false
     */
    private static int LOW_WATER_MARK = 100000;
    /**
     * If true then the eventWriter is considered "overloaded" and can not keep up with demand
     * This is set if the event queue length reaches the high water mark
     * In this case we stop logging events entirely until we are no longer overloaded
     */
    private boolean localOverloadedFlag = false;
    private boolean remoteOverloadedFlag = false;

    private long lastLocalLoggedWarningTime = System.currentTimeMillis();
    private long lastRemoteLoggedWarningTime = System.currentTimeMillis();

    private static EventManagerImpl instance = null;

    private final String settingsFilename = System.getProperty("uvm.settings.dir") + "/untangle-vm/" + "events.js";
    private final String classesFilename = System.getProperty("uvm.lib.dir") + "/untangle-vm/events/" + "classFields.json";

    private LocalEventWriter localEventWriter = new LocalEventWriter();
    private RemoteEventWriter remoteEventWriter = new RemoteEventWriter();

    private Map<String, String> i18nMap;

    private static String DefaultEmailSubject = "";
    private static String DefaultEmailBody = "";
    private static Map<String,EventTemplateVariable> eventTemplateVariables;

    private static final String PREVIEW_EVENT_CLASS_NAME = "SystemStatEvent";
    private LogEvent mostRecentPreviewEvent = null;
    private static final String DISK_CHECK_FAILURE = "DISK_CHECK_FAILURE";
    private static final String DISK_CHECK_FAILURE_MESSAGE = "Disk health checks failed";
    private static final String CRITICAL_DEVICE_TEMPERATURE = "CRITICAL_DEVICE_TEMPERATURE";
    private static final String CRITICAL_DEVICE_TEMPERATURE_MESSAGE = "Device temperature exceeded critical threshold";
    private final HookCallback settingsChangeHook = new SettingsHook();;
    private static HookCallback appInstantiateHook;
    private static HookCallback appDestroyHook;

    /**
     * The current event settings
     */
    private EventSettings settings;

    private static Map<String, Boolean> classesToProcess = new HashMap<>();
    private static Map<String, Integer> EventsSeen = new HashMap<>();

    private Reporting reportsApp = null;

    /**
     * Initialize event manager.
     *
     * * Load settings.
     * * Start event writer.
     * 
     * @return Instance of event manager.
     */
    protected EventManagerImpl()
    {
        i18nMap = UvmContextFactory.context().languageManager().getTranslations("untangle");
        SettingsManager settingsManager = UvmContextFactory.context().settingsManager();
        EventSettings readSettings = null;

        try {
            readSettings = settingsManager.load( EventSettings.class, this.settingsFilename );
        } catch ( SettingsManager.SettingsException e ) {
            logger.warn( "Failed to load settings:", e );
        }

        buildEmailTemplateDefaults();
        buildEmailTemplateVariables();

        /**
         * If there are still no settings, just initialize
         */
        if (readSettings == null) {
            logger.warn( "No settings found - Initializing new settings." );
            this.setSettings( defaultSettings() );
        } else {
            updateSettings(readSettings);

            this.settings = readSettings;

            logger.debug( "Loading Settings: " + this.settings.toJSONString() );
        }
        buildClassesToProcess();

        localEventWriter.start();
        remoteEventWriter.start();

        SyslogManagerImpl.reconfigureCheck(settingsFilename, this.settings);
        UvmContextFactory.context().hookManager().registerCallback( com.untangle.uvm.HookManager.SETTINGS_CHANGE, this.settingsChangeHook );

        appInstantiateHook = new AppInstantiateHook();
        appDestroyHook = new AppDestroyHook();
        UvmContextFactory.context().hookManager().registerCallback( HookManager.APPLICATION_INSTANTIATE, appInstantiateHook );
        UvmContextFactory.context().hookManager().registerCallback( HookManager.APPLICATION_DESTROY, appDestroyHook );
    }

    /**
     * Update settings.
     * @param newSettings EventSettings to replace current settings.
     */
    public void setSettings( final EventSettings newSettings )
    {
        /**
         * Set the Event Rules IDs
         */
        int idx = 0;
        for (AlertRule rule : newSettings.getAlertRules()) {
            rule.setRuleId(++idx);
        }
        idx = 0;
        for (SyslogRule rule : newSettings.getSyslogRules()) {
            rule.setRuleId(++idx);
        }
        idx = 0;
        for (TriggerRule rule : newSettings.getTriggerRules()) {
            rule.setRuleId(++idx);

            if ( rule.getTagName() == null )
                throw new RuntimeException("Missing tag name on trigger rule: " + idx);
            if ( rule.getTagTarget() == null )
                throw new RuntimeException("Missing tag target on trigger rule: " + idx);
            if ( rule.getTagLifetimeSec() == null )
                throw new RuntimeException("Missing tag lifetime on trigger rule: " + idx);
        }

        if (newSettings != null) {
            LinkedList<SyslogServer> inputServerList =  newSettings.getSyslogServers();
            //cover the Base scenario of default LogServer enabled and default logserver post upgrade restart
            if (inputServerList == null ) {
                LinkedList<SyslogServer> syslogList = new LinkedList<SyslogServer>();
                LinkedList<Integer> sysLogIntegerList = new LinkedList<Integer>();
                if (newSettings.getSyslogEnabled()) {
                    SyslogServer logServer = new SyslogServer(getLastUsedServerId(inputServerList) + 1, true, newSettings.getSyslogHost(), newSettings.getSyslogPort(), newSettings.getSyslogProtocol(), SyslogManagerImpl.LOG_TAG_PREFIX, "Default Syslog Server");
                    syslogList.add(logServer);
                    //Disable sysLogHost, and sysLogEnabled field
                    //Syslog servers will be managed by List
                    newSettings.setSyslogHost(null);
                    newSettings.setSyslogEnabled(false);
                    newSettings.setSyslogServers(syslogList);
                    //During Upgrade with Syslog enabled and default syslog set
                    // first syslog server will have server ID as 1.
                    sysLogIntegerList.add(1);
                } else {
                    newSettings.setSyslogServers(syslogList);
                }
                //Set Empty List in case of Syslog Disabled during upgrade.
                for (SyslogRule rule : newSettings.getSyslogRules()) {
                    rule.setSyslogServers(sysLogIntegerList);
                }
            } else {
                // set ServerIDs based on last used logic
                for (SyslogServer syslogServer : inputServerList ) {
                    //Skip Default Scenario, and set serverID and Tag for New SyslogServers
                    if (syslogServer.getServerId() == -1) {
                        syslogServer.setServerId(getLastUsedServerId(inputServerList) + 1);
                    }
                }
            }
        }

        /**
         * Save the settings
         */
        SettingsManager settingsManager = UvmContextFactory.context().settingsManager();
        try {
            settingsManager.save( this.settingsFilename, newSettings );
        } catch (SettingsManager.SettingsException e) {
            logger.warn("Failed to save settings.",e);
            return;
        }

        /**
         * Change current settings
         */
        this.settings = newSettings;
        try {logger.debug("New Settings: \n" + new org.json.JSONObject(this.settings).toString(2));} catch (Exception e) {}

        SyslogManagerImpl.reconfigure(this.settings);
        buildClassesToProcess();
    }

    /**
     * Get the network settings
     * @return EventSettings of current settings.
     */
    public EventSettings getSettings()
    {
        return this.settings;
    }

    /**
     * Extract class field from rule and add to list if not already found.
     *
     * @param rule    EventRule to process.
     * @param classes List of classes to add to and check.
     * @return boolean if true, this rule wants to match on all classes, otherwise false.
     */
    private boolean buildClassesToProcessRules(EventRule rule, List<String> classes){
        Boolean classFound = false;
        String fieldValue = null;
        for(EventRuleCondition condition: rule.getConditions()){
            if(condition.getField().equals(Constants.CLASS) || condition.getField().equals("javaClass")){
                fieldValue = condition.getFieldValue();
                classFound = true;
                if(!classes.contains(fieldValue)){
                    classes.add(fieldValue);
                }
            }
        }
        return classFound == false;
    }

    /**
     * Build regex list of classes to match to add to local queue.
     */
    private void buildClassesToProcess(){
        LinkedList<String> classes = new LinkedList<>();

        boolean allClasses = false;
        for(EventRule rule : Stream.of(settings.getAlertRules(), settings.getTriggerRules())
                            .flatMap(Collection::stream)
                            .collect(Collectors.toList()) ){
            if(rule.getEnabled()){
                allClasses = buildClassesToProcessRules(rule, classes);
            }
            if(allClasses){
                break;
            }
        }

        // NOTE: Make sure syslog processing comes last.
        if(!allClasses){
            for(SyslogRule rule : settings.getSyslogRules()){
                if(rule.getEnabled() && !rule.getSyslogServers().isEmpty()){
                    allClasses = buildClassesToProcessRules(rule, classes);
                }
                if(allClasses){
                    break;
                }
            }
        }
        if(allClasses){
            classes.clear();
        }

        synchronized (classesToProcess) {
            classesToProcess.clear();
            for(String className : classes ){
                classesToProcess.put(className.replaceAll("\\*", ""), true);
            }
        }
    }

    /**
     * Retreive class fields for UI.
     * @return JSONObject of class fields.
     */
    public JSONObject getClassFields()
    {
        JSONObject classFields = null;
        File f = new File(classesFilename);
        if(f.exists()){
            try{
                InputStream is = new FileInputStream( classesFilename );
                String jsonTxt = IOUtils.toString(is, "UTF-8");
                classFields = new JSONObject(jsonTxt);
            }catch(Exception e){
                logger.warn( "Unable to load event classes:", e);
            }
        }
        return classFields;
    }

    /**
     * Return template parameters
     *
     * @return     List of JSON objects for template parameters
     */
    public JSONArray getTemplateParameters(){
        JSONArray result = null;
        int index = 0;

        result = new JSONArray();
        try{
            SortedSet<String> sortedKeys = new TreeSet<>(eventTemplateVariables.keySet());

            for(String variable : sortedKeys){
                JSONObject jo = new JSONObject(EventManagerImpl.eventTemplateVariables.get(variable));
                jo.remove(Constants.CLASS);
                result.put(index++, jo);
            }
        }catch(Exception e){
            logger.warn("getTemplateParameters:", e);
        }

        return result;
    }

    /**
     * Generate a preview of the email format alert with passed
     * templates and conversion.  Also convert whitepace characters for UI display.
     * @param  rule            AlertRule to process.
     * @param  event           LogEvent to process.
     * @param  subjectTemplate Email subject template.
     * @param  bodyTemplate    Email body template
     * @param  convert         If true, pass convert to human readable.  Otherwise, don't.
     * @return                 Map containing emailSubject and emailBody.
     */
    public Map<String, String> emailAlertFormatPreview(AlertRule rule, LogEvent event, String subjectTemplate, String bodyTemplate, boolean convert){
        if(mostRecentPreviewEvent != null){
            event = mostRecentPreviewEvent;
        }
        Map<String,String> email = emailAlertFormat(rule, event, subjectTemplate, bodyTemplate, convert);
        for(String key : email.keySet() ){
            email.put(key, email.get(key).replaceAll("\n", "<br>"));
            email.put(key, email.get(key).replaceAll("\n", "<br>"));
        }

        return email;
    }

    /**
     * Generate email subject, body from rule, event, and templates.
     * @param  rule            AlertRule to process.
     * @param  event           LogEvent to process.
     * @param  subjectTemplate Email subject template.
     * @param  bodyTemplate    Email body template
     * @param  convert         If true, pass convert to human readable.  Otherwise, don't.
     * @return                 Map containing emailSubject and emailBody.
     */
    public static Map<String, String> emailAlertFormat(AlertRule rule, LogEvent event, String subjectTemplate, String bodyTemplate, boolean convert)
    {
        String subject = subjectTemplate == null ? DefaultEmailSubject : subjectTemplate;
        String body = bodyTemplate == null ? DefaultEmailBody : bodyTemplate;

        for(EventTemplateVariable variable : EventManagerImpl.eventTemplateVariables.values() ){
            if(variable.getNameMatcher().matcher(subject).find()){
                subject = subject.replaceAll(variable.getName(), variable.getValue(rule, event, convert));
            }
            if(variable.getNameMatcher().matcher(body).find()){
                body = body.replaceAll(variable.getName(), variable.getValue(rule, event, convert));
            }
        }

        Map<String, String> email = new HashMap<>();
        email.put( "emailSubject", subject);
        email.put( "emailBody", body );

        return email;
    }


    /**
     * Update passed settings to latest verson.
     *
     * @param  settings Current EventSettings
     * @return          Nothing
     */
    private void updateSettings(EventSettings settings){
        if(settings.getVersion() < SETTINGS_CURRENT_VERSION){

            // Below code to add CriticalAlertEvent as default event can be removed after 17.4 release
            boolean criticalFlag = false;
            boolean diskCheckFailFlag = false;
            boolean deviceCriticalTemperature = false;

            // search for the CriticalAlertEvent CRITICAL_DEVICE_TEMPERATURE rule
            for (EventRule er : settings.getAlertRules()) {
                for(EventRuleCondition c : er.getConditions()) {
                    if(c.getField().equals(Constants.CLASS) && c.getFieldValue().equals(Constants.CRITICAL_ALERT_EVENT_RGX)){
                        criticalFlag = true;
                    }
                    if(c.getField().equals(Constants.COMPONENT) && c.getFieldValue().equals(DISK_CHECK_FAILURE)){
                        diskCheckFailFlag = true;
                    }
                    if(c.getField().equals(Constants.COMPONENT) && c.getFieldValue().equals(CRITICAL_DEVICE_TEMPERATURE)){
                        deviceCriticalTemperature = true;
                    }
                }
            }

            // if we didn't find the CriticalAlertEvent DISK_CHECK_FAILURE rule create at top
            if ((!criticalFlag) || (!diskCheckFailFlag)) {
                this.addCriticalEventRules(settings, DISK_CHECK_FAILURE, DISK_CHECK_FAILURE_MESSAGE);
            }

            // if we didn't find the CriticalAlertEvent CRITICAL_DEVICE_TEMPERATURE rule create at top
            if ((!criticalFlag) || (!deviceCriticalTemperature)) {
                this.addCriticalEventRules(settings, CRITICAL_DEVICE_TEMPERATURE, CRITICAL_DEVICE_TEMPERATURE_MESSAGE);
            }


            // set the alertrules FieldValues from null to correct values
            for (EventRule er : settings.getAlertRules()) {
                if(er.getThresholdTimeframeSec() == null){
                    er.setThresholdTimeframeSec(60);
                }
                if(er.getThresholdEnabled() == null){
                    er.setThresholdEnabled(false);
                }
            }

            settings.setVersion(SETTINGS_CURRENT_VERSION);
        }
        this.setSettings( settings );
    }

    /**
     * Adds CriticalEvent Rule like CRITICAL_DEVICE_TEMPERATURE DISK_CHECK_FAILURE .
     *  @param settings Current EventSettings
     * @param  criticalEventName criticalEventName
     * @param  criticalEventMessage criticalEventMessage
     */
    private void addCriticalEventRules(EventSettings settings, String criticalEventName, String criticalEventMessage)
    {
        LinkedList<EventRuleCondition> conditions;
        EventRuleCondition condition1;
        EventRuleCondition condition2;
        AlertRule eventRule;

        conditions = new LinkedList<>();
        condition1 = new EventRuleCondition( Constants.CLASS, Constants.EQUALS_TO, Constants.CRITICAL_ALERT_EVENT_RGX );
        conditions.add( condition1 );
        condition2 = new EventRuleCondition( Constants.COMPONENT, Constants.EQUALS_TO, criticalEventName );
        conditions.add( condition2 );
        eventRule = new AlertRule( true, conditions, true, true, criticalEventMessage , false, 0 );
        settings.getAlertRules().addFirst( eventRule );
    }


    /**
     * Create default settings.
     * @return EventSettings consisting of default values.
     */
    private EventSettings defaultSettings()
    {
        EventSettings settings = new EventSettings();
        settings.setVersion( SETTINGS_CURRENT_VERSION );
        settings.setAlertRules( defaultAlertRules() );
        settings.setSyslogRules( defaultSyslogRules() );
        settings.setTriggerRules( defaultTriggerRules() );

        // pass the settings to the OEM override function and return the override settings
        EventSettings overrideSettings = (EventSettings)UvmContextFactory.context().oemManager().applyOemOverrides(settings);
        return overrideSettings;
    }

    /**
     * Return default alert rules.
     * @return List of AlertRule consisting of default alert rules.
     */
    private LinkedList<AlertRule> defaultAlertRules()
    {
        LinkedList<AlertRule> rules = new LinkedList<>();

        LinkedList<EventRuleCondition> conditions;
        EventRuleCondition condition1;
        EventRuleCondition condition2;
        EventRuleCondition condition3;
        AlertRule eventRule;

        conditions = new LinkedList<>();
        condition1 = new EventRuleCondition( Constants.CLASS, Constants.EQUALS_TO, Constants.CRITICAL_ALERT_EVENT_RGX );
        conditions.add( condition1 );
        condition2 = new EventRuleCondition( Constants.COMPONENT, Constants.EQUALS_TO, CRITICAL_DEVICE_TEMPERATURE );
        conditions.add( condition2 );
        eventRule = new AlertRule( true, conditions, true, true, CRITICAL_DEVICE_TEMPERATURE_MESSAGE, false, 0 );
        rules.add( eventRule );

        conditions = new LinkedList<>();
        condition1 = new EventRuleCondition( Constants.CLASS, Constants.EQUALS_TO, Constants.CRITICAL_ALERT_EVENT_RGX );
        conditions.add( condition1 );
        condition2 = new EventRuleCondition( Constants.COMPONENT, Constants.EQUALS_TO, DISK_CHECK_FAILURE );
        conditions.add( condition2 );
        eventRule = new AlertRule( true, conditions, true, true, DISK_CHECK_FAILURE_MESSAGE, false, 0 );
        rules.add( eventRule );

        conditions = new LinkedList<>();
        condition1 = new EventRuleCondition( Constants.CLASS, Constants.EQUALS_TO, Constants.CRITICAL_ALERT_EVENT_RGX );
        conditions.add( condition1 );
        condition2 = new EventRuleCondition( Constants.COMPONENT, Constants.EQUALS_TO, "REPORTS" );
        conditions.add( condition2 );
        eventRule = new AlertRule( true, conditions, true, true, "Reporting disabled due to low disk space", false, 0 );
        rules.add( eventRule );

        conditions = new LinkedList<>();
        condition1 = new EventRuleCondition( Constants.CLASS, Constants.EQUALS_TO, "*WanFailoverEvent*" );
        conditions.add( condition1 );
        condition2 = new EventRuleCondition( Constants.ACTION, Constants.EQUALS_TO, "DISCONNECTED" );
        conditions.add( condition2 );
        eventRule = new AlertRule( true, conditions, true, true, "WAN is offline", false, 0 );
        rules.add( eventRule );

        conditions = new LinkedList<>();
        condition1 = new EventRuleCondition( Constants.CLASS, Constants.EQUALS_TO, Constants.SYSTEM_STAT_EVENT_RGX );
        conditions.add( condition1 );
        condition2 = new EventRuleCondition( "load1", ">", "20" );
        conditions.add( condition2 );
        eventRule = new AlertRule( true, conditions, true, true, "Server load is high", true, 60 );
        rules.add( eventRule );

        conditions = new LinkedList<>();
        condition1 = new EventRuleCondition( Constants.CLASS, Constants.EQUALS_TO, Constants.SYSTEM_STAT_EVENT_RGX );
        conditions.add( condition1 );
        condition2 = new EventRuleCondition( "diskFreePercent", "<", ".2" );
        conditions.add( condition2 );
        eventRule = new AlertRule( true, conditions, true, true, "Free disk space is low", true, 60 );
        rules.add( eventRule );

        conditions = new LinkedList<>();
        condition1 = new EventRuleCondition( Constants.CLASS, Constants.EQUALS_TO, Constants.SYSTEM_STAT_EVENT_RGX );
        conditions.add( condition1 );
        condition2 = new EventRuleCondition( "memFreePercent", "<", ".05" );
        conditions.add( condition2 );
        eventRule = new AlertRule( false, conditions, true, true, "Free memory is low", true, 60 );
        rules.add( eventRule );

        conditions = new LinkedList<>();
        condition1 = new EventRuleCondition( Constants.CLASS, Constants.EQUALS_TO, Constants.SYSTEM_STAT_EVENT_RGX );
        conditions.add( condition1 );
        condition2 = new EventRuleCondition( "swapUsedPercent", ">", ".25" );
        conditions.add( condition2 );
        eventRule = new AlertRule( true, conditions, true, true, "Swap usage is high", true, 60 );
        rules.add( eventRule );

        conditions = new LinkedList<>();
        condition1 = new EventRuleCondition( Constants.CLASS, Constants.EQUALS_TO, Constants.SESSION_EVENT_RGX );
        conditions.add( condition1 );
        condition2 = new EventRuleCondition( Constants.S_SERVER_PORT, Constants.EQUALS_TO, "22" );
        conditions.add( condition2 );
        eventRule = new AlertRule( true, conditions, true, true, "Suspicious Activity: Client created many SSH sessions", true, 60, Boolean.TRUE, 20.0D, 60, "CClientAddr");
        rules.add( eventRule );

        conditions = new LinkedList<>();
        condition1 = new EventRuleCondition( Constants.CLASS, Constants.EQUALS_TO, Constants.SESSION_EVENT_RGX );
        conditions.add( condition1 );
        condition2 = new EventRuleCondition( Constants.S_SERVER_PORT, Constants.EQUALS_TO, "3389" );
        conditions.add( condition2 );
        eventRule = new AlertRule( true, conditions, true, true, "Suspicious Activity: Client created many RDP sessions", true, 60, Boolean.TRUE, 20.0D, 60, "CClientAddr");
        rules.add( eventRule );

        conditions = new LinkedList<>();
        condition1 = new EventRuleCondition( Constants.CLASS, Constants.EQUALS_TO, Constants.SESSION_EVENT_RGX );
        conditions.add( condition1 );
        condition2 = new EventRuleCondition( "entitled", Constants.EQUALS_TO, Constants.FALSE );
        conditions.add( condition2 );
        eventRule = new AlertRule( true, conditions, true, true, "License limit exceeded. Session not entitled", true, 60*24 );
        rules.add( eventRule );

        conditions = new LinkedList<>();
        condition1 = new EventRuleCondition( Constants.CLASS, Constants.EQUALS_TO, Constants.WEB_FILTER_EVENT_RGX );
        conditions.add( condition1 );
        condition2 = new EventRuleCondition( Constants.BLOCKED, Constants.EQUALS_TO, Constants.FALSE );
        conditions.add( condition2 );
        condition3 = new EventRuleCondition( Constants.CATEGORY, Constants.EQUALS_TO, "Malware Sites" );
        conditions.add( condition3 );
        eventRule = new AlertRule( true, conditions, true, true, "Malware Sites website visit detected", false, 10 );
        rules.add( eventRule );

        conditions = new LinkedList<>();
        condition1 = new EventRuleCondition( Constants.CLASS, Constants.EQUALS_TO, Constants.WEB_FILTER_EVENT_RGX );
        conditions.add( condition1 );
        condition2 = new EventRuleCondition( Constants.BLOCKED, Constants.EQUALS_TO, Constants.TRUE );
        conditions.add( condition2 );
        condition3 = new EventRuleCondition( Constants.CATEGORY, Constants.EQUALS_TO, "Malware Sites" );
        conditions.add( condition3 );
        eventRule = new AlertRule( true, conditions, true, true, "Malware Sites website visit blocked", false, 10 );
        rules.add( eventRule );

        conditions = new LinkedList<>();
        condition1 = new EventRuleCondition( Constants.CLASS, Constants.EQUALS_TO, Constants.WEB_FILTER_EVENT_RGX );
        conditions.add( condition1 );
        condition2 = new EventRuleCondition( Constants.BLOCKED, Constants.EQUALS_TO, Constants.FALSE );
        conditions.add( condition2 );
        condition3 = new EventRuleCondition( Constants.CATEGORY, Constants.EQUALS_TO, "Bot Netst" );
        conditions.add( condition3 );
        eventRule = new AlertRule( true, conditions, true, true, "Bot Nets website visit detected", false, 10 );
        rules.add( eventRule );

        conditions = new LinkedList<>();
        condition1 = new EventRuleCondition( Constants.CLASS, Constants.EQUALS_TO, Constants.WEB_FILTER_EVENT_RGX );
        conditions.add( condition1 );
        condition2 = new EventRuleCondition( Constants.BLOCKED, Constants.EQUALS_TO, Constants.TRUE );
        conditions.add( condition2 );
        condition3 = new EventRuleCondition( Constants.CATEGORY, Constants.EQUALS_TO, "Bot Nets" );
        conditions.add( condition3 );
        eventRule = new AlertRule( true, conditions, true, true, "Bot Nets website visit blocked", false, 10 );
        rules.add( eventRule );

        conditions = new LinkedList<>();
        condition1 = new EventRuleCondition( Constants.CLASS, Constants.EQUALS_TO, Constants.WEB_FILTER_EVENT_RGX );
        conditions.add( condition1 );
        condition2 = new EventRuleCondition( Constants.BLOCKED, Constants.EQUALS_TO, Constants.FALSE );
        conditions.add( condition2 );
        condition3 = new EventRuleCondition( Constants.CATEGORY, Constants.EQUALS_TO, "Phishing and Other Frauds" );
        conditions.add( condition3 );
        eventRule = new AlertRule( true, conditions, true, true, "Phishing and Other Frauds website visit detected", false, 10 );
        rules.add( eventRule );

        conditions = new LinkedList<>();
        condition1 = new EventRuleCondition( Constants.CLASS, Constants.EQUALS_TO, Constants.WEB_FILTER_EVENT_RGX );
        conditions.add( condition1 );
        condition2 = new EventRuleCondition( Constants.BLOCKED, Constants.EQUALS_TO, Constants.TRUE );
        conditions.add( condition2 );
        condition3 = new EventRuleCondition( Constants.CATEGORY, Constants.EQUALS_TO, "Phishing and Other Frauds" );
        conditions.add( condition3 );
        eventRule = new AlertRule( true, conditions, true, true, "Phishing and Other Frauds website visit blocked", false, 10 );
        rules.add( eventRule );

        conditions = new LinkedList<>();
        condition1 = new EventRuleCondition( Constants.CLASS, Constants.EQUALS_TO, "*DeviceTableEvent*" );
        conditions.add( condition1 );
        condition2 = new EventRuleCondition( "key", Constants.EQUALS_TO, "add" );
        conditions.add( condition2 );
        if ( "i386".equals(System.getProperty("os.arch", "unknown")) || "amd64".equals(System.getProperty("os.arch", "unknown"))) {
            eventRule = new AlertRule( false, conditions, true, true, "New device discovered", false, 0 );
        } else {
            eventRule = new AlertRule( true, conditions, true, true, "New device discovered", false, 0 );
        }
        rules.add( eventRule );

        conditions = new LinkedList<>();
        condition1 = new EventRuleCondition( Constants.CLASS, Constants.EQUALS_TO, "*QuotaEvent*" );
        conditions.add( condition1 );
        condition2 = new EventRuleCondition( Constants.ACTION, Constants.EQUALS_TO, "2" );
        conditions.add( condition2 );
        eventRule = new AlertRule( false, conditions, true, true, "Host exceeded quota.", false, 0 );
        rules.add( eventRule );

        conditions = new LinkedList<>();
        condition1 = new EventRuleCondition( Constants.CLASS, Constants.EQUALS_TO, Constants.APP_CONTROL_LOG_EVENT_RGX );
        conditions.add( condition1 );
        condition2 = new EventRuleCondition( "protochain", Constants.EQUALS_TO, "*BITTORRE*" );
        conditions.add( condition2 );
        eventRule = new AlertRule( false, conditions, true, true, "Host is using Bittorrent", true, 60 );
        rules.add( eventRule );

        conditions = new LinkedList<>();
        condition1 = new EventRuleCondition( Constants.CLASS, Constants.EQUALS_TO, "*HttpResponseEvent*" );
        conditions.add( condition1 );
        condition2 = new EventRuleCondition( "contentLength", ">", "1000000000" );
        conditions.add( condition2 );
        eventRule = new AlertRule( false, conditions, true, true, "Host is doing large download", true, 60 );
        rules.add( eventRule );

        conditions = new LinkedList<>();
        condition1 = new EventRuleCondition( Constants.CLASS, Constants.EQUALS_TO, "*CaptivePortalUserEvent*" );
        conditions.add( condition1 );
        condition2 = new EventRuleCondition( "event", Constants.EQUALS_TO, "FAILED" );
        conditions.add( condition2 );
        eventRule = new AlertRule( false, conditions, true, true, "Failed Captive Portal login", false, 0 );
        rules.add( eventRule );

        conditions = new LinkedList<>();
        condition1 = new EventRuleCondition( Constants.CLASS, Constants.EQUALS_TO, "*VirusHttpEvent*" );
        conditions.add( condition1 );
        condition2 = new EventRuleCondition( "clean", Constants.EQUALS_TO, Constants.FALSE );
        conditions.add( condition2 );
        eventRule = new AlertRule( false, conditions, true, true, "HTTP virus blocked", false, 0 );
        rules.add( eventRule );

        conditions = new LinkedList<>();
        condition1 = new EventRuleCondition( Constants.CLASS, Constants.EQUALS_TO, "*ConfigurationBackupEvent*" );
        conditions.add( condition1 );
        condition2 = new EventRuleCondition( "success", Constants.EQUALS_TO, Constants.FALSE );
        conditions.add( condition2 );
        eventRule = new AlertRule( true, conditions, true, true, "Configuration backup failed", false, 0 );
        rules.add( eventRule );

        return rules;
    }

    /**
     * Return default suslog rules.
     * @return List of SyslogRule consisting of default syslog rules.
     */
    private LinkedList<SyslogRule> defaultSyslogRules()
    {
        LinkedList<SyslogRule> rules = new LinkedList<>();

        LinkedList<EventRuleCondition> conditions;
        EventRuleCondition condition1;
        EventRuleCondition condition2;
        EventRuleCondition condition3;
        SyslogRule eventRule;

        conditions = new LinkedList<>();
        eventRule = new SyslogRule( true, conditions, true, true, "All events", false, 0 );
        rules.add( eventRule );

        return rules;
    }

    /**
     * Return default trigger rules.
     * @return List of TriggerRule consisting of default trigger rules.
     */
    private LinkedList<TriggerRule> defaultTriggerRules()
    {
        LinkedList<TriggerRule> rules = new LinkedList<>();

        LinkedList<EventRuleCondition> conditions;
        EventRuleCondition condition1;
        EventRuleCondition condition2;
        EventRuleCondition condition3;
        TriggerRule eventRule;

        conditions = new LinkedList<>();
        condition1 = new EventRuleCondition( Constants.CLASS, Constants.EQUALS_TO, "*AlertEvent*" );
        conditions.add( condition1 );
        condition2 = new EventRuleCondition( "description", Constants.EQUALS_TO, "*Suspicious Activity*" );
        conditions.add( condition2 );
        eventRule = new TriggerRule( true, conditions, true, "Tag suspicious activity", false, 0 );
        eventRule.setAction( TriggerRule.TriggerAction.TAG_HOST );
        eventRule.setTagTarget( "cClientAddr" );
        eventRule.setTagName( "suspicious" );
        eventRule.setTagLifetimeSec( (long) (60*30) ); // 30 minutes
        rules.add( eventRule );
        
        conditions = new LinkedList<>();
        condition1 = new EventRuleCondition( Constants.CLASS, Constants.EQUALS_TO, Constants.APP_CONTROL_LOG_EVENT_RGX);
        conditions.add( condition1 );
        condition2 = new EventRuleCondition( Constants.CATEGORY, Constants.EQUALS_TO, "Proxy" );
        conditions.add( condition2 );
        eventRule = new TriggerRule( false, conditions, true, "Tag proxy-using hosts", false, 0 );
        eventRule.setAction( TriggerRule.TriggerAction.TAG_HOST );
        eventRule.setTagTarget( "sessionEvent.localAddr" );
        eventRule.setTagName( "proxy-use" );
        eventRule.setTagLifetimeSec( (long) (60*30) ); // 30 minutes
        rules.add( eventRule );

        conditions = new LinkedList<>();
        condition1 = new EventRuleCondition( Constants.CLASS, Constants.EQUALS_TO, Constants.APP_CONTROL_LOG_EVENT_RGX );
        conditions.add( condition1 );
        condition2 = new EventRuleCondition( "application", Constants.EQUALS_TO, "BITTORRE" );
        conditions.add( condition2 );
        eventRule = new TriggerRule( false, conditions, true, "Tag bittorrent-using hosts", false, 0 );
        eventRule.setAction( TriggerRule.TriggerAction.TAG_HOST );
        eventRule.setTagTarget( "sessionEvent.CClientAddr" );
        eventRule.setTagName( "bittorrent-usage" );
        eventRule.setTagLifetimeSec( (long) (60*5) ); // 5 minutes
        rules.add( eventRule );

        conditions = new LinkedList<>();
        condition1 = new EventRuleCondition( Constants.CLASS, Constants.EQUALS_TO, Constants.APP_CONTROL_LOG_EVENT_RGX );
        conditions.add( condition1 );
        condition2 = new EventRuleCondition( Constants.CATEGORY, Constants.EQUALS_TO, "BITTORRE" );
        conditions.add( condition2 );
        eventRule = new TriggerRule( false, conditions, true, "Tag bittorrent-using hosts", false, 0 );
        eventRule.setAction( TriggerRule.TriggerAction.TAG_HOST );
        eventRule.setTagTarget( "sessionEvent.localAddr" );
        eventRule.setTagName( "bittorrent-usage" );
        eventRule.setTagLifetimeSec( (long) (60*5) ); // 5 minutes
        rules.add( eventRule );
        
        return rules;
    }

    /**
     * Return default email settings values.
     * @return Map of string mapping email values to their defaults.
     */
    public Map<String,String> defaultEmailSettings()
    {
        Map<String, String> emailSettings = new HashMap<>();
        emailSettings.put( "emailSubject", DefaultEmailSubject );
        emailSettings.put( "emailBody", DefaultEmailBody );
        emailSettings.put( "emailConvert", Constants.TRUE);
        return emailSettings;
    }

    /**
     * Construct the email subject and body templates using localizaiton.
     */
    private void buildEmailTemplateDefaults(){
        DefaultEmailSubject = I18nUtil.tr("%system.company% Alert \"%alert.description%\" [%system.host%]", i18nMap);
        DefaultEmailBody = I18nUtil.tr("System: %system.company% [%system.host%]", i18nMap) +
                            "\r\n\r\n" +
                            I18nUtil.tr("Event: %event.class%", i18nMap) +
                            "\r\n\r\n" +
                            I18nUtil.tr("Event Time: %event.timestamp%.", i18nMap) +
                            "\r\n\r\n" +
                            I18nUtil.tr("Event Summary:", i18nMap) +
                            "\r\n" +
                            I18nUtil.tr("%event.summary%", i18nMap) +
                            "\r\n\r\n" +
                            I18nUtil.tr("Event Details:", i18nMap) +
                            "\r\n" +
                            I18nUtil.tr("%event.values.keyvalue%", i18nMap) +
                            "\r\n\r\n" +
                            I18nUtil.tr("This is an automated message sent because this event matched Alerts Rule \"%alert.description%\".", i18nMap);
    }

    /**
     * Construct email template variables.
     */
    @SuppressWarnings("serial")
    private void buildEmailTemplateVariables()
    {
        eventTemplateVariables = new HashMap<>();

        EventTemplateVariable etv;
        etv = new EventTemplateVariable("system.company", I18nUtil.tr("System company or organization name", i18nMap))
        {
            /**
             * Get company name value.
             * @param  rule  Matching AlertRule
             * @param  event Matching LogEvent
             * @param convert if true, attempt to convert to human readable
             * @return       String of company name.
             */
            @Override
            public String getValue(AlertRule rule, LogEvent event, boolean convert)
            {
                return UvmContextFactory.context().brandingManager().getCompanyName();
            }
        };
        eventTemplateVariables.put(etv.getName(), etv);

        etv = new EventTemplateVariable("system.host", I18nUtil.tr("System hostname", i18nMap)){
            /**
             * Get hostname + domain.
             * @param  rule  Matching AlertRule
             * @param  event Matching LogEvent
             * @param convert if true, attempt to convert to human readable
             * @return       String of hostname + domain.
             */
            @Override
            public String getValue(AlertRule rule, LogEvent event, boolean convert)
            {
                String systemHost = UvmContextFactory.context().networkManager().getNetworkSettings().getHostName();
                String domainName = UvmContextFactory.context().networkManager().getNetworkSettings().getDomainName();
                return systemHost + (  domainName == null ? "" : ( "." + domainName ) );
            }
        };
        eventTemplateVariables.put(etv.getName(), etv);

        etv = new EventTemplateVariable("alert.description", I18nUtil.tr("Alert rule description", i18nMap)){
            /**
             * Get alert rule description.
             * @param  rule  Matching AlertRule
             * @param  event Matching LogEvent
             * @param convert if true, attempt to convert to human readable
             * @return       String of alert rule description.
             */
            @Override
            public String getValue(AlertRule rule, LogEvent event, boolean convert)
            {
                return rule.getDescription();
            }
        };
        eventTemplateVariables.put(etv.getName(), etv);

        etv = new EventTemplateVariable("event.class", "Event class"){
            /**
             * Get event class name.
             * @param  rule  Matching AlertRule
             * @param  event Matching LogEvent
             * @param convert if true, attempt to convert to human readable
             * @return       String of class event name.
             */
            @Override
            public String getValue(AlertRule rule, LogEvent event, boolean convert)
            {
                return event.getClass().getSimpleName();
            }
        };
        eventTemplateVariables.put(etv.getName(), etv);

        etv = new EventTemplateVariable("event.timestamp", I18nUtil.tr("Event timestamp", i18nMap)){
            /**
             * Get event timestamp.
             * @param  rule  Matching AlertRule
             * @param  event Matching LogEvent
             * @param convert if true, attempt to convert to human readable
             * @return       String of Timestamp.
             */
            @Override
            public String getValue(AlertRule rule, LogEvent event, boolean convert)
            {
                return new Timestamp(event.getTimeStamp()).toString();
            }
        };
        eventTemplateVariables.put(etv.getName(), etv);

        etv = new EventTemplateVariable("event.summary", I18nUtil.tr("Event summary", i18nMap)){
            /**
             * Get event timestamp.
             * @param  rule  Matching AlertRule
             * @param  event Matching LogEvent
             * @param convert if true, attempt to convert to human readable
             * @return       String of Timestamp.
             */
            @Override
            public String getValue(AlertRule rule, LogEvent event, boolean convert)
            {
                return event.toSummaryString();
            }
        };
        eventTemplateVariables.put(etv.getName(), etv);

        etv = new EventTemplateVariable("event.values.json", I18nUtil.tr("Event details in JSON format", i18nMap)){
            /**
             * Get event timestamp.
             * @param  rule  Matching AlertRule
             * @param  event Matching LogEvent
             * @param convert if true, attempt to convert to human readable
             * @return       String of Timestamp.
             */
            @Override
            public String getValue(AlertRule rule, LogEvent event, boolean convert)
            {
                JSONObject jsonObject = event.toJSONObject();
                cleanupJsonObject( jsonObject, convert );
                String jsonString = "";

                try {
                    jsonString = jsonObject.toString(4);
                } catch (org.json.JSONException e) {
                    logger.warn("Failed to pretty print.",e);
                    jsonString = jsonObject.toString();
                }
                return jsonString;
            }
        };
        eventTemplateVariables.put(etv.getName(), etv);

        etv = new EventTemplateVariable("event.values.keyvalue", I18nUtil.tr("Event details in key=value format", i18nMap)){
            /**
             * Get event timestamp.
             * @param  rule  Matching AlertRule
             * @param  event Matching LogEvent
             * @param convert if true, attempt to convert to human readable
             * @return       String of Timestamp.
             */
            @Override
            public String getValue(AlertRule rule, LogEvent event, boolean convert)
            {
                JSONObject jsonObject = event.toJSONObject();
                cleanupJsonObject( jsonObject, convert );
                String jsonString = "";

                try {
                    jsonString = jsonObject.toString(4);
                } catch (org.json.JSONException e) {
                    logger.warn("Failed to pretty print.",e);
                    jsonString = jsonObject.toString();
                }

                Map<String,String> kvPairs = new HashMap<>();

                int maxKeyLength = 0;
                String[] kv;
                String key;
                String subKey = null;
                for(String line: jsonString.split("\n")){
                    line = line.replaceAll(",\\s*$", "").replaceAll("\"", "");
                    if( line.trim().equals("{") ||
                        line.trim().equals("}") ||
                        line.trim().equals("")) {
                        subKey = null;
                        continue;
                    }
                    kv = line.trim().split(":", 2);
                    key = kv[0].trim();
                    key = key.replaceAll("(.)(\\p{Upper})", "$1 $2").toLowerCase();
                    if(kv.length > 1 && kv[1].trim().equals("{")){
                        subKey = key;
                    }else if(subKey != null){
                        key = subKey + "\t" + key.trim();
                    }

                    key = key.replaceAll("(.)(\\p{Upper})", "$1 $2").toLowerCase();

                    if(key.length() > maxKeyLength){
                        maxKeyLength = key.length();
                    }
                    kvPairs.put(key, kv.length > 1 ? kv[1].trim() : "");
                }
                maxKeyLength += 3;
                SortedSet<String> sortedKeys = new TreeSet<>(kvPairs.keySet());

                List<String> kvStrings = new LinkedList<>();
                for(String k : sortedKeys){
                    String kvString;
                    if(kvPairs.get(k).trim().equals("{")){
                        kvString = String.format("%-" + maxKeyLength+ "s", k);
                    }else{
                        String showKey = k;
                        if(showKey.indexOf('\t') != -1){
                            showKey = " " + k.substring(showKey.indexOf('\t')).trim();
                        }
                        kvString = String.format("%-" + maxKeyLength+ "s = %s", showKey, kvPairs.get(k));
                    }
                    kvStrings.add(kvString);
                }

                return String.join("\n", kvStrings);
            }
        };
        eventTemplateVariables.put(etv.getName(), etv);
    }

    /**
     * Add event to writer queue.
     * @param event LogEvent to add to writer queue.
     */
    public void logEvent( LogEvent event )
    {
        if ( this.localOverloadedFlag ) {
            if ( System.currentTimeMillis() - this.lastLocalLoggedWarningTime > 60000 ) {
                logger.warn("Local event queue overloaded, discarding event");
                this.lastLocalLoggedWarningTime = System.currentTimeMillis();
            }
            return;
        }else{
            localEventWriter.inputQueue.offer(event);
        }
    }

    /**
     * Retrieve length of event queue.
     *
     * @return Integer of length of event queue
     */
    public int getEventQueueSize(){
        return localEventWriter.inputQueue.size();
    }

    /**
     * Return map of event classes and number of times they were seen
     *
     * @return Map of string (name) and integer (counts).
     */
    public Map<String, Integer> getEventsSeenCounts(){
        return EventsSeen;
    }

    /**
     * Retrieve length of event queue.
     *
     * @return Integer of length of cmd queue
     */
    public int getRemoteEventQueueSize(){
        return remoteEventWriter.inputQueue.size();
    }

    /**
     * Process event through alerts, triggers, and syslog.
     * @param event LogEvent to process.
     */
    private void runEvent( LogEvent event )
    {
        if (this.reportsApp != null){
            // Send to reports app
            this.reportsApp.logEvent(event);
        }
        if(remoteEventWriter.enabled){
            // Send to cmd
            if ( this.remoteOverloadedFlag ) {
                if ( System.currentTimeMillis() - this.lastRemoteLoggedWarningTime > 60000 ) {
                    logger.warn("Remote event queue overloaded, discarding event");
                    this.lastRemoteLoggedWarningTime = System.currentTimeMillis();
                }
                return;
            }else{
                remoteEventWriter.inputQueue.offer(event);
            }
        }
        // Process for local events (alerts, tags, syslog, etc)
        String simpleName = event.getClass().getSimpleName();
        if(!EventsSeen.containsKey(simpleName)){
            EventsSeen.put(simpleName, 0);
        }else{
            EventsSeen.put(simpleName,EventsSeen.get(simpleName) + 1);
        }
        if(classesToProcess.size() > 0 && !classesToProcess.containsKey(simpleName)){
            event = null;
        }else{
            try {
                runAlertRules( event );
            } catch ( Exception e ) {
                logger.warn("Failed to evaluate alert rules.", e);
            }

            try {
                runTriggerRules( event );
            } catch ( Exception e ) {
                logger.warn("Failed to evaluate trigger rules.", e);
            }

            try {
                runSyslogRules( event );
            } catch ( Exception e ) {
                logger.warn("Failed to evaluate syslog rules.", e);
            }
        }
        event = null;
    }

    /**
     * Process event through alert rules.
     * @param event LogEvent to process.
     */
    private void runAlertRules( LogEvent event )
    {
        if ( event == null )
            return;
        if ( event instanceof AlertEvent )
            return;

        List<AlertRule> rules = UvmContextFactory.context().eventManager().getSettings().getAlertRules();
        if ( rules == null )
            return;

        JSONObject jsonObject = event.toJSONObject();
        for ( AlertRule rule : rules ) {
            if ( ! rule.getEnabled() )
                continue;
            if ( ! rule.isMatch( jsonObject ) )
                continue;

            logger.debug( "alert match: " + rule.getDescription() + " matches " + jsonObject.toString() );

            if(rule.getEmail()){
                sendEmailForEvent( rule, event );
            }
            if(rule.getLog()){
                AlertEvent eventEvent = new AlertEvent( rule.getDescription(), event.toSummaryString(), jsonObject, event, rule, false );
                UvmContextFactory.context().logEvent( eventEvent );
            }
        }
    }

    /**
     * Process event through trigger rules.
     * @param event LogEvent to process.
     */
    private void runTriggerRules( LogEvent event )
    {
        if ( event == null )
            return;
        //if ( event instanceof TriggerEvent )
        //    return;

        List<TriggerRule> rules = UvmContextFactory.context().eventManager().getSettings().getTriggerRules();
        if ( rules == null )
            return;

        JSONObject jsonObject = event.toJSONObject();

        for ( TriggerRule rule : rules ) {
            if ( ! rule.getEnabled() )
                continue;
            if ( ! rule.isMatch( jsonObject ) )
                continue;

            logger.debug( "trigger \"" + rule.getDescription() + "\" matches: " + event );

            String target = findAttribute( jsonObject, rule.getTagTarget() );
            if ( target == null ) {
                logger.debug( "trigger: failed to find target \"" + rule.getTagTarget() + "\"");
                continue;
            }

            target = target.replaceAll("/",""); // remove annoying / from InetAddress toString()

            HostTableEntry host = null;
            UserTableEntry user = null;
            DeviceTableEntry device = null;
            List<Tag> tags;

            host = UvmContextFactory.context().hostTable().getHostTableEntry( target );
            if ( rule.getAction().toString().contains("USER") ) {
                user = UvmContextFactory.context().userTable().getUserTableEntry( target );
                if ( user == null && host != null )
                    user = UvmContextFactory.context().userTable().getUserTableEntry( host.getUsername() );
            }
            if ( rule.getAction().toString().contains("DEVICE") ) {
                device = UvmContextFactory.context().deviceTable().getDevice( target );
                if ( device == null && host != null )
                    device = UvmContextFactory.context().deviceTable().getDevice( host.getMacAddress() );
            }

            if ( rule.getAction().toString().contains("_HOST") && host == null ) {
                logger.debug( "trigger: failed to find host \"" + target + "\"");
                continue;
            }
            if ( rule.getAction().toString().contains("_USER") && user == null ) {
                logger.debug( "trigger: failed to find user \"" + target + "\"");
                continue;
            }
            if ( rule.getAction().toString().contains("_DEVICE") && device == null ) {
                logger.debug( "trigger: failed to find device \"" + target + "\"");
                continue;
            }

            switch( rule.getAction() ) {
            case TAG_HOST:
                if ( rule == null ) break;
                logger.debug("Tagging host " + target + " with tag \"" + rule.getTagName() + "\"");
                host.addTag( new Tag( rule.getTagName(), System.currentTimeMillis()+(rule.getTagLifetimeSec()*1000) ));
                break;
            case UNTAG_HOST:
                logger.debug("Untagging host " + target + " with tag \"" + rule.getTagName() + "\"");
                if ( host == null ) break;
                tags = host.getTags();
                if ( tags == null ) break;
                for ( Tag t : tags ) {
                    if ( rule.nameMatches( t ) ) {
                        logger.debug("Untagging host " + target + " removing tag \"" + t.getName() + "\"");
                        host.removeTag( t );
                    }
                }
                break;
            case TAG_USER:
                logger.debug("Tagging user " + target + " with tag \"" + rule.getTagName() + "\"" );
                if ( user == null ) break;
                user.addTag( new Tag( rule.getTagName(), System.currentTimeMillis()+(rule.getTagLifetimeSec()*1000) ) );
                break;
            case UNTAG_USER:
                logger.debug("Untagging user " + target + " with tag \"" + rule.getTagName() + "\"");
                if ( user == null ) break;
                tags = user.getTags();
                if ( tags == null ) break;
                for ( Tag t : tags ) {
                    if ( rule.nameMatches( t ) ) {
                        logger.debug("Untagging user " + target + " removing tag \"" + t.getName() + "\"");
                        user.removeTag( t );
                    }
                }
                break;
            case TAG_DEVICE:
                logger.debug("Tagging device " + target + " with tag \"" + rule.getTagName() + "\"" );
                if ( device == null ) break;
                device.addTag( new Tag( rule.getTagName(), System.currentTimeMillis()+(rule.getTagLifetimeSec()*1000) ) );
                break;
            case UNTAG_DEVICE:
                logger.debug("Untagging device " + target + " with tag \"" + rule.getTagName() + "\"");
                if ( device == null ) break;
                tags = device.getTags();
                if ( tags == null ) break;
                for ( Tag t : tags ) {
                    if ( rule.nameMatches( t ) ) {
                        logger.debug("Untagging device " + target + " removing tag \"" + t.getName() + "\"");
                        device.removeTag( t );
                    }
                }
                break;
            }
        }
    }


     /**
     * Returns lastused ID on list of syslogservers provided.
     * @param syslogServers syslogservers list to process.
     * @return int lastUsedServerId
     */
    private int getLastUsedServerId(LinkedList<SyslogServer> syslogServers) {
        int lastUsedServerId = 0;
        if (syslogServers == null || syslogServers.size() == 0)
            return 0;
        for (SyslogServer obj : syslogServers) {
            int objId = obj.getServerId();
            if (objId == -1)
                continue;
            if (objId > lastUsedServerId) {
                lastUsedServerId = objId;
            }
        }
        return lastUsedServerId;
    }


    /**
     * Returns filtered syslog servers based on list of server IDS provided.
     * @param syslogServerIds list of server IDS to filter.
     * 
     * @return list of filtered SyslogServers
     */
    private LinkedList<SyslogServer> getFilteredSyslogByIDs(LinkedList<Integer> syslogServerIds ) {
        LinkedList<SyslogServer> sysLogFilteredServers = settings.getSyslogServers().stream()
        .filter(obj -> syslogServerIds.contains(obj.getServerId()))
        .collect(Collectors.toCollection(LinkedList::new));

        return sysLogFilteredServers;

    }

    /**
     * Process event through syslog rules.
     * @param event LogEvent to process.
     */
    private void runSyslogRules( LogEvent event )
    {
        if ( event == null )
            return;

        List<SyslogRule> rules = UvmContextFactory.context().eventManager().getSettings().getSyslogRules();
        if ( rules == null )
            return;

        JSONObject jsonObject = event.toJSONObject();
        JSONObject jsonSendObject = event.toJSONObject();
        cleanupJsonObject( jsonSendObject );
        try{
            jsonSendObject.put(Constants.CLASS, event.getClass());
        }catch(Exception e){}

        for ( SyslogRule rule : rules ) {
            if ( ! rule.getEnabled() ){
                continue;
            }
            //use jsonSendObject instead of jsonObject as ip addresses start with /
            if ( ! rule.isMatch( jsonSendObject ) ){
                continue;
            }

            logger.debug( "syslog match: " + rule.getDescription() + " matches " + jsonObject.toString() );
            LinkedList<Integer> rulesSyslogServerIDList = rule.getSyslogServers();
            if (rulesSyslogServerIDList != null  && rulesSyslogServerIDList.size() > 0) {
                //get syslogserver list using IDs
                for (SyslogServer syslogServer: getFilteredSyslogByIDs(rulesSyslogServerIDList) ) {
                    event.setTag(syslogServer.getTag());
                    if ( rule.getSyslog() && syslogServer.isEnabled()) {
                        try {
                            SyslogManagerImpl.sendSyslog( event, jsonSendObject );
                        } catch (Exception exn) {
                            logger.warn("failed to send syslog", exn);
                        }
                    }
                }


            }
        }
    }

    /**
     * Retreive an attribute value using the attribute name from the object.
     * @param  json         JSONObject to search.
     * @param  name         String of key to find.
     * @return              String of matching value.  Null if not found.
     */
    private static String findAttribute( JSONObject json, String name )
    {
        String s = null;
        if ( (s = findAttributeRecursive( json, name )) != null )
            return s;
        if ( ( name != null ) && !name.contains(".") )
            if ( (s = findAttributeFlatten( json, name, 3 )) != null )
                return s;
        return s;
    }

    /**
     * This looks for a specific JSON attribute
     * foo.bar.baz returns json['foo']['bar']['baz']
     * @param  json JSONObject to search.
     * @param  name String of key to find.
     * @return              String of matching value.  Null if not found.
     */
    private static String findAttributeRecursive( JSONObject json, String name )
    {
        if ( json == null || name == null ) return null;

        try {
            String[] parts = name.split("\\.",2);
            if ( parts.length < 1 )
                return null;

            String fieldName = parts[0];

            Object o = null;
            try {o = json.get(fieldName);} catch(Exception exc) {}
            if ( o == null )
                return null;

            if ( parts.length > 1 ) {
                String subName = parts[1];
                return findAttributeRecursive( new JSONObject(o), subName );
            } else {
                return o.toString();
            }
        } catch (Exception e) {
            logger.warn("Failed to find attribute: " + name,e);
            return null;
        }
    }

    /**
     * This looks through JSONObjects recursively to find any attribute with the specified name
     * It looks up to maxDepth levels to prevent cycles
     * @param  json JSONObject to search.
     * @param  name String of key to find.
     * @param maxDepth integer of maximum depth to search.
     * @return              String of matching value.  Null if not found.
     */
    private static String findAttributeFlatten( JSONObject json, String name, int maxDepth )
    {
        if ( json == null || name == null ) return null;
        if ( maxDepth < 1 ) return null;

        //logger.info("findAttributeFlatten( " + name + " , " + json + ")");
        try {
            String[] keys = JSONObject.getNames(json);
            if ( keys == null ) return null;

            for( String key : keys ) {
                if (Constants.CLASS.equals(key))
                    continue;
                if (name.equalsIgnoreCase(key)) {
                    Object o = json.get(key);
                    return (o == null ? null : o.toString());
                }
            }

            for( String key : keys ) {
                try {
                    if (Constants.CLASS.equals(key))
                        continue;
                    Object o = json.get(key);
                    if ( o == null )
                        continue;
                    if ( ! (o instanceof java.io.Serializable) )
                        continue;
                    JSONObject obj = new JSONObject(o);
                    if ( obj.length() < 2 )
                        continue;

                    if ( o != null ) {
                        String s = findAttributeFlatten(obj,name,maxDepth-1);
                        if ( s != null )
                            return s;
                    }
                } catch (Exception e) {}
            }
        } catch (Exception e) {
            logger.warn("Exception",e);
        }

        return null;
    }

    /**
     * Send this event as an email alert notification.
     * @param  rule  Matching alert rule.
     * @param  event LogEvent to send.
     * @return       boolean if true, alert generated and sent, false if not sent.
     */
    private static boolean sendEmailForEvent( AlertRule rule, LogEvent event )
    {
        if(rule.frequencyCheck() == false){
            return false;
        }

        Map<String, String> email = emailAlertFormat(rule, event, UvmContextFactory.context().eventManager().getSettings().getEmailSubject(), UvmContextFactory.context().eventManager().getSettings().getEmailBody(), UvmContextFactory.context().eventManager().getSettings().getEmailConvert());
        LinkedList<String> alertRecipients = new LinkedList<>();

        /*
         * Local admin users
         */
        LinkedList<AdminUserSettings> adminManagerUsers = UvmContextFactory.context().adminManager().getSettings().getUsers();
        if ( adminManagerUsers != null ) {
            for ( AdminUserSettings user : adminManagerUsers ) {
                if ( user.getEmailAddress() == null || "".equals( user.getEmailAddress() ) ){
                    continue;
                }
                if ( ! user.getEmailAlerts() ){
                    continue;
                }
                alertRecipients.add( user.getEmailAddress() );
            }
        }

        /*
         * Report users
         */
        App reportsApp = UvmContextFactory.context().appManager().app("reports");
        if(reportsApp != null) {
            List<String> reportsEmailAddresses = ((Reporting) reportsApp).getAlertEmailAddresses();
            alertRecipients.addAll(reportsEmailAddresses);
        }

        for( String emailAddress : alertRecipients){
            try {
                String[] recipients = null;
                recipients = new String[]{ emailAddress };
                UvmContextFactory.context().mailSender().sendMessage( recipients, email.get("emailSubject"), email.get("emailBody"));
            } catch ( Exception e) {
                logger.warn("Failed to send mail.",e);
            }
        }

        return true;
    }

    /**
     * Make json formatted event more suitable for users.
     * By default, leave values as-is.
     * @param jsonObject JSONObject to process.
     */
    private static void cleanupJsonObject( JSONObject jsonObject )
    {
        cleanupJsonObject( jsonObject, false);
    }

    /**
     * Make json formatted event more suitable for users:
     * * Remove unncessessary fields.
     * * Recursively clean.
     * @param jsonObject JSONObject to process.
     * @param human
     */
    private static void cleanupJsonObject( JSONObject jsonObject, boolean human )
    {
        if ( jsonObject == null )
            return;

        @SuppressWarnings("unchecked")
        java.util.Iterator<String> keys = (java.util.Iterator<String>)jsonObject.keys();
        while ( keys.hasNext() ) {
            String key = keys.next();

            if (Constants.CLASS.equals(key)) {
                keys.remove();
                continue;
            }
            if ("tag".equals(key)) {
                keys.remove();
                continue;
            }
            if ("partitionTablePostfix".equals(key)) {
                keys.remove();
                continue;
            }
            if ("sqlTimeStamp".equals(key)) {
                keys.remove();
                continue;
            }
            if ("timeStamp".equals(key)) {
                try{
                    jsonObject.put("timeStamp", new Timestamp(jsonObject.getLong("timeStamp")).toString());
                }catch(Exception e){}
            }


            try{
                String ipAddress = jsonObject.getString(key);
                if(IPMatcher.JAVA_IPADDR_REGEX.matcher(ipAddress).matches()){
                    jsonObject.put(key, ipAddress.substring(1));
                }
            }catch(Exception e){}

            if(human){
                if(key.indexOf("Percent") > -1){
                    try{
                        jsonObject.put(key, Integer.toString((int)Math.round(jsonObject.getDouble(key) * 100)) + "%");
                    }catch(Exception e){}
                }else{
                    try{
                        long value = jsonObject.getLong(key);
                        if(value > 0){
                            if(key.indexOf("Time") > -1){
                                Date date = new Date(value);
                                jsonObject.put(key, date);
                            }else if(
                                (key.indexOf("Id") > -1) ||
                                (key.indexOf("Latitude") > -1) ||
                                (key.indexOf("Longitude") > -1) ||
                                (key.indexOf("Intf") > -1) ||
                                (key.indexOf("Port") > -1)
                                ){
                                // Ignore.  Don't try to convert this value.
                            }else{
                                jsonObject.put(key, StringUtil.longToHumanReadable(value));
                            }
                        }
                    }catch(Exception e){}
                }
            }

            /**
             * Recursively clean json objects
             */
            try {
                JSONObject subObject = jsonObject.getJSONObject(key);
                if (subObject != null) {
                    cleanupJsonObject( subObject, human );
                }
            } catch (Exception e) {
                /* ignore */
            }

            /**
             * If the object implements JSONString, then its probably a jsonObject
             * Convert to JSON Object, recursively clean that, then replace it
             */
            try {
                if ( jsonObject.get(key) != null ) {
                    Object o = jsonObject.get(key);
                    if ( o instanceof org.json.JSONString ) {
                        JSONObject newObj = new JSONObject( o );
                        cleanupJsonObject( newObj, human );
                        jsonObject.put( key, newObj );
                    }
                }
            } catch (Exception e) {
                /* ignore */
            }
        }
    }


    /**
     * This thread waits on the inputQueue
     */
    private class LocalEventWriter implements Runnable
    {
        private volatile Thread thread;
        private final LinkedTransferQueue<LogEvent> inputQueue = new LinkedTransferQueue<>();

        private final int MAX_EVENTS_PER_CYCLE = 50000;

        /**
         * Run event queue.
         */
        public void run()
        {
            thread = Thread.currentThread();
            long lastLoggedWarningTime = 0;

            /**
             * Loop indefinitely and continue running event rules
             */
            while (thread != null) {
                // only log this warning once every 10 seconds
                if (inputQueue.size() > 20000 && System.currentTimeMillis() - lastLoggedWarningTime > 10000 ) {
                        logger.warn("Large local input queue size: " + inputQueue.size());
                    lastLoggedWarningTime = System.currentTimeMillis();
                }

                try {
                    // Wait for queue to have something
                    runEvent(inputQueue.take());
                    // Attempt to drain a batch of events
                    ArrayList<LogEvent> logQueue = new ArrayList<LogEvent>();
                    int drained = inputQueue.drainTo(logQueue, MAX_EVENTS_PER_CYCLE);
                    for(LogEvent event: logQueue){
                        runEvent( event );
                    }
                } catch (Exception e) {
                    logger.warn("Failed to run event rules.", e);
                    try {this.wait(1000);} catch (Exception exc) {}
                }
                /**
                 * Check queue lengths
                 */
                if (!localOverloadedFlag && inputQueue.size() > HIGH_WATER_MARK)  {
                    logger.warn("OVERLOAD: High Water Mark reached for local event queue.");
                    localOverloadedFlag = true;
                }
                if (localOverloadedFlag && inputQueue.size() < LOW_WATER_MARK) {
                    logger.warn("OVERLOAD: Low Water Mark reached for local event queue. Continuing normal operation.");
                    localOverloadedFlag = false;
                }
            }
        }

        /**
         * Start the thread.
         */
        protected void start()
        {
            UvmContextFactory.context().newThread(this,"Local event writer", Thread.NORM_PRIORITY - 1).start();
        }

        /**
         * Stop the thread.
         */
        protected void stop()
        {
            Thread tmp = thread;
            thread = null; /* thread will exit if thread is null */
            if (tmp != null) {
                tmp.interrupt();
            }
        }
    }

    /**
     * This thread waits on the inputQueue
     */
    private class RemoteEventWriter implements Runnable
    {
        private volatile Thread thread;
        private final LinkedTransferQueue<LogEvent> inputQueue = new LinkedTransferQueue<>();
        public Boolean enabled = false;
        private static int MAX_EVENTS_PER_CYCLE = 50000;

        /**
         * Run event queue.
         */
        public void run()
        {
            thread = Thread.currentThread();
            long lastLoggedWarningTime = 0;

            /**
             * Loop indefinitely and continue running event rules
             */
            while (thread != null) {
                synchronized( this ) {
                    try {
                        // only log this warning once every 10 seconds
                        if (inputQueue.size() > 20000 && System.currentTimeMillis() - lastLoggedWarningTime > 10000 ) {
                            logger.warn("Large remote input queue size: " + inputQueue.size());
                            lastLoggedWarningTime = System.currentTimeMillis();
                        }

                        LogEvent event = inputQueue.take();
                        UvmContextFactory.context().hookManager().callCallbacks( HookManager.REPORTS_EVENT_LOGGED, event);
                        // Attempt to drain a larger amount to process
                        ArrayList<LogEvent> logQueue = new ArrayList<LogEvent>();
                        int drained = inputQueue.drainTo(logQueue, MAX_EVENTS_PER_CYCLE);
                        for(LogEvent lqevent: logQueue){
                            UvmContextFactory.context().hookManager().callCallbacks( HookManager.REPORTS_EVENT_LOGGED, lqevent);
                        }
                        /**
                         * Check queue lengths
                         */
                        if (!remoteOverloadedFlag && inputQueue.size() > HIGH_WATER_MARK)  {
                            logger.warn("OVERLOAD: High Water Mark reached for remote event queue.");
                            remoteOverloadedFlag = true;
                        }
                        if (remoteOverloadedFlag && inputQueue.size() < LOW_WATER_MARK) {
                            logger.warn("OVERLOAD: Low Water Mark reached for remote event queue. Continuing normal operation.");
                            remoteOverloadedFlag = false;
                        }
                    } catch (Exception e) {
                        logger.warn("Failed to run event rules.", e);
                        try {this.wait(1000);} catch (Exception exc) {}
                    }
                }
            }
        }

        /**
         * Start the thread.
         */
        protected void start()
        {
            UvmContextFactory.context().newThread(this,"Remote event writer", Thread.NORM_PRIORITY - 1).start();
            enabled = UvmContextFactory.context().systemManager().getSettings().getCloudEnabled();
        }

        /**
         * Stop the thread.
         */
        protected void stop()
        {
            Thread tmp = thread;
            thread = null; /* thread will exit if thread is null */
            if (tmp != null) {
                tmp.interrupt();
            }
        }
    }

    /**
     * Class for event template variables.
     */
    @SuppressWarnings("serial")
    public class EventTemplateVariable implements Serializable, JSONString
    {
        private static final char NAME_PREFIX_SUFFIX = '%';
        private String name;
        private String description;
        private Pattern nameMatcher = null;

        public EventTemplateVariable(String name, String description)
        {
            // this.name = NAME_PREFIX_SUFFIX + name + NAME_PREFIX_SUFFIX;
            this.setName(name);
            this.description = description;
        }

        public String getName() { return name; }
        public void setName( String name ) {
            this.name = NAME_PREFIX_SUFFIX + name + NAME_PREFIX_SUFFIX;
            this.nameMatcher = Pattern.compile(this.name);
        }

        public Pattern getNameMatcher(){ return nameMatcher; };

        public String getDescription() { return description; }
        public void setDescription( String description ) { this.description = description; }

        /**
         * [getValue description]
         * @return [description]
         */
        public String getValue(AlertRule rule, LogEvent event, boolean convert){ return ""; }

        public String toJSONString()
        {
            JSONObject jO = new JSONObject(this);
            return jO.toString();
        }
    }

    /**
     * Hook into setting saves to look for system settings
     */
    private class SettingsHook implements HookCallback
    {
        /**
        * @return Name of callback hook
        */
        public String getName()
        {
            return "event-manager-settings-change-hook";
        }

        /**
         * Callback documentation
         *
         * @param args  Args to pass
         */
        public void callback( Object... args )
        {
            Object o = args[1];
            if ( ! (o instanceof SystemSettings) ) {
                return;
            }
            SystemSettings settings = (SystemSettings)o;
            remoteEventWriter.enabled = settings.getCloudEnabled();
        }
    }    /**
    * Hook into application instantiations.
    */
   private class AppInstantiateHook implements HookCallback
   {
       /**
       * @return Name of callback hook
       */
       public String getName()
       {
           return "uvmcontext-application-instantiate-hook";
       }

       /**
        * Callback documentation
        *
        * @param args  Args to pass
        */
       public void callback( Object... args )
       {
           String appName = (String) args[0];
           Object app = args[1];

           if(appName == null){
               return;
           }
           if(appName.equals("reports")){
               synchronized(this){
                   reportsApp = (Reporting) app;
               }
           }
       }
   }

   /**
    * Hook into application destroys.
    */
   private class AppDestroyHook implements HookCallback
   {
       /**
       * @return Name of callback hook
       */
       public String getName()
       {
           return "uvmcontext-application-destroy-hook";
       }

       /**
        * Callback documentation
        *
        * @param args  Args to pass
        */
       public void callback( Object... args )
       {
           String appName = (String) args[0];

           if(appName == null){
               return;
           }
           if(appName.equals("reports")){
               synchronized(this){
                   reportsApp = null;
               }
           }
       }
   }


}
