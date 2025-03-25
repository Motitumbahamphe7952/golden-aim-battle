
import React, { useState } from 'react';
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
  
  const handleShoot = (selectedPower: number) => {
    setPower(selectedPower);
    setShootTrigger(true);
    setIsPlaying(true);
  };
  
  const handleShootComplete = () => {
    setShootTrigger(false);
  };
  
  const handleBallStop = (result: { discount: number; name: string; color: string }) => {
    setResult(result);
    setShowResult(true);
    setIsPlaying(false);
  };
  
  const closeModal = () => {
    setShowResult(false);
  };
  
  return (
    <div className="max-w-4xl w-full mx-auto px-4 sm:px-6 animate-fade-in">
      <BilliardTable 
        onBallStop={handleBallStop}
        power={power}
        shootTrigger={shootTrigger}
        onShootComplete={handleShootComplete}
      />
      
      <Controls 
        onShoot={handleShoot}
        disabled={isPlaying}
      />
      
      <Dialog open={showResult} onOpenChange={closeModal}>
        <DialogContent className="sm:max-w-md animate-scale-in">
          <DialogHeader>
            <DialogTitle className="text-2xl text-center">
              {result?.discount > 0 ? `${result.discount}% Discount!` : 'No Discount'}
            </DialogTitle>
            <DialogDescription className="text-center">
              You landed in the {result?.name}!
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center mt-4">
            <Button onClick={closeModal} className="px-8">Play Again</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GameContainer;
