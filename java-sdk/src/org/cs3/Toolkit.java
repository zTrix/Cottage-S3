package org.cs3;

import java.io.BufferedReader;
import java.io.DataOutputStream;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;

import org.json.JSONObject;

public class Toolkit {
    private static final String ERR = "err";
    private static final String MSG = "msg";

    private static String token = null;
    private static String baseurl = null;

    public static void setServer(String ipOrDomain) {
        baseurl = "http://" + ipOrDomain + "/";
    }

    /**
     *
     * @return -1000, unknown error in sdk, -1001 server not set
     */
    public static int ping() {
        if (baseurl == null) {
            Zlog.e("server not set");
            return -1001;
        }
        int ret = 0;
        try {
            URL url = new URL(baseurl);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            JSONObject rs = getJson(conn.getInputStream());
            ret = rs.getInt(ERR);
            if (ret != 0) {
                Zlog.e(rs.getString(MSG));
            } else {
                Zlog.i(rs.getString(MSG));
            }
        } catch (Exception e) {
            ret = -1000;
            Zlog.e(e);
        }
        return ret;
    }

    /**
     *
     * @return -1000, unknown error in sdk, -1001 server not set
     */
    public static int login(String email, String password) {
        if (baseurl == null) {
            Zlog.e("server not set");
            return -1001;
        }
        int ret = 0;
        try {
            URL url = new URL(getApiUrl("login"));
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("POST");
            conn.setDoInput(true);
            conn.setDoOutput(true);
            DataOutputStream printout = new DataOutputStream(conn.getOutputStream ());
            String content = "email=" + URLEncoder.encode (email) + "&password=" + URLEncoder.encode(password);
            printout.writeBytes (content);
            printout.flush ();
            printout.close ();

            JSONObject rs = getJson(conn.getInputStream());
            ret = rs.getInt(ERR);

            if (ret != 0) {
                Zlog.e(rs.getString(MSG));
            } else {
                token = rs.getString("token");
                Zlog.i(rs.getString(MSG));
            }
        } catch (Exception e) {
            ret = -1000;
            Zlog.e(e);
        }
        return ret;
    }

    /**
     *
     * @return -1000, unknown error in sdk, -1001 server not set, -1002 token not set, please login first
     */
    public static int upload(String key, String content) {
        if (baseurl == null) {
            Zlog.e("server not set");
            return -1001;
        }
        if (token == null) {
            Zlog.e("token not set, please login first");
            return -1002;
        }
        int ret = 0;
        try {
            URL url = new URL(getApiUrl("upload"));
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("POST");
            conn.setDoInput(true);
            conn.setDoOutput(true);
            conn.setRequestProperty("token", token);
            conn.setRequestProperty("key", key);
            DataOutputStream printout = new DataOutputStream(conn.getOutputStream ());
            printout.writeBytes(content);
            printout.flush();
            printout.close();

            JSONObject rs = getJson(conn.getInputStream());
            ret = rs.getInt(ERR);
            if (ret != 0) {
                Zlog.e(ret, rs.getString(MSG));
            } else {
                Zlog.i("size", rs.getInt("size"));
                Zlog.i("space", rs.getInt("space"));
                Zlog.i("upload success");
            }
        } catch (Exception e) {
            ret = -1000;
            Zlog.e(e);
        }
        return ret;
    }

    public static String fetch(String key) {
        if (baseurl == null) {
            Zlog.e("server not set");
            return null;
        }
        if (token == null) {
            Zlog.e("token not set, please login first");
            return null;
        }
        StringBuilder ret = new StringBuilder();
        try {
            URL url = new URL(getApiUrl("fetch"));
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("POST");
            conn.setDoInput(true);
            conn.setRequestProperty("token", token);
            conn.setRequestProperty("key", key);

            int err = Integer.valueOf(conn.getHeaderField(ERR));
            String msg = conn.getHeaderField(MSG);

            if (err != 0) {
                Zlog.e(err, msg);
            } else {
                Zlog.i("fetch success");
            }

            BufferedReader rd = new BufferedReader(new InputStreamReader(conn.getInputStream()));
            String tmp;

            while((tmp = rd.readLine()) != null) {
                ret.append(tmp);
            }
        } catch (Exception e) {
            Zlog.e(e);
            return null;
        }
        return ret.toString();
    }

    private static String getApiUrl(String api) {
        return baseurl + "api/" + api;
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
