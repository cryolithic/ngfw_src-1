/**
 * $Id$
 */
package com.untangle.app.phish_blocker;

import java.util.Map;

import com.untangle.app.smtp.WrappedMessageGenerator;
import com.untangle.app.spam_blocker.SpamReport;
import com.untangle.uvm.UvmContextFactory;
import com.untangle.uvm.util.I18nUtil;

/**
 * Protocol Handler which is called-back as scanable messages
 * are encountered.
 */
public class PhishBlockerSmtpHandler extends com.untangle.app.spam_blocker.SpamSmtpHandler
{
    private static final String MOD_SUB_TEMPLATE = "[PHISH] $MIMEMessage:SUBJECT$";
   
    private WrappedMessageGenerator msgGenerator;
    
    protected PhishBlockerSmtpHandler( PhishBlockerApp app )
    {
        super( app );

        msgGenerator = new WrappedMessageGenerator(MOD_SUB_TEMPLATE,getTranslatedBodyTemplate(), this);
    }
    
    @Override
    public String getTranslatedBodyTemplate()
    {
        Map<String, String> i18nMap = UvmContextFactory.context().languageManager().getTranslations("untangle");
        I18nUtil i18nUtil = new I18nUtil(i18nMap);
        String bodyTemplate = i18nUtil.tr("The attached message from")
                              + " $MIMEMessage:FROM$\r\n"
                              + i18nUtil.tr("was determined by the Phish Blocker to be phish (a fraudulent email intended to steal information).") + "  "
                              + "\n\r" + i18nUtil.tr("The kind of phish that was found was") + " $SPAMReport:FULL$";
        return bodyTemplate;
    }
    
    @Override
    public String getTranslatedSubjectTemplate()
    {
        return MOD_SUB_TEMPLATE;
    }

    @Override
    protected String getQuarantineCategory()
    {
        return "PHISH";
    }

    @Override
    protected String getQuarantineDetail(SpamReport report)
    {
        return "PHISH";
    }

    @Override
    protected WrappedMessageGenerator getMsgGenerator()
    {
        return msgGenerator;
    }

}
