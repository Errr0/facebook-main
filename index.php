<?php
    header('location: login.php');
//     session_start();
//     if(isset($_SESSION["password"]) && isset($_SESSION["name"]) && isset($_SESSION["id"]) && isset($_SESSION["admin"])){
//         $conn = mysqli_connect("localhost", "root", "", "fejsbuk");
//         $sql = "SELECT `id`, `name`, `admin` FROM `users` WHERE `name` = '".$_SESSION["name"]."' AND `password` = '".sha1($_SESSION["password"])."'";
//         $result = mysqli_fetch_array(mysqli_query($conn, $sql));
//         mysqli_close($conn);
//         if($result){
//             header("location: logged.php");
//         }
//     }          
//    header('location: login.php');
?>