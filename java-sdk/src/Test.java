import org.cs3.Toolkit;
import org.cs3.Zlog;


public class Test {

    public static void main(String []args) {
        Toolkit.setServer("127.0.0.1");
        int rs = Toolkit.ping();
        if (rs != 0) {
            Zlog.e("ping server failed: retcode = " + rs);
        } else {
            Zlog.i("ping server OK!");
        }
        Toolkit.login("test@test.com", "password");
    }
}