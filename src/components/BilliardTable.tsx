
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

      if (goldZoneRef.current && redZoneRef.current && blueZoneRef.current && whiteZoneRef.current) {
        const zones: Zone[] = [
          { 
            element: whiteZoneRef.current, 
            discount: 5, 
            name: 'White Zone',
            color: 'white',
            innerRadius: blueZoneRef.current.offsetWidth / 2,
            outerRadius: whiteZoneRef.current.offsetWidth / 2
          },
          { 
            element: blueZoneRef.current, 
            discount: 10, 
            name: 'Blue Zone',
            color: 'blue',
            innerRadius: redZoneRef.current.offsetWidth / 2,
            outerRadius: blueZoneRef.current.offsetWidth / 2
          },
          { 
            element: redZoneRef.current, 
            discount: 20, 
            name: 'Red Zone',
            color: 'red',
            innerRadius: goldZoneRef.current.offsetWidth / 2,
            outerRadius: redZoneRef.current.offsetWidth / 2
          },
          { 
            element: goldZoneRef.current, 
            discount: 50, 
            name: 'Golden Zone',
            color: 'gold',
            innerRadius: 0,
            outerRadius: goldZoneRef.current.offsetWidth / 2
          },  
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
        <div className="billiard-border "></div>
              {/* 🎯 Zones Container - All zones stacked */}
          <div className="zones-container">
          <div
            ref={whiteZoneRef}
            className="target-zone"
            style={{
              width: window.innerWidth < 768 ? '150px' : '300px',
              height: window.innerWidth < 768 ? '150px' : '300px',
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              zIndex: 1
            }}
          />
          <div
            ref={blueZoneRef}
            className="target-zone"
            style={{
              width: window.innerWidth < 768 ? '90px' : '180px',
              height: window.innerWidth < 768 ? '90px' : '180px',
              backgroundColor: 'rgba(0, 119, 182, 0.7)',
              zIndex: 2
            }}
          />
          <div
            ref={redZoneRef}
            className="target-zone"
            style={{
              width: window.innerWidth < 768 ? '50px' : '120px',
              height: window.innerWidth < 768 ? '50px' : '120px',
              backgroundColor: 'rgba(214, 40, 40, 0.7)',
              zIndex: 3
            }}
          />
          <div
            ref={goldZoneRef}
            className="target-zone"
            style={{
              width: window.innerWidth < 768 ? '20px' : '50px',
              height: window.innerWidth < 768 ? '20px' : '50px',
              backgroundColor: 'rgba(255, 215, 0, 0.7)',
              zIndex: 4
            }}
          />
        </div>

            <div
            ref={ballRef}
            className="absolute bg-transparent"
            style={{
              backgroundImage: `url("/cueball.png")`, // ✅ Notice: no "/public"
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center center',
              backgroundSize: 'contain', // Optional: ensures it fills the div
              backgroundColor: 'transparent',
              width: window.innerWidth < 768 ? '20px' : '50px',
              height: window.innerWidth < 768 ? '20px' : '50px',
              borderRadius: '50%',
              zIndex: 5 // Ensure the cue ball is on top of the zones
            }}
          ></div>

        <div ref={ball2Ref} className="absolute bg-transparent"  style={{
              backgroundImage: `url("/redpoolball.png")`, // ✅ Notice: no "/public"
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center center',
              backgroundSize: 'cover', // Optional: ensures it fills the div
              backgroundColor: 'transparent',
              width: window.innerWidth < 768 ? '20px' : '60px',
            height: window.innerWidth < 768 ? '20px' : '60px',
              borderRadius: '50%',
              zIndex: 5 // Ensure the red ball is on top of the zones
            }}></div>
        <div ref={ball3Ref} className="absolute bg-transparent"  style={{
              backgroundImage: `url("/transparentbgball.png")`, // ✅ Notice: no "/public"
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center center',
              backgroundSize: 'cover', // Optional: ensures it fills the div
              backgroundColor: 'transparent',
              width: window.innerWidth < 768 ? '20px' : '60px',
              height: window.innerWidth < 768 ? '20px' : '60px',
              borderRadius: '50%',
              zIndex: 5 // Ensure the red ball is on top of the zones
            }}></div>
        <div ref={aimLineRef} className="aim-line  absolute"  style={{
              backgroundImage: `url("/poolstick3d.png")`, 
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center center',
              backgroundSize: 'contain', // Optional: ensures it fills the div
              backgroundColor: 'transparent',
              width: window.innerWidth < 768 ? '300px' : '120px',
              height: '10px',
              zIndex: 5 // Ensure the aim line is on top of the zones
            }}></div>
      </div>
      </div>
    </div>
  );
};

export default BilliardTable;
