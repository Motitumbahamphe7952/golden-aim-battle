
export interface Position {
  x: number;
  y: number;
}

export interface Velocity {
  x: number;
  y: number;
}

export interface Zone {
  element: HTMLElement;
  discount: number;
  name: string;
  color: string;
}

export interface BallPhysicsProps {
  balls: HTMLElement[];
  table: HTMLElement;
  onBallStop: (result: { discount: number; name: string; color: string }) => void;
}

interface BallState {
  element: HTMLElement;
  position: Position;
  velocity: Velocity;
  width: number;
  height: number;
  stopped: boolean;
}

export class BallPhysics {
  private balls: BallState[];
  private table: HTMLElement;
  private tableRect: DOMRect;
  private friction: number;
  private zones: Zone[];
  private onBallStop: (result: { discount: number; name: string; color: string }) => void;
  private animationFrameId: number | null = null;
  private horizontalOffset: number = 60; // Spacing between balls

  constructor(props: BallPhysicsProps) {
    this.table = props.table;
    this.tableRect = this.table.getBoundingClientRect();
    this.friction = 0.98;
    this.onBallStop = props.onBallStop;
    this.zones = [];
    
    // Initialize ball states
    this.balls = props.balls.map(ball => ({
      element: ball,
      position: { x: 0, y: 0 },
      velocity: { x: 0, y: 0 },
      width: ball.offsetWidth,
      height: ball.offsetHeight,
      stopped: true
    }));
  }

  public setZones(zones: Zone[]): void {
    this.zones = zones;
  }

  public updateTableRect(): void {
    this.tableRect = this.table.getBoundingClientRect();
  }

  public reset(): void {
    // if (this.animationFrameId !== null) {
    //   cancelAnimationFrame(this.animationFrameId);
    //   this.animationFrameId = null;
    // }
    
    // this.updateTableRect();
    
    // const tableWidth = this.tableRect.width;
    // const tableHeight = this.tableRect.height;
    
    // // Position the cue ball separately from others
    // this.balls.forEach((ball, index) => {
    //   if (index === 0) {
    //     // Position cue ball at the front
    //     ball.position = {
    //       x: tableWidth * 0.2,
    //       y: tableHeight / 2 - ball.height / 2
    //     };
    //   } else {
    //     // Position other balls in a line behind
    //     ball.position = {
    //       x: tableWidth * 0.2 + index * this.horizontalOffset,
    //       y: tableHeight / 2 - ball.height / 2
    //     };
    //   }
      
    //   ball.velocity = { x: 0, y: 0 };
    //   ball.stopped = true;
    //   this.updateBallPosition(ball);
    // });

    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    
    this.updateTableRect();
    
    const tableWidth = this.tableRect.width;
    const tableHeight = this.tableRect.height;
    const ballHeight = this.balls[0].height;
    const minY = 0;
    const maxY = tableHeight - ballHeight;
    const randomY = Math.random() * (maxY - minY) + minY;
  
    this.balls.forEach((ball, index) => {
      if (index === 0) {
        ball.position = {
          x: tableWidth * 0.2,
          y: randomY
        };
      } else {
        ball.position = {
          x: tableWidth * 0.2 + index * this.horizontalOffset,
          y: randomY
        };
      }
      
      ball.velocity = { x: 0, y: 0 };
      ball.stopped = true;
      this.updateBallPosition(ball);
    });
  }

  public shoot(angle: number, power: number): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
    
    const angleRad = angle * Math.PI / 180;
    const baseSpeed = this.tableRect.width * 0.05;
    const speedMultiplier = power / 8;

    // Apply force only to the cue ball (first ball)
    const cueBall = this.balls[0];
    cueBall.velocity = {
      x: -baseSpeed * speedMultiplier * Math.cos(angleRad),
      y: -baseSpeed * speedMultiplier * Math.sin(angleRad)
    };
    cueBall.stopped = false;

    this.animate();
  }

  private animate(): void {
    let allStopped = true;

    // Update velocities and positions
    this.balls.forEach(ball => {
      if (ball.stopped) return;

      ball.velocity.x *= this.friction;
      ball.velocity.y *= this.friction;
      ball.position.x += ball.velocity.x;
      ball.position.y += ball.velocity.y;

      // Wall collisions
      const energyLoss = 0.8;
      if (ball.position.x <= 0) {
        ball.position.x = 0;
        ball.velocity.x = Math.abs(ball.velocity.x) * energyLoss;
      } else if (ball.position.x >= this.tableRect.width - ball.width) {
        ball.position.x = this.tableRect.width - ball.width;
        ball.velocity.x = -Math.abs(ball.velocity.x) * energyLoss;
      }

      if (ball.position.y <= 0) {
        ball.position.y = 0;
        ball.velocity.y = Math.abs(ball.velocity.y) * energyLoss;
      } else if (ball.position.y >= this.tableRect.height - ball.height) {
        ball.position.y = this.tableRect.height - ball.height;
        ball.velocity.y = -Math.abs(ball.velocity.y) * energyLoss;
      }

      // Check stopping condition
      if (Math.abs(ball.velocity.x) < 0.1 && Math.abs(ball.velocity.y) < 0.1) {
        ball.stopped = true;
      } else {
        allStopped = false;
      }
    });

    // Resolve ball collisions
    this.resolveCollisions();

    // Update positions and check final stopped state
    this.balls.forEach(ball => {
      this.updateBallPosition(ball);
      if (!ball.stopped) allStopped = false;
    });

    if (allStopped) {
      this.checkZone(this.balls[2]);
      return;
    }

    this.animationFrameId = requestAnimationFrame(() => this.animate());
  }

  private resolveCollisions(): void {
    for (let i = 0; i < this.balls.length; i++) {
      for (let j = i + 1; j < this.balls.length; j++) {
        const ball1 = this.balls[i];
        const ball2 = this.balls[j];
        const dx = (ball2.position.x + ball2.width/2) - (ball1.position.x + ball1.width/2);
        const dy = (ball2.position.y + ball2.height/2) - (ball1.position.y + ball1.height/2);
        const distance = Math.sqrt(dx * dx + dy * dy);
        const minDistance = (ball1.width + ball2.width) / 2;

        if (distance < minDistance) {
          // Collision detected
          const nx = dx / distance;
          const ny = dy / distance;
          const tx = -ny;
          const ty = nx;

          // Project velocities onto normal and tangent
          const v1n = nx * ball1.velocity.x + ny * ball1.velocity.y;
          const v1t = tx * ball1.velocity.x + ty * ball1.velocity.y;
          const v2n = nx * ball2.velocity.x + ny * ball2.velocity.y;
          const v2t = tx * ball2.velocity.x + ty * ball2.velocity.y;

          // Swap normal velocities with coefficient of restitution
          const cor = 0.95;
          const newV1n = v2n * cor;
          const newV2n = v1n * cor;

          // Convert back to vectors
          ball1.velocity.x = newV1n * nx + v1t * tx;
          ball1.velocity.y = newV1n * ny + v1t * ty;
          ball2.velocity.x = newV2n * nx + v2t * tx;
          ball2.velocity.y = newV2n * ny + v2t * ty;

          // Position correction
          const overlap = (minDistance - distance) / 2;
          ball1.position.x -= nx * overlap;
          ball1.position.y -= ny * overlap;
          ball2.position.x += nx * overlap;
          ball2.position.y += ny * overlap;

          ball1.stopped = false;
          ball2.stopped = false;
        }
      }
    }
  }

  private updateBallPosition(ball: BallState): void {
    ball.element.style.left = `${ball.position.x}px`;
    ball.element.style.top = `${ball.position.y}px`;
  }

  private checkZone(ball: BallState): void {
    const ballRect = ball.element.getBoundingClientRect();
    let result = { discount: 0, name: 'No Zone', color: 'gray' };
    
    this.zones.forEach(zone => {
      const zoneRect = zone.element.getBoundingClientRect();
      
      // Check if the center of the ball is in the zone using distance formula
      const ballCenterX = ballRect.left + ballRect.width / 2;
      const ballCenterY = ballRect.top + ballRect.height / 2;
      
      const zoneCenterX = zoneRect.left + zoneRect.width / 2;
      const zoneCenterY = zoneRect.top + zoneRect.height / 2;
      
      const dx = ballCenterX - zoneCenterX;
      const dy = ballCenterY - zoneCenterY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Check if ball center is within zone radius
      if (distance <= zoneRect.width / 2) {
        result = zone;
      }
    });

    // Trigger callback with result
    this.onBallStop(result);
  }
}

export interface AimingSystemProps {
  ball: HTMLElement;
  aimLine: HTMLElement;
  table: HTMLElement;
}

export class AimingSystem {
  private ball: HTMLElement;
  private aimLine: HTMLElement;
  private table: HTMLElement;
  private angle: number = 0;
  private maxLength: number = 300;
  
  constructor(props: AimingSystemProps) {
    this.ball = props.ball;
    this.aimLine = props.aimLine;
    this.table = props.table;
    
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.table.addEventListener('mousemove', this.updateAimLine.bind(this));
  }

  private updateAimLine(event: MouseEvent): void {
    const tableRect = this.table.getBoundingClientRect();
    const ballRect = this.ball.getBoundingClientRect();
    
    // Ball center coordinates
    const ballCenterX = ballRect.left - tableRect.left + ballRect.width / 2;
    const ballCenterY = ballRect.top - tableRect.top + ballRect.height / 2;
    
    const mouseX = event.clientX - tableRect.left;
    const mouseY = event.clientY - tableRect.top;

    // Calculate angle from ball to mouse
    const dx = mouseX - ballCenterX;
    const dy = mouseY - ballCenterY;
    this.angle = Math.atan2(dy, dx) * 180 / Math.PI;

    // Calculate line length
    const length = Math.min(Math.sqrt(dx*dx + dy*dy), this.maxLength);

    // Update aim line
    this.aimLine.style.width = `${length}px`;
    this.aimLine.style.left = `${ballCenterX}px`;
    this.aimLine.style.top = `${ballCenterY}px`;
    this.aimLine.style.transform = `rotate(${this.angle}deg)`;
  }

  public getAngle(): number {
    return this.angle;
  }
}
