
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
  const whiteZoneRef = useRef<HTMLDivElement>(null);
  
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
        // Order is important: largest to smallest for proper stacking
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
            name: 'Golden Zone',
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
      
      if (aiming) {
        aiming.reset();
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
      
      // Reset aiming after shooting
      setTimeout(() => {
        if (aiming) {
          aiming.reset();
        }
      }, 100);
    }
  }, [shootTrigger, physics, aiming, power, onShootComplete]);

  return (
    <div className="billiard-table">
      <div className="vignette-overlay">
      <div className="billiard-inner" ref={tableRef} >
        <div className="billiard-border"></div>
        <div ref={whiteZoneRef} className="target-zone absolute rounded-full" style={{ width: '300px', height: '300px', backgroundColor: 'rgba(255, 255, 255, 0.7)' }}></div>
        <div ref={blueZoneRef} className="target-zone absolute rounded-full" style={{ width: '180px', height: '180px', backgroundColor: 'rgba(0, 119, 182, 0.7)' }}></div>
        <div ref={redZoneRef} className="target-zone absolute rounded-full" style={{ width: '120px', height: '120px', backgroundColor: 'rgba(214, 40, 40, 0.7)' }}></div>
        <div ref={goldZoneRef} className="target-zone absolute rounded-full" style={{ width: '50px', height: '50px', backgroundColor: 'rgba(255, 215, 0, 0.7)' }}></div>
        {/* <div ref={ballRef} className="ball absolute" style={{  background-image: url("/public/transparentbgball.png"), width: '30px', height: '30px', borderRadius: '50%' }}></div> */}
            <div
            ref={ballRef}
            className="absolute bg-transparent"
            style={{
              backgroundImage: `url("/cueball.png")`, // ✅ Notice: no "/public"
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center center',
              backgroundSize: 'contain', // Optional: ensures it fills the div
              backgroundColor: 'transparent',
              width: '50px',
              height: '50px',
              borderRadius: '50%',
            }}
          ></div>

        <div ref={ball2Ref} className="absolute bg-transparent"  style={{
              backgroundImage: `url("/redpoolball.png")`, // ✅ Notice: no "/public"
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center center',
              backgroundSize: 'cover', // Optional: ensures it fills the div
              backgroundColor: 'transparent',
              width: '60px',
              height: '60px',
              borderRadius: '50%',
            }}></div>
        <div ref={ball3Ref} className="absolute bg-transparent"  style={{
              backgroundImage: `url("/transparentbgball.png")`, // ✅ Notice: no "/public"
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center center',
              backgroundSize: 'cover', // Optional: ensures it fills the div
              backgroundColor: 'transparent',
              width: '60px',
              height: '60px',
              borderRadius: '50%',
            }}></div>
        <div ref={aimLineRef} className="aim-line absolute"  style={{
              backgroundImage: `url("/stick.png")`, // ✅ Notice: no "/public"
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center center',
              backgroundSize: 'cover', // Optional: ensures it fills the div
              backgroundColor: 'transparent',
              width: '60px',
              height: '6px',
            }}></div>
      </div>
      </div>
    </div>
  );
};

export default BilliardTable;
