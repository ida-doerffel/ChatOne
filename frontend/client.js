// add divs from index.html
const sendMessage = document.querySelector('.send-form');
const targetDiv = document.querySelector('.new-messages');
const contact = document.querySelector('.contact');
const socketClient = io('http://localhost:5000');
const importedUsername = require('..backend/index');

let elements = []
socketClient.on('new-messages-received', (data) =>{
    elements = data;
    renderElements(elements)
})

function renderElements(elements) {
    targetDiv.innerHTML = '';
    for (const element of elements) {
        const div = document.createElement('div');
        div.className = "message"
        div.innerHTML = `
            <strong>Von ${importedUsername}</strong>:<br/>${element.title}     
        `;
        div.addEventListener('submit', ()=>{
            emitNewMessages();
        });
        targetDiv.appendChild(div);
    }
}

function addMessage(title) {
    elements.push({
        person: importedUsername,
        title: title
    });
    renderElements(elements);
    emitNewMessages();
}

async function fetchMessages(){
    const response = await fetch('http://localhost:5000/messages');
    elements = await response.json();
    renderElements(elements);
}

function emitNewMessages(){
    socketClient.emit('new-message-sent', elements)
}



sendMessage.addEventListener('submit', (event)=> {
    event.preventDefault();
    const input = document.querySelector('[name="message"]');
    addMessage(input.value);
});

// initial render
renderElements(elements);
fetchMessages();