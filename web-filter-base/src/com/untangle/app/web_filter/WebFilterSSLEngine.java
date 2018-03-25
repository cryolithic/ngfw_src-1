/*
 * $Id: WebFilterSSLEngine.java 43513 2016-05-31 18:44:31Z mahotz $
 */

package com.untangle.app.web_filter;

import javax.net.ssl.SSLEngineResult.HandshakeStatus;
import javax.net.ssl.SSLEngineResult;
import javax.net.ssl.X509TrustManager;
import javax.net.ssl.TrustManager;
import javax.net.ssl.SSLContext;
import javax.net.ssl.SSLEngine;
import javax.net.ssl.KeyManagerFactory;

import java.net.InetAddress;
import java.nio.ByteBuffer;
import java.io.FileInputStream;
import java.security.cert.CertificateException;
import java.security.cert.X509Certificate;
import java.security.KeyStore;

import com.untangle.uvm.vnet.AppTCPSession;
import com.untangle.uvm.vnet.AppSession;
import com.untangle.uvm.CertificateManager;
import com.untangle.uvm.UvmContextFactory;

import org.apache.log4j.Logger;

public class WebFilterSSLEngine
{
    private final Logger logger = Logger.getLogger(getClass());
    private AppTCPSession session;
    private SSLContext sslContext;
    private SSLEngine sslEngine;
    private String nonceStr;
    private String appStr;

    protected WebFilterSSLEngine(AppTCPSession session, String nonceStr, String appStr)
    {
        String webCertFile = CertificateManager.CERT_STORE_PATH + UvmContextFactory.context().systemManager().getSettings().getWebCertificate().replaceAll("\\.pem", "\\.pfx");
        this.session = session;
        this.nonceStr = nonceStr;
        this.appStr = appStr;

        try {
            // use the argumented certfile and password to init our keystore
            KeyStore keyStore = KeyStore.getInstance("PKCS12");
            keyStore.load(new FileInputStream(webCertFile), CertificateManager.CERT_FILE_PASSWORD.toCharArray());
            KeyManagerFactory kmf = KeyManagerFactory.getInstance("SunX509");
            kmf.init(keyStore, CertificateManager.CERT_FILE_PASSWORD.toCharArray());

            // pass trust_all_certificates as the trust manager for our
            // engine to prevent the SSLEngine from loading cacerts
            sslContext = SSLContext.getInstance("TLS");
            sslContext.init(kmf.getKeyManagers(), new TrustManager[] { trust_all_certificates }, null);
            sslEngine = sslContext.createSSLEngine();

            // we're acting like a server so set the appropriate engine flags
            sslEngine.setUseClientMode(false);
            sslEngine.setNeedClientAuth(false);
            sslEngine.setWantClientAuth(false);
        }

        catch (Exception exn) {
            logger.error("Exception creating WebFilterSSLEngine()", exn);
        }
    }

    // ------------------------------------------------------------------------

    public void handleClientData(ByteBuffer buff)
    {
        // pass the data to the client data worker function
        boolean success = false;
        
        try {
            success = clientDataWorker(buff);
        }

        // catch any exceptions
        catch (Exception exn) {
            logger.debug("Exception calling clilentDataWorker", exn);
        }

        // null result means something went haywire
        if ( ! success ) {
            session.globalAttach(AppSession.KEY_WEB_FILTER_SSL_ENGINE, null);
            session.resetClient();
            session.resetServer();
            session.release();
        }

        return;
    }

    // ------------------------------------------------------------------------

    private boolean clientDataWorker(ByteBuffer data) throws Exception
    {
        ByteBuffer target = ByteBuffer.allocate(32768);
        boolean done = false;
        HandshakeStatus status;

        logger.debug("PARAM_BUFFER = " + data.toString());

        while ( ! done ) {
            status = sslEngine.getHandshakeStatus();
            logger.debug("STATUS = " + status);

            // problems with the external server cert seem to cause one
            // of these to become true during handshake so we just return
            if (sslEngine.isInboundDone()) {
                logger.debug("Unexpected isInboundDone() == TRUE");
                return false;
            }
            if (sslEngine.isOutboundDone()) {
                logger.debug("Unexpected isOutboundDone() == TRUE");
                return false;
            }

            switch (status) {
            // should never happen since this will only be returned from
            // a call to wrap or unwrap but we include it to be complete
            case FINISHED:
                logger.error("Unexpected FINISHED in dataHandler loop");
                return false;

                // handle outstanding tasks during handshake
            case NEED_TASK:
                done = doNeedTask(data);
                break;

            // handle unwrap during handshake
            case NEED_UNWRAP:
                done = doNeedUnwrap(data, target);
                break;

            // handle wrap during handshake
            case NEED_WRAP:
                done = doNeedWrap(data, target);
                break;

            // handle data when no handshake is in progress
            case NOT_HANDSHAKING:
                done = doNotHandshaking(data, target);
                break;

            // should never happen but we handle just to be safe
            default:
                logger.error("Unknown SSLEngine status in dataHandler loop");
                return false;
            }
        }

        return done;
    }

    // ------------------------------------------------------------------------

    private boolean doNeedTask(ByteBuffer data) throws Exception
    {
        Runnable runnable;

        // loop and run SSLEngine outstanding tasks
        while ((runnable = sslEngine.getDelegatedTask()) != null) {
            logger.debug("EXEC_TASK " + runnable.toString());
            runnable.run();
        }
        return false;
    }

    // ------------------------------------------------------------------------

    private boolean doNeedUnwrap(ByteBuffer data, ByteBuffer target) throws Exception
    {
        SSLEngineResult result;

        // unwrap the argumented data into the engine buffer
        result = sslEngine.unwrap(data, target);
        logger.debug("EXEC_UNWRAP " + result.toString());

        if (result.getStatus() == SSLEngineResult.Status.BUFFER_UNDERFLOW) {
            // underflow during unwrap means the SSLEngine needs more data
            // but it's also possible it used some of the passed data so we
            // compact the receive buffer and hand it back for more
            data.compact();
            logger.debug("UNDERFLOW_LEFTOVER = " + data.toString());

            session.setClientBuffer( data );
            return true;
        }

        // check for engine problems
        if (result.getStatus() != SSLEngineResult.Status.OK)
            throw new Exception("SSLEngine unwrap fault");

        // if the engine result hasn't changed we need more processing
        if (result.getHandshakeStatus() == HandshakeStatus.NEED_UNWRAP)
            return false;

        // the unwrap call shouldn't produce data during handshake and if
        // that is the case we return null here allowing the loop to continue
        if (result.bytesProduced() == 0)
            return false;

        // unwrap calls during handshake should never produce data
        throw new Exception("SSLEngine produced unexpected data during handshake unwrap");
    }

    // ------------------------------------------------------------------------

    private boolean doNeedWrap(ByteBuffer data, ByteBuffer target) throws Exception
    {
        SSLEngineResult result;

        // wrap the argumented data into the engine buffer
        result = sslEngine.wrap(data, target);
        logger.debug("EXEC_WRAP " + result.toString());

        // check for engine problems
        if (result.getStatus() != SSLEngineResult.Status.OK)
            throw new Exception("SSLEngine wrap fault");

        // if the engine result hasn't changed we need more processing
        if (result.getHandshakeStatus() == HandshakeStatus.NEED_WRAP)
            return false;

        // if the wrap call didn't produce any data return null
        if (result.bytesProduced() == 0)
            return false;

        // the wrap call produced some data so return it to the client
        target.flip();
        ByteBuffer array[] = new ByteBuffer[1];
        array[0] = target;
        session.sendDataToClient( array );
        return true;
    }

    // ------------------------------------------------------------------------

    private boolean doNotHandshaking(ByteBuffer data, ByteBuffer target) throws Exception
    {
        SSLEngineResult result = null;
        String vector = new String();

        // we call unwrap for all data we receive from the client 
        result = sslEngine.unwrap(data, target);
        logger.debug("EXEC_HANDSHAKING " + result.toString());
        logger.debug("LOCAL_BUFFER = " + target.toString());

        // make sure we get a good status return from the SSL engine
        if (result.getStatus() != SSLEngineResult.Status.OK)
            throw new Exception("SSLEngine unwrap fault");

        // if unwrap doesn't produce any data then we are handshaking and 
        // must return null to let the handshake process continue
        if (result.bytesProduced() == 0)
            return false;

        // when unwrap finally returns some data it will be the client request
        logger.debug("CLIENT REQUEST = " + new String(target.array(), 0, target.position()));

        InetAddress host = UvmContextFactory.context().networkManager().getInterfaceHttpAddress(session.getClientIntf());

        vector += "HTTP/1.1 307 Temporary Redirect\r\n";
        vector += "Location: http://" + host.getHostAddress().toString() + "/web-filter/blockpage?nonce=" + nonceStr + "&appid=" + appStr + "\r\n";
        vector += "Cache-Control: no-store, no-cache, must-revalidate, post-check=0, pre-check=0\r\n";
        vector += "Pragma: no-cache\r\n";
        vector += "Expires: Mon, 10 Jan 2000 00:00:00 GMT\r\n";
        vector += "Content-Type: text/plain\r\n";
        vector += "Content-Length: 0\r\n";
        vector += "Connection: Close\r\n";
        vector += "\r\n";

        logger.debug("CLIENT REPLY = " + vector);

        // pass the reply buffer to the SSL engine wrap function
        ByteBuffer ibuff = ByteBuffer.wrap(vector.getBytes());
        ByteBuffer obuff = ByteBuffer.allocate(32768);
        result = sslEngine.wrap(ibuff, obuff);

        // we are done so cleanup attachment and release session
        session.globalAttach(AppSession.KEY_WEB_FILTER_SSL_ENGINE, null);
        session.release();

        // return the now encrypted reply buffer back to the client
        ByteBuffer array[] = new ByteBuffer[1];
        obuff.flip();
        array[0] = obuff;
        session.sendDataToClient( array );
        return true;
    }

    private TrustManager trust_all_certificates = new X509TrustManager()
    {
        public void checkClientTrusted(X509Certificate[] chain, String authType) throws CertificateException
        {
        }

        public void checkServerTrusted(X509Certificate[] chain, String authType) throws CertificateException
        {
        }

        public X509Certificate[] getAcceptedIssuers()
        {
            return null;
        }
    };
}
