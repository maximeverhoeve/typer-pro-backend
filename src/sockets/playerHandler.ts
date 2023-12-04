import { Socket } from 'socket.io';
import {
  ClientToServerEvents,
  InterServerEvents,
  Player,
  ServerToClientEvents,
  SocketData,
} from 'socketTypes';
import { getPlayerArray } from '../server';

const wordArray = [
  'geez',
  'uncustomary',
  'precipitants',
  'amalgamators',
  'yasmaks',
  'titrating',
  'tinmen',
  'lady',
  'allelopathy',
  'wrote',
  'diplegias',
  'naturopathies',
  'fishbowl',
  'allying',
  'confessions',
  'potstones',
  'mussily',
];

// Define interval so we can cancel it outside of events
let countdownInterval: NodeJS.Timer;

const playerHandler = (
  socket: Socket<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >,
): void => {
  // HELPER FUNCTIONS
  const checkAllPlayerStatus = (roomId: string, players: Player[]): void => {
    let countdownDuration = 5;
    const isAllReady = players.every(({ isReady }) => isReady);
    if (isAllReady) {
      countdownInterval = setInterval(() => {
        socket.to(roomId).emit('room:update-countdown', countdownDuration);
        countdownDuration--;

        if (countdownDuration < 0) {
          clearInterval(countdownInterval);
          socket.to(roomId).emit('room:countdown-ended');
        }
      }, 1000);
    } else {
      clearInterval(countdownInterval);
    }
  };

  // EVENT-FUNCTIONS
  const onReadyUpate = (isReady: boolean): void => {
    console.log(`Is ${socket.data.nickname} ready? ${isReady ? 'Yes' : 'no'}`);
    socket.data.player.isReady = isReady;
    const players = getPlayerArray(socket.data.room);

    // handle all players ready
    checkAllPlayerStatus(socket.data.room, players);

    socket.emit('room:update', players);
    socket.to(socket.data.room).emit('room:update', players);
  };
  const onPlayerUpdate = (payload: Partial<Player>): void => {
    console.log(
      `Player ${socket.data.nickname} updated  ${JSON.stringify(payload)}`,
    );
    socket.data.player = { ...socket.data.player, ...payload };
    const players = getPlayerArray(socket.data.room);

    socket.emit('room:update', players);
    socket.to(socket.data.room).emit('room:update', players);
  };

  const onGameStart = (): void => {
    const text = wordArray.join(' ');
    socket.emit('game:started', text);
    socket.to(socket.data.room).emit('game:started', text);
  };

  const onProgressUpdate = (progress: number): void => {
    socket.data.player.progress = progress;
    const players = getPlayerArray(socket.data.room);
    socket.emit('room:update', players);
    socket.to(socket.data.room).emit('room:update', players);
  };

  // EVENTS
  socket.on('player:update-ready', onReadyUpate);
  socket.on('player:update', onPlayerUpdate);
  socket.on('player:progress', onProgressUpdate);
  socket.on('game:start', onGameStart);
};

export default playerHandler;
