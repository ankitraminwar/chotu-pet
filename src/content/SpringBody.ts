export class SpringBody {
  private y = 0;
  private vy = 0;
  private target = 0;
  private phase = 0;

  private readonly stiffness = 0.035;
  private readonly damping = 0.85;

  tick(): number {
    this.phase += 0.02;
    this.target = Math.sin(this.phase) * 3;

    const force = -this.stiffness * (this.y - this.target);
    const damp = -this.damping * this.vy;

    this.vy += force + damp;
    this.y += this.vy;
    return this.y;
  }

  impulse(force: number): void {
    this.vy += force;
  }

  reset(): void {
    this.y = 0;
    this.vy = 0;
    this.phase = 0;
  }
}
