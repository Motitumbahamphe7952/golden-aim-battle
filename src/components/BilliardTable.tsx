
import React, { useRef, useEffect, useState } from 'react';
import { AimingSystem, BallPhysics, Zone } from '../utils/physics';

interface BilliardTableProps {
  onBallStop: (result: { discount: number; name: string; color: string }) => void;
  power: number;
  shootTrigger: boolean;
  onShootComplete: () => void;
}

const BilliardTable: React.FC<BilliardTableProps> = ({ 
  onBallStop, 
  power, 
  shootTrigger,
  onShootComplete
}) => {
  const tableRef = useRef<HTMLDivElement>(null);
  const ballRef = useRef<HTMLDivElement>(null);
  const ball2Ref = useRef<HTMLDivElement>(null);
  const ball3Ref = useRef<HTMLDivElement>(null);
  const aimLineRef = useRef<HTMLDivElement>(null);
  const goldZoneRef = useRef<HTMLDivElement>(null);
  const redZoneRef = useRef<HTMLDivElement>(null);
  const blueZoneRef = useRef<HTMLDivElement>(null);
  
  const [physics, setPhysics] = useState<BallPhysics | null>(null);
  const [aiming, setAiming] = useState<AimingSystem | null>(null);
  
  // Initialize physics and aiming systems
  useEffect(() => {
    if (tableRef.current && ballRef.current && ball2Ref.current && ball3Ref.current && aimLineRef.current) {
      const ballElements = [ballRef.current, ball2Ref.current, ball3Ref.current];
      
      const newPhysics = new BallPhysics({
        balls: ballElements,
        table: tableRef.current,
        onBallStop
      });
      
      const newAiming = new AimingSystem({
        ball: ballRef.current,
        aimLine: aimLineRef.current,
        table: tableRef.current
      });
      
      // Set zones if refs are available
      if (goldZoneRef.current && redZoneRef.current && blueZoneRef.current) {
        const zones: Zone[] = [
          { 
            element: blueZoneRef.current, 
            discount: 20, 
            name: 'Blue Zone',
            color: 'blue'
          },
          { 
            element: redZoneRef.current, 
            discount: 30, 
            name: 'Red Zone',
            color: 'red'
          },
          { 
            element: goldZoneRef.current, 
            discount: 40, 
            name: 'Gold Zone',
            color: 'gold'
          }
        ];
        
        newPhysics.setZones(zones);
      }
      
      setPhysics(newPhysics);
      setAiming(newAiming);
      
      // Initial positioning
      newPhysics.reset();
    }
    
    // Handle window resize
    const handleResize = () => {
      if (physics) {
        physics.updateTableRect();
        physics.reset();
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [onBallStop]);
  
  // Handle shoot trigger
  useEffect(() => {
    if (shootTrigger && physics && aiming) {
      physics.shoot(aiming.getAngle(), power);
      onShootComplete();
    }
  }, [shootTrigger, physics, aiming, power, onShootComplete]);

  return (
    <div className="billiard-table">
      <div className="billiard-inner" ref={tableRef} style={{ 
            backgroundImage: `url("/cropedimage.jpg")`, 
            backgroundSize: 'contain',
            backgroundPosition: 'center',
            position: 'relative',}}>
        <div className="billiard-border"></div>
        <div ref={blueZoneRef} className="target-zone absolute rounded-full" style={{ width: '180px', height: '180px', backgroundColor: 'rgba(69, 123, 157, 0.7)' }}></div>
        <div ref={redZoneRef} className="target-zone absolute rounded-full" style={{ width: '120px', height: '120px', backgroundColor: 'rgba(230, 57, 70, 0.7)' }}></div>
        <div ref={goldZoneRef} className="target-zone absolute rounded-full" style={{ width: '70px', height: '70px', backgroundColor: 'rgba(255, 215, 0, 0.7)' }}></div>
        <div ref={ballRef} className="ball absolute" style={{ backgroundColor: 'red', width: '30px', height: '30px', borderRadius: '50%' }}></div>
        <div ref={ball2Ref} className="ball absolute" style={{ backgroundColor: 'blue', width: '30px', height: '30px', borderRadius: '50%' }}></div>
        <div ref={ball3Ref} className="ball absolute" style={{ backgroundColor: 'green', width: '30px', height: '30px', borderRadius: '50%' }}></div>
        <div ref={aimLineRef} className="aim-line absolute" style={{ height: '2px', backgroundColor: 'rgba(255, 255, 255, 0.7)', transformOrigin: 'left center' }}></div>
      </div>
    </div>
  );
};

export default BilliardTable;
