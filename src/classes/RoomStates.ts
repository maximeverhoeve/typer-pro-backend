import RoomState from './RoomState';
import { IoType } from 'socketTypes';

export default class RoomStates {
  readonly states: Map<string, RoomState>;
  readonly io: IoType;

  constructor(io: IoType) {
    this.states = new Map();
    this.io = io;
  }

  addRoomState(roomId: string): void {
    const _roomState = new RoomState({ io: this.io });
    this.states.set(roomId, _roomState);
  }

  removeRoomState(roomId: string): void {
    this.states.delete(roomId);
  }

  getRoomState(roomId: string): RoomState | undefined {
    return this.states.get(roomId);
  }

  getAllRoomStates(): Map<string, RoomState> {
    return this.states;
  }
}
