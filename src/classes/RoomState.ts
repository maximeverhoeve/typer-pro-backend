import { IoType, RoomState as RoomStateProps, RoomStatus } from 'socketTypes';

export default class RoomState implements RoomStateProps {
  name: string;
  status: RoomStatus;
  countdown: number;
  io: IoType;

  constructor(props: Partial<RoomStateProps> & { io: IoType }) {
    this.name = props.name;
    this.status = props.status || 'IDLE';
    this.countdown = props.countdown || 0;
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
      countdown: this.countdown,
    });
  }

  getStatus(): RoomStatus {
    return this.status;
  }

  setStatus(status: RoomStatus): void {
    this.status = status;
    this.updateIo();
  }

  setCountdown(countdown: number): void {
    this.countdown = countdown;
    this.updateIo();
  }
}
