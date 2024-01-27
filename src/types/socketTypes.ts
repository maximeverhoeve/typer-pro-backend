import { Server } from 'socket.io';

export interface Player {
  nickname: string;
  isReady: boolean;
  progress: number; // percentage
  id: string;
  color: string;
}

export interface Message {
  message: string;
  nickname: string;
  room: string;
}

export interface Room {
  name: string;
  /** Player count */
  count: number;
}

export interface RoomState {
  name: string;
  status: 'LAUNCHING' | 'STARTING' | 'IN-PROGRESS' | 'IDLE';
}

export interface ServerToClientEvents {
  'chat:receive': (p: { message: string; nickname: string }) => void;
  'room:joined': (p: { room: string; nickname: string }) => void;
  'room:left': () => void;
  'room:update': (players: Player[]) => void;
  'room:update-countdown': (countdown: number) => void;
  'room:countdown-ended': () => void;
  'rooms:get': (rooms: Room[]) => void;
  'game:started': (text: string) => void;
  'roomstate:update': (roomState: RoomState) => void;
}
export interface ClientToServerEvents {
  'chat:send': (p: { message: string; nickname: string; room: string }) => void;
  'room:join': (p: { room: string; nickname: string }) => void;
  'room:leave': () => void;
  'rooms:request': () => void;
  'room:request': (room: string) => void;
  'player:update': (payload: Partial<Player>) => void;
  'player:update-ready': (isReady: boolean) => void;
  'player:progress': (progress: number) => void;
  'game:start': () => void;
}

// SERVER ONLY TYPES
export interface SocketData {
  nickname: string;
  room: string;
  player: Player;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface RoomStateObject {
  [roomId: string]: RoomState;
}

export type IoType = Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;
