
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useIsMobile } from '@/hooks/use-mobile';

interface ControlsProps {
  onShoot: (power: number) => void;
  disabled: boolean;
}

const Controls: React.FC<ControlsProps> = ({ onShoot, disabled }) => {
  const [power, setPower] = useState<number>(5);
  const isMobile = useIsMobile();
  
  const handlePowerChange = (values: number[]) => {
    setPower(values[0]);
  };
  
  const handleShoot = () => {
    onShoot(power);
  };
  
  return (
    <div className="controls-container">
      <div className="slider-container">
        <div className="flex items-center justify-between gap-4 w-full">
          <span className="text-sm font-medium text-white opacity-80">Power</span>
          <Slider
            value={[power]}
            min={1}
            max={10}
            step={1}
            onValueChange={handlePowerChange}
            disabled={disabled}
            className={`w-full ${isMobile ? 'max-w-[150px]' : 'sm:w-[200px]'}`}
          />
          <span className="min-w-[30px] text-center text-white font-medium">{power}</span>
        </div>
      </div>
      
      <Button
        onClick={handleShoot}
        disabled={disabled}
        className="bg-primary hover:bg-primary/90 transition-all duration-300 ease-out px-8 py-2 text-white rounded-full"
      >
        SHOOT
      </Button>
    </div>
  );
};

export default Controls;
