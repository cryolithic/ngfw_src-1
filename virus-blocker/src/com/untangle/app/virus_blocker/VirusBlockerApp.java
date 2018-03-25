/*
 * $Id: VirusBlockerApp.java 37269 2014-02-26 23:46:16Z dmorris $
 */

package com.untangle.app.virus_blocker;

import java.io.File;
import org.apache.log4j.Logger;
import com.untangle.uvm.UvmContextFactory;
import com.untangle.uvm.app.AppSettings;
import com.untangle.uvm.app.AppProperties;
import com.untangle.app.virus_blocker.VirusBlockerBaseApp;

public class VirusBlockerApp extends VirusBlockerBaseApp
{
    private final Logger logger = Logger.getLogger(VirusBlockerApp.class);

    public VirusBlockerApp( AppSettings appSettings, AppProperties appProperties )
    {
        super( appSettings, appProperties );

        // if the bdamserver package is not installed we set our special flag
        try {
            // if entitled to "virus-blocker" enable BD
            if ( UvmContextFactory.context().licenseManager().isLicenseValid( "virus-blocker" ) ) {
                this.fileScannerAvailable = true;
            } else {
                // otherwise - BD not available
                this.fileScannerAvailable = false;
            }

            if (!isBdamInstalled()) {
                this.fileScannerAvailable = false;
            }

        } catch (Exception exn) {
            this.fileScannerAvailable = false;
        }

        this.setScanner( new VirusBlockerScanner(this) );
    }

    @Override
    protected int getHttpStrength()
    {
        // virus blocker is 18
        // virus blocker lite is 15
        // virus blocker should be higher (closer to server)
        return 18;
    }

    @Override
    protected int getFtpStrength()
    {
        // virus blocker is 18
        // virus blocker lite is 15
        // virus blocker should be higher (closer to server)
        return 18;
    }

    @Override
    protected int getSmtpStrength()
    {
        // virus blocker is 15
        // virus blocker lite is 18
        // virus blocker should be lower (closer to client)
        return 15;
    }

    @Override
    public String getName()
    {
        return "virus_blocker";
    }

    @Override
    public String getAppName()
    {
        return "virus-blocker";
    }

    @Override
    public boolean isPremium()
    {
        return true;
    }

    @Override
    public boolean isLicenseValid()
    {
        // accept either license "virus-blocker" or "virus-blocker-cloud"
        if ( UvmContextFactory.context().licenseManager().isLicenseValid( "virus-blocker" ) )
            return true;
        if ( UvmContextFactory.context().licenseManager().isLicenseValid( "virus-blocker-cloud" ) )
            return true;
        return false;
    }

    @Override
    protected void preStart( boolean isPermanentTransition )
    {
        // skip the daemon stuff if package is not installed
        if (isBdamInstalled()) {
            UvmContextFactory.context().daemonManager().incrementUsageCount("untangle-bdamserver");

            // we only need to enable the monitoring since it will be disabled
            // automatically when the daemon count reaches zero
            String transmit = "INFO 1\r\n";
            String search = "200 1";
            UvmContextFactory.context().daemonManager().enableRequestMonitoring("untangle-bdamserver", 1200, "127.0.0.1", 1344, transmit, search);
        } else {
            logger.info("Skipping DaemonManager initialization because the package is not installed.");
        }

        super.preStart( isPermanentTransition );
    }

    @Override
    protected void postStop( boolean isPermanentTransition )
    {
        // skip the daemon stuff if the package is not installed
        if (isBdamInstalled()) {
            UvmContextFactory.context().daemonManager().decrementUsageCount("untangle-bdamserver");
        }

        super.postStop( isPermanentTransition );
    }

    protected boolean isBdamInstalled()
    {
        File daemonCheck = new File("/lib/systemd/system/untangle-bdamserver.service");
        return daemonCheck.exists();
    }
}
