/*
 * $Id$
 */
package com.untangle.uvm;

import java.util.List;

import com.untangle.uvm.SessionMonitorEntry;

public interface SessionMonitor
{
    /**
     * This returns a list of descriptors for all sessions in the conntrack table
     * It also pulls the list of current "pipelines" from the foundry and adds the UVM informations
     * such as policy
     */
    public List<SessionMonitorEntry> getMergedSessions();

    /**
     * This returns a list of descriptors for all sessions in the conntrack table
     * It also pulls the list of current "pipelines" from the foundry and adds the UVM informations
     * such as policy. This only lists sessions being processed by the given appId
     * If appId == 0, then getMergedSessions() is returned
     */
    public List<SessionMonitorEntry> getMergedSessions(long appId);

    /**
     * This returns a list of sessions and the bandwidth usage over the last 5 seconds
     * It calls the Jnettop list and merges it with the conntrack and netcap lists
     * This takes 5 seconds to return
     */
    public List<SessionMonitorEntry> getMergedBandwidthSessions();

    /**
     * This returns a list of sessions and the bandwidth usage over the last 5 seconds
     * It calls the Jnettop list and merges it with the conntrack and netcap lists
     * It calls jnettop on the specified interface Id (example: "0")
     * This takes 5 seconds to return
     */
    public List<SessionMonitorEntry> getMergedBandwidthSessions(String interfaceId);

    /**
     * This returns a list of sessions and the bandwidth usage over the last 5 seconds
     * It calls the Jnettop list and merges it with the conntrack and netcap lists
     * It calls jnettop on the specified interface Id (example: "0")
     * if appId != 0, only include sessions being processed by the specified appId.
     * This takes 5 seconds to return
     */
    public List<SessionMonitorEntry> getMergedBandwidthSessions(String interfaceIdStr, int appId);

    /**
     * Retrieve the session stats (but not the sessions themselves)
     * This is a JSON object with some keys to store values such as totalSessions, scannedSession, etc.
     */
    public org.json.JSONObject getSessionStats();

    /**
     * Retrieve the session stats by policy id
     * This is a JSON object which has policy ids as keys and sessions count, total kbps for each policy
     */
    public org.json.JSONObject getPoliciesSessionsStats();
}
