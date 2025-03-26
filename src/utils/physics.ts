
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
  ball: HTMLElement;
  table: HTMLElement;
  onBallStop: (result: { discount: number; name: string; color: string }) => void;
}

export class BallPhysics {
  private ball: HTMLElement;
  private table: HTMLElement;
  private tableRect: DOMRect;
  private ballWidth: number;
  private ballHeight: number;
  private position: Position;
  private velocity: Velocity;
  private friction: number;
  private zones: Zone[];
  private onBallStop: (result: { discount: number; name: string; color: string }) => void;
  private animationFrameId: number | null = null;

  constructor(props: BallPhysicsProps) {
    this.ball = props.ball;
    this.table = props.table;
    this.tableRect = this.table.getBoundingClientRect();
    this.ballWidth = this.ball.offsetWidth;
    this.ballHeight = this.ball.offsetHeight;
    this.position = { x: 0, y: 0 };
    this.velocity = { x: 0, y: 0 };
    this.friction = 0.98;
    this.onBallStop = props.onBallStop;
    this.zones = [];
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
    
    // Position ball at the left side of the table (20% from left)
    const tableWidth = this.tableRect.width;
    const tableHeight = this.tableRect.height;
    
    this.position = { 
      x: tableWidth * 0.2 - this.ballWidth / 2, 
      y: tableHeight / 2 - this.ballHeight / 2
    };
    
    // Reset velocity
    this.velocity = { x: 0, y: 0 };
    
    // Update ball position
    this.updateBallPosition();
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
    
    // Set initial velocity
    this.velocity = {
      x: -baseSpeed * speedMultiplier * Math.cos(angleRad),
      y: -baseSpeed * speedMultiplier * Math.sin(angleRad)
    };

    // Start animation
    this.animate();
  }

  private animate(): void {
    // Apply friction
    this.velocity.x *= this.friction;
    this.velocity.y *= this.friction;

    // Update position
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    // Wall collisions with energy loss
    const energyLoss = 0.8;
    if (this.position.x <= 0) {
      this.position.x = 0;
      this.velocity.x = Math.abs(this.velocity.x) * energyLoss;
    } else if (this.position.x >= this.tableRect.width - this.ballWidth) {
      this.position.x = this.tableRect.width - this.ballWidth;
      this.velocity.x = -Math.abs(this.velocity.x) * energyLoss;
    }

    if (this.position.y <= 0) {
      this.position.y = 0;
      this.velocity.y = Math.abs(this.velocity.y) * energyLoss;
    } else if (this.position.y >= this.tableRect.height - this.ballHeight) {
      this.position.y = this.tableRect.height - this.ballHeight;
      this.velocity.y = -Math.abs(this.velocity.y) * energyLoss;
    }

    // Update ball position
    this.updateBallPosition();

    // Check if ball has nearly stopped
    if (Math.abs(this.velocity.x) < 0.1 && Math.abs(this.velocity.y) < 0.1) {
      this.checkZone();
      return;
    }

    // Continue animation
    this.animationFrameId = requestAnimationFrame(() => this.animate());
  }

  private updateBallPosition(): void {
    this.ball.style.left = `${this.position.x}px`;
    this.ball.style.top = `${this.position.y}px`;
  }

  private checkZone(): void {
    const ballRect = this.ball.getBoundingClientRect();
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
