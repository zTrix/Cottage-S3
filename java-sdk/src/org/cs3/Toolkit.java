package org.cs3;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;

import org.json.JSONObject;

public class Toolkit {
    private static final String ERR = "err";
    private static final String MSG = "msg";

    private static String token;
    private static String baseurl = null;

    public static void setServer(String ipOrDomain) {
        baseurl = "http://" + ipOrDomain + "/";
    }

    /**
     *
     * @return -1000, server not set, -1001 unknown error
     */
    public static int ping() {
        if (baseurl == null) {
            return -1000;
        }
        int ret = 0;
        try {
            URL url = new URL(baseurl);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            JSONObject rs = getJson(conn.getInputStream());
            ret = rs.getInt(ERR);
            if (ret != 0) {
                Zlog.e(rs.getString(MSG));
            }
        } catch (Exception e) {
            ret = -1001;
            Zlog.e(e);
        }
        return ret;
    }

    public static boolean login(String username, String password) {
        return false;
    }

    private static JSONObject getJson(InputStream in) {
        JSONObject ret = null;
        try {
            BufferedReader rd = new BufferedReader(new InputStreamReader(in));
            StringBuilder sb = new StringBuilder();
            String tmp;

            while((tmp = rd.readLine()) != null) {
                sb.append(tmp);
            }

            ret = new JSONObject(sb.toString());
        } catch (Exception e) {
            Zlog.e(e);
        }
        return ret;
    }
}
