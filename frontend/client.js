// add divs from index.html
const sendMessage = document.querySelector('.send-form');
const targetDiv = document.querySelector('.new-messages');
const contact = document.querySelector('.contact');
const socketClient = io('http://localhost:5000');
import { title } from 'process';
import importedUsername from '../backend/index.js';

let elements = []

// Nachrichten werden in json importiert und gerendert
socketClient.on('new-messages-received', (data) =>{
    elements = data;
    renderElements(elements)
})


// Bei neuer Nachricht wird ein neues div erzeugt das die Elemente des Json ausgibt
function renderElements(elements) {
    targetDiv.innerHTML = '';
    for (const element of elements) {
        const div = document.createElement('div');
        div.className = "message"
        div.innerHTML = `
            <strong>Von ${importedUsername}</strong>:<br/>${element.title}     
        `;
        div.addEventListener('click', ()=>{
            emitNewMessages();
        });
        targetDiv.appendChild(div);
    }
}

// neue Nachrichten an Json anhängen
function addMessage(importedUsername, title) {
    elements.push({
        person: importedUsername,
        title: title
    });
    renderElements(elements);
    emitNewMessages();
}

// Nachrichten fetchen, die schon im Json sind
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
    addMessage(importedUsername, title);
});

// initial render
renderElements(elements);
fetchMessages();