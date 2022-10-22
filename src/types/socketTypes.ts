export interface Message {
  message: string;
  nickname: string;
}

export interface ServerToClientEvents {
  receive_message: (p: { message: string; nickname: string }) => void;
  room_joined: (p: { room: string; nickname: string }) => void;
  room_left: () => void;
  room_updated: (players: string[]) => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface ClientToServerEvents {
  send_message: (p: {
    message: string;
    nickname: string;
    room: string;
  }) => void;
  join_room: (p: { room: string; nickname: string }) => void;
  leave_room: () => void;
}

export interface SocketData {
  nickname: string;
  room: string;
}