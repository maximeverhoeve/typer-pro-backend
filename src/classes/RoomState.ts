import {
  IoType,
  RoomState as RoomStateProps,
  RoomStateStats,
  RoomStatus,
} from 'socketTypes';

export default class RoomState implements RoomStateProps {
  name: string;
  status: RoomStatus;
  countdown: number;
  io: IoType;
  text: string | undefined;
  leaderboard: { [playerId: string]: RoomStateStats };

  constructor(props: Partial<RoomStateProps> & { io: IoType }) {
    this.name = props.name;
    this.status = props.status || 'IDLE';
    this.countdown = props.countdown || 0;
    this.text = props.text;
    this.io = props.io;
    this.leaderboard = props.leaderboard || {};

    this.updateIo();
  }

  private clearLeaderBoard(): void {
    delete this.leaderboard;
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
      text: this.text,
      leaderboard: this.leaderboard,
    });
  }

  getStatus(): RoomStatus {
    return this.status;
  }

  setStatus(status: RoomStatus): void {
    this.status = status;
    if (status === 'STARTING') {
      this.clearLeaderBoard();
    }
    this.updateIo();
  }

  setCountdown(countdown: number): void {
    this.countdown = countdown;
    this.updateIo();
  }

  setText(text?: string): void {
    this.text = text;
    this.updateIo();
  }

  addToLeaderboard(playerId: string, stats: RoomStateStats): void {
    if (!this.leaderboard) this.leaderboard = {};
    this.leaderboard[playerId] = stats;
    this.updateIo();
  }
}
