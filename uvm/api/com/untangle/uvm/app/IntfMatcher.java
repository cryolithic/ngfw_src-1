/* $HeadURL$ */
package com.untangle.uvm.app;

import java.util.LinkedList;

import org.apache.log4j.Logger;

import com.untangle.uvm.network.InterfaceSettings;
import com.untangle.uvm.UvmContextFactory;

/**
 * An matcher for interfaces
 *
 * Examples:
 * "any"
 * "wan"
 * "1"
 * "1,2"
 *
 */
public class IntfMatcher
{
    private static final String MARKER_ANY = "any";
    private static final String MARKER_ALL = "all";
    private static final String MARKER_NONE = "none";
    private static final String MARKER_WAN = "wan";
    private static final String MARKER_NON_WAN = "non_wan";
    private static final String MARKER_SEPERATOR = ",";

    private static final IntfMatcher ANY_MATCHER = new IntfMatcher(MARKER_ANY);
    private static final IntfMatcher NONE_MATCHER = new IntfMatcher(MARKER_NONE);
    private static final IntfMatcher WAN_MATCHER = new IntfMatcher(MARKER_WAN);
    private static final IntfMatcher NONWAN_MATCHER = new IntfMatcher(MARKER_NON_WAN);

    public enum IntfMatcherType { ANY, NONE, ANY_WAN, ANY_NON_WAN, SINGLE, LIST };

    private final Logger logger = Logger.getLogger(getClass());
    
    private String matcher;
    
    /**
     * The type of this matcher
     */
    private IntfMatcherType type = IntfMatcherType.NONE;

    /**
     * if this intf matcher is a list of intf matchers, this list stores the children
     */
    private LinkedList<IntfMatcher> children = null;

    /**
     * If this intf matcher is a single this store the single interface ID
     */
    private int singleInt = -1;
        
    public IntfMatcher( String matcher )
    {
        initialize(matcher);
    }

    /**
     * return the type of matcher
     */
    public IntfMatcherType getType()
    {
        return this.type;
    }

    /**
     * Return true if <param>interfaceId</param> matches this matcher.
     *
     * @param intf The interface to test
     * @return True if the <param>interfaceId</param> matches.
     */
    public boolean isMatch( int interfaceId )
    {
        InterfaceSettings intfSettings = UvmContextFactory.context().networkManager().findInterfaceId(interfaceId);

        if (intfSettings == null) {
            logger.warn("Failed to match interface: Cant find interface " + interfaceId);
            return false;
        }

        return isMatch(intfSettings);
    }

    /**
     * Return true if <param>interfaceId</param> matches this matcher.
     *
     * @param intf The interface to test
     * @return True if the <param>intf</param> matches.
     */
    public boolean isMatch( InterfaceSettings intfSettings )
    {
        switch (this.type) {

        case ANY:
            return true;

        case NONE:
            return false;

        case ANY_WAN:
            return (intfSettings.getIsWan());

        case ANY_NON_WAN:
            return (!intfSettings.getIsWan());
            
        case SINGLE:
            if (singleInt == intfSettings.getInterfaceId())
                return true;
            return false;

        case LIST:
            for (IntfMatcher child : this.children) {
                if (child.isMatch(intfSettings))
                    return true;
            }
            return false;

        default:
            logger.warn("Unknown intf matcher type: " + this.type);
            return false;
        }
    }
    
    /**
     * return string representation
     */
    public String toString()
    {
        return matcher;
    }

    public static IntfMatcher getAnyMatcher()
    {
        return ANY_MATCHER;
    }
    
    public static IntfMatcher getNilMatcher()
    {
        return NONE_MATCHER;
    }

    public static IntfMatcher getWanMatcher()
    {
        return WAN_MATCHER;
    }

    public static IntfMatcher getNonWanMatcher()
    {
        return NONWAN_MATCHER;
    }

    private void initialize( String matcher )
    {
        matcher = matcher.toLowerCase().trim().replaceAll("\\s","");
        this.matcher = matcher;

        /**
         * if it contains a comma it must be a list
         */
        if (matcher.contains(MARKER_SEPERATOR)) {
            this.type = IntfMatcherType.LIST;

            this.children = new LinkedList<IntfMatcher>();

            String[] results = matcher.split(MARKER_SEPERATOR);
            
            /* check each one */
            for (String childString : results) {
                IntfMatcher child = new IntfMatcher(childString);
                this.children.add(child);
            }

            return;
        }

        /**
         * check the common constants
         */
        if (MARKER_ANY.equals(matcher)) {
            this.type = IntfMatcherType.ANY;
            return;
        }
        if (MARKER_ALL.equals(matcher)) {
            this.type = IntfMatcherType.ANY;
            return;
        }
        if (MARKER_NONE.equals(matcher)) {
            this.type = IntfMatcherType.NONE;
            return;
        }
        if (MARKER_WAN.equals(matcher)) {
            this.type = IntfMatcherType.ANY_WAN;
            return;
        }
        if (MARKER_NON_WAN.equals(matcher)) {
            this.type = IntfMatcherType.ANY_NON_WAN;
            return;
        }

        /**
         * if it isn't any of these it must be a basic SINGLE matcher
         */
        this.type = IntfMatcherType.SINGLE;
        try {
            this.singleInt = Integer.parseInt(matcher);
        } catch (NumberFormatException e) {
            logger.warn("Unknown IntfMatcher format: \"" + matcher + "\"", e);
            throw new java.lang.IllegalArgumentException("Unknown IntfMatcher format: \"" + matcher + "\"", e);

        }

        return;
    }        
}
