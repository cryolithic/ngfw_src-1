/**
 * $Id: IntrusionPreventionApp.java 38584 2014-09-03 23:23:07Z dmorris $
 */
package com.untangle.app.intrusion_prevention;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.FileWriter;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.IOException;
import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.LinkedList;
import java.util.Map;
import java.util.Set;
import java.text.SimpleDateFormat;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.log4j.Logger;

import com.untangle.uvm.UvmContext;
import com.untangle.uvm.UvmContextFactory;
import com.untangle.uvm.SettingsManager;
import com.untangle.uvm.HookCallback;
import com.untangle.uvm.ExecManagerResult;
import com.untangle.uvm.util.I18nUtil;
import com.untangle.uvm.network.NetworkSettings;
import com.untangle.uvm.network.InterfaceSettings;
import com.untangle.uvm.network.InterfaceStatus;
import com.untangle.uvm.app.IPMaskedAddress;
import com.untangle.uvm.app.AppMetric;
import com.untangle.uvm.app.AppManager;
import com.untangle.uvm.app.AppBase;
import com.untangle.uvm.vnet.PipelineConnector;
import com.untangle.uvm.servlet.DownloadHandler;

/**
 * Manage Intrusion Prevention configuration.
 *
 * The major difference between this and other applications is that configuration is handled through
 * special upload/downloaders.  This is due to the size of IPS settings which:
 *
 * * Are not used by uvm at all so they take up 20+MB of memory.
 * * Deallocating that much memory causes uvm to cause garbage collection errors.
 *
 */
public class IntrusionPreventionApp extends AppBase
{
    private final Logger logger = Logger.getLogger(getClass());

    private static final String STAT_SCAN = "scan";
    private static final String STAT_DETECT = "detect";
    private static final String STAT_BLOCK = "block";
    
    private final EventHandler handler;
    private final PipelineConnector [] connectors = new PipelineConnector[0];
    private final IntrusionPreventionEventMonitor ipsEventMonitor;    

    private static final String IPTABLES_SCRIPT = "/etc/untangle/iptables-rules.d/740-snort";
    private static final String GET_LAST_UPDATE = System.getProperty( "uvm.bin.dir" ) + "/intrusion-prevention-get-last-update-check";
    private static final String DEFAULTS_SETTINGS = "/usr/share/untangle-snort-config/current/templates/defaults.js";
    private static final String SNORT_DEBIAN_CONF = "/etc/snort/snort.debian.conf";
    private static final String SNORT_CONF = "/etc/snort/snort.conf";
    private static final String DATE_FORMAT_NOW = "yyyy-MM-dd_HH-mm-ss";

    private boolean updatedSettingsFlag = false;

    private final HookCallback networkSettingsChangeHook;

    private List<IPMaskedAddress> homeNetworks = null;
    private List<String> interfaceIds = null;

    /**
     * Setup IPS application
     *
     * @param appSettings       Application settings.
     * @param appProperties     Application properties
     */
    public IntrusionPreventionApp( com.untangle.uvm.app.AppSettings appSettings, com.untangle.uvm.app.AppProperties appProperties )
    {
        super( appSettings, appProperties );

        this.handler = new EventHandler(this);
        this.homeNetworks = this.calculateHomeNetworks( UvmContextFactory.context().networkManager().getNetworkSettings(), true );
        this.interfaceIds = this.calculateInterfaces( UvmContextFactory.context().networkManager().getNetworkSettings() );
        this.networkSettingsChangeHook = new IntrusionPreventionNetworkSettingsHook();

        this.addMetric(new AppMetric(STAT_SCAN, I18nUtil.marktr("Sessions scanned")));
        this.addMetric(new AppMetric(STAT_DETECT, I18nUtil.marktr("Sessions logged")));
        this.addMetric(new AppMetric(STAT_BLOCK, I18nUtil.marktr("Sessions blocked")));

        setScanCount(0);
        setDetectCount(0);
        setBlockCount(0);

        this.ipsEventMonitor = new IntrusionPreventionEventMonitor( this );

        UvmContextFactory.context().servletFileManager().registerDownloadHandler( new IntrusionPreventionSettingsDownloadHandler() );
    }

    /**
     * Get the pineliene connector.
     *
     * @return PipelineConector
     */
    @Override
    protected PipelineConnector[] getConnectors()
    {
        return this.connectors;
    }

    /**
     * Post IPS initialization
     *
     * @return PipelineConector
     */
    @Override
    protected void postInit()
    {
        logger.info("Post init");

        readAppSettings();
    }

    /**
     * Pre IPS stop. Register callback?
     *
     * @param isPermanentTransition
     */
    @Override
    protected void preStop( boolean isPermanentTransition )
    {
        UvmContextFactory.context().hookManager().registerCallback( com.untangle.uvm.HookManager.NETWORK_SETTINGS_CHANGE, this.networkSettingsChangeHook );
        try{
            this.ipsEventMonitor.stop();
        }catch( Exception e ){
            logger.warn( "Error disabling Intrusion Prevention Event Monitor", e );
        }
    }

    /**
     * Post IPS stop.  Shut down snort.  Run IPS rules to remove.
     *
     * @param isPermanentTransition
     */
    @Override
    protected void postStop( boolean isPermanentTransition )
    {
        UvmContextFactory.context().daemonManager().decrementUsageCount( "snort" );
        iptablesRules();
    }

    /**
     * Pre IPS start. Check setup wizard, start snort, unregister calllback hook.
     *
     * @param isPermanentTransition
     */
    @Override
    protected void preStart( boolean isPermanentTransition )
    {
        File settingsFile = new File( getSettingsFileName() );
        File snortConf = new File(SNORT_CONF);
        File snortDebianConf = new File(SNORT_DEBIAN_CONF);
        if (settingsFile.lastModified() > snortDebianConf.lastModified() ||
            snortConf.lastModified() > snortDebianConf.lastModified() ) {
            logger.warn("Settings file newer than snort debian configuration, Syncing...");
            reconfigure();
        }

        Map<String,String> i18nMap = UvmContextFactory.context().languageManager().getTranslations("untangle");
        I18nUtil i18nUtil = new I18nUtil(i18nMap);
        if(!wizardCompleted()){
            throw new RuntimeException(i18nUtil.tr("The configuration wizard must be completed before enabling Intrusion Prevention"));
        }
        UvmContextFactory.context().daemonManager().incrementUsageCount( "snort" );
        UvmContextFactory.context().hookManager().unregisterCallback( com.untangle.uvm.HookManager.NETWORK_SETTINGS_CHANGE, this.networkSettingsChangeHook );
        this.ipsEventMonitor.start();
    }

    /**
     * Post  IPS start. Start IPS rules.
     *
     * @param isPermanentTransition
     */
    @Override
    protected void postStart( boolean isPermanentTransition )
    {
        iptablesRules();

    }

    /**
     * Reconfigure IPS.
     */
    public void reconfigure()
    {

        this.homeNetworks = this.calculateHomeNetworks( UvmContextFactory.context().networkManager().getNetworkSettings(), true );
        this.interfaceIds = this.calculateInterfaces( UvmContextFactory.context().networkManager().getNetworkSettings() );

        String homeNetValue = "";
        for( IPMaskedAddress ma : this.homeNetworks ){
            homeNetValue += 
                ( homeNetValue.length() > 0 ? "," : "" ) + 
                ma.getMaskedAddress().getHostAddress().toString() + "/" + ma.getPrefixLength();
        }

        String interfacesValue = "";
        for( String i : this.interfaceIds ){
            interfacesValue += 
                ( interfacesValue.length() > 0 ? "," : "" ) + i; 
        }

        String configCmd = new String(System.getProperty("uvm.bin.dir") + 
            "/intrusion-prevention-create-config.py" + 
            " --app_id " + this.getAppSettings().getId().toString() +
            " --home_net " + homeNetValue + 
            " --interfaces " + interfacesValue + 
            " --iptables_script " + IPTABLES_SCRIPT
        );

        String result = UvmContextFactory.context().execManager().execOutput(configCmd );
        try{
            String lines[] = result.split("\\r?\\n");
            for ( String line : lines ){
                if( line.trim().length() > 1 ){
                    logger.warn("reconfigure: intrusion-prevention-create-config: " + line);
                }
            }
        }catch( Exception e ){
            logger.warn( "Unable to generate snort configuration:", e );
        }
        reloadEventMonitorMap();
        stop();
        start();
    }

    /**
     * Get the last time signarures were updated.
     *
     * @return Last signature update.
     */
    public Date getLastUpdate()
    {
        try {
            String result = UvmContextFactory.context().execManager().execOutput( GET_LAST_UPDATE + " rules");
            long timeSeconds = Long.parseLong( result.trim());

            return new Date( timeSeconds * 1000l );
        } catch ( Exception e ) {
            logger.warn( "Unable to get last update.", e );
            return null;
        } 
    }

    /**
     * Get the last time signarures were checked.  An update may not have occured if signures didn't change.
     *
     * @return Last signature update.
     */
    public Date getLastUpdateCheck()
    {
        try {
            String result = UvmContextFactory.context().execManager().execOutput( GET_LAST_UPDATE );
            long timeSeconds = Long.parseLong( result.trim());

            return new Date( timeSeconds * 1000l );
        } catch ( Exception e ) {
            logger.warn( "Unable to get last update.", e );
            return null;
        } 
    }

    // private methods ---------------------------------------------------------

    /**
     * Determine the settings filename to use.
     */
    private void readAppSettings()
    {
        String settingsFile = System.getProperty("uvm.settings.dir") + "/intrusion-prevention/settings_" + this.getAppSettings().getId().toString() + ".js";

        logger.info("Loading settings from " + settingsFile);

    }

    /**
     * Set the scan count to the specified value.
     *
     * @param value     New scan count value
     */
    public void setScanCount( long value )
    {
        this.setMetric(STAT_SCAN, value);
    }

    /**
     * Set the detect count to the specified value.
     *
     * @param value     New detect count value
     */
    public void setDetectCount( long value)
    {
        this.setMetric(STAT_DETECT, value);
    }

    /**
     * Set the block count to the specified value.
     *
     * @param value     New block count value
     */
    public void setBlockCount( long value )
    {
        this.setMetric(STAT_BLOCK, value);
    }

    /**
     * Insert or remove iptables rules if snort daemon is running
     */
    private synchronized void iptablesRules()
    {
        File f = new File( IPTABLES_SCRIPT  );
        if( !f.exists() ){
            logger.warn("Cannot find init script:" + IPTABLES_SCRIPT);
        }

        ExecManagerResult result = UvmContextFactory.context().execManager().exec( IPTABLES_SCRIPT );
        try {
            String[] lines = result.getOutput().split("\\r?\\n");
            logger.info( IPTABLES_SCRIPT + ": ");
            for ( String line : lines )
                logger.info( IPTABLES_SCRIPT + ": " + line);
        } catch (Exception e) {
            logger.warn( "Unable to process " + IPTABLES_SCRIPT + ":", e );
        }

        if ( result.getResult() != 0 ) {
            logger.error("Failed to run " + IPTABLES_SCRIPT+ " (return code: " + result.getResult() + ")");
            throw new RuntimeException("Failed to manage rules");
        }
    }

    /**
     * Insert or remove iptables rules if snort daemon is running
     *
     * @return  true if wizard has been run, false if not.
     */
    private Boolean wizardCompleted()
    {
        String settingsFileName = getSettingsFileName();
        File f = new File(settingsFileName);
        if(f.exists()){
            int retCode = UvmContextFactory.context().execManager().execResult( "grep -q '\"configured\": true,' " + settingsFileName);
            if(retCode == 0){
                return true;
            }
        }
        return false;
    }

    /**
     * Get settings filename
     *
     * @return  Settings filename.
     */
    public String getSettingsFileName()
    {
        return System.getProperty("uvm.settings.dir") + "/intrusion-prevention/settings_" + this.getAppSettings().getId().toString() + ".js";
    }

    /**
     * Get default settings filename
     *
     * @return  default Settings filename.
     */
    public String getDefaultsSettingsFileName()
    {
        return DEFAULTS_SETTINGS;
    }

    /**
     * Initialize settings.
     */
    public void initializeSettings()
    {
        SettingsManager settingsManager = UvmContextFactory.context().settingsManager();
        String appId = this.getAppSettings().getId().toString();
        String tempFileName = "/tmp/settings_" + getAppSettings().getAppName() + "_" + appId + ".js";

        String configCmd = new String(System.getProperty("uvm.bin.dir") + 
            "/intrusion-prevention-sync-settings.py" + 
            " --app_id " + appId +
            " --rules /usr/share/untangle-snort-config/current" +
            " --settings " + tempFileName
        );
        String result = UvmContextFactory.context().execManager().execOutput(configCmd );
        try{
            String[] lines = result.split("\\r?\\n");
            for ( String line : lines ){
                if( line.trim().length() > 1 ){
                    logger.warn("initializeSettings: intrusion-prevention-sync-settings: " + line);
                }
            }
        }catch( Exception e ){
            logger.warn("Unable to initialize settings: ", e );
        }

        try {
            settingsManager.save( getSettingsFileName(), tempFileName, true );
        } catch (Exception exn) {
            logger.error("Could not save app settings", exn);
        }
    }

    /**
     * Save settings.
     *
     * @param tempFileName  Temporary filename.
     */
    public void saveSettings( String tempFileName )
    {
        SettingsManager settingsManager = UvmContextFactory.context().settingsManager();

        try {
            settingsManager.save( getSettingsFileName(), tempFileName, true );
        } catch (Exception exn) {
            logger.error("Could not save app settings", exn);
        }
    }

    /**
     * Set the update settings flag.
     *
     * @param updatedSettingsFlag Boolean value
     */
    public void setUpdatedSettingsFlag( boolean updatedSettingsFlag )
    {
        this.updatedSettingsFlag = updatedSettingsFlag;
    }

    /**
     * Get the update settings flag.
     *
     * @return 
     *  true updated set, false not updated..
     */
    public boolean getUpdatedSettingsFlag()
    {
        return this.updatedSettingsFlag;
    }

    /**
     * Tell the ips monitor to reload the event map.
     */
    public void reloadEventMonitorMap()
    {
        this.ipsEventMonitor.unified2Parser.reloadEventMap();
    }

    /**
     * Force stats to restart by stopping and restarting.
     */
    public void forceUpdateStats()
    {
        this.ipsEventMonitor.stop();
        this.ipsEventMonitor.start();
        try { Thread.sleep( 2000 ); } catch ( InterruptedException e ) {}
    }

    /**
     * IPS settings are very large, around 30MB.  Managing this through uvm's
     * standard settings management causes Java garbage collection to go nuts
     * and almost always causes uvm to reload.
     * 
     * Besides not wanting to re-work uvm's GC settings, the bigger issue
     * is that uvm does not need to know anything about IPS settings;
     * everything is handled in backend scripts that manage and generate
     * configuration for Snort.
     *
     * Therefore, the easiest way to get around the GC issue is to simply
     * make IPS settings use the download manager for downloads and uploads.
     *
     */
    private class IntrusionPreventionSettingsDownloadHandler implements DownloadHandler
    {
        private static final String CHARACTER_ENCODING = "utf-8";

        /**
         * IPS download/upload handler.
         *
         * @return Name of the download handler.
         */
        @Override
        public String getName()
        {
            return "IntrusionPreventionSettings";
        }
        
        /**
         * Handle upload/download.
         *
         * @param req   HTTP request
         * @param resp  HTTP response.
         */
        public void serveDownload( HttpServletRequest req, HttpServletResponse resp )
        {

            String action = req.getParameter("arg1");
            String appId = req.getParameter("arg2");

            UvmContext uvm = UvmContextFactory.context();
            AppManager nm = uvm.appManager();
            IntrusionPreventionApp app = (IntrusionPreventionApp) nm.app( Long.parseLong(appId) );

            if (app == null ) {
                logger.warn("Invalid parameters: " + appId );
                return;
            }

            if( action.equals("load") ||
                action.equals("wizard") ){
                String settingsName;
                if( action.equals("wizard") ){
                    settingsName = app.getDefaultsSettingsFileName();
                }else{
                    settingsName = app.getSettingsFileName();
                }
                try{
                    resp.setCharacterEncoding(CHARACTER_ENCODING);
                    resp.setHeader("Content-Type","application/json");

                    File f = new File( settingsName );
                    if( !f.exists() && 
                        action.equals("load") ){
                        app.initializeSettings();
                    }
                    byte[] buffer = new byte[1024];
                    int read;
                    FileInputStream fis = new FileInputStream(settingsName);
                    OutputStream out = resp.getOutputStream();
                
                    while ( ( read = fis.read( buffer ) ) > 0 ) {
                        out.write( buffer, 0, read);
                    }

                    fis.close();
                    out.flush();
                    out.close();

                } catch (Exception e) {
                    logger.warn("Failed to load IPS settings",e);
                }
                app.setUpdatedSettingsFlag( false );
            }else if( action.equals("save")) {
                /*
                 * Save/uploads are a bit of a problem due to size.  For load/downloads,
                 * the settings file is automatically compressed by Apache/Tomcat from 
                 * around 30MB to 3MB which is hardly noticable.
                 *
                 * The reverse is almost never true and the client will attempt to upload 
                 * without compression.  To get around this, we receive a JSON "patch"
                 * which we pass to the configuration management scripts to integrate into settings.
                 */
                String tempPatchName = "/tmp/changedDataSet_intrusion-prevention_settings_" + appId + ".js";
                String tempSettingsName = "/tmp/intrusion-prevention_settings_" + appId + ".js";
                int verifyResult = 1;
                try{
                    byte[] buffer = new byte[1024];
                    int read;
                    InputStream in = req.getInputStream();
                    FileOutputStream fos = new FileOutputStream( tempPatchName );

                    while ( ( read = in.read( buffer ) ) > 0 ) {
                        fos.write( buffer, 0, read);
                    }

                    in.close();
                    fos.flush();
                    fos.close();

                    /*
                     * If client takes too long to upload, we'll get an incomplete settings file and all will be bad.
                     */
                    String verifyCommand = new String( "python -m simplejson.tool " + tempPatchName + "> /dev/null 2>&1" );
                    verifyResult = UvmContextFactory.context().execManager().execResult(verifyCommand);

                    String configCmd = new String(
                        System.getProperty("uvm.bin.dir") + 
                        "/intrusion-prevention-sync-settings.py" + 
                        " --app_id " + appId +
                        " --rules /usr/share/untangle-snort-config/current" +
                        " --settings " + tempSettingsName + 
                        " --patch " + tempPatchName
                    );
                    String result = UvmContextFactory.context().execManager().execOutput(configCmd );
                    try{
                        String[] lines = result.split("\\r?\\n");
                        for ( String line : lines ){
                            if( line.trim().length() > 1 ){
                                logger.warn("DownloadHandler: intrusion-prevention-sync-settings: " + line);
                            }
                        }
                    }catch( Exception e ){
                        logger.warn("Unable to initialize settings: ", e );
                    }

                    File fp = new File( tempPatchName );
                    fp.delete();

                }catch( IOException e ){
                    logger.warn("Failed to save IPS settings");
                }

                String responseText = "{success:true}";
                if( verifyResult == 0 ){
                    app.saveSettings( tempSettingsName );
                }else{
                     responseText = "{success:false}";
                }

                try{
                    resp.setCharacterEncoding(CHARACTER_ENCODING);
                    resp.setHeader("Content-Type","application/json");

                    OutputStream out = resp.getOutputStream();
                    out.write( responseText.getBytes(), 0, responseText.getBytes().length );
                    out.flush();
                    out.close();
                } catch (Exception e) {
                    logger.warn("Failed to send IPS save response");
                }
            }else if(action.equals("export")){
                String tempPatchName = "/tmp/changedDataSet_intrusion-prevention_settings_" + appId + ".js";
                String tempSettingsName = "/tmp/intrusion-prevention_settings_" + appId + ".js";

                String changedSet = req.getParameter("arg4");
                BufferedWriter writer = null;
                try{
                    /*
                     * Create a patch based on the currently changed dataset as export does elsewhere.
                     */
                    writer = new BufferedWriter( new FileWriter(tempPatchName));
                    writer.write(changedSet);
                    writer.close();

                    /*
                     * If client takes too long to upload, we'll get an incomplete settings file and all will be bad.
                     */
                    String verifyCommand = new String( "python -m simplejson.tool " + tempPatchName + "> /dev/null 2>&1" );
                    UvmContextFactory.context().execManager().execResult(verifyCommand);

                    String configCmd = new String(
                        System.getProperty("uvm.bin.dir") + 
                        "/intrusion-prevention-sync-settings.py" + 
                        " --app_id " + appId +
                        " --rules /usr/share/untangle-snort-config/current" +
                        " --settings " + tempSettingsName + 
                        " --patch " + tempPatchName + 
                        " --export"
                    );
                    String result = UvmContextFactory.context().execManager().execOutput(configCmd );
                    try{
                        String lines[] = result.split("\\r?\\n");
                        for ( String line : lines ){
                            if( line.trim().length() > 1 ){
                                logger.warn("DownloadHandler: export, intrusion-prevention-sync-settings: " + line);
                            }
                        }
                    }catch( Exception e ){
                        logger.warn("Unable to sync export settings: ", e );
                    }

                    File fp = new File( tempPatchName );
                    fp.delete();

                }catch( IOException e ){
                    logger.warn("Failed to synchronize export IPS settings");
                }

                try{
                    String oemName = UvmContextFactory.context().oemManager().getOemName();
                    String version = UvmContextFactory.context().version().replace(".","_");
                    String hostName = UvmContextFactory.context().networkManager().getNetworkSettings().getHostName().replace(".","_");
                    String dateStr = (new SimpleDateFormat(DATE_FORMAT_NOW)).format((Calendar.getInstance()).getTime());
                    String gridName = req.getParameter("arg3");

                    String filename = oemName + "-" + version + "-" + gridName + "-" + hostName + "-" + dateStr + ".json";
                    resp.setCharacterEncoding(CHARACTER_ENCODING);
                    resp.setHeader("Content-Disposition","attachment; filename="+filename);

                    byte[] buffer = new byte[1024];
                    int read;
                    FileInputStream fis = new FileInputStream(tempSettingsName);
                    OutputStream out = resp.getOutputStream();
                
                    while ( ( read = fis.read( buffer ) ) > 0 ) {
                        out.write( buffer, 0, read);
                    }

                    fis.close();
                    out.flush();
                    out.close();

                } catch (Exception e) {
                    logger.warn("Failed to export IPS settings",e);
                }
            }
        }
    }

    /*
     * The HOME_NET snort value is highly dependent on non-WAN interface values.
     * If it changes, we must reconfigure snort.  However, reconfiguring snort
     * is an expensive operation due to timeto restart snort.  To make this as painless
     * as possible, at startup we calculate initial HOME_NET value and recalc on
     * network changes.  Only if HOME_NET changes will a reconfigure occur.
     */

    /**
     * Build non-WAN networks
     *
     * @param networkSettings   Network settings.
     * @param getWan            Get the WAN address
     * @return List of IP addresses.
     */
    private List<IPMaskedAddress> calculateHomeNetworks( NetworkSettings networkSettings, boolean getWan )
    {
        boolean match;
        IPMaskedAddress maskedAddress;
        List<IPMaskedAddress> addresses = new LinkedList<>();
        /*
         * Pull static addresses
         */
        for( InterfaceSettings interfaceSettings : networkSettings.getInterfaces() ){
            if ( interfaceSettings.getConfigType() != InterfaceSettings.ConfigType.ADDRESSED ){
                continue;
            }
            if ( interfaceSettings.getV4ConfigType() != InterfaceSettings.V4ConfigType.STATIC ){
                continue;
            }
            if( ( ( getWan == false ) && ( interfaceSettings.getIsWan() == true ) ) ||
                ( ( getWan == true ) && ( interfaceSettings.getIsWan() == false ) ) ){
                continue;
            }
            
            addresses.add(new IPMaskedAddress( interfaceSettings.getV4StaticAddress(), interfaceSettings.getV4StaticPrefix()));
            for ( InterfaceSettings.InterfaceAlias alias : interfaceSettings.getV4Aliases() ) {
                /*
                 * Don't add if already in list 
                 */
                match = false;
                maskedAddress = new IPMaskedAddress( alias.getStaticAddress(), alias.getStaticNetmask() );
                for( IPMaskedAddress ma : addresses ){
                    if( ma.getMaskedAddress().getHostAddress().equals( maskedAddress.getMaskedAddress().getHostAddress() ) &&
                        ( ma.getPrefixLength() == maskedAddress.getPrefixLength() ) ){
                        match = true;
                    }
                }
                if( match == false ){
                    addresses.add( maskedAddress );
                }
            }   
        }
        if( getWan == true ){
            /*
             * Pull dynamic addresses for WAN interfaces
             */
            boolean isWanInterface;
            for( InterfaceStatus intfStatus : UvmContextFactory.context().networkManager().getInterfaceStatus() ) {
                isWanInterface = false;
                for( InterfaceSettings interfaceSettings : networkSettings.getInterfaces() ){
                    if(interfaceSettings.getInterfaceId() != intfStatus.getInterfaceId()) {
                        continue;
                    }
                    if(interfaceSettings.getConfigType() != InterfaceSettings.ConfigType.ADDRESSED) {
                        continue;
                    }
                    if(interfaceSettings.getIsWan()) {
                        isWanInterface = true;
                    }
                }
                if( isWanInterface == false ){
                    continue;
                }
                if ( intfStatus.getV4Address() == null || intfStatus.getV4Netmask() == null ){
                    continue;
                }
                match = false;
                maskedAddress = new IPMaskedAddress( intfStatus.getV4Address(), intfStatus.getV4PrefixLength());
                for( IPMaskedAddress ma : addresses ){
                    if( ma.getMaskedAddress().getHostAddress().equals( maskedAddress.getMaskedAddress().getHostAddress() ) &&
                        ( ma.getPrefixLength() == maskedAddress.getPrefixLength() ) ){
                        match = true;
                    }
                }
                if( match == false ){
                    addresses.add( maskedAddress );
                }
            }
        }
        if( addresses.isEmpty() && !getWan ) {
            /*
             * No LAN interfaces were found.  This means the system
             * is in bridged-to-WAN networking mode and we should
             * use the WAN network as home.
             */
            addresses = calculateHomeNetworks(networkSettings, true);
        }
        return addresses; 
    }

    /**
     * Build active interface identifiers.
     *
     * @param networkSettings   Network settings.
     * @return List of IP addresses.
     */
    private List<String> calculateInterfaces( NetworkSettings networkSettings )
    {
        List<String> interfaces = new LinkedList<>();
        for( InterfaceSettings interfaceSettings : networkSettings.getInterfaces() ){
            if (interfaceSettings.getConfigType() == InterfaceSettings.ConfigType.DISABLED) {
                continue;
            }
            interfaces.add( interfaceSettings.getSystemDev() );
        }
        return interfaces; 
    }

    /**
     * Compare currently known non-WAN addresses to new addresses.  
     * If they're different, trigger a reconfigure event.
     *
     * @param networkSettings   Network settings.
     * @throws Exception Exception if something happens.
     */
    private void networkSettingsEvent( NetworkSettings networkSettings ) throws Exception
    {
        List<IPMaskedAddress> newHomeNetworks = calculateHomeNetworks( networkSettings, false );

        boolean sameNetworks = true;
        if( newHomeNetworks.size() != this.homeNetworks.size() ){
            sameNetworks = false;
        }else{
            int minLength = Math.min( this.homeNetworks.size(), newHomeNetworks.size() );
            for( int i = 0; i < minLength; i++ ){
                if( ( this.homeNetworks.get(i).getMaskedAddress().getHostAddress().toString().equals(newHomeNetworks.get(i).getMaskedAddress().getHostAddress().toString()) == false ) ||
                    ( this.homeNetworks.get(i).getPrefixLength() != newHomeNetworks.get(i).getPrefixLength() ) ){
                    sameNetworks = false;
                }
            }
        }
        if( sameNetworks == false ){
            this.homeNetworks = newHomeNetworks;
            this.interfaceIds = calculateInterfaces(networkSettings);
            this.reconfigure();
        }
    }

    /**
     * Hook into network setting saves.
     */
    private class IntrusionPreventionNetworkSettingsHook implements HookCallback
    {
        /**
        * @return Name of callback hook
        */
        public String getName()
        {
            return "intrusion-prevention-network-settings-change-hook";
        }

        /**
         * Callback documentation
         *
         * @param args  Args to pass
         */
        public void callback( Object... args )
        {
            Object o = args[0];
            if ( ! (o instanceof NetworkSettings) ) {
                logger.warn( "Invalid network settings: " + o);
                return;
            }
                 
            NetworkSettings settings = (NetworkSettings)o;

            if ( logger.isDebugEnabled()){
                logger.debug( "network settings changed:" + settings );  
            } 
            try {
                networkSettingsEvent( settings );
            } catch( Exception e ) {
                logger.error( "Unable to reconfigure IPS" );
            }
        }
    }
}
