
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

interface ControlsProps {
  onShoot: (power: number) => void;
  disabled: boolean;
  isMobile?: boolean;
}

const Controls: React.FC<ControlsProps> = ({ onShoot, disabled, isMobile = false }) => {
  const [power, setPower] = useState<number>(5);
  
  const handlePowerChange = (values: number[]) => {
    setPower(values[0]);
  };
  
  const handleShoot = () => {
    onShoot(power);
  };
  
  return (
    <div className={`controls-container ${isMobile ? 'flex-col' : 'flex-col'}`}>
      <div className={`slider-container ${isMobile ? 'w-full' : 'w-full'}`}>
        <div className="flex items-center justify-between gap-4 w-full">
          <span className="text-sm font-medium text-white opacity-80">Power</span>
          <Slider
            value={[power]}
            min={1}
            max={10}
            step={1}
            onValueChange={handlePowerChange}
            disabled={disabled}
            className="w-full"
            orientation={isMobile ? "horizontal" : "horizontal"}
          />
          <span className="min-w-[30px] text-center text-white font-medium">{power}</span>
        </div>
      </div>
      
      <Button
        onClick={handleShoot}
        disabled={disabled}
        className="bg-primary hover:bg-primary/90 transition-all duration-300 ease-out px-8 py-2 text-white rounded-full w-full sm:w-auto mt-4"
      >
        SHOOT
      </Button>
    </div>
  );
};

export default Controls;
