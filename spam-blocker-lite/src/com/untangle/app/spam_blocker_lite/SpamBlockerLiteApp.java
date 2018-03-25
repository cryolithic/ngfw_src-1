/**
 * $Id$
 */
package com.untangle.app.spam_blocker_lite;

import org.apache.log4j.Logger;

import com.untangle.app.spam_blocker.SpamBlockerBaseApp;
import com.untangle.app.spam_blocker.SpamSettings;
import com.untangle.uvm.UvmContextFactory;
import com.untangle.uvm.SettingsManager;

public class SpamBlockerLiteApp extends SpamBlockerBaseApp
{
    private final Logger logger = Logger.getLogger(getClass());

    public SpamBlockerLiteApp( com.untangle.uvm.app.AppSettings appSettings, com.untangle.uvm.app.AppProperties appProperties )
    {
        super( appSettings, appProperties, new SpamAssassinScanner() );
    }

    @Override
    public void setSettings(SpamSettings newSettings)
    {
        SettingsManager settingsManager = UvmContextFactory.context().settingsManager();
        String appID = this.getAppSettings().getId().toString();
        String settingsFile = System.getProperty("uvm.settings.dir") + "/spam-blocker-lite/settings_" + appID + ".js";

        try {
            settingsManager.save( settingsFile, newSettings);
        } catch (Exception exn) {
            logger.error("Could not save app settings", exn);
            return;
        }

        super.setSettings(newSettings);
    }
    
    @Override
    protected void preInit()
    {
        SettingsManager settingsManager = UvmContextFactory.context().settingsManager();
        String appID = this.getAppSettings().getId().toString();
        String settingsFile = System.getProperty("uvm.settings.dir") + "/spam-blocker-lite/settings_" + appID + ".js";
        SpamSettings readSettings = null;
        
        logger.info("Loading settings from " + settingsFile);
        
        try {
            readSettings =  settingsManager.load( SpamSettings.class, settingsFile);
        } catch (Exception exn) {
            logger.error("Could not read app settings", exn);
        }

        try {
            if (readSettings == null) {
                logger.warn("No settings found... initializing with defaults");
                initializeSettings();
                SpamSettings ps = getSettings();
                initSpamDnsblList(ps);
                this.setSettings(ps);
            }
            else {
                this.spamSettings = readSettings;
                initSpamDnsblList(this.spamSettings);
            }
        } catch (Exception exn) {
            logger.error("Could not apply app settings", exn);
        }

        // 12.1 special - try to download spamassassin sigs if they do not exist
        try {
            if ( ! (new java.io.File("/var/lib/spamassassin/3.004000/updates_spamassassin_org.cf")).exists() ) {
                UvmContextFactory.context().execManager().exec("nohup sleep 120 && /etc/cron.daily/spamassassin >/dev/null 2>&1 &");
            }
        } catch (Exception e) {
            logger.warn("Exception",e);
        }
        
        initSpamDnsblList(getSettings());
    }

    @Override
    protected void preStart( boolean isPermanentTransition )
    {
        UvmContextFactory.context().daemonManager().incrementUsageCount( "spamassassin" );
        String transmit = "PING SPAMC/1.0\r\n";
        String search = "SPAMD/1.5 0 PONG";
        UvmContextFactory.context().daemonManager().enableRequestMonitoring("spamassassin", 300, "127.0.0.1", 783, transmit, search);

        // enable CRON job
        UvmContextFactory.context().execManager().exec("grep -q -F 'CRON=1' /etc/default/spamassassin || sed -i -e 's/^CRON=.*/CRON=1/' /etc/default/spamassassin");

        super.preStart( isPermanentTransition);
    }
    
    @Override
    protected void postStop( boolean isPermanentTransition )
    {
        UvmContextFactory.context().daemonManager().decrementUsageCount( "spamassassin" );

        // disable CRON job if permanent and no one else using SA
        if ( isPermanentTransition && UvmContextFactory.context().daemonManager().getUsageCount("spamassassin") == 0 )
            UvmContextFactory.context().execManager().exec("sed -i -e 's/^CRON=.*/CRON=0/' /etc/default/spamassassin");

        super.postStop( isPermanentTransition );
    }

    @Override
    public boolean isPremium()
    {
        return false;
    }

    @Override
    public String getVendor()
    {
        return "spam_blocker_lite";
    }
}
