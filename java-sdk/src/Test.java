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
        Zlog.i("---- test space");
        Toolkit.space();

        newline();
        String key = "test_upload_key", content = "Test upload content";
        Zlog.i("---- test upload, key = " + key, "content = " + content);
        Toolkit.upload(key, content);


        newline();
        Zlog.i("---- test space");
        Toolkit.space();

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

        newline();
        Zlog.i("---- test space");
        Toolkit.space();

        newline();
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 20000; i++) {
            sb.append(Character.toChars((int)(Math.random() * 128)));
        }
        Zlog.i("---- test upload limit exceeds, key = " + key);
        Toolkit.upload(key, sb.toString());

        newline();
        Zlog.i("---- test space");
        Toolkit.space();
    }

    private static void newline() {
        System.out.println();
    }
}