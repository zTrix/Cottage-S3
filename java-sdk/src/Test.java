import org.cs3.Toolkit;
import org.cs3.Zlog;


public class Test {

    public static void main(String []args) {
        Toolkit.setServer("127.0.0.1");

        newline();
        Zlog.i("---- ping server");
        Toolkit.ping();

        newline();
        Zlog.i("---- test login onto server");
        Toolkit.login("test@test.com", "password");

        newline();
        String key = "test_upload_key", content = "Test upload content";
        Zlog.i("---- test upload, key = " + key, "content = " + content);
        Toolkit.upload(key, content);

        newline();
        Zlog.i("---- test fetch, key = " + key);
        String result = Toolkit.fetch(key);
        if (result != null) {
            Zlog.i("fetched content: " + result);
        } else {
            Zlog.e("fetch content for key " + key + " failed");
        }

        newline();
        Zlog.i("---- test remove, key = " + key);
        Toolkit.remove(key);
    }

    private static void newline() {
        System.out.println();
    }
}