
import React, { useState, useRef } from 'react';
import BilliardTable from './BilliardTable';
import Controls from './Controls';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const GameContainer: React.FC = () => {
  const [shootTrigger, setShootTrigger] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [result, setResult] = useState<{ discount: number; name: string; color: string } | null>(null);
  const [showResult, setShowResult] = useState<boolean>(false);
  const [power, setPower] = useState<number>(5);
  const [gameKey, setGameKey] = useState<number>(0); // Key to force component re-render for reset
  
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
    <div className="max-w-4xl w-full mx-auto px-4 sm:px-2 animate-fade-in">
      <BilliardTable 
        key={gameKey} // Force re-render when key changes
        onBallStop={handleBallStop}
        power={power}
        shootTrigger={shootTrigger}
        onShootComplete={handleShootComplete}
      />
      
      <Controls 
        onShoot={handleShoot}
        disabled={isPlaying}
      />
      
      <div className="text-center mt-4 text-sm text-gray-300">
        <p>Shoot the red ball. Balls will only move when hit - the green ball determines your final reward!</p>
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
