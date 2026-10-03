// server.js — Servidor multijugador con Socket.IO
// El HOST no juega: solo crea la sala, la controla y observa.
// La sala NO se destruye al desconectarse el host: los jugadores siguen jugando.
// Escucha en 0.0.0.0 para aceptar conexiones desde la red local.
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const os = require('os');
const { PAIRS } = require('./data');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(express.static(path.join(__dirname, 'public')));
app.get('/api/pairs', (req, res) => res.json(PAIRS));

const rooms = {};

function generateCode() {
  let code;
  do { code = Math.floor(100000 + Math.random() * 900000).toString(); }
  while (rooms[code]);
  return code;
}

function buildShuffledBoard() {
  const deck = [];
  PAIRS.forEach((p, i) => {
    deck.push({ pid: i, icon: p.emoji, label: p.name });
    deck.push({ pid: i, icon: p.symbol, label: p.symName });
  });
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck.map(c => ({ ...c, flipped: false, matched: false }));
}

function roomPublicState(room) {
  return {
    board: room.board.map(c => ({
      icon: c.icon, label: c.label, flipped: c.flipped, matched: c.matched
    })),
    players: room.players.map(p => ({
      id: p.id,
      name: p.name,
      score: p.score,
      connected: p.connected,
      avatar: p.avatar || '🦊'
    })),
    hostId: room.host,
    hostName: room.hostName,
    hostAvatar: room.hostAvatar || '👑',
    hostConnected: room.hostConnected !== false,
    turn: room.turn,
    started: room.started,
    finished: room.finished,
    matchedCount: room.matchedCount,
    totalPairs: PAIRS.length,
    code: room.code
  };
}

function broadcastRoom(code) {
  const room = rooms[code];
  if (!room) return;
  io.to(code).emit('roomState', roomPublicState(room));
}

function nextTurn(room) {
  if (room.players.length === 0) return;
  const idx = room.players.findIndex(p => p.id === room.turn);
  const nextIdx = idx < 0 ? 0 : (idx + 1) % room.players.length;
  room.turn = room.players[nextIdx].id;
}

// Emitir hostLeft SOLO a los demás sockets (no al host)
function emitHostLeftExcept(code, excludeSocketId) {
  const roomSockets = io.sockets.adapter.rooms.get(code);
  if (!roomSockets) return;
  roomSockets.forEach(sid => {
    if (sid !== excludeSocketId) {
      io.to(sid).emit('hostLeft');
    }
  });
}

io.on('connection', (socket) => {
  console.log('Conectado:', socket.id);

  // === CREAR SALA (host) ===
  socket.on('createRoom', ({ name, playerId, avatar }, cb) => {
    name = (name || '').trim().slice(0, 20) || 'Anfitrión';
    playerId = playerId || socket.id;
    avatar = avatar || '🦊';

    const code = generateCode();
    rooms[code] = {
      code,
      host: playerId,
      hostName: name,
      hostAvatar: avatar,
      hostConnected: true,
      players: [],
      board: [],
      flipped: [],
      turn: null,
      matchedCount: 0,
      started: false,
      finished: false,
      lockUntil: 0
    };
    socket.join(code);
    socket.data.playerId = playerId;
    socket.data.roomCode = code;
    socket.data.isHost = true;
    cb({ ok: true, code, playerId, host: playerId, isHost: true });
    broadcastRoom(code);
    console.log(`Sala ${code} creada por host ${name}`);
  });

  // === UNIRSE COMO JUGADOR / REINGRESO ===
  socket.on('joinRoom', ({ code, name, playerId, avatar }, cb) => {
    code = (code || '').toString().trim();
    name = (name || '').trim().slice(0, 20) || 'Jugador';
    playerId = playerId || socket.id;
    avatar = avatar || '🦊';

    const room = rooms[code];
    if (!room) return cb({ ok: false, error: 'Sala no encontrada' });

    // ¿Es el host reconectándose?
    if (playerId === room.host) {
      room.hostConnected = true;
      if (avatar) room.hostAvatar = avatar;
      if (name) room.hostName = name;
      socket.join(code);
      socket.data.playerId = playerId;
      socket.data.roomCode = code;
      socket.data.isHost = true;
      cb({ ok: true, code, playerId, rejoin: true, host: room.host, isHost: true });
      broadcastRoom(code);
      console.log(`Host reconectado a sala ${code}`);
      return;
    }

    // ¿Jugador existente que se reconecta?
    const existing = room.players.find(p => p.id === playerId);
    if (existing) {
      existing.connected = true;
      existing.socketId = socket.id;
      if (name) existing.name = name;
      if (avatar) existing.avatar = avatar;
      socket.join(code);
      socket.data.playerId = playerId;
      socket.data.roomCode = code;
      socket.data.isHost = false;
      cb({ ok: true, code, playerId, rejoin: true, host: room.host, isHost: false });
      broadcastRoom(code);
      return;
    }

    // Jugador nuevo
    if (room.started) return cb({ ok: false, error: 'La partida ya comenzó' });
    if (room.players.length >= 10) return cb({ ok: false, error: 'Sala llena (máx. 10)' });

    let finalName = name, n = 1;
    while (room.players.some(p => p.name === finalName)) {
      finalName = `${name} (${++n})`;
    }

    room.players.push({
      id: playerId,
      name: finalName,
      score: 0,
      connected: true,
      avatar: avatar,
      socketId: socket.id
    });
    socket.join(code);
    socket.data.playerId = playerId;
    socket.data.roomCode = code;
    socket.data.isHost = false;
    cb({ ok: true, code, playerId, host: room.host, isHost: false });
    broadcastRoom(code);
    console.log(`Jugador ${finalName} ${avatar} unido a sala ${code}`);
  });

  // === CAMBIAR AVATAR EN EL LOBBY ===
  socket.on('changeAvatar', ({ avatar }) => {
    const code = socket.data.roomCode;
    const playerId = socket.data.playerId;
    if (!code || !playerId) return;
    const room = rooms[code];
    if (!room) return;
    if (room.started) return;  // Solo en el lobby

    console.log(`Cambio de avatar: ${playerId} → ${avatar} en sala ${code}`);

    // Si es el host
    if (playerId === room.host) {
      room.hostAvatar = avatar || '👑';
      broadcastRoom(code);
      return;
    }

    // Si es jugador
    const player = room.players.find(p => p.id === playerId);
    if (player) {
      player.avatar = avatar || '🦊';
      console.log(`Avatar actualizado: ${player.name} → ${avatar}`);
      broadcastRoom(code);
    }
  });

  // === INICIAR PARTIDA (solo host) ===
  socket.on('startGame', () => {
    const code = socket.data.roomCode;
    const room = rooms[code];
    if (!room) return;
    if (socket.data.playerId !== room.host) return;
    if (room.players.length < 2) return;

    room.board = buildShuffledBoard();
    room.flipped = [];
    room.turn = room.players[0].id;
    room.matchedCount = 0;
    room.started = true;
    room.finished = false;
    room.lockUntil = 0;
    room.players.forEach(p => p.score = 0);
    broadcastRoom(code);
    io.to(code).emit('gameStarted');
    console.log(`Partida iniciada en sala ${code}`);
  });

  // === VOLTEAR CARTA (solo jugadores, no host) ===
  socket.on('flipCard', ({ index }) => {
    const code = socket.data.roomCode;
    const room = rooms[code];
    if (!room || !room.started || room.finished) return;
    if (socket.data.playerId === room.host) return;
    if (room.turn !== socket.data.playerId) return;
    if (Date.now() < room.lockUntil) return;

    const card = room.board[index];
    if (!card || card.flipped || card.matched) return;

    card.flipped = true;
    room.flipped.push(index);

    if (room.flipped.length === 2) {
      const [i1, i2] = room.flipped;
      const c1 = room.board[i1];
      const c2 = room.board[i2];

      if (c1.pid === c2.pid) {
        c1.matched = true;
        c2.matched = true;
        const player = room.players.find(p => p.id === socket.data.playerId);
        if (player) player.score++;
        room.matchedCount++;
        room.flipped = [];
        broadcastRoom(code);

        if (room.matchedCount === PAIRS.length) {
          room.finished = true;
          const sorted = [...room.players].sort((a, b) => b.score - a.score);
          const top = sorted[0].score;
          const winners = sorted.filter(p => p.score === top).map(p => p.name);
          io.to(code).emit('gameOver', {
            winners,
            scores: sorted.map(p => ({
              name: p.name,
              score: p.score,
              avatar: p.avatar || '🦊'
            }))
          });
          broadcastRoom(code);
          console.log(`Partida terminada en sala ${code}. Ganadores: ${winners.join(', ')}`);
        }
      } else {
        room.lockUntil = Date.now() + 1200;
        broadcastRoom(code);
        setTimeout(() => {
          c1.flipped = false;
          c2.flipped = false;
          room.flipped = [];
          room.lockUntil = 0;
          nextTurn(room);
          broadcastRoom(code);
        }, 1200);
      }
    } else {
      broadcastRoom(code);
    }
  });

  // === REINICIAR (solo host) ===
  socket.on('restartGame', () => {
    const code = socket.data.roomCode;
    const room = rooms[code];
    if (!room || socket.data.playerId !== room.host) return;

    room.board = buildShuffledBoard();
    room.flipped = [];
    room.turn = room.players[0]?.id || null;
    room.matchedCount = 0;
    room.started = true;
    room.finished = false;
    room.lockUntil = 0;
    room.players.forEach(p => p.score = 0);
    broadcastRoom(code);
    io.to(code).emit('gameRestarted');
    console.log(`Partida reiniciada en sala ${code}`);
  });

  socket.on('leaveRoom', () => handleLeave(socket, true));

  socket.on('disconnect', () => {
    console.log('Desconectado:', socket.id);
    handleLeave(socket, false);
  });
});

function handleLeave(socket, isVoluntary) {
  const code = socket.data.roomCode;
  const playerId = socket.data.playerId;
  if (!code || !playerId) return;
  const room = rooms[code];
  if (!room) return;

  // === HOST ===
  if (playerId === room.host) {
    if (isVoluntary) {
      emitHostLeftExcept(code, socket.id);
      socket.leave(code);
      delete rooms[code];
      console.log(`Sala ${code} cerrada por salida voluntaria del host`);
      return;
    }
    room.hostConnected = false;
    broadcastRoom(code);
    console.log(`Host desconectado de sala ${code}. Sala se mantiene viva.`);
    return;
  }

  // === JUGADOR ===
  const player = room.players.find(p => p.id === playerId);
  if (!player) return;

  if (isVoluntary) {
    room.players = room.players.filter(p => p.id !== playerId);
    socket.leave(code);

    if (room.players.length === 0) {
      if (room.turn) room.turn = null;
    } else if (room.turn === playerId) {
      nextTurn(room);
    }
  } else {
    player.connected = false;
    if (room.turn === playerId && room.started && !room.finished) {
      const connected = room.players.filter(p => p.connected);
      if (connected.length > 0) {
        const idx = connected.findIndex(p => p.id === playerId);
        const next = connected[(idx + 1 + connected.length) % connected.length];
        room.turn = next.id;
      }
    }
  }
  broadcastRoom(code);
}

// ============================================================
// ARRANQUE EN RED LOCAL
// ============================================================
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

server.listen(PORT, HOST, () => {
  const nets = os.networkInterfaces();
  const ips = [];
  Object.keys(nets).forEach(name => {
    nets[name].forEach(net => {
      if (net.family === 'IPv4' && !net.internal) {
        ips.push({ name, ip: net.address });
      }
    });
  });

  console.log('');
  console.log('  ✅ Servidor de Memorama Bíblico corriendo');
  console.log('  ─────────────────────────────────────────');
  console.log(`  🖥️  Local:      http://localhost:${PORT}`);
  ips.forEach(({ name, ip }) => {
    console.log(`  🌐 Red (${name}): http://${ip}:${PORT}`);
  });
  console.log('  ─────────────────────────────────────────');
  console.log('  Comparte la URL de "Red" con los demás dispositivos.');
  console.log('  Todos deben estar en la MISMA red Wi-Fi.');
  console.log('  Pulsa Ctrl+C para detener el servidor.');
  console.log('');
});