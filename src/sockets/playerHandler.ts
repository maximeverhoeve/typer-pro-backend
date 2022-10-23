import { Socket } from 'socket.io';
import {
  ClientToServerEvents,
  InterServerEvents,
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
  'pickoff',
  'foreigner',
  'dysuric',
  'perikarya',
  'madreporites',
  'grabbling',
  'councilwomen',
  'darkeners',
  'atriums',
  'beachwear',
  'obturators',
  'depravednesses',
  'practicability',
  'perdurabilities',
  'surrealists',
  'acaricides',
  'kobos',
  'frounces',
  'achievements',
  'bridegroom',
  'cratered',
  'craven',
  'bivalve',
  'canst',
  'moperies',
  'edifies',
  'hydroxides',
  'asphyxy',
  'elaborately',
  'cavalero',
  'privatise',
  'petulancy',
  'nagger',
];

const playerHandler = (
  socket: Socket<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >,
): void => {
  // EVENT-FUNCTIONS
  const onReadyUpate = (isReady: boolean): void => {
    console.log(`Is ${socket.data.nickname} ready? ${isReady ? 'Yes' : 'no'}`);
    socket.data.player.isReady = isReady;
    const players = getPlayerArray(socket.data.room);

    socket.emit('room:update', players);
    socket.to(socket.data.room).emit('room:update', players);
  };

  const onGameStart = (): void => {
    const text = wordArray.join(' ');
    socket.emit('game:started', text);
    socket.to(socket.data.room).emit('game:started', text);
  };

  // EVENTS
  socket.on('player:update-ready', onReadyUpate);
  socket.on('game:start', onGameStart);
};

export default playerHandler;
