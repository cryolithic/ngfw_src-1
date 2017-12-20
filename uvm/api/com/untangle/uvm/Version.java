/*
 * $Id$
 */
package com.untangle.uvm;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;

import com.untangle.uvm.UvmContextFactory;

/**
 * Provides access to the UVM version.
 */
public class Version
{
    /**
     * Get the public version number.
     * "A" (10)
     */
    public static String getMajorVersion()
    {
        if (UvmContextFactory.context().isDevel())
            return "DEVEL-MAJOR-VERSION";
        return getResource("MAJORVERSION");
    }

    /**
     * Get the public version number.
     * "A.B" (10.0)
     */
    public static String getVersion()
    {
        if (UvmContextFactory.context().isDevel())
            return "DEVEL-PUB-VERSION";
        return getResource("PUBVERSION");
    }

    /**
     * Get the public version number.
     * "A.B.C" (10.0.1)
     */
    public static String getFullVersion()
    {
        if (UvmContextFactory.context().isDevel())
            return "DEVEL-VERSION";
        return getResource("VERSION");
    }

    private static String getResource(String type)
    {
        String line = null;

        try {
            InputStream is = Version.class.getClassLoader().getResourceAsStream(type);
            if (is != null) {
                InputStreamReader isr = new InputStreamReader(is);
                BufferedReader bis = new BufferedReader(isr);
                line = bis.readLine();
            }
        } catch (IOException exn) {
            System.out.println("Exception reading: " + type + " " + exn);
        }

        return line;
    }
}
