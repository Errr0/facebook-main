<!-- <?php
session_start();
header('Content-Type: application/json');

$inputData = json_decode(file_get_contents('php://input'), true);

if (isset($inputData['getProfileData'])) {
    $conn = mysqli_connect("localhost", "root", "", "fejsbuk");
    $sql = "SELECT `name`, `admin` FROM `users` WHERE `id` = '".$_SESSION['id']."'";
    $result = mysqli_fetch_array(mysqli_query($conn, $sql));
    mysqli_close($conn);
    $output = ["name" => $result['name']];
    echo json_encode($output);
} else if (isset($inputData['deleteAccount'])) {
    $conn = mysqli_connect("localhost", "root", "", "fejsbuk");
    $sql = "DELETE FROM `users` WHERE `id` = ".$_SESSION['id'];
    $result = mysqli_query($conn, $sql);
    if ($result) {
        $output = ["output" => "User deleted successfully"];
    } else {
        $output = ["output" => "Error deleting user: " . mysqli_error($conn)];
    }
    mysqli_close($conn);
    echo json_encode($output);
} else if (isset($inputData['get_data'])) {
    $output = ["output" => "1"];
    echo json_encode($output);
} else if (isset($inputData['send_data'])) {
    $output = ["output" => "0"];
    echo json_encode($output);
} else {
    $output = ["output" => "No input provided."];
    echo json_encode($output);
}
?>  -->

<?php
session_start();
header('Content-Type: application/json');

// Verify user is logged in for all API calls
function verifyLoggedIn() {
    if (!isset($_SESSION["id"]) || !isset($_SESSION["name"]) || !isset($_SESSION["password"])) {
        return false;
    }
    
    $conn = getDbConnection();
    
    // Use prepared statement to prevent SQL injection
    $stmt = $conn->prepare("SELECT id FROM users WHERE id = ? AND name = ? AND password = ?");
    $hashedPassword = sha1($_SESSION["password"]);
    $stmt->bind_param("iss", $_SESSION["id"], $_SESSION["name"], $hashedPassword);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $isLoggedIn = $result->num_rows > 0;
    
    $stmt->close();
    $conn->close();
    
    return $isLoggedIn;
}

// Get database connection
function getDbConnection() {
    $conn = mysqli_connect("localhost", "root", "", "fejsbuk");
    
    if (!$conn) {
        die(json_encode([
            'success' => false,
            'error' => 'Database connection failed: ' . mysqli_connect_error()
        ]));
    }
    
    // Set charset to prevent injection issues
    $conn->set_charset("utf8mb4");
    
    return $conn;
}

// Sanitize input to prevent XSS
function sanitizeOutput($data) {
    if (is_array($data)) {
        foreach ($data as $key => $value) {
            $data[$key] = sanitizeOutput($value);
        }
        return $data;
    }
    return htmlspecialchars($data, ENT_QUOTES, 'UTF-8');
}

$inputData = json_decode(file_get_contents('php://input'), true);

// Check if user is logged in for protected endpoints
$protectedEndpoints = [
    'getProfileData', 'getAllUsers', 'getMessages', 'saveMessage', 
    'deleteAccount', 'getCurrentUserId'
];

foreach ($protectedEndpoints as $endpoint) {
    if (isset($inputData[$endpoint])) {
        if (!verifyLoggedIn()) {
            echo json_encode([
                'success' => false,
                'error' => 'Unauthorized access'
            ]);
            exit;
        }
        break;
    }
}

// Handle API endpoints
if (isset($inputData['getProfileData'])) {
    $conn = getDbConnection();
    
    $stmt = $conn->prepare("SELECT name, admin FROM users WHERE id = ?");
    $stmt->bind_param("i", $_SESSION['id']);
    $stmt->execute();
    
    $result = $stmt->get_result();
    $userData = $result->fetch_assoc();
    
    $stmt->close();
    $conn->close();
    
    echo json_encode(sanitizeOutput([
        "name" => $userData['name']
    ]));
} 
else if (isset($inputData['getAllUsers'])) {
    $conn = getDbConnection();
    
    // Don't include current user in the list
    $stmt = $conn->prepare("SELECT id, name FROM users WHERE id != ? ORDER BY name");
    $stmt->bind_param("i", $_SESSION['id']);
    $stmt->execute();
    
    $result = $stmt->get_result();
    $users = [];
    
    while ($row = $result->fetch_assoc()) {
        $users[] = [
            'id' => $row['id'],
            'name' => $row['name']
        ];
    }
    
    $stmt->close();
    $conn->close();
    
    echo json_encode([
        'success' => true,
        'users' => sanitizeOutput($users)
    ]);
}
else if (isset($inputData['getCurrentUserId'])) {
    echo json_encode([
        'success' => true,
        'userId' => $_SESSION['id']
    ]);
}
else if (isset($inputData['getMessages'])) {
    $conn = getDbConnection();
    
    // Validate input
    if (!isset($inputData['userId']) || !is_numeric($inputData['userId'])) {
        echo json_encode([
            'success' => false,
            'error' => 'Invalid user ID'
        ]);
        exit;
    }
    
    $otherUserId = intval($inputData['userId']);
    $currentUserId = $_SESSION['id'];
    
    // Create messages table if it doesn't exist
    $createTableSql = "CREATE TABLE IF NOT EXISTS messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        sender_id INT NOT NULL,
        receiver_id INT NOT NULL,
        content TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        is_read BOOLEAN DEFAULT FALSE
    )";
    
    $conn->query($createTableSql);
    
    // Get messages between the two users
    $stmt = $conn->prepare("
        SELECT 
            id,
            sender_id AS senderId,
            receiver_id AS receiverId,
            content,
            timestamp
        FROM 
            messages 
        WHERE 
            (sender_id = ? AND receiver_id = ?) 
            OR 
            (sender_id = ? AND receiver_id = ?)
        ORDER BY 
            timestamp ASC
    ");
    
    $stmt->bind_param("iiii", $currentUserId, $otherUserId, $otherUserId, $currentUserId);
    $stmt->execute();
    
    $result = $stmt->get_result();
    $messages = [];
    
    while ($row = $result->fetch_assoc()) {
        $messages[] = $row;
    }
    
    // Mark messages as read
    $updateStmt = $conn->prepare("
        UPDATE messages 
        SET is_read = TRUE 
        WHERE sender_id = ? AND receiver_id = ? AND is_read = FALSE
    ");
    
    $updateStmt->bind_param("ii", $otherUserId, $currentUserId);
    $updateStmt->execute();
    
    $stmt->close();
    $updateStmt->close();
    $conn->close();
    
    echo json_encode([
        'success' => true,
        'messages' => sanitizeOutput($messages)
    ]);
}
else if (isset($inputData['saveMessage'])) {
    $conn = getDbConnection();
    
    // Validate input
    if (!isset($inputData['messageData']) || 
        !isset($inputData['messageData']['content']) || 
        !isset($inputData['messageData']['receiverId']) ||
        !is_numeric($inputData['messageData']['receiverId'])) {
        
        echo json_encode([
            'success' => false,
            'error' => 'Invalid message data'
        ]);
        exit;
    }
    
    $content = $inputData['messageData']['content'];
    $receiverId = intval($inputData['messageData']['receiverId']);
    $senderId = $_SESSION['id'];
    
    // Create messages table if it doesn't exist
    $createTableSql = "CREATE TABLE IF NOT EXISTS messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        sender_id INT NOT NULL,
        receiver_id INT NOT NULL,
        content TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        is_read BOOLEAN DEFAULT FALSE
    )";
    
    $conn->query($createTableSql);
    
    // Save message
    $stmt = $conn->prepare("
        INSERT INTO messages (sender_id, receiver_id, content) 
        VALUES (?, ?, ?)
    ");
    
    $stmt->bind_param("iis", $senderId, $receiverId, $content);
    $success = $stmt->execute();
    
    $stmt->close();
    $conn->close();
    
    echo json_encode([
        'success' => $success,
        'messageId' => $success ? $conn->insert_id : null
    ]);
}
else if (isset($inputData['deleteAccount'])) {
    $conn = getDbConnection();
    
    // Begin transaction to ensure all related data is deleted
    $conn->begin_transaction();
    
    try {
        // Delete messages
        $stmt = $conn->prepare("
            DELETE FROM messages 
            WHERE sender_id = ? OR receiver_id = ?
        ");
        $stmt->bind_param("ii", $_SESSION['id'], $_SESSION['id']);
        $stmt->execute();
        $stmt->close();
        
        // Delete user
        $stmt = $conn->prepare("DELETE FROM users WHERE id = ?");
        $stmt->bind_param("i", $_SESSION['id']);
        $stmt->execute();
        $stmt->close();
        
        // Commit transaction
        $conn->commit();
        
        // Destroy session
        session_destroy();
        
        echo json_encode([
            'success' => true,
            'output' => 'User and related data deleted successfully'
        ]);
    } catch (Exception $e) {
        // Rollback transaction on error
        $conn->rollback();
        
        echo json_encode([
            'success' => false,
            'output' => 'Error deleting user: ' . $e->getMessage()
        ]);
    }
    
    $conn->close();
} 
else if (isset($inputData['get_data'])) {
    $output = ["output" => "1"];
    echo json_encode($output);
} 
else if (isset($inputData['send_data'])) {
    $output = ["output" => "0"];
    echo json_encode($output);
} 
else {
    $output = ["output" => "No input provided."];
    echo json_encode($output);
}
?>