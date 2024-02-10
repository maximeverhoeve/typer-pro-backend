/* eslint-disable @typescript-eslint/no-floating-promises */
import { Socket } from 'socket.io';
import {
  ClientToServerEvents,
  InterServerEvents,
  Player,
  ServerToClientEvents,
  SocketData,
} from 'socketTypes';
import { getPlayerArray, roomStates } from '../server';
import { retrieveRandomText } from '../api/getRandomWords';

// Define interval so we can cancel it outside of events
let countdownInterval: NodeJS.Timer;
let countdownGameInterval: NodeJS.Timer;
let countdownDuration = 5;

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
    const roomState = roomStates.getRoomState(roomId);
    countdownDuration = 5;
    clearInterval(countdownInterval);
    const isAllReady = players.every(({ isReady }) => isReady);

    if (roomState && isAllReady && roomState.getStatus() === 'IDLE') {
      roomState?.setStatus('LAUNCHING');
      countdownInterval = setInterval(() => {
        socket.to(roomId).emit('room:update-countdown', countdownDuration);
        console.log('devmax countdown', countdownDuration);
        countdownDuration--;

        if (countdownDuration < 0) {
          clearInterval(countdownInterval);
          socket.to(roomId).emit('room:countdown-ended');
          roomState?.setStatus('JOINING');
        }
      }, 1000);
    } else {
      if (
        roomState?.getStatus() === 'JOINING' ||
        roomState?.getStatus() === 'LAUNCHING' ||
        !players.some(({ isReady }) => isReady)
      ) {
        roomState?.setStatus('IDLE');
      }
      clearInterval(countdownInterval);
    }
  };

  /**
   * Checks if all players are loaded
   * Retrieves text to type
   * Starts countdown
   */
  const prepareStart = async (): Promise<void> => {
    const players = getPlayerArray(socket.data.room);
    const roomState = roomStates.getRoomState(socket.data.room);
    let countdownDuration = 5;
    const isAllLoaded = players.every(({ isLoaded }) => isLoaded);
    if (roomState && isAllLoaded && roomState.getStatus() === 'JOINING') {
      roomState.setText(undefined);
      try {
        const randomText = await retrieveRandomText();
        console.log('devmax text to type', randomText);
        roomState.setText(randomText);
        roomState.setCountdown(5);
        roomState.setStatus('STARTING');
        // start coundown
        countdownGameInterval = setInterval(() => {
          roomState.setCountdown(countdownDuration);
          countdownDuration--;

          if (countdownDuration < 0) {
            clearInterval(countdownGameInterval);
            roomState.setStatus('IN-PROGRESS');
          }
        }, 1000);
      } catch {
        //
      }
    } else {
      clearInterval(countdownGameInterval);
    }
  };

  // EVENT-FUNCTIONS
  const onReadyUpdate = (isReady: boolean): void => {
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
    if (payload.isLoaded) {
      // check for countdown start
      prepareStart();
    } else if (Object.keys(payload).includes('isLoaded')) {
      /** When all players are unloaded from multiplayer game, set status back to idle */
      const loadedPlayers = players.filter(({ isLoaded }) => isLoaded);
      const roomState = roomStates.getRoomState(socket.data.room);
      if (!loadedPlayers.length && roomState?.status === 'IN-PROGRESS') {
        roomState.setStatus('IDLE');
      }
    }
  };

  const onProgressUpdate = (progress: number): void => {
    socket.data.player.progress = progress;
    const players = getPlayerArray(socket.data.room);
    socket.emit('room:update', players);
    socket.to(socket.data.room).emit('room:update', players);
  };

  // EVENTS
  socket.on('player:update-ready', onReadyUpdate);
  socket.on('player:update', onPlayerUpdate);
  socket.on('player:progress', onProgressUpdate);
};

export default playerHandler;
