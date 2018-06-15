/**
 * $Id$
 */
package com.untangle.app.web_filter;

import org.apache.log4j.Logger;

import com.untangle.app.http.HttpEventHandler;
import com.untangle.app.http.RequestLineToken;
import com.untangle.app.http.StatusLine;
import com.untangle.uvm.vnet.ChunkToken;
import com.untangle.app.http.HeaderToken;
import com.untangle.uvm.vnet.Token;
import com.untangle.uvm.vnet.AppTCPSession;

/**
 * Blocks HTTP traffic that is on an active block list.
 */
public class WebFilterBaseHandler extends HttpEventHandler
{
    protected final Logger logger = Logger.getLogger(getClass());

    protected final WebFilterBase app;

    /**
     * Constructor
     * 
     * @param app
     *        The application instance
     */
    protected WebFilterBaseHandler(WebFilterBase app)
    {
        this.app = app;
    }

    /**
     * Handle the request line
     * 
     * @param session
     *        The session
     * @param requestLine
     *        The request line
     * @return The request line
     */
    @Override
    protected RequestLineToken doRequestLine(AppTCPSession session, RequestLineToken requestLine)
    {
        return requestLine;
    }

    /**
     * Handle the request header
     * 
     * @param sess
     *        The session
     * @param requestHeader
     *        The header
     * @return The header
     */
    @Override
    protected HeaderToken doRequestHeader(AppTCPSession sess, HeaderToken requestHeader)
    {
        app.incrementScanCount();

        String nonce = app.getDecisionEngine().checkRequest(sess, sess.getClientAddr(), 80, getRequestLine(sess), requestHeader);

        if (logger.isDebugEnabled()) {
            logger.debug("in doRequestHeader(): " + requestHeader + "check request returns: " + nonce);
        }

        if (nonce == null) {
            app.incrementPassCount();

            releaseRequest(sess);
        } else {
            app.incrementBlockCount();

            String uri = getRequestLine(sess).getRequestUri().toString();
            Token[] response = app.generateResponse(nonce, sess, uri, requestHeader);
            blockRequest(sess, response);
        }

        return requestHeader;
    }

    /**
     * Handle the request body
     * 
     * @param session
     *        The session
     * @param chunk
     *        The chunk
     * @return The chunk
     */
    @Override
    protected ChunkToken doRequestBody(AppTCPSession session, ChunkToken chunk)
    {
        return chunk;
    }

    /**
     * Handle the reqest body end
     * 
     * @param session
     *        The session
     */
    @Override
    protected void doRequestBodyEnd(AppTCPSession session)
    {
    }

    /**
     * Handle the status line
     * 
     * @param session
     *        The session
     * @param statusLine
     *        The status line
     * @return The status line
     */
    @Override
    protected StatusLine doStatusLine(AppTCPSession session, StatusLine statusLine)
    {
        return statusLine;
    }

    /**
     * Handle the response header
     * 
     * @param sess
     *        The session
     * @param responseHeader
     *        The response header
     * @return The response header
     */
    @Override
    protected HeaderToken doResponseHeader(AppTCPSession sess, HeaderToken responseHeader)
    {
        if (getStatusLine(sess).getStatusCode() == 100) {
            releaseResponse(sess);
        } else {
            String nonce = app.getDecisionEngine().checkResponse(sess, sess.getClientAddr(), getResponseRequest(sess), responseHeader);

            if (logger.isDebugEnabled()) {
                logger.debug("in doResponseHeader: " + responseHeader + "checkResponse returns: " + nonce);
            }

            if (nonce == null) {
                app.incrementPassCount();

                releaseResponse(sess);
            } else {
                app.incrementBlockCount();

                Token[] response = app.generateResponse(nonce, sess);
                blockResponse(sess, response);
            }
        }

        return responseHeader;
    }

    /**
     * Handle the response body
     * 
     * @param session
     *        The session
     * @param chunk
     *        The chunk
     * @return The chunk
     */
    @Override
    protected ChunkToken doResponseBody(AppTCPSession session, ChunkToken chunk)
    {
        return chunk;
    }

    /**
     * Handle the response body end
     * 
     * @param session
     *        The session
     */
    @Override
    protected void doResponseBodyEnd(AppTCPSession session)
    {
    }
}
