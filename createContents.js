// async function createPasswordChangeContent(contentDiv = document.createElement('div')){
//     contentDiv.classList.add('window-content');
//     contentDiv.innerHTML = "<form method=\"post\">"
//     + "<input required type=\"password\" name=\"password\" placeholder=\"haslo\" maxlength=\"32\">"
//     + "<input required type=\"password\" name=\"password2\" placeholder=\"powtórz haslo\" maxlength=\"32\">"
//     + "<button name=\"changePassword\" class=\"form_button\">Zmień hasło</button>"
//     + "</form>";
// }

// async function createProfileContent(contentDiv = document.createElement('div')){
//     contentDiv.classList.add('window-content');
//     var userData = await getProfileData();
//     contentDiv.innerHTML = "<h2>"+userData.name+"</h2>"
//     + "<button id=\"changePasswordButton\" class=\"form_button\">Zmień hasło</button>"
//     + "<button id=\"deleteAccountButton\" class=\"form_button\" onclick=\"deleteAccount()\">Usuń konto</button>";
// }

// async function createMessagesContent(contentDiv = document.createElement('div')){
//     contentDiv.classList.add('window-content');
//     //var userData = await getProfileData();
//     contentDiv.innerHTML = "<input style=\"max-width: none; width: 90%;\" type=\"text\">"
// }

async function createPasswordChangeContent(contentDiv = document.createElement('div')){
    contentDiv.classList.add('window-content');
    contentDiv.innerHTML = "<form method=\"post\">"
    + "<input required type=\"password\" name=\"password\" placeholder=\"haslo\" maxlength=\"32\">"
    + "<input required type=\"password\" name=\"password2\" placeholder=\"powtórz haslo\" maxlength=\"32\">"
    + "<button name=\"changePassword\" class=\"form_button\">Zmień hasło</button>"
    + "</form>";
}

async function createProfileContent(contentDiv = document.createElement('div')){
    contentDiv.classList.add('window-content');
    var userData = await getProfileData();
    contentDiv.innerHTML = "<h2>"+userData.name+"</h2>"
    + "<button id=\"changePasswordButton\" class=\"form_button\">Zmień hasło</button>"
    + "<button id=\"deleteAccountButton\" class=\"form_button\" onclick=\"deleteAccount()\">Usuń konto</button>";
}

async function createMessagesContent(contentDiv = document.createElement('div')){
    contentDiv.classList.add('window-content');
    
    // Create search and user list container
    const searchContainer = document.createElement('div');
    searchContainer.classList.add('search-container');
    
    // Create search input
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Szukaj użytkownika...';
    searchInput.classList.add('search-input');
    searchInput.style.maxWidth = 'none';
    searchInput.style.width = '90%';
    searchInput.style.marginBottom = '15px';
    
    // Create users list container
    const usersListContainer = document.createElement('div');
    usersListContainer.classList.add('users-list');
    usersListContainer.style.maxHeight = '400px';
    usersListContainer.style.overflowY = 'auto';
    usersListContainer.style.width = '100%';
    usersListContainer.style.textAlign = 'left';
    
    // Add elements to the DOM
    searchContainer.appendChild(searchInput);
    contentDiv.appendChild(searchContainer);
    contentDiv.appendChild(usersListContainer);
    
    // Fetch users list
    const users = await getAllUsers();
    renderUsersList(users, usersListContainer);
    
    // Add search functionality
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const filteredUsers = users.filter(user => 
            user.name.toLowerCase().includes(searchTerm)
        );
        renderUsersList(filteredUsers, usersListContainer);
    });
}

function renderUsersList(users, container) {
    container.innerHTML = '';
    
    if (users.length === 0) {
        const noUsers = document.createElement('p');
        noUsers.textContent = 'Nie znaleziono użytkowników';
        container.appendChild(noUsers);
        return;
    }
    
    users.forEach(user => {
        const userItem = document.createElement('div');
        userItem.classList.add('user-item');
        userItem.style.padding = '10px';
        userItem.style.margin = '5px 0';
        userItem.style.borderRadius = 'var(--border-radius)';
        userItem.style.backgroundColor = 'var(--black)';
        userItem.style.cursor = 'pointer';
        
        userItem.innerHTML = `
            <span>${user.name}</span>
        `;
        
        userItem.addEventListener('click', () => {
            createChatWindow(user);
        });
        
        // Add hover effect
        userItem.addEventListener('mouseover', () => {
            userItem.style.backgroundColor = '#2a2a2a';
        });
        
        userItem.addEventListener('mouseout', () => {
            userItem.style.backgroundColor = 'var(--black)';
        });
        
        container.appendChild(userItem);
    });
}

async function createChatContent(contentDiv, user) {
    contentDiv.classList.add('window-content');
    contentDiv.style.display = 'flex';
    contentDiv.style.flexDirection = 'column';
    contentDiv.style.height = 'calc(100% - 60px)'; // Account for title bar
    
    // Create chat header
    const chatHeader = document.createElement('div');
    chatHeader.classList.add('chat-header');
    chatHeader.innerHTML = `<h3>${user.name}</h3>`;
    chatHeader.style.borderBottom = '1px solid var(--white)';
    chatHeader.style.padding = '5px 0';
    chatHeader.style.marginBottom = '10px';
    
    // Create chat messages container
    const messagesContainer = document.createElement('div');
    messagesContainer.classList.add('messages-container');
    messagesContainer.style.flexGrow = '1';
    messagesContainer.style.overflowY = 'auto';
    messagesContainer.style.maxHeight = 'calc(100% - 100px)';
    messagesContainer.style.padding = '10px';
    messagesContainer.style.margin = '0 0 10px 0';
    messagesContainer.style.borderRadius = 'var(--border-radius)';
    messagesContainer.style.backgroundColor = 'var(--dark-gray)';
    
    // Create input container
    const inputContainer = document.createElement('div');
    inputContainer.classList.add('input-container');
    inputContainer.style.display = 'flex';
    inputContainer.style.marginTop = 'auto';
    
    const messageInput = document.createElement('input');
    messageInput.type = 'text';
    messageInput.placeholder = 'Wpisz wiadomość...';
    messageInput.classList.add('message-input');
    messageInput.style.flexGrow = '1';
    messageInput.style.marginRight = '10px';
    
    const sendButton = document.createElement('button');
    sendButton.textContent = 'Wyślij';
    sendButton.classList.add('form_button');
    sendButton.style.width = 'auto';
    sendButton.style.marginTop = '0';
    
    inputContainer.appendChild(messageInput);
    inputContainer.appendChild(sendButton);
    
    // Add elements to the DOM
    contentDiv.appendChild(chatHeader);
    contentDiv.appendChild(messagesContainer);
    contentDiv.appendChild(inputContainer);
    
    // Load previous messages
    const messages = await getMessages(user.id);
    renderMessages(messages, messagesContainer);
    
    // Scroll to bottom of messages
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    // Setup WebSocket connection
    const socket = setupWebSocket(user.id, messagesContainer);
    
    // Add send message functionality
    sendButton.addEventListener('click', () => {
        sendMessage(messageInput.value, user.id, socket);
        messageInput.value = '';
    });
    
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage(messageInput.value, user.id, socket);
            messageInput.value = '';
        }
    });
}

function setupWebSocket(receiverId, messagesContainer) {
    // Create WebSocket connection
    const socket = new WebSocket(`ws://${window.location.hostname}:8080`);
    
    socket.onopen = function(e) {
        console.log('WebSocket connection established');
        // Send authentication message with current user ID
        socket.send(JSON.stringify({
            type: 'auth',
            userId: getCurrentUserId()
        }));
    };
    
    socket.onmessage = function(event) {
        const data = JSON.parse(event.data);
        
        // Check if this message is for current chat
        if (data.type === 'message' && 
            (data.senderId === receiverId || data.receiverId === receiverId)) {
            
            addMessageToDisplay(data, messagesContainer);
        }
    };
    
    socket.onclose = function(event) {
        if (event.wasClean) {
            console.log(`Connection closed cleanly, code=${event.code}, reason=${event.reason}`);
        } else {
            console.log('Connection died');
        }
    };
    
    socket.onerror = function(error) {
        console.log(`WebSocket error: ${error.message}`);
    };
    
    return socket;
}

function renderMessages(messages, container) {
    container.innerHTML = '';
    
    if (messages.length === 0) {
        const noMessages = document.createElement('p');
        noMessages.textContent = 'Brak wiadomości';
        noMessages.style.textAlign = 'center';
        noMessages.style.color = 'var(--light-gray)';
        container.appendChild(noMessages);
        return;
    }
    
    const currentUserId = getCurrentUserId();
    
    messages.forEach(message => {
        addMessageToDisplay(message, container, currentUserId);
    });
}

function addMessageToDisplay(message, container, currentUserId = getCurrentUserId()) {
    const isCurrentUserMessage = message.senderId === currentUserId;
    
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.style.maxWidth = '80%';
    messageElement.style.padding = '8px 12px';
    messageElement.style.marginBottom = '10px';
    messageElement.style.borderRadius = 'var(--border-radius)';
    messageElement.style.wordWrap = 'break-word';
    
    if (isCurrentUserMessage) {
        messageElement.style.backgroundColor = '#0084ff';
        messageElement.style.marginLeft = 'auto';
    } else {
        messageElement.style.backgroundColor = '#3a3b3c';
    }
    
    // Time formatter
    const messageTime = new Date(message.timestamp);
    const formattedTime = messageTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    
    messageElement.innerHTML = `
        <div>${message.content}</div>
        <div style="font-size: 0.7em; text-align: right; margin-top: 5px;">${formattedTime}</div>
    `;
    
    container.appendChild(messageElement);
    
    // Scroll to the new message
    container.scrollTop = container.scrollHeight;
}

function getCurrentUserId() {
    // This should return the current logged in user ID
    return document.body.getAttribute('data-user-id');
}

function sendMessage(content, receiverId, socket) {
    if (!content.trim()) return;
    
    const messageData = {
        type: 'message',
        content: content,
        receiverId: receiverId,
        senderId: getCurrentUserId(),
        timestamp: new Date().toISOString()
    };
    
    // Send via WebSocket
    socket.send(JSON.stringify(messageData));
    
    // Also save to database
    saveMessage(messageData);
}