import org.cs3.Toolkit;
import org.cs3.Zlog;


public class Test {

    public static void main(String []args) {
        Toolkit.setServer("127.0.0.1");

        Toolkit.ping();

        Toolkit.login("test@test.com", "password");

        String key = "test_upload_key";
        Toolkit.upload(key, "Test upload content");

        String result = Toolkit.fetch(key);
        if (result != null) {
            Zlog.i("fetched content: " + result);
        } else {
            Zlog.e("fetch content for key " + key + " failed");
        }
    }
}