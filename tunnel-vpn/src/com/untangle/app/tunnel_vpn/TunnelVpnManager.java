/**
 * $Id$
 */

package com.untangle.app.tunnel_vpn;

import java.util.HashMap;
import java.io.FilenameFilter;
import java.io.File;
import java.io.FileWriter;
import java.io.BufferedWriter;
import java.nio.file.Files;

import org.apache.log4j.Logger;

import com.untangle.uvm.UvmContextFactory;
import com.untangle.uvm.ExecManagerResult;

/**
 * This class has all the logic for "managing" the tunnel configs. This includes
 * writing all config files and starting/stopping the processes
 */
public class TunnelVpnManager
{
    private final Logger logger = Logger.getLogger(this.getClass());

    private static final String IPTABLES_SCRIPT = System.getProperty("prefix") + "/etc/untangle/iptables-rules.d/350-tunnel-vpn";
    private static final String IMPORT_SCRIPT = System.getProperty("uvm.bin.dir") + "/tunnel-vpn-import";
    private static final String VALIDATE_SCRIPT = System.getProperty("uvm.bin.dir") + "/tunnel-vpn-validate";

    private final TunnelVpnApp app;
    private int newTunnelId = -1;

    private HashMap<Integer, Process> processMap = new HashMap<Integer, Process>();

    protected TunnelVpnManager(TunnelVpnApp app)
    {
        this.app = app;
    }

    protected synchronized void launchProcesses()
    {
        logger.info("Launching OpenVPN processes...");

        insertIptablesRules();

        try {
            File dir = new File("/run/tunnelvpn/");
            dir.mkdir();
        } catch (Exception e) {
            logger.warn("Unable to create PID directory", e);
        }

        for (TunnelVpnTunnelSettings tunnelSettings : app.getSettings().getTunnels()) {
            launchProcess(tunnelSettings);
        }
    }

    protected synchronized void killProcesses()
    {
        logger.info("Killing OpenVPN processes...");
        try {
            File dir = new File("/run/tunnelvpn/");
            File[] matchingFiles = dir.listFiles(new FilenameFilter()
            {
                public boolean accept(File dir, String name)
                {
                    return name.startsWith("tunnel-") && name.endsWith("pid");
                }
            });
            if (matchingFiles != null) {
                for (File f : matchingFiles) {
                    String pid = new String(Files.readAllBytes(f.toPath())).replaceAll("(\r|\n)", "");
                    logger.info("Killing OpenVPN process: " + pid);
                    UvmContextFactory.context().execManager().execOutput("kill -INT " + pid);
                    UvmContextFactory.context().execManager().execOutput("kill -TERM " + pid);
                    UvmContextFactory.context().execManager().execOutput("kill -KILL " + pid);
                    f.delete();
                }
            }
        } catch (Exception e) {
            logger.warn("Failed to kill processes", e);
        }
    }

    protected synchronized void restartProcesses()
    {
        killProcesses();
        launchProcesses();
    }

    protected synchronized void launchProcess(TunnelVpnTunnelSettings tunnelSettings)
    {
        if (!tunnelSettings.getEnabled()) {
            logger.info("Tunnel " + tunnelSettings.getTunnelId() + " not enabled. Skipping...");
            return;
        }
        int tunnelId = tunnelSettings.getTunnelId();
        String directory = System.getProperty("uvm.settings.dir") + "/" + "tunnel-vpn/tunnel-" + tunnelId;
        String tunnelName = "tunnel-" + tunnelId;

        String cmd = "/usr/sbin/openvpn ";
        cmd += "--config " + directory + "/tunnel.conf ";
        cmd += "--writepid /run/tunnelvpn/" + tunnelName + ".pid ";
        cmd += "--dev tun" + tunnelId + " ";
        cmd += "--cd " + directory + " ";
        cmd += "--log-append /var/log/uvm/tunnel.log ";
        cmd += "--auth-user-pass auth.txt ";
        cmd += "--script-security 2 ";
        cmd += "--up " + System.getProperty("prefix") + "/usr/share/untangle/bin/tunnel-vpn-up.sh ";
        cmd += "--down " + System.getProperty("prefix") + "/usr/share/untangle/bin/tunnel-vpn-down.sh ";
        cmd += "--management 127.0.0.1 " + (TunnelVpnApp.BASE_MGMT_PORT + tunnelId) + " ";

        Process proc = UvmContextFactory.context().execManager().execEvilProcess(cmd);
        processMap.put(tunnelId, proc);
    }

    protected synchronized void importTunnelConfig(String filename, String provider, int tunnelId)
    {
        if (filename == null || provider == null) {
            logger.warn("Invalid arguments");
            throw new RuntimeException("Invalid Arguments");
        }

        TunnelVpnSettings settings = app.getSettings();

        if (tunnelId < 1) {
            logger.warn("Failed to find available tunnel ID");
            throw new RuntimeException("Failed to find available tunnel ID");
        }

        ExecManagerResult result = UvmContextFactory.context().execManager().exec(IMPORT_SCRIPT + " \"" + filename + "\" \"" + provider + "\" " + tunnelId);

        try {
            String lines[] = result.getOutput().split("\\r?\\n");
            logger.info(IMPORT_SCRIPT + ": ");
            for (String line : lines) {
                logger.info(IMPORT_SCRIPT + ": " + line);
            }
        } catch (Exception e) {
        }

        if (result.getResult() != 0) {
            logger.error("Failed to import client config (return code: " + result.getResult() + ")");
            throw new RuntimeException("Failed to import client config");
        }

        return;
    }

    protected synchronized void validateTunnelConfig(String filename, String provider)
    {
        if (filename == null || provider == null) {
            logger.warn("Invalid arguments");
            throw new RuntimeException("Invalid Arguments");
        }

        TunnelVpnSettings settings = app.getSettings();
        int tunnelId = findLowestAvailableTunnelId(settings);

        if (tunnelId < 1) {
            logger.warn("Failed to find available tunnel ID");
            throw new RuntimeException("Failed to find available tunnel ID");
        }

        ExecManagerResult result = UvmContextFactory.context().execManager().exec(VALIDATE_SCRIPT + " \"" + filename + "\" \"" + provider + "\" " + tunnelId);

        try {
            String lines[] = result.getOutput().split("\\r?\\n");
            logger.info(VALIDATE_SCRIPT + ": ");
            for (String line : lines) {
                logger.info(VALIDATE_SCRIPT + ": " + line);
            }
        } catch (Exception e) {
        }

        if (result.getResult() != 0) {
            logger.error("Failed to validate client config (return code: " + result.getResult() + ")");
            throw new RuntimeException("Failed to validate client config: " + result.getOutput().trim());
        }

        return;
    }

    protected int getNewTunnelId()
    {
        return this.newTunnelId;
    }

    public void recycleTunnel(int tunnelId)
    {
        for (TunnelVpnTunnelSettings tunnelSettings : app.getSettings().getTunnels()) {
            if (tunnelSettings.getTunnelId() == null) continue;
            if (tunnelSettings.getTunnelId() != tunnelId) continue;
            if (!tunnelSettings.getEnabled()) continue;

            try {
                File pidFile = new File("/run/tunnelvpn/tunnel-" + tunnelSettings.getTunnelId() + ".pid");
                String pidData = new String(Files.readAllBytes(pidFile.toPath())).replaceAll("(\r|\n)", "");
                logger.info("Recycling tunnel connection: " + tunnelSettings.getName() + "PID:" + pidData);
                pidFile.delete();

                /*
                 * We get called when the user clicks recycle from the web
                 * interface so we send three signals to make sure the process
                 * goes away as quickly and cleanly as possible. The first will
                 * interrupt any system call in progress. The second lets the
                 * daemon know to terminate and hopefully begin a clean
                 * shutdown. The third tells it we do not want to wait.
                 */
                UvmContextFactory.context().execManager().execOutput("kill -INT " + pidData);
                UvmContextFactory.context().execManager().execOutput("kill -TERM " + pidData);
                UvmContextFactory.context().execManager().execOutput("kill -KILL " + pidData);

                launchProcess(tunnelSettings);
            } catch (Exception exn) {
                logger.warn("Exception attempting to recycle tunnel");
            }
        }
    }

    private void writeFile(String fileName, StringBuilder sb)
    {
        logger.info("Writing File: " + fileName);
        BufferedWriter out = null;

        try {
            String data = sb.toString();
            out = new BufferedWriter(new FileWriter(fileName));
            out.write(data, 0, data.length());
        } catch (Exception ex) {
            logger.error("Error writing file " + fileName + ":", ex);
        }

        try {
            if (out != null) out.close();
        } catch (Exception ex) {
            logger.error("Unable to close file", ex);
        }

    }

    /**
     * Inserts iptables rules
     */
    private synchronized void insertIptablesRules()
    {
        File f = new File(IPTABLES_SCRIPT);
        if (!f.exists()) return;

        ExecManagerResult result = UvmContextFactory.context().execManager().exec(IPTABLES_SCRIPT);
        try {
            String lines[] = result.getOutput().split("\\r?\\n");
            logger.info(IPTABLES_SCRIPT + ": ");
            for (String line : lines)
                logger.info(IPTABLES_SCRIPT + ": " + line);
        } catch (Exception e) {
        }

        if (result.getResult() != 0) {
            logger.error("Failed to execute iptables script (return code: " + result.getResult() + ")");
            throw new RuntimeException("Failed to execute iptables script");
        }
    }

    private int findLowestAvailableTunnelId(TunnelVpnSettings settings)
    {
        if (settings.getTunnels() == null) return 1;

        for (int i = 200; i < 240; i++) {
            boolean found = false;
            for (TunnelVpnTunnelSettings tunnelSettings : settings.getTunnels()) {
                if (tunnelSettings.getTunnelId() != null && i == tunnelSettings.getTunnelId()) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                newTunnelId = i;
                return i;
            }
        }

        logger.error("Failed to find available tunnel ID");
        return -1;
    }
}
