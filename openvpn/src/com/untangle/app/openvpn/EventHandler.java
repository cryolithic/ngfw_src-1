/**
 * $Id$
 */
package com.untangle.app.openvpn;

import com.untangle.uvm.network.InterfaceSettings;
import com.untangle.uvm.vnet.AbstractEventHandler;
import com.untangle.uvm.vnet.IPNewSessionRequest;
import com.untangle.uvm.vnet.TCPNewSessionRequest;
import com.untangle.uvm.vnet.UDPNewSessionRequest;
import org.apache.log4j.Logger;

class EventHandler extends AbstractEventHandler
{
    private final Logger logger = Logger.getLogger( EventHandler.class );

    private final OpenVpnAppImpl app;

    public EventHandler( OpenVpnAppImpl app )
    {
        super(app);

        this.app = app;
    }

    public void handleTCPNewSessionRequest( TCPNewSessionRequest sessionRequest )
        
    {
        handleNewSessionRequest( sessionRequest );
    }

    public void handleUDPNewSessionRequest( UDPNewSessionRequest sessionRequest )
        
    {
        handleNewSessionRequest( sessionRequest );
    }

    private void handleNewSessionRequest( IPNewSessionRequest request )
    {
        if ( logger.isDebugEnabled()) logger.debug( "New session: [" + request.id() + "]" );

        if ( request.getClientIntf() != InterfaceSettings.OPENVPN_INTERFACE_ID && request.getServerIntf() != InterfaceSettings.OPENVPN_INTERFACE_ID ) {
            /* Nothing to do - not VPN traffic*/
            request.release();
            return;
        }
        else if ( request.getClientIntf() == InterfaceSettings.OPENVPN_INTERFACE_ID && request.getServerIntf() == InterfaceSettings.OPENVPN_INTERFACE_ID ) {
            /* from the VPN to the VPN? just release it */
            request.release();
        }
        else if ( request.getClientIntf() == InterfaceSettings.OPENVPN_INTERFACE_ID ) {
            /* OPENVPN client going to another interface */
            app.incrementPassCount();
            request.release();
        }
        else {
            /* Local user trying to reach a OPENVPN client */
            app.incrementPassCount();
            request.release();
        }
    }
}
