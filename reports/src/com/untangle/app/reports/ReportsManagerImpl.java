/**
 * $Id: ReportsManagerImpl.java,v 1.00 2015/03/04 13:59:12 dmorris Exp $
 */
package com.untangle.app.reports;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Collections;
import java.util.Comparator;
import java.util.Date;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.Iterator;

import org.apache.log4j.Logger;
import org.json.JSONObject;

import com.untangle.uvm.AdminUserSettings;
import com.untangle.uvm.ExecManagerResult;
import com.untangle.uvm.UvmContextFactory;
import com.untangle.uvm.WebBrowser;
import com.untangle.uvm.network.InterfaceSettings;
import com.untangle.uvm.app.AppProperties;
import com.untangle.uvm.app.AppSettings;
import com.untangle.uvm.app.PolicyManager;

public class ReportsManagerImpl implements ReportsManager
{
    private static final Logger logger = Logger.getLogger(ReportsManagerImpl.class);

    private static ReportsManagerImpl instance = null;

    private static ReportsApp app = null;

    /**
     * This stores the table column metadata lookup results so we don't have to frequently lookup metadata
     * which is slow
     */
    private static HashMap<String,HashMap<String,String>> cacheColumnsResults = new HashMap<String,HashMap<String,String>>();

    /**
     * This stores the tables metadata lookup results so we don't have to frequently lookup metadata
     * which is slow
     */
    private static ResultSet cacheTablesResults = null;

    /**
     * This stores all the app properties. It is used to reference information about the different apps/categories
     */
    private List<AppProperties> appPropertiesList = null;

    protected ReportsManagerImpl()
    {
        this.appPropertiesList = UvmContextFactory.context().appManager().getAllAppProperties();

        // sort by view position
        Collections.sort(this.appPropertiesList, new Comparator<AppProperties>() {
            public int compare(AppProperties np1, AppProperties np2) {
                int vp1 = np1.getViewPosition();
                int vp2 = np2.getViewPosition();
                if (vp1 == vp2) {
                    return np1.getName().compareToIgnoreCase(np2.getName());
                } else if (vp1 < vp2) {
                    return -1;
                } else {
                    return 1;
                }
            }
        });

    }

    public static ReportsManagerImpl getInstance()
    {
        synchronized ( ReportsManagerImpl.class ) {
            if ( instance == null ) {
                instance = new ReportsManagerImpl();
            }
        }

        return instance;
    }

    public void setReportsApp( ReportsApp app )
    {
        ReportsManagerImpl.app = app;
    }

    public boolean isReportsEnabled()
    {
        return app != null && AppSettings.AppState.RUNNING.equals(app.getRunState());
    }

    public List<ReportEntry> getReportEntries()
    {
        if ( app == null ) {
            throw new RuntimeException("Reports app not found");
        }

        LinkedList<ReportEntry> allReportEntries = new LinkedList<ReportEntry>( app.getSettings().getReportEntries() );

        Collections.sort( allReportEntries, new ReportEntryDisplayOrderComparator() );

        return allReportEntries;
    }

    public List<ReportEntry> getReportEntries( String category )
    {
        List<ReportEntry> allReportEntries = getReportEntries();
        LinkedList<ReportEntry> entries = new LinkedList<ReportEntry>();

        /**
         * If fetching the reports for an app, check that it is installed and has a valid license
         * If the license is not valid, return an empty list
         * If the category isnt an app name, just continue.
         */
        AppProperties appProperties = findAppProperties( category );
        if ( appProperties != null ) {
            if ( ! UvmContextFactory.context().licenseManager().isLicenseValid( appProperties.getName() ) ) {
                logger.warn("Not showing report entries for \"" + category + "\" because of invalid license.");
                return entries;
            }
            if ( UvmContextFactory.context().appManager().app( appProperties.getName() ) == null ) {
                logger.warn("Not showing report entries for \"" + category + "\" because it isnt installed.");
                return entries;
            }
        }

        for ( ReportEntry entry: allReportEntries ) {
            if ( category == null || category.equals( entry.getCategory() ) )
                 entries.add( entry );
            else if ( "Summary".equals( category ) && entry.getType() == ReportEntry.ReportEntryType.TEXT )
                 entries.add( entry );

        }
        return entries;
    }

    public List<JSONObject> getCurrentApplications()
    {
        ArrayList<JSONObject> currentApplications = new ArrayList<JSONObject>();

        for ( AppProperties appProperties : this.appPropertiesList ) {
            if ( appProperties.getInvisible()) {
                continue;
            }
            if ( UvmContextFactory.context().appManager().app( appProperties.getName() ) == null ) {
                continue;
            }
            if ( ! UvmContextFactory.context().licenseManager().isLicenseValid( appProperties.getName() ) ) {
                continue;
            }
            org.json.JSONObject json = new org.json.JSONObject();

            try {
                json.put("displayName", appProperties.getDisplayName());
                json.put("name", appProperties.getName());
                json.put("viewPosition", appProperties.getViewPosition());
            } catch (Exception e) {
                logger.error( "Error generating Current Applications list", e );
            }
            currentApplications.add(json);
        }

        return currentApplications;
    }

    public Map<String, String> getUnavailableApplicationsMap()
    {
        Map<String, String> unavailableApplicationsMap = new HashMap<String, String>();

        for ( AppProperties appProperties : this.appPropertiesList ) {
            if("shield".equals(appProperties.getName())){
                continue;
            }
            if ( appProperties.getInvisible() ||
                    UvmContextFactory.context().appManager().app( appProperties.getName() ) == null ||
                    !UvmContextFactory.context().licenseManager().isLicenseValid( appProperties.getName() ) ) {
                unavailableApplicationsMap.put(appProperties.getDisplayName(), appProperties.getName());
            }
        }

        return unavailableApplicationsMap;
    }

    public void setReportEntries( List<ReportEntry> newEntries )
    {
        if ( app == null ) {
            throw new RuntimeException("Reports app not found");
        }

        LinkedList<ReportEntry> newReportEntries = new LinkedList<ReportEntry>(newEntries);
        updateSystemReportEntries( newReportEntries, false );

        ReportsSettings settings = app.getSettings();
        settings.setReportEntries( newReportEntries );
        app.setSettings( settings, true );
    }

    public ReportEntry getReportEntry( String category, String title )
    {
        LinkedList<ReportEntry> entries = app.getSettings().getReportEntries();

        if ( category == null || title == null )
            return null;

        for ( ReportEntry entry : entries ) {
            if ( category.equals(entry.getCategory()) && title.equals(entry.getTitle()) )
                return entry;
        }

        return null;
    }

    public ReportEntry getReportEntry( String uniqueId )
    {
        LinkedList<ReportEntry> entries = app.getSettings().getReportEntries();

        if ( uniqueId == null)
            return null;

        for ( ReportEntry entry : entries ) {
            if ( uniqueId.equals(entry.getUniqueId()) )
                return entry;
        }

        return null;
    }

    public void saveReportEntry( ReportEntry entry )
    {
        String uniqueId = entry.getUniqueId();
        List<ReportEntry> reportEntries = getReportEntries();
        boolean found = false;
        int i = 0;

        if ( uniqueId == null ) {
            throw new RuntimeException("Invalid Entry unique ID: " + uniqueId );
        }

        for ( ReportEntry e : reportEntries ) {
            if ( uniqueId.equals( e.getUniqueId() ) ) {
                found = true;
                reportEntries.set( i, entry );
                break;
            }
            i++;
        }

        if (!found)
            reportEntries.add( entry );

        setReportEntries( reportEntries );
        return;
    }

    public void removeReportEntry( ReportEntry entry )
    {
        String uniqueId = entry.getUniqueId();
        List<ReportEntry> reportEntries = getReportEntries();
        boolean found = false;
        int i = 0;

        if ( uniqueId == null ) {
            throw new RuntimeException("Invalid Entry unique ID: " + uniqueId );
        }

        if ( entry.getReadOnly() ) {
            throw new RuntimeException("Readonly entries cannot be removed!");
        }

        for ( ReportEntry e : reportEntries ) {
            if ( uniqueId.equals( e.getUniqueId() ) ) {
                found = true;
                reportEntries.set( i, entry );
                break;
            }
            i++;
        }

        if ( !found ) {
            throw new RuntimeException("Report entry: " + uniqueId + " not found!");
        }

        // remove entry
        if ( !reportEntries.remove( entry ) ) {
            throw new RuntimeException("Failed to remove report entry: " + uniqueId);
        }

        setReportEntries( reportEntries );
        return;
    }

    public List<JSONObject> getDataForReportEntry( ReportEntry entry, final Date startDate, final Date endDate, SqlCondition[] extraConditions, final int limit )
    {
        Connection conn = app.getDbConnection();
        PreparedStatement statement = entry.toSql( conn, startDate, endDate, extraConditions );

        if ( app != null ) {
            // only flush if there are less than 10k events pending
            // if there are more than 10k then events are currently being flushed and the queue can be quite long
            // as such, just return the results for the events already in the DB instead of waiting up to several minutes
            if (app.getEventsPendingCount() < 10000)
                app.flushEvents();
        }

        logger.info("Getting Data for : (" + entry.getCategory() + ") " + entry.getTitle());
        logger.info("Statement        : " + statement);

        long t0 = System.currentTimeMillis();
        ArrayList<JSONObject> results = ReportsApp.eventReader.getEvents( conn, statement, entry.getTable(), limit );
        long t1 = System.currentTimeMillis();

        logger.info("Query Time       : " + String.format("%5d",(t1 - t0)) + " ms");

        return results;
    }

    public List<JSONObject> getDataForReportEntry( ReportEntry entry, final Date startDate, final Date endDate, final int limit )
    {
        return getDataForReportEntry( entry, startDate, endDate, null, limit );
    }

    public List<JSONObject> getDataForReportEntry( ReportEntry entry, final int timeframeSec, final int limit )
    {
        Date startDate = null;
        if(timeframeSec > 0) {
            Calendar cal = Calendar.getInstance();
            cal.add(Calendar.SECOND, -timeframeSec);
            startDate = cal.getTime();
        }
        return getDataForReportEntry( entry, startDate, null, null, limit );
    }

    public String[] getColumnsForTable( String tableName )
    {
        ArrayList<String> columnNames = new ArrayList<String>();
        HashMap<String,String> metadata = getColumnMetaData( tableName );

        Set<String> keys = metadata.keySet();
        String[] array = new String[keys.size()];
        array = keys.toArray(array);
        return array;
    }

    public String getColumnType( String tableName, String columnName )
    {
        HashMap<String,String> metadata = getColumnMetaData( tableName );

        return metadata.get( columnName );
    }

    public boolean tableHasColumn( String tableName, String columnName )
    {
        String type = getColumnType( tableName, columnName );
        if ( type == null )
            return false;
        return true;
    }

    public String[] getTables()
    {
        ArrayList<String> tableNames = new ArrayList<String>();
        Connection conn = app.getDbConnection();
        try {
            ResultSet rs = cacheTablesResults;
            if ( rs == null ) {
                if (ReportsApp.dbDriver.equals("sqlite")) {
                    // don't cache sqlite results
                    // the result is FORWARD_ONLY
                    rs = conn.getMetaData().getTables( null, null, null, null );
                } else {
                    cacheTablesResults = conn.getMetaData().getTables( null, "reports", null, null );
                    rs = cacheTablesResults;
                }
            } else {
                rs.beforeFirst();
            }

            while(rs.next()){
                try {
                    String tableName = rs.getString(3);
                    String type = rs.getString(4);

                    // only include tables without a "0" in them
                    // the 0 excludes all partitions because they have the date in them
                    if ("TABLE".equals(type) && !tableName.contains("0")) {
                        tableNames.add( tableName );
                    }
                } catch (Exception e) {
                    logger.warn("Exception fetching table names",e);
                }
            }
        } catch ( Exception e ) {
            logger.warn("Failed to retrieve column names", e);
            return null;
        } finally {
            try { conn.close(); } catch (Exception e) {
                logger.warn("Close Exception",e);
            }
        }

        String[] array = new String[tableNames.size()];
        array = tableNames.toArray(array);
        return array;
    }

    public ArrayList<org.json.JSONObject> getEvents(final ReportEntry entry, final SqlCondition[] extraConditions, final int limit)
    {
        if (entry == null) {
            logger.warn("Invalid arguments");
            return null;
        }
        if ( entry.getType() != ReportEntry.ReportEntryType.EVENT_LIST )
            throw new RuntimeException("Can only retrieve events for an EVENT_LIST type report entry");
        if ( app != null ) {
            // only flush if there are less than 10k events pending
            // if there are more than 10k then events are currently being flushed and the queue can be quite long
            // as such, just return the results for the events already in the DB instead of waiting up to several minutes
            if (app.getEventsPendingCount() < 10000)
                app.flushEvents();
        }

        Connection conn = app.getDbConnection();
        PreparedStatement statement = entry.toSql( conn, null, null, extraConditions, limit );

        logger.info("Getting Events for : (" + entry.getCategory() + ") " + entry.getTitle());
        logger.info("Statement          : " + statement);

        long t0 = System.currentTimeMillis();
        ArrayList<org.json.JSONObject> results =  ReportsApp.eventReader.getEvents( conn, statement, entry.getTable(), limit );
        long t1 = System.currentTimeMillis();

        logger.info("Query Time         : " + String.format("%5d",(t1 - t0)) + " ms");

        return results;
    }

    public ResultSetReader getEventsResultSet(final ReportEntry entry, final SqlCondition[] extraConditions, final int limit)
    {
        if (entry == null) {
            logger.warn("Invalid arguments");
            return null;
        }
        return getEventsForDateRangeResultSet( entry, extraConditions, limit, null, null );
    }

    public ResultSetReader getEventsForTimeframeResultSet(final ReportEntry entry, final SqlCondition[] extraConditions, final int timeframeSec, final int limit)
    {
        if (entry == null) {
            logger.warn("Invalid arguments");
            return null;
        }
        Date startDate = null;
        if(timeframeSec > 0) {
            Calendar cal = Calendar.getInstance();
            cal.add(Calendar.SECOND, -timeframeSec);
            startDate = cal.getTime();
        }
        return getEventsForDateRangeResultSet( entry, extraConditions, limit, startDate, null );
    }

    public ResultSetReader getEventsForDateRangeResultSet(final ReportEntry entry, final SqlCondition[] extraConditions, final int limit, final Date start, final Date endDate)
    {
        if (entry == null) {
            logger.warn("Invalid arguments");
            return null;
        }
        if ( entry.getType() != ReportEntry.ReportEntryType.EVENT_LIST )
            throw new RuntimeException("Can only retrieve events for an EVENT_LIST type report entry");
        if ( app != null ) {
            // only flush if there are less than 10k events pending
            // if there are more than 10k then events are currently being flushed and the queue can be quite long
            // as such, just return the results for the events already in the DB instead of waiting up to several minutes
            if (app.getEventsPendingCount() < 10000)
                app.flushEvents();
        }

        Date startDate = start;
        if ( startDate == null ) {
            startDate = new Date((new Date()).getTime() - (1000 * 60 * 60 * 24));
            logger.info("startDate not specified, using 1 day ago: " + startDate);
        }

        Connection conn = app.getDbConnection();
        PreparedStatement statement = entry.toSql( conn, startDate, endDate, extraConditions, limit );

        logger.info("Getting Events for : (" + entry.getCategory() + ") " + entry.getTitle());
        logger.info("Statement          : " + statement);

        long t0 = System.currentTimeMillis();
        ResultSetReader result = ReportsApp.eventReader.getEventsResultSet( conn, statement, limit);
        long t1 = System.currentTimeMillis();

        logger.info("Query Time         : " + String.format("%5d",(t1 - t0)) + " ms");

        return result;
    }

    public org.json.JSONObject getConditionQuickAddHints()
    {
        return UvmContextFactory.context().getConditionQuickAddHints();
    }

    public Integer getTimeZoneOffset()
    {
        return UvmContextFactory.context().systemManager().getTimeZoneOffset();
    }

    public List<JSONObject> getPoliciesInfo()
    {
        ArrayList<JSONObject> policiesInfo = new ArrayList<JSONObject>();
        PolicyManager policyManager = (PolicyManager) UvmContextFactory.context().appManager().app("policy-manager");
        if ( policyManager != null ) {
            policiesInfo = policyManager.getPoliciesInfo();
        }
        return policiesInfo;
    }

    public List<JSONObject> getInterfacesInfo()
    {
        ArrayList<JSONObject> interfacesInfo = new ArrayList<JSONObject>();
        for( InterfaceSettings interfaceSettings : UvmContextFactory.context().networkManager().getNetworkSettings().getInterfaces() ){
            try {
                JSONObject json = new org.json.JSONObject();
                json.put("interfaceId", interfaceSettings.getInterfaceId());
                json.put("name", interfaceSettings.getName() );
                interfacesInfo.add(json);
            } catch (Exception e) {
                logger.warn("Error generating interfaces list",e);
            }
        }
        for( InterfaceSettings interfaceSettings : UvmContextFactory.context().networkManager().getNetworkSettings().getVirtualInterfaces() ){
            try {
                JSONObject json = new org.json.JSONObject();
                json.put("interfaceId", interfaceSettings.getInterfaceId());
                json.put("name", interfaceSettings.getName() );
                interfacesInfo.add(json);
            } catch (Exception e) {
                logger.warn("Error generating interfaces list",e);
            }
        }
        return interfacesInfo;
    }

    public Boolean fixedReportsAllowGraphs()
    {
        return WebBrowser.exists();
    }

    public List<String> getAdminEmailAddresses()
    {
        LinkedList<String> adminEmailAddresses = new LinkedList<String>();

        LinkedList<ReportsUser> reportsUsers = app.getSettings().getReportsUsers();
        Boolean reportsUserFound;
        LinkedList<AdminUserSettings> adminUsers = UvmContextFactory.context().adminManager().getSettings().getUsers();
        if((reportsUsers != null) && (adminUsers != null)){
            for(AdminUserSettings adminUser : adminUsers ){
                if( (adminUser == null) ||
                    (adminUser.getEmailAddress() == null) ||
                    (adminUser.getEmailAddress().isEmpty()) ){
                    // Ignore if admin email address is empty.
                    continue;
                }
                reportsUserFound = false;
                for(ReportsUser reportUser: reportsUsers){
                    if( (reportUser != null) &&
                        (reportUser.getEmailAddress() != null) &&
                        reportUser.getEmailAddress().equals( adminUser.getEmailAddress() ) ){
                        reportsUserFound = true;
                    }
                }
                if(reportsUserFound == false){
                    adminEmailAddresses.add(adminUser.getEmailAddress());
                }
            }
        }

        return adminEmailAddresses;
    }

    public List<String> getRecommendedReportIds()
    {
        return FixedReports.ReservedReports;
    }

    protected void updateSystemReportEntries( List<ReportEntry> existingEntries, boolean saveIfChanged )
    {
        boolean updates = false;
        if ( existingEntries == null )
            existingEntries = new LinkedList<ReportEntry>();

        String cmd = "/usr/bin/find " + System.getProperty("uvm.lib.dir") + " -path '*/lib/*/reports/*.json' -print";
        ExecManagerResult result = UvmContextFactory.context().execManager().exec( cmd );
        if (result.getResult() != 0) {
            logger.warn("Failed to find report entries: \"" + cmd + "\" -> "  + result.getResult());
            return;
        }
        try {
            List<String> seenUniqueIds = new LinkedList<String>();
            String lines[] = result.getOutput().split("\\r?\\n");
            logger.info("Creating Schema: ");
            for ( String line : lines ) {
                logger.debug("Reading file: " + line);
                try {
                    ReportEntry newEntry = UvmContextFactory.context().settingsManager().load( ReportEntry.class, line );

                    /* do some error checking around unique ID */
                    if ( newEntry.getUniqueId() == null ) {
                        logger.error("System Report Entry missing uniqueId: " + line);
                    }
                    if ( seenUniqueIds.contains( newEntry.getUniqueId() ) ) {
                        logger.error("System Report Entry duplicate uniqueId: " + line);
                    } else {
                        seenUniqueIds.add( newEntry.getUniqueId() );
                    }

                    ReportEntry oldEntry = findReportEntry( existingEntries, newEntry.getUniqueId() );
                    if ( oldEntry == null ) {
                        logger.info( "Report Entries Update: Adding  \"" + newEntry.getTitle() + "\" [" + line + "]");
                        existingEntries.add( newEntry );
                        updates = true;
                    } else {
                        boolean changed = updateReportEntry( existingEntries, newEntry, oldEntry );
                        if ( changed ) {
                            updates = true;
                            logger.info( "Report Entries Update: Updated \"" + newEntry.getTitle() + "\" [" + line + "]");
                        }
                    }
                } catch (Exception e) {
                    logger.warn( "Failed to read report entry from: " + line, e );
                }
            }

            /**
             * Remove any obsolete entries
             */
            for (Iterator<ReportEntry> i = existingEntries.iterator(); i.hasNext(); ) {
                ReportEntry entry = i.next();
                if ( entry.getUniqueId().startsWith("reporting-") ) {
                    i.remove();
                    updates = true;
                }
                if ( entry.getUniqueId().startsWith("syslog-") ) {
                    i.remove();
                    updates = true;
                }
                if ( "Web Filter Lite".equals(entry.getCategory()) ) {
                    i.remove();
                    updates = true;
                }
            }

        } catch (Exception e) {
            logger.warn( "Failed to check for new entries.", e );
        }

        if ( updates && saveIfChanged ) {
            setReportEntries( existingEntries );
        }

        return;
    }

    private ReportEntry findReportEntry( List<ReportEntry> entries, String uniqueId )
    {
        if ( entries == null || uniqueId == null ) {
            logger.warn("Invalid arguments: " + uniqueId, new Exception());
            return null;
        }

        for ( ReportEntry entry : entries ) {
            if (uniqueId.equals( entry.getUniqueId() ) )
                return entry;
        }
        return null;
    }

    private boolean updateReportEntry( List<ReportEntry> entries, ReportEntry newEntry, ReportEntry oldEntry )
    {
        String newEntryStr = newEntry.toJSONString();
        String oldEntryStr = oldEntry.toJSONString();

        // no changed are needed if two are identical
        if ( oldEntryStr.equals( newEntryStr ) )
            return false;

        // remove old entry
        if ( ! entries.remove( oldEntry ) ) {
            logger.warn("Failed to update report entry: " + newEntry.getUniqueId());
            return false;
        }

        // copy "changeable" attributes from old settings, replace old entry with new
        newEntry.setEnabled( oldEntry.getEnabled() );
        entries.add( newEntry );

        return true;
    }

    private HashMap<String,String> getColumnMetaData( String tableName )
    {
        Connection conn = app.getDbConnection();
        if ( conn == null ) {
            logger.warn("Failed to get DB Connection");
            return null;
        }

        try {
            HashMap<String,String> results = cacheColumnsResults.get( tableName );
            if ( results != null ) {
                return results;
            }
            results = new HashMap<String,String>();

            ResultSet rs;
            if (ReportsApp.dbDriver.equals("sqlite"))
                rs = conn.getMetaData().getColumns( null, null, tableName, null );
            else
                rs = conn.getMetaData().getColumns( null, "reports", tableName, null );

            synchronized( rs ) {
                while(rs.next()) {
                    String columnName = rs.getString(4);
                    String columnType = rs.getString(6).toLowerCase();
                    results.put(columnName, columnType);
                }
            }

            cacheColumnsResults.put( tableName, results );
            return results;
        } catch ( Exception e ) {
            logger.warn("Failed to fetch column meta data", e);
            return null;
        } finally {
            try { conn.close(); } catch (Exception e) {
                logger.warn("Close Exception",e);
            }
        }
    }

    private class ReportEntryDisplayOrderComparator implements Comparator<ReportEntry>
    {
        public int compare( ReportEntry entry1, ReportEntry entry2 )
        {
            int num = entry1.getDisplayOrder() - entry2.getDisplayOrder();
            if ( num != 0 )
                return num;
            else {
                if (entry1.getTitle() == null || entry2.getTitle() == null )
                    return 0;
                return entry1.getTitle().compareTo( entry2.getTitle() );
            }
        }
    }

    private AppProperties findAppProperties( String displayName )
    {
        if ( displayName == null )
            return null;

        for ( AppProperties props : this.appPropertiesList ) {
            if ( displayName.equals( props.getDisplayName() ) )
                return props;
        }

        return null;
    }
}
