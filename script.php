<?php
session_start();
header('Content-Type: application/json');

function verifyLoggedIn() {
    if (!isset($_SESSION["id"]) || !isset($_SESSION["name"]) || !isset($_SESSION["password"])) {
        return false;
    }
    $conn = mysqli_connect("localhost", "root", "", "fejsbuk");
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

$inputData = json_decode(file_get_contents('php://input'), true);

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

if (isset($inputData['getProfileData'])) {
    $conn = mysqli_connect("localhost", "root", "", "fejsbuk");
    $sql = "SELECT `name`, `admin` FROM `users` WHERE `id` = '".$_SESSION['id']."'";
    $result = mysqli_fetch_array(mysqli_query($conn, $sql));
    mysqli_close($conn);
    $output = ["name" => $result['name']];
    echo json_encode($output);
} else if (isset($inputData['getAllUsers'])) {
    $conn = mysqli_connect("localhost", "root", "", "fejsbuk");
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
        'users' => $users
    ]);
}
else if (isset($inputData['getCurrentUserId'])) {
    echo json_encode([
        'success' => true,
        'userId' => $_SESSION['id']
    ]);
}
else if (isset($inputData['getMessages'])) {
    $conn = mysqli_connect("localhost", "root", "", "fejsbuk");
    if (!isset($inputData['userId']) || !is_numeric($inputData['userId'])) {
        echo json_encode([
            'success' => false,
            'error' => 'Invalid user ID'
        ]);
        exit;
    }
    $otherUserId = intval($inputData['userId']);
    $currentUserId = $_SESSION['id'];

    $stmt = $conn->prepare("SELECT id, sender_id AS senderId, receiver_id AS receiverId, content, timestamp FROM messages WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?) ORDER BY timestamp ASC");
    $stmt->bind_param("iiii", $currentUserId, $otherUserId, $otherUserId, $currentUserId);
    $stmt->execute();
    
    $result = $stmt->get_result();
    $messages = [];
    while ($row = $result->fetch_assoc()) {
        $messages[] = $row;
    }
    $updateStmt = $conn->prepare("UPDATE messages SET is_read = TRUE WHERE sender_id = ? AND receiver_id = ? AND is_read = FALSE");
    $updateStmt->bind_param("ii", $otherUserId, $currentUserId);
    $updateStmt->execute();
    $stmt->close();
    $updateStmt->close();
    $conn->close();
    echo json_encode([
        'success' => true,
        'messages' => $messages
    ]);
}
else if (isset($inputData['saveMessage'])) {
    $conn = mysqli_connect("localhost", "root", "", "fejsbuk");
    
    if (!isset($inputData['messageData']) || !isset($inputData['messageData']['content']) || !isset($inputData['messageData']['receiverId']) || !is_numeric($inputData['messageData']['receiverId'])) {
        echo json_encode([
            'success' => false,
            'error' => 'Invalid message data'
        ]);
        exit;
    }
    
    $content = $inputData['messageData']['content'];
    $receiverId = intval($inputData['messageData']['receiverId']);
    $senderId = $_SESSION['id'];

    $stmt = $conn->prepare("INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)");
    $stmt->bind_param("iis", $senderId, $receiverId, $content);
    $success = $stmt->execute();
    $stmt->close();
    
    echo json_encode([
        'success' => $success,
        'messageId' => $success ? $conn->insert_id : null
    ]);
    $conn->close();
}
else if (isset($inputData['deleteAccount'])) {
    $conn = getDbConnection();
    $conn->begin_transaction();
    try {
        $stmt = $conn->prepare("
            DELETE FROM messages 
            WHERE sender_id = ? OR receiver_id = ?
        ");
        $stmt->bind_param("ii", $_SESSION['id'], $_SESSION['id']);
        $stmt->execute();
        $stmt->close();

        $stmt = $conn->prepare("DELETE FROM users WHERE id = ?");
        $stmt->bind_param("i", $_SESSION['id']);
        $stmt->execute();
        $stmt->close();
        
        $conn->commit();
        
        session_destroy();
        echo json_encode([
            'success' => true,
            'output' => 'User and related data deleted successfully'
        ]);
    } catch (Exception $e) {
        $conn->rollback();
        echo json_encode([
            'success' => false,
            'output' => 'Error deleting user: ' . $e->getMessage()
        ]);
    }
    $conn->close();
} 
else {
    $output = ["output" => "No input provided."];
    echo json_encode($output);
}
?>