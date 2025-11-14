    package Util;

    import java.sql.Connection;
    import java.sql.DriverManager;
    import java.sql.SQLException;

    public class DBUtil {

        private static final String URL = System.getenv("DB_URL");
        private static final String USER = System.getenv("DB_USER");
        private static final String PASSWORD = System.getenv("DB_PASSWORD");
        static {
            try {
                Class.forName("com.mysql.cj.jdbc.Driver");
            } catch (ClassNotFoundException e) {
                throw new RuntimeException("MySQL Driver not found!", e);
            }
        }

        public static Connection getConnection() throws SQLException {
            return DriverManager.getConnection(URL, USER, PASSWORD);
        }
    }
