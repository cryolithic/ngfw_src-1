/**
 * $Id: WebFilterHandler.java 42622 2016-03-08 23:00:30Z dmorris $
 */

package com.untangle.app.web_filter;

import java.net.URI;

import com.untangle.app.http.HeaderToken;
import com.untangle.uvm.vnet.Token;
import com.untangle.app.web_filter.WebFilterBase;
import com.untangle.app.web_filter.WebFilterHandler;
import com.untangle.uvm.vnet.AppTCPSession;

/**
 * Blocks HTTP traffic that is on an active block list.
 */
public class WebFilterHandler extends WebFilterBaseHandler
{

    /**
     * Constructor
     * 
     * @param app
     *        The web filter base application
     */
    public WebFilterHandler(WebFilterBase app)
    {
        super(app);
    }

    /**
     * Handle the request header
     * 
     * @param session
     *        The session
     * @param requestHeader
     *        The request header
     * @return The request header
     */
    @Override
    protected HeaderToken doRequestHeader(AppTCPSession session, HeaderToken requestHeader)
    {
        app.incrementScanCount();

        String nonce = app.getDecisionEngine().checkRequest(session, session.getClientAddr(), 80, getRequestLine(session), requestHeader);
        if (logger.isDebugEnabled()) {
            logger.debug("in doRequestHeader(): " + requestHeader + "check request returns: " + nonce);
        }

        if (nonce == null) {
            String host = requestHeader.getValue("Host");
            URI uri = getRequestLine(session).getRequestUri();

            if (app.getSettings().getEnforceSafeSearch()) {
                logger.debug("doRequestHeader: host = '" + host + "', uri = '" + uri + "'");

                URI safeSearchUri = UrlRewriter.getSafeSearchUri(host, uri);

                if (safeSearchUri != null) getRequestLine(session).setRequestUri(safeSearchUri);

                logger.debug("doRequestHeader: host = '" + host + "', uri = '" + getRequestLine(session).getRequestUri() + "'");
            }

            releaseRequest(session);
        } else {
            app.incrementBlockCount();
            String uri = getRequestLine(session).getRequestUri().toString();
            Token[] response = app.generateResponse(nonce, session, uri, requestHeader);

            blockRequest(session, response);
        }

        return requestHeader;
    }
}
