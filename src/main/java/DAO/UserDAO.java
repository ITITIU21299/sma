/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package DAO;

/**
 *
 * @author nguye
 */
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import Class.*;
import Util.*;

public class UserDAO {
    public User getUserByUsername(String username) {
        String query = "SELECT * FROM Users WHERE username = ?";
        try (Connection connection = DBUtil.getConnection();
             PreparedStatement preparedStatement = connection.prepareStatement(query)) {
            
            preparedStatement.setString(1, username);
            
            try (ResultSet resultSet = preparedStatement.executeQuery()) {
                if (resultSet.next()) {
                    return new User(
                        resultSet.getString("username"),
                        resultSet.getString("password"),
                        resultSet.getString("role")
                    );
                }
            }
        } catch (SQLException e) {
            e.printStackTrace(); 
        }
        return null;
    }
    
public boolean changePassword(String username, String currentPassword, String newPassword) {
    String verifyPasswordQuery = "SELECT password FROM Users WHERE username = ?";
    String updatePasswordQuery = "UPDATE Users SET password = ? WHERE username = ?";
    
    try (Connection connection = DBUtil.getConnection();
         PreparedStatement verifyStmt = connection.prepareStatement(verifyPasswordQuery);
         PreparedStatement updateStmt = connection.prepareStatement(updatePasswordQuery)) {

        verifyStmt.setString(1, username);
        ResultSet rs = verifyStmt.executeQuery();

        if (rs.next()) {
            String storedHashedPassword = rs.getString("password");

            if (PasswordUtil.verifyPassword(currentPassword, storedHashedPassword)) {

                String hashedNewPassword = PasswordUtil.hashPassword(newPassword);

                updateStmt.setString(1, hashedNewPassword);
                updateStmt.setString(2, username);
                int rowsUpdated = updateStmt.executeUpdate();

                return rowsUpdated > 0;
            }
        }
    } catch (Exception e) {
        e.printStackTrace();
    }
    return false;
}

}
