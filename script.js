async function getProfileData() {
    var output = 0;
    await fetch('script.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            getProfileData: "getProfileData"
        })
    })
    .then(response => response.json())
    .then(data => {
        output = data;
    })
    .catch(error => console.error('Error:', error));
    return output;
}

async function getAllUsers() {
    let users = [];
    
    await fetch('script.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            getAllUsers: true
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            users = data.users;
        } else {
            console.error('Error fetching users:', data.error);
        }
    })
    .catch(error => console.error('Error:', error));
    
    return users;
}

async function getMessages(userId) {
    let messages = [];
    
    await fetch('script.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            getMessages: true,
            userId: userId
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // console.log(data)
            messages = data.messages;
        } else {
            console.error('Error fetching messages:', data.error);
        }
    })
    .catch(error => console.error('Error:', error));
    
    return messages;
}

async function saveMessage(messageData) {
    await fetch('script.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            saveMessage: true,
            messageData: messageData
        })
    })
    .then(response => response.json())
    .then(data => {
        if (!data.success) {
            console.error('Error saving message:', data.error);
        }
    })
    .catch(error => console.error('Error:', error));
}

function deleteAccount(){
    if(confirm("Na pewno?")){
        fetch('script.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                deleteAccount: "deleteAccount"
            })
        })
        .then(response => response.json())
        .then(data => {
            window.location.reload();
        })
        .catch(error => console.error('Error:', error));
    }
}

document.addEventListener('DOMContentLoaded', function() {
    fetch('script.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            getCurrentUserId: true
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            document.body.setAttribute('data-user-id', data.userId);
        }
    })
    .catch(error => console.error('Error:', error));
});