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
    const searchContainer = document.createElement('div');
    searchContainer.classList.add('search-container');
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Szukaj użytkownika...';
    searchInput.classList.add('search-input');
    searchInput.style.maxWidth = 'none';
    searchInput.style.width = '90%';
    searchInput.style.marginBottom = '15px';

    const usersListContainer = document.createElement('div');
    usersListContainer.classList.add('users-list');
    usersListContainer.style.maxHeight = '400px';
    usersListContainer.style.overflowY = 'auto';
    usersListContainer.style.width = '100%';
    usersListContainer.style.textAlign = 'left';
    
    searchContainer.appendChild(searchInput);
    contentDiv.appendChild(searchContainer);
    contentDiv.appendChild(usersListContainer);

    const users = await getAllUsers();
    renderUsersList(users, usersListContainer);

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
    contentDiv.style.height = 'calc(100% - 60px)';
    
    const chatHeader = document.createElement('div');
    chatHeader.classList.add('chat-header');
    chatHeader.innerHTML = `<h3>${user.name}</h3>`;
    chatHeader.style.borderBottom = '1px solid var(--white)';
    chatHeader.style.padding = '5px 0';
    chatHeader.style.marginBottom = '10px';
    
    const messagesContainer = document.createElement('div');
    messagesContainer.classList.add('messages-container');
    messagesContainer.style.flexGrow = '1';
    messagesContainer.style.overflowY = 'auto';
    messagesContainer.style.maxHeight = 'calc(100% - 100px)';
    messagesContainer.style.padding = '10px';
    messagesContainer.style.margin = '0 0 10px 0';
    messagesContainer.style.borderRadius = 'var(--border-radius)';
    messagesContainer.style.backgroundColor = 'var(--dark-gray)';
    
    const inputContainer = document.createElement('div');
    inputContainer.classList.add('input-container');
    inputContainer.style.display = 'flex';
    inputContainer.style.marginTop = 'auto';
    inputContainer.style.marginBottom = '10px';
    
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
    sendButton.style.marginBottom = '0';
    
    inputContainer.appendChild(messageInput);
    inputContainer.appendChild(sendButton);
    contentDiv.appendChild(chatHeader);
    contentDiv.appendChild(messagesContainer);
    contentDiv.appendChild(inputContainer);
    
    const messages = await getMessages(user.id);
    renderMessages(messages, messagesContainer);
    startMessagePolling(user.id, messagesContainer);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    sendButton.addEventListener('click', () => {
        sendMessage(messageInput.value, user.id);
        messageInput.value = '';
    });
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
    const isCurrentUserMessage = message.senderId == currentUserId;
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.style.maxWidth = '80%';
    messageElement.style.padding = '8px 12px';
    messageElement.style.marginBottom = '10px';
    messageElement.style.borderRadius = 'var(--border-radius)';
    
    if (isCurrentUserMessage) {
        messageElement.style.backgroundColor = '#0084ff';
        messageElement.style.marginLeft = 'auto';
    } else {
        messageElement.style.backgroundColor = '#3a3b3c';
    }

    const messageTime = new Date(message.timestamp);
    const formattedTime = messageTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    
    messageElement.innerHTML = `<div>${message.content}</div> <div style="font-size: 0.7em; text-align: right; margin-top: 5px;">${formattedTime}</div>`;
    
    container.appendChild(messageElement);
    
    container.scrollTop = container.scrollHeight;
}

function getCurrentUserId() {
    return document.body.getAttribute('data-user-id');
}

function sendMessage(content, receiverId) {
    if (!content.trim()) return;
    
    const messageData = {
        type: 'message',
        content: content,
        receiverId: receiverId,
        senderId: getCurrentUserId(),
        timestamp: new Date().toISOString()
    };    
    saveMessage(messageData);
}

function startMessagePolling(userId, messagesContainer) {
    setInterval(async () => {
        let messages = await getMessages(userId);
        renderMessages(messages, messagesContainer);
    }, 1000);
}