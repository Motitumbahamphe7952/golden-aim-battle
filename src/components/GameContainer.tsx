
import React, { useState, useRef } from 'react';
import BilliardTable from './BilliardTable';
import Controls from './Controls';
import { useIsMobile } from '@/hooks/use-mobile';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const GameContainer: React.FC = () => {
  const [shootTrigger, setShootTrigger] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [result, setResult] = useState<{ discount: number; name: string; color: string } | null>(null);
  const [showResult, setShowResult] = useState<boolean>(false);
  const [power, setPower] = useState<number>(5);
  const [gameKey, setGameKey] = useState<number>(0); // Key to force component re-render for reset
  const isMobile = useIsMobile();
  
  const handleShoot = (selectedPower: number) => {
    setPower(selectedPower);
    setShootTrigger(true);
    setIsPlaying(true);
  };
  
  const handleShootComplete = () => {
    setShootTrigger(false);
  };
  
  const getZone = (result: { discount: number; name: string; color: string }) => {
    if (result.discount === 20) {
      return { discount: 20, name: 'Blue Zone', color: 'blue' };
    } else if (result.discount === 30) {
      return { discount: 30, name: 'Red Zone', color: 'red' };
    } else if (result.discount === 40) {
      return { discount: 40, name: 'Golden Zone', color: 'golden' };
    } else {
      return { discount: 0, name: 'No Zone', color: 'gray' };
    }
  };
  
  const handleBallStop = (result: { discount: number ; name: string; color: string }) => {
    const zone = getZone(result); // Get the zone that the ball landed on
    setResult({ discount: zone.discount, name: zone.name, color: zone.color });
    setShowResult(true);
    setIsPlaying(false);
  };
  
  const resetGame = () => {
    setShowResult(false);
    setGameKey(prevKey => prevKey + 1); // Force component re-render to reset positions
  };
  
  return (
    <div className="w-full mx-auto px-2 animate-fade-in max-w-full sm:max-w-4xl">
      <style jsx>{`
        .aim-line.locked {
          background-color: rgba(255, 0, 0, 0.8);
          height: 3px;
          box-shadow: 0 0 5px rgba(255, 0, 0, 0.8);
        }
      `}</style>
      
      <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} gap-4`}>
        <div className={`${isMobile ? 'w-full h-[60vh]' : 'w-3/4'}`}>
          <BilliardTable 
            key={gameKey} // Force re-render when key changes
            onBallStop={handleBallStop}
            power={power}
            shootTrigger={shootTrigger}
            onShootComplete={handleShootComplete}
          />
        </div>
        
        <div className={`${isMobile ? 'w-full' : 'w-1/4 self-center'}`}>
          <Controls 
            onShoot={handleShoot}
            disabled={isPlaying}
            isMobile={isMobile}
          />
        </div>
      </div>
      
      <div className="text-center mt-4 text-sm text-gray-300">
        <p>Shoot the red ball. Balls will only move when hit - the green ball determines your final reward!</p>
        <p className="mt-1">Click on the table to lock your aim.</p>
      </div>
      
      <Dialog open={showResult} onOpenChange={setShowResult}>
        <DialogContent className="sm:max-w-md animate-scale-in">
          <DialogHeader>
            <DialogTitle className="text-2xl text-center">
              {result?.discount > 0 ? `${result.discount}% Discount!` : 'No Discount'}
            </DialogTitle>
            <DialogDescription className="text-center">
              Your green ball landed in the {result?.name}!
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center mt-4">
            <Button onClick={resetGame} className="px-8">Play Again</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GameContainer;
