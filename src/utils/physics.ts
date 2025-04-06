
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
  innerRadius: number;
  outerRadius: number;
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
  private borderWidth: number = 13; // Border width of the table
  private balls: BallState[];
  private table: HTMLElement;
  private tableRect: DOMRect;
  private friction: number;
  private zones: Zone[];
  private onBallStop: (result: { discount: number; name: string; color: string }) => void;
  private animationFrameId: number | null = null;
  private verticalOffset: number = 60; // Spacing between balls (now vertical)


  
  constructor(props: BallPhysicsProps) {
    this.table = props.table;
    this.updateTableRect(); // Get initial table dimensions
    this.tableRect = this.table.getBoundingClientRect();
    this.friction = 0.98;
    this.onBallStop = props.onBallStop;
    this.zones = [];
    
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
    // Dynamically calculate border width from the billiard-border element
    const borderElement = this.table.querySelector('.billiard-border');
    if (borderElement) {
      const computedStyle = window.getComputedStyle(borderElement);
      this.borderWidth = parseFloat(computedStyle.borderLeftWidth);
    }
  }

  public reset(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  
    this.updateTableRect(); // Recalculate tableRect and borderWidth
  
    const innerWidth = this.tableRect.width - 2 * this.borderWidth;
    const innerHeight = this.tableRect.height - 2 * this.borderWidth;
    const ballWidth = this.balls[0].width;
  
    // Random X position within inner boundaries
    const minX = this.borderWidth;
    const maxX = innerWidth - ballWidth + this.borderWidth;
    const randomX = Math.random() * (maxX - minX) + minX;
  
    // Position balls vertically within inner boundaries
    this.balls.forEach((ball, index) => {
      ball.position = {
        x: randomX,
        y: innerHeight * 0.8 + this.borderWidth - index * this.verticalOffset
      };
      ball.velocity = { x: 0, y: 0 };
      ball.stopped = true;
      this.updateBallPosition(ball);
    });
  }

  public shoot(angle: number, power: number): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
    
    // Add 180 degrees to shoot in exactly the opposite direction
    const oppositeAngle = angle + 180;
    const angleRad = oppositeAngle * Math.PI / 180;
    const baseSpeed = this.tableRect.height * 0.05;
    const speedMultiplier = power / 10;

    const cueBall = this.balls[0];
    cueBall.velocity = {
      x: baseSpeed * speedMultiplier * Math.cos(angleRad),
      y: baseSpeed * speedMultiplier * Math.sin(angleRad)
    };
    cueBall.stopped = false;

    this.animate();
  }


  private animate(): void {

    let allStopped = true;

    this.balls.forEach(ball => {
      if (ball.stopped) return;
  
      // Apply friction
      ball.velocity.x *= this.friction;
      ball.velocity.y *= this.friction;
      ball.position.x += ball.velocity.x;
      ball.position.y += ball.velocity.y;
  
      // Boundary collision detection (inner edges)
      const energyLoss = 0.8;
      const innerWidth = this.tableRect.width - 2 * this.borderWidth;
      const innerHeight = this.tableRect.height - 2 * this.borderWidth;
  
      // Left boundary (inner)
      if (ball.position.x <= this.borderWidth) {
        ball.position.x = this.borderWidth;
        ball.velocity.x = -ball.velocity.x * energyLoss;
      }
      // Right boundary (inner)
      else if (ball.position.x + ball.width >= innerWidth + this.borderWidth) {
        ball.position.x = innerWidth + this.borderWidth - ball.width;
        ball.velocity.x = -ball.velocity.x * energyLoss;
      }
  
      // Top boundary (inner)
      if (ball.position.y <= this.borderWidth) {
        ball.position.y = this.borderWidth;
        ball.velocity.y = -ball.velocity.y * energyLoss;
      }
      // Bottom boundary (inner)
      else if (ball.position.y + ball.height >= innerHeight + this.borderWidth) {
        ball.position.y = innerHeight + this.borderWidth - ball.height;
        ball.velocity.y = -ball.velocity.y * energyLoss;
      }
  
      // Check if the ball has stopped
      if (Math.abs(ball.velocity.x) < 0.1 && Math.abs(ball.velocity.y) < 0.1) {
        ball.stopped = true;
      } else {
        allStopped = false;
      }
    });
  
    this.resolveCollisions(); // Handle ball-to-ball collisions
  
    this.balls.forEach(ball => {
      this.updateBallPosition(ball);
    });
  
    if (allStopped) {
      this.checkZone(this.balls[2]); // Check final position
      return;
    }
  
    this.animationFrameId = requestAnimationFrame(() => this.animate());
  }


  private resolveCollisions(): void {
    for (let i = 0; i < this.balls.length; i++) {
      for (let j = i + 1; j < this.balls.length; j++) {
        const ball1 = this.balls[i];
        const ball2 = this.balls[j];
  
        // Calculate distance between ball centers
        const dx = (ball2.position.x + ball2.width / 2) - (ball1.position.x + ball1.width / 2);
        const dy = (ball2.position.y + ball2.height / 2) - (ball1.position.y + ball1.height / 2);
        const distance = Math.sqrt(dx * dx + dy * dy);
        const minDistance = (ball1.width + ball2.width) / 2;
  
        // Check if balls are colliding
        if (distance < minDistance) {
          // Normalize collision vector
          const nx = dx / distance;
          const ny = dy / distance;
  
          // Calculate impulse (elastic collision)
          const cor = 0.95; // Coefficient of restitution (bounciness)
          const impulse = (2 * (ball1.velocity.x * nx + ball1.velocity.y * ny - ball2.velocity.x * nx - ball2.velocity.y * ny)) / 2;
  
          // Apply impulse
          ball1.velocity.x -= impulse * nx * cor;
          ball1.velocity.y -= impulse * ny * cor;
          ball2.velocity.x += impulse * nx * cor;
          ball2.velocity.y += impulse * ny * cor;
  
          // Separate overlapping balls
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
      const zoneCenterX = zoneRect.left + zoneRect.width / 2;
      const zoneCenterY = zoneRect.top + zoneRect.height / 2;
      const ballCenterX = ballRect.left + ballRect.width / 2;
      const ballCenterY = ballRect.top + ballRect.height / 2;
      const dx = ballCenterX - zoneCenterX;
      const dy = ballCenterY - zoneCenterY;
      const distance = Math.sqrt(dx * dx + dy * dy);
  
      if (distance >= zone.innerRadius && distance <= zone.outerRadius) {
        result = zone;
      }
    });
  
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
  private maxLength: number = 600;
  private isAimLocked: boolean = false;
  
  constructor(props: AimingSystemProps) {
    this.ball = props.ball;
    this.aimLine = props.aimLine;
    this.table = props.table;
    
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.table.addEventListener('mousemove', this.handleMouseMove.bind(this));
    this.table.addEventListener('click', this.handleClick.bind(this));
    this.table.addEventListener('touchstart', this.handleTouchStart.bind(this));
    this.table.addEventListener('touchmove', this.handleTouchMove.bind(this));
    this.table.addEventListener('touchend', this.handleTouchEnd.bind(this));
  }
  

  private handleTouchStart(event: TouchEvent): void {
    event.preventDefault();
    if (this.isAimLocked) return;
    this.handleTouchMove(event);
  }

  private handleTouchMove(event: TouchEvent): void {
    event.preventDefault();
    if (this.isAimLocked) return;
    
    const touch = event.touches[0];
    this.updateAimLine({
      clientX: touch.clientX,
      clientY: touch.clientY,
    } as MouseEvent);
  }

  private handleTouchEnd(event: TouchEvent): void {
    event.preventDefault();
    this.lockAim();
  }

  private handleMouseMove(event: MouseEvent): void {
    if (this.isAimLocked) return;
    
    this.updateAimLine(event);
  }
  
  private handleClick(event: MouseEvent): void {
    event.preventDefault();
    this.lockAim();
  }
  
  public lockAim(): void {
    this.isAimLocked = true;
    this.aimLine.classList.add('locked');
  }
  
  public unlockAim(): void {
    this.isAimLocked = false;
    this.aimLine.classList.remove('locked');
  }
  
  public isLocked(): boolean {
    return this.isAimLocked;
  }


  private updateAimLine(event: MouseEvent): void {
    const ballRect = this.ball.getBoundingClientRect(); // Get viewport position
    const ballCenterX = ballRect.left + ballRect.width / 2;
    const ballCenterY = ballRect.top + ballRect.height / 2;
    
    const mouseX = event.clientX;
    const mouseY = event.clientY;
  
    const dx = mouseX - ballCenterX;
    const dy = mouseY - ballCenterY;
    this.angle = Math.atan2(dy, dx) * 180 / Math.PI;
  
    const length = Math.sqrt(dx * dx + dy * dy) + 100;
  
    this.aimLine.style.width = `${length}px`;
    this.aimLine.style.left = `${ballCenterX}px`;
    this.aimLine.style.top = `${ballCenterY}px`;
    this.aimLine.style.transform = `rotate(${this.angle}deg)`;
    this.aimLine.style.transformOrigin = 'left center';
  }

  public getAngle(): number {
    return this.angle;
  }
  
  public reset(): void {
    this.unlockAim();
  }
}