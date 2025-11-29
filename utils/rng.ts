export class SeededRNG {
  private state: number;

  constructor(seed: number) {
    this.state = seed;
  }

  // Mulberry32 Algorithm - High quality, fast, and consistent across browsers
  public next(): number {
    let t = this.state += 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0);
  }

  // Returns a float between 0 and 1
  public nextFloat(): number {
    return this.next() / 4294967296;
  }

  // Returns an integer between min and max (inclusive min, exclusive max)
  public nextInt(min: number, max: number): number {
    return Math.floor(this.nextFloat() * (max - min) + min);
  }
}