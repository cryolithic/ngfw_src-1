/**
* $Id$
 */
package com.untangle.uvm;

import java.util.Set;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import org.apache.log4j.Logger;

import com.untangle.uvm.app.App;
import com.untangle.uvm.app.AppProperties;
import com.untangle.uvm.vnet.PipelineConnector;
import com.untangle.uvm.vnet.AppSession;
import com.untangle.uvm.vnet.Fitting;
import com.untangle.uvm.vnet.Subscription;
import com.untangle.uvm.vnet.Affinity;
import com.untangle.uvm.vnet.SessionEventHandler;

/**
 * PipelineConnectorImpl is the implementation of a single PipelineConnector.
 * Status and control of a pipe happen here.
 * Events are handled in Dispatcher instead.
 */
public class PipelineConnectorImpl implements PipelineConnector
{
    /**
     * Active Sessions for this agent
     */
    private Set<AppSession> activeSessions = java.util.Collections.newSetFromMap(new ConcurrentHashMap<AppSession,Boolean>());

    private boolean enabled = true;

    private final Dispatcher dispatcher;
    private final String name;
    private final App app;
    private final Subscription subscription;
    private final SessionEventHandler listener;
    private final Fitting inputFitting;
    private final Fitting outputFitting;
    private final Affinity affinity;
    private final Integer affinityStrength;
    private final boolean premium;

    /**
     * A buddy is another pipelineConnector that this connector must not be adjacent to.
     * If it is, both this one and the buddy will be removed from the pipeline.
     * Also, this pipeline connector will not be inserted into the pipeline if the buddy is not present.
     *
     * This is used for casings
     * For example, the "http-server-side" pipeline connector has a buddy of "http-client-side"
     * This assures two things
     * 1) That http-server-side is only inserted if http-client-side exists somewhere in the pipeline before it
     * 2) That if http-server-side is inserted immediately after http-client-side, then both are removed since there is nothin "in the middle"
     */
    private final String buddy; 
    
    
    protected static final Logger logger = Logger.getLogger( PipelineConnectorImpl.class );
    
    public PipelineConnectorImpl( String name, App app, Subscription subscription, SessionEventHandler listener, Fitting inputFitting, Fitting outputFitting, Affinity affinity, Integer affinityStrength, boolean premium )
    {
        this( name, app, subscription, listener, inputFitting, outputFitting, affinity, affinityStrength, premium, null );
    }

    public PipelineConnectorImpl( String name, App app, Subscription subscription, SessionEventHandler listener, Fitting inputFitting, Fitting outputFitting, Affinity affinity, Integer affinityStrength, boolean premium, String buddy )
    {
        this.name = name;
        this.app = app;
        this.subscription = subscription;
        this.listener = listener;
        this.inputFitting = inputFitting;
        this.outputFitting = outputFitting;
        this.affinity = affinity;
        this.affinityStrength = affinityStrength;
        this.premium = premium;
        this.buddy = buddy;
        
        dispatcher = new Dispatcher(this);
        if (listener != null)
            dispatcher.setSessionEventHandler( listener );
    }
    
    public boolean isEnabled()
    {
        return enabled;
    }

    public void setEnabled(boolean enabled)
    {
        this.enabled = enabled;
    }

    public String getName() { return this.name; }
    public String getBuddy() { return this.buddy; }
    public App getApp() { return this.app; }
    public App app() { return this.app; }
    public Affinity getAffinity() { return this.affinity; }
    public Integer getAffinityStrength() { return this.affinityStrength; }
    public Dispatcher getDispatcher() { return dispatcher; }
    public boolean isPremium() { return premium; }
    
    public Fitting getInputFitting()
    {
        return inputFitting;
    }

    public Fitting getOutputFitting()
    {
        return outputFitting;
    }

    public AppProperties appProperties()
    {
        return app().getAppProperties();
    }

    public long[] liveSessionIds()
    {
        if (dispatcher == null)
            return new long[0];
        return dispatcher.liveSessionIds();
    }

    public List<AppSession> liveSessions()
    {
        if (dispatcher != null)
            return dispatcher.liveSessions();
        else
            return null;
    }
    
    /**
     * This is called by the App (or AppManager?) to disconnect
     * from a live PipelineConnector. Since it is live we must be sure to shut down the
     * Dispatcher nicely (in comparison to shutdown, below).
     *
     */
    public void destroy()
    {
        try {
            this.dispatcher.killAllSessions();
        } catch (Exception x) {
            logger.info("Exception destroying PipelineConnector", x);
        }

        /* Remove all of the active sessions */
        activeSessions.clear();
    }


    /**
     * Add a session to the map of active sessions.
     * @return True if the session was added, false if the agent is dead, or the session
     *   has already been added.
     */
    public boolean addSession( AppSession session )
    {
        return activeSessions.add( session );
    }

    /**
     * Remove a session from the map of active sessions associated with this netcap agent.
     * @return True if the session was removed, false if the session was not in the list 
     *   of active session.
     */
    public boolean removeSession( AppSession session )
    {
        return activeSessions.remove( session );
    }

    public boolean matches( com.untangle.uvm.app.SessionTuple tuple )
    {
        if ( !enabled ) {
            return false;
        }
        
        if ( subscription != null && ! subscription.matches( tuple ) ) {
            return false;
        }

        return true;
    }
    
    public String toString()
    {
        return this.name;
    }
}
