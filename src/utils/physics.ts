
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
  private horizontalOffset: number = 30; // Spacing between balls

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
    // Cancel any ongoing animation
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    
    this.updateTableRect();
    
    // Get table dimensions
    const tableWidth = this.tableRect.width;
    const tableHeight = this.tableRect.height;
    
    // Set random positions for all balls ensuring they don't overlap
    const padding = 50; // Space from edges
    const minDistance = 70; // Minimum distance between balls
    
    const ballPositions: Position[] = [];
    
    this.balls.forEach((ball, index) => {
      let validPosition = false;
      let attempts = 0;
      let newPos: Position;
      
      // Try to find a non-overlapping position
      while (!validPosition && attempts < 50) {
        newPos = {
          x: padding + Math.random() * (tableWidth - padding * 2 - ball.width),
          y: padding + Math.random() * (tableHeight - padding * 2 - ball.height)
        };
        
        // Check if this position overlaps with any existing balls
        let overlaps = false;
        for (let i = 0; i < ballPositions.length; i++) {
          const dx = newPos.x - ballPositions[i].x;
          const dy = newPos.y - ballPositions[i].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < minDistance) {
            overlaps = true;
            break;
          }
        }
        
        if (!overlaps) {
          validPosition = true;
          ballPositions.push(newPos);
          ball.position = newPos;
        }
        
        attempts++;
      }
      
      // If we couldn't find a non-overlapping position, just place it somewhere
      if (!validPosition) {
        ball.position = {
          x: padding + (tableWidth - padding * 2 - ball.width) * (index + 1) / (this.balls.length + 1),
          y: padding + (tableHeight - padding * 2 - ball.height) * (index + 1) / (this.balls.length + 1)
        };
        ballPositions.push(ball.position);
      }
      
      // Reset velocity
      ball.velocity = { x: 0, y: 0 };
      ball.stopped = true;
      
      // Update ball position
      this.updateBallPosition(ball);
    });
    
    // Randomize zone positions
    this.randomizeZones();
  }
  
  private randomizeZones(): void {
    if (!this.zones.length) return;
    
    const tableWidth = this.tableRect.width;
    const tableHeight = this.tableRect.height;
    
    // Try to position zones in the center area
    const centerX = tableWidth / 2;
    const centerY = tableHeight / 2;
    
    this.zones.forEach((zone, index) => {
      const zoneSize = parseFloat(zone.element.style.width);
      const halfSize = zoneSize / 2;
      
      // The largest zone (index 0 - blue) should be in the center
      // Medium zone (index 1 - red) in a random position around center
      // Smallest zone (index 2 - gold) in a random position around center
      let x, y;
      
      if (index === 0) {
        // Center the largest zone
        x = centerX - halfSize;
        y = centerY - halfSize;
      } else {
        // Place other zones at random offsets from center
        const maxOffset = Math.min(tableWidth, tableHeight) * 0.2;
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * maxOffset;
        
        x = centerX + Math.cos(angle) * distance - halfSize;
        y = centerY + Math.sin(angle) * distance - halfSize;
        
        // Ensure zones stay within bounds
        x = Math.max(0, Math.min(x, tableWidth - zoneSize));
        y = Math.max(0, Math.min(y, tableHeight - zoneSize));
      }
      
      zone.element.style.left = `${x}px`;
      zone.element.style.top = `${y}px`;
    });
  }

  public shoot(angle: number, power: number): void {
    // Cancel any ongoing animation
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
    
    // Convert angle to radians
    const angleRad = angle * Math.PI / 180;
    
    // Calculate initial velocity based on power
    const baseSpeed = this.tableRect.width * 0.05;
    const speedMultiplier = power / 8; // Normalize power
    
    // Only set velocity for the first ball (red ball)
    const cueBall = this.balls[0];
    cueBall.velocity = {
      x: -baseSpeed * speedMultiplier * Math.cos(angleRad),
      y: -baseSpeed * speedMultiplier * Math.sin(angleRad)
    };
    cueBall.stopped = false;
    
    // Make sure other balls are initially stopped
    for (let i = 1; i < this.balls.length; i++) {
      this.balls[i].velocity = { x: 0, y: 0 };
      this.balls[i].stopped = true;
    }

    // Start animation
    this.animate();
  }

  private animate(): void {
    let allStopped = true;
    
    // Update each ball independently
    this.balls.forEach(ball => {
      if (ball.stopped) return;
      
      // Apply friction
      ball.velocity.x *= this.friction;
      ball.velocity.y *= this.friction;

      // Update position
      ball.position.x += ball.velocity.x;
      ball.position.y += ball.velocity.y;

      // Wall collisions with energy loss
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

      // Simple collision detection with other balls
      this.balls.forEach(otherBall => {
        if (ball === otherBall) return;

        const dx = ball.position.x - otherBall.position.x;
        const dy = ball.position.y - otherBall.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const minDistance = (ball.width + otherBall.width) / 2;

        if (distance < minDistance) {
          // Calculate collision response
          const angle = Math.atan2(dy, dx);
          const sin = Math.sin(angle);
          const cos = Math.cos(angle);

          // Rotate ball velocities
          const vx1 = ball.velocity.x * cos + ball.velocity.y * sin;
          const vy1 = ball.velocity.y * cos - ball.velocity.x * sin;
          const vx2 = otherBall.velocity.x * cos + otherBall.velocity.y * sin;
          const vy2 = otherBall.velocity.y * cos - otherBall.velocity.x * sin;

          // Swap the x velocities
          const temp = vx1;
          
          // Update ball velocities
          ball.velocity.x = (vx2 * cos - vy1 * sin) * 0.9; // Reduce energy a bit
          ball.velocity.y = (vy1 * cos + vx2 * sin) * 0.9;
          
          // Only update the other ball's velocity if it was stationary
          if (otherBall.stopped) {
            otherBall.stopped = false;
          }
          
          otherBall.velocity.x = (temp * cos - vy2 * sin) * 0.9;
          otherBall.velocity.y = (vy2 * cos + temp * sin) * 0.9;

          // Move balls apart to prevent sticking
          const overlap = minDistance - distance;
          ball.position.x += overlap * cos * 0.5;
          ball.position.y += overlap * sin * 0.5;
          otherBall.position.x -= overlap * cos * 0.5;
          otherBall.position.y -= overlap * sin * 0.5;
        }
      });

      // Update ball position
      this.updateBallPosition(ball);

      // Check if ball has nearly stopped
      if (Math.abs(ball.velocity.x) < 0.1 && Math.abs(ball.velocity.y) < 0.1) {
        ball.stopped = true;
        ball.velocity.x = 0;
        ball.velocity.y = 0;
      } else {
        allStopped = false;
      }
    });

    // If all balls have stopped
    if (allStopped) {
      // Get results from the last ball (index 2)
      this.checkZone(this.balls[2]);
      return;
    }

    // Continue animation
    this.animationFrameId = requestAnimationFrame(() => this.animate());
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
