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
                <input required type="text" name="name" placeholder="login" maxlength="16" pattern="^[a-zA-Z0-9_]+$" title="Tylko znaki alfanumeryczne i podkreślenia (_)"><br/>
                <input required type="password" name="password" placeholder="haslo" maxlength="32" pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$" title="Minimum 8 znaków, przynajmniej 1 duża litera, 1 mała litera i 1 cyfra"><br/>
                <input required type="password" name="password2" placeholder="powtórz haslo" maxlength="32"><br/>
                <button name="register" class="form_button">Zarejestruj się</button>
            </form>
            <a href="login.php">Zaloguj się</a>
            <p id="output">
            <?php
                if(isset($_POST['register'])){
                    if(!preg_match('/^[a-zA-Z0-9_]+$/', $_POST['name'])) {
                        echo "Login może zawierać tylko znaki alfanumeryczne i podkreślenia (_)";
                    } 
                    else if(!preg_match('/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/', $_POST['password'])) {
                        echo "Hasło musi zawierać minimum 8 znaków, przynajmniej 1 dużą literę, 1 małą literę i 1 cyfrę";
                    }
                    else {
                        $conn = mysqli_connect("localhost", "root", "", "fejsbuk");
                        $sql = "SELECT `id`, `name`, `admin` FROM `users` WHERE `name` = '".$_POST['name']."'";
                        $result = mysqli_fetch_array(mysqli_query($conn, $sql));
                        if($result){
                            echo "login zajęty";
                        } else {
                            if($_POST['password'] != $_POST['password2']){
                                echo "hasła muszą być takie same";
                            } else{
                                $password = sha1($_POST['password']);
                                $sql = "INSERT INTO `users` (`id`, `name`, `password`, `admin`) VALUES (NULL, '".$name."', '".$password."', '0')";
                                mysqli_query($conn, $sql);
                                mysqli_close($conn);
                                header('location: index.php');
                            }
                        }
                        mysqli_close($conn);
                    }
                }
            ?>
            </p>
        </div>
    </div>
</body>
</html>