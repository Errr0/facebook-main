async function createPasswordChangeWindow() {
    var button = document.getElementById('changePasswordButton');
    var windowId = "passwordChangeWindow";
    var oldWindow = document.getElementById(windowId)
    if(oldWindow){
        oldWindow.remove();
    }
    await createPasswordChangeContent(createWindow(button, windowId, "Zmiana Hasła", 400, 50, 400, 250));
}

async function createProfileWindow() {
    var button = document.getElementById('profileButton');
    var windowId = "profileWindow";
    await createProfileContent(createWindow(button, windowId, "Profil", 50, 50, 400, 300));
    document.getElementById('changePasswordButton').addEventListener('click', createPasswordChangeWindow);
}

async function createMessagesWindow() {
    var button = document.getElementById('messagesButton');
    var windowId = "messagesWindow";
    await createMessagesContent(createWindow(button, windowId, "Wiadomości", 50, 500, 400, 300));
}

async function createChatWindow(user) {
    var windowId = "chatWindow_" + user.id;
    var existingWindow = document.getElementById(windowId);
    if (existingWindow) {
        var parent = existingWindow.parentNode;
        parent.removeChild(existingWindow);
        parent.appendChild(existingWindow);
        return;
    }
    const messagesWindow = document.getElementById('messagesWindow');
    let left = 500;
    let top = 50;
    
    if (messagesWindow) {
        const rect = messagesWindow.getBoundingClientRect();
        left = rect.right + 20;
        top = rect.top;
    }
    const tempButton = document.createElement('button');
    tempButton.style.display = 'none';
    document.body.appendChild(tempButton);
    const contentDiv = createWindow(tempButton, windowId, "Chat: " + user.name, top, left, 400, 500);
    await createChatContent(contentDiv, user);
    document.body.removeChild(tempButton);
}

document.getElementById('profileButton').addEventListener('click', createProfileWindow);
document.getElementById('messagesButton').addEventListener('click', createMessagesWindow);