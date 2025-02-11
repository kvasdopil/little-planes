import { Vector3 } from 'three';

export class FlightController {
  private startTime: number;
  private cancelled: boolean = false;
  private flightDuration: number;
  private animationFrameId: number | null = null;

  constructor(
    private start: Vector3,
    private end: Vector3,
    private speed: number,
    private onProgress: (position: Vector3) => void,
    private onComplete: () => void
  ) {
    const totalDistance = end.clone().sub(start).length();
    this.flightDuration = (totalDistance / speed) * 1000;
    this.startTime = performance.now();
    this.startFlight();
  }

  private startFlight = () => {
    const animate = () => {
      if (this.cancelled) return;

      const progress = Math.min((performance.now() - this.startTime) / this.flightDuration, 1);
      const currentPosition = this.start.clone().lerp(this.end, progress);
      this.onProgress(currentPosition);

      if (progress >= 1) {
        this.onComplete();
        return;
      }

      this.animationFrameId = requestAnimationFrame(animate);
    };

    this.animationFrameId = requestAnimationFrame(animate);
  };

  public cancel() {
    this.cancelled = true;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }
} 