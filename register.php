<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <title>Fejsbuk</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div id="container">
        <div id="login">
            <form method="post" style="margin: 10px;">
                <h2>Rejestracja</h2>
                <input required type="text" name="name" placeholder="login" maxlength="16"><br/>
                <input required type="password" name="password" placeholder="haslo" maxlength="32"><br/>
                <input required type="password" name="password2" placeholder="powtórz haslo" maxlength="32"><br/>
                <button name="register" class="form_button">Zarejestruj się</button>
            </form>
            <a href="login.php">Zaloguj się</a>
            <p id="output">
            <?php
                if(isset($_POST['register'])){
                    $conn = mysqli_connect("localhost", "root", "", "fejsbuk");
                    $sql = "SELECT `id`, `name`, `admin` FROM `users` WHERE `name` = '".$_POST['name']."'";
                    $result = mysqli_fetch_array(mysqli_query($conn, $sql));
                    if($result){
                        echo "login zajęty";
                    } else {
                        if($_POST['password'] != $_POST['password2']){
                            echo "hasła muszą być takie same";
                        } else{
                            $sql = "INSERT INTO `users` (`id`, `name`, `password`, `admin`) VALUES (NULL, '".$_POST['name']."', '".sha1($_POST['password'])."', '0')";
                            mysqli_query($conn, $sql);
                            mysqli_close($conn);
                            header('location: index.php');
                        }
                    }
                    mysqli_close($conn);
                }
            ?>
            </p>
        </div>
    </div>
</body>
</html>