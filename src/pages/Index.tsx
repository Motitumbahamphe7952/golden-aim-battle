
import React from 'react';
import GameContainer from '@/components/GameContainer';
import { useIsMobile } from '@/hooks/use-mobile';

const Index: React.FC = () => {
  const isMobile = useIsMobile();

  return (
    <div className={`w-screen h-screen flex flex-col  overflow-hidden bg-gradient-to-b from-[#1a1a2e] to-[#16213e] text-white ${isMobile ? 'p-0 overflow-hidden' : ''}`}>
      <header className="py-4 sm:py-8 text-center mobile-hide">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-1 sm:mb-2">Lucky Shot</h1>
        <p className="text-base sm:text-lg text-gray-300 max-w-md mx-auto">Aim precisely to hit the target zones and win amazing discounts</p>
      </header>
      
      {/* <main className={`flex-grow items-center justify-center  ${isMobile ? 'p-0 w-full h-full' : 'py-4 sm:py-8'}`}>
        <GameContainer/>
      </main> */}
      <main className={`flex flex-grow items-center justify-center ${isMobile ? 'p-0 w-full h-full' : 'py-4 sm:py-8'}`}>
        <GameContainer />
      </main>

      
      <footer className="py-3 sm:py-6 text-center text-sm text-gray-400 mobile-hide">
        <p>Shoot the ball into golden zone for maximum discount</p>
      </footer>
    </div>
  );
};

export default Index;
