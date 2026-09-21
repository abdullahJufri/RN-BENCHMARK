export interface BenchmarkResult {
  fetchTimeMs: number;
  storageWriteTimeMs: number;
  storageReadTimeMs: number;
  renderTimeMs: number;
  totalTimeMs: number;
  itemCount: number;
}

export class BenchmarkTimer {
  private startTime: number = 0;
  private markers: Map<string, number> = new Map();

  start(): void {
    this.startTime = Date.now();
  }

  mark(label: string): number {
    const elapsed = Date.now() - this.startTime;
    this.markers.set(label, elapsed);
    return elapsed;
  }

  elapsed(): number {
    return Date.now() - this.startTime;
  }

  getMarker(label: string): number {
    return this.markers.get(label) ?? 0;
  }

  getDelta(from: string, to: string): number {
    return (this.markers.get(to) ?? 0) - (this.markers.get(from) ?? 0);
  }
}
