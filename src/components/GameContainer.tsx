
import BilliardTable from './BilliardTable';
import Controls from './Controls';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

const GameContainer: React.FC = () => {
  const [shootTrigger, setShootTrigger] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [result, setResult] = useState<{ discount: number; name: string; color: string } | null>(null);
  const [showResult, setShowResult] = useState<boolean>(false);
  const [power, setPower] = useState<number>(5);
  const [gameKey, setGameKey] = useState<number>(0);
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
    if (result.discount === 5) {
      return { discount: 5, name: 'White Zone', color: 'white' };
    } else if (result.discount === 10) {
      return { discount: 10, name: 'Blue Zone', color: 'blue' };
    } else if (result.discount === 20) {
      return { discount: 20, name: 'Red Zone', color: 'red' };
    } else if (result.discount === 50){
      return { discount: 50, name: 'Golden Zone', color: 'golden' };
    } else {
      return { discount: 0, name: 'No Zone', color: 'gray' };
    }
  };

  const handleBallStop = (result: { discount: number ; name: string; color: string }) => {
    const zone = getZone(result);
    setResult({ discount: zone.discount, name: zone.name, color: zone.color });
    setShowResult(true);
    setIsPlaying(false);
  };

  const resetGame = () => {
    setShowResult(false);
    setGameKey(prevKey => prevKey + 1);
  };

  const handleDoubleClick = () => {
    if (!isPlaying) {
      handleShoot(power);
    }
  };

  return (
    <div>
    <div className={`${isMobile ? 'w-full h-full relative' : 'max-w-4xl w-full mx-auto px-2 sm:px-4'} animate-fade-in flex flex-col items-center`}>
      <div className="w-full h-full" onDoubleClick={handleDoubleClick}>
        <BilliardTable
          key={gameKey}
          onBallStop={handleBallStop}
          power={power}
          shootTrigger={shootTrigger}
          onShootComplete={handleShootComplete}
        />
      </div>
     

      <div className="text-center mt-4 text-sm text-gray-300 mobile-hide">
        <p>Shoot the red ball. Balls will only move when hit - the green ball determines your final reward!</p>
        <p className="mt-1">Click on the table to lock your aim. Double tap to shoot on mobile.</p>
      </div>

      <Dialog open={showResult} onOpenChange={setShowResult}>
        <DialogContent className="sm:max-w-md animate-scale-in">
          <DialogHeader>
            <DialogTitle className="text-2xl text-center">
              {result?.discount > 0 ? `${result.discount}% Discount!` : 'No Discount'}
            </DialogTitle>
            <DialogDescription className="text-center">
              Your yellow ball landed in the {result?.name}!
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center mt-4">
            <Button onClick={resetGame} className="px-8">Play Again</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
    <div className={`${isMobile ? 'absolute bottom-4 w-full px-4' : 'w-full sm:w-auto px-4 mt-2 sm:mt-6'}`}>
        <Controls
          onShoot={handleShoot}
          disabled={isPlaying}
        />
      </div>
    </div>
  );
};

export default GameContainer;
