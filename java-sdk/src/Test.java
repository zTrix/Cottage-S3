import org.cs3.Toolkit;


public class Test {

    public static void main(String []args) {
        Toolkit.setServer("127.0.0.1");

        Toolkit.ping();

        Toolkit.login("test@test.com", "password");

        Toolkit.upload("test_upload_key", "Test upload content");
    }
}