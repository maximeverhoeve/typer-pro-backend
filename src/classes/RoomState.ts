import { IoType, RoomState as RoomStateProps } from 'socketTypes';

export default class RoomState implements RoomStateProps {
  name: string;
  status: 'LAUNCHING' | 'STARTING' | 'IN-PROGRESS' | 'IDLE';
  io: IoType;

  constructor(props: Partial<RoomStateProps> & { io: IoType }) {
    this.name = props.name;
    this.status = props.status || 'IDLE';
    this.io = props.io;

    this.updateIo();
  }

  private updateIo(): void {
    /** This private function should be called on each update of the RoomState
     * This is for updating the client side
     */
    this.io.to(this.name).emit('roomstate:update', {
      name: this.name,
      status: this.status,
    });
  }

  getStatus(): 'LAUNCHING' | 'STARTING' | 'IN-PROGRESS' | 'IDLE' {
    return this.status;
  }

  setStatus(status: 'LAUNCHING' | 'STARTING' | 'IN-PROGRESS' | 'IDLE'): void {
    this.status = status;
    this.updateIo();
  }
}
