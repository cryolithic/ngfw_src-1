/**
 * $Id: WebMonitorApp.java 43848 2016-07-22 22:05:42Z mahotz $
 */
package com.untangle.app.web_monitor;

import java.util.List;
import java.util.LinkedList;

import org.apache.log4j.Logger;

import com.untangle.uvm.UvmContextFactory;
import com.untangle.uvm.AdminSettings;
import com.untangle.uvm.PasswordUtil;
import com.untangle.uvm.AdminUserSettings;
import com.untangle.uvm.vnet.Affinity;
import com.untangle.uvm.vnet.Fitting;
import com.untangle.uvm.vnet.PipelineConnector;
import com.untangle.uvm.vnet.Subscription;
import com.untangle.uvm.app.PortRange;
import com.untangle.uvm.app.IPMaskedAddress;
import com.untangle.uvm.vnet.Protocol;
import com.untangle.uvm.app.GenericRule;
import com.untangle.app.web_filter.DecisionEngine;
import com.untangle.app.web_filter.WebFilterBase;
import com.untangle.app.web_filter.WebFilterReplacementGenerator;
import com.untangle.app.web_filter.WebFilterSettings;
import com.untangle.app.web_filter.WebFilterRule;
import com.untangle.app.web_filter.WebFilterDecisionEngine;
import com.untangle.app.web_filter.WebFilterHttpsSniHandler;
import com.untangle.app.web_filter.WebFilterQuicHandler;
import com.untangle.app.web_filter.WebFilterHandler;

public class WebMonitorApp extends WebFilterBase
{
    private final Logger logger = Logger.getLogger(getClass());

    private final WebFilterDecisionEngine engine = new WebFilterDecisionEngine(this);

    private final WebFilterHttpsSniHandler sniHandler = new WebFilterHttpsSniHandler(this);
    private final WebFilterQuicHandler quicHandler = new WebFilterQuicHandler(this);

    private final Subscription httpsSub = new Subscription(Protocol.TCP, IPMaskedAddress.anyAddr, PortRange.ANY, IPMaskedAddress.anyAddr, new PortRange(443, 443));
    private final Subscription quicSub = new Subscription(Protocol.UDP, IPMaskedAddress.anyAddr, PortRange.ANY, IPMaskedAddress.anyAddr, new PortRange(443, 443));

    private final PipelineConnector httpConnector = UvmContextFactory.context().pipelineFoundry().create("web-filter-http", this, null, new WebFilterHandler(this), Fitting.HTTP_TOKENS, Fitting.HTTP_TOKENS, Affinity.CLIENT, 2, true);
    private final PipelineConnector httpsSniConnector = UvmContextFactory.context().pipelineFoundry().create("web-filter-https-sni", this, httpsSub, sniHandler, Fitting.OCTET_STREAM, Fitting.OCTET_STREAM, Affinity.CLIENT, 2, true);
    private final PipelineConnector quicConnector = UvmContextFactory.context().pipelineFoundry().create("web-filter-quic", this, quicSub, quicHandler, Fitting.OCTET_STREAM, Fitting.OCTET_STREAM, Affinity.CLIENT, 2, true);
    private final PipelineConnector[] connectors = new PipelineConnector[] { httpConnector, httpsSniConnector, quicConnector };

    public WebMonitorApp(com.untangle.uvm.app.AppSettings appSettings, com.untangle.uvm.app.AppProperties appProperties)
    {
        super(appSettings, appProperties);
    }

    public boolean unblockSite(String nonce, boolean global, String password)
    {
        if (!this.verifyPassword(password)) {
            if (this.logger.isInfoEnabled()) {
                logger.info("Unable to verify the password for nonce: '" + nonce + "'");
            }
            return false;
        } else {
            if (this.logger.isInfoEnabled()) {
                logger.info("Verified the password for nonce: '" + nonce + "'");
            }
            return super.unblockSite(nonce, global);
        }
    }

    public void clearCache(boolean expireAll)
    {
        this.engine.clearCache(expireAll);
    }

    public List<String> lookupSite(String url)
    {
        return this.engine.lookupSite(url);
    }

    public int recategorizeSite(String url, int category)
    {
        return this.engine.recategorizeSite(url, category);
    }

    // this is used for the UI alert test
    public String encodeDnsQuery(String domain, String uri, String command)
    {
        return this.engine.encodeDnsQuery(domain, uri, command);
    }

    // this is used for the UI alert test
    public String encodeDnsQuery(String domain, String uri)
    {
        return this.engine.encodeDnsQuery(domain, uri);
    }

    private boolean verifyPassword(String password)
    {
        WebFilterSettings settings = getSettings();

        if (settings == null) {
            logger.info("Settings are null, assuming password is not required.");
            return true;
        }

        if (!settings.getUnblockPasswordEnabled()) {
            return true;
        }

        if (password == null) {
            return false;
        }

        if (settings.getUnblockPasswordAdmin()) {
            AdminSettings as = UvmContextFactory.context().adminManager().getSettings();
            for (AdminUserSettings user : as.getUsers()) {
                if (user.getUsername().equals("admin")) {
                    if (PasswordUtil.check(password, user.trans_getPasswordHash())) {
                        return true;
                    }

                    return false;
                }
            }

            return false;
        }

        if (password.equals(settings.getUnblockPassword())) {
            return true;
        } else {
            return false;
        }
    }

    @Override
    public DecisionEngine getDecisionEngine()
    {
        return engine;
    }

    @Override
    protected void preStart(boolean isPermanentTransition)
    {
        engine.getDiaKey();

        super.preStart(isPermanentTransition);
    }

    @Override
    protected void postStart(boolean isPermanentTransition)
    {
        super.postStart(isPermanentTransition);
    }

    @Override
    protected void postStop(boolean isPermanentTransition)
    {
        super.postStop(isPermanentTransition);
    }

    @Override
    protected PipelineConnector[] getConnectors()
    {
        return this.connectors;
    }

    @Override
    protected WebFilterReplacementGenerator buildReplacementGenerator()
    {
        return new WebFilterReplacementGenerator(getAppSettings());
    }

    @Override
    public String getAppTitle()
    {
        return "Web Monitor";
    }

    @Override
    public String getName()
    {
        return "web_monitor";
    }

    @Override
    public String getAppName()
    {
        return "web-monitor";
    }

    @Override
    public boolean isPremium()
    {
        return false;
    }

    @Override
    public void initializeSettings(WebFilterSettings settings)
    {
        LinkedList<GenericRule> categories = new LinkedList<GenericRule>();

        addCategories(categories);
        settings.setCategories(categories);
    }

    @Override
    public void fixupSetSettings(WebFilterSettings argSettings)
    {
        super.fixupSetSettings(argSettings);

        /*
         * This hook function is called just before the base app writes and
         * activates new settings, so this is where we look for and disable the
         * block flag on all rules since we do monitoring only.
         */

        List<WebFilterRule> filterRules = argSettings.getFilterRules();
        for (WebFilterRule item : filterRules) {
            if (item.getBlocked()) {
                item.setBlocked(false);
                item.setFlagged(true);
            }
        }

        List<GenericRule> categories = argSettings.getCategories();
        for (GenericRule item : categories) {
            if (item.getBlocked()) {
                item.setBlocked(false);
                item.setFlagged(true);
            }
        }

        List<GenericRule> blockedUrls = argSettings.getBlockedUrls();
        for (GenericRule item : blockedUrls) {
            if (item.getBlocked()) {
                item.setBlocked(false);
                item.setFlagged(true);
            }
        }
    }
}
