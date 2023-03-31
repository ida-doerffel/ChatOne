const express = require('express');
const cors = require('cors');
const app = express();
const path = require('path');
app.use(cors());
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    cors: {
        origin: '*',
    }
});
const redis = require('redis');
const redisClient = redis.createClient();
redisClient.connect();

// Express-Session-Modul einrichten
const session = require('express-session');
const sessionMiddleware = session({
  secret: 'bitte lassen sie uns bestehen',
  resave: false,
  saveUninitialized: true
});

// Middleware zum Abrufen von POST-Daten einrichten
app.use(express.urlencoded({ extended: true }));

// Sitzungsverwaltung einrichten
app.use(sessionMiddleware);
io.use(function(socket, next) {
  sessionMiddleware(socket.request, socket.request.res, next);
});

// Login-Seite bereitstellen
app.get('/login', function(req, res) {
  res.sendFile(path.join(__dirname, '../frontend', 'login.html'));
});

// Benutzer einloggen
app.post('/login', async (req, res) =>{
  // Benutzernamen aus POST-Daten abrufen
  const username = req.body.username;

  // Benutzernamen in der Sitzung speichern
  req.session.username = username;
  module.exports = req.session.username;
  await redisClient.get('username')
  app.set('person', req.session.username)
  console.log(req.session.id, 'logged in as', req.session.username)

  // Benutzer zur Chat-Seite weiterleiten
  res.redirect('/');
});

// Chat-Seite bereitstellen
app.get('/', function(req, res) {
  // Überprüfen, ob der Benutzer eingeloggt ist
  if (!req.session.username) {
    // Benutzer ist nicht eingeloggt, zur Login-Seite weiterleiten
    res.redirect('/login');
    return;
  }

  // Benutzer ist eingeloggt, Chat-Seite bereitstellen
  res.sendFile(path.join(__dirname, '../frontend', 'index.html'));
});

// Socket.IO-Verbindung herstellen
io.on('connection', (socket) => {
  console.log('Benutzer verbunden');

  // Benutzernamen aus der Sitzung abrufen
  const username = socket.request.session.username;

  // Überprüfen, ob der Benutzer eingeloggt ist
  if (!username) {
    // Benutzer ist nicht eingeloggt, Socket.IO-Verbindung trennen
    socket.disconnect();
    return;
  }

  // Benutzer ist eingeloggt, Chat-Nachrichten empfangen
  socket.on('new-message-sent', async (msg) => {
    await redisClient.set('elements', JSON.stringify(msg));
    console.log(username + ': ' + msg);
    socket.emit('new-messages-received', msg)
  });

  // Socket.IO-Verbindung trennen
  socket.on('disconnect', () => {
    console.log('Benutzer getrennt');
  });
});

app.get('/messages', async (req,res)=>{
    const elements = await redisClient.get('elements');
    if (elements == null){
        return res.send([]);
    }
    return res.send(JSON.parse(elements));
});

http.listen(5000, () => {});