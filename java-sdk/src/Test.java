import org.cs3.Toolkit;
import org.cs3.Zlog;


public class Test {

    public static void main(String []args) {
        Toolkit.setServer("127.0.0.1");
        int rs;

        rs = Toolkit.ping();
        if (rs != 0) {
            Zlog.e("ping server failed: retcode = " + rs);
        } else {
            Zlog.i("ping server OK!");
        }

        rs = Toolkit.login("test@test.com", "password");
        if (rs != 0) {
            Zlog.e("login failed, please see more specific info in stdout");
        } else {
            Zlog.i("login success");
        }
    }
}