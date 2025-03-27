
import React from 'react';
import GameContainer from '@/components/GameContainer';
import { useIsMobile } from '@/hooks/use-mobile';

const Index: React.FC = () => {
  const isMobile = useIsMobile();
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#1a1a2e] to-[#16213e] text-white">
      {!isMobile && (
        <header className="py-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight mb-2">Golden Shot</h1>
          <p className="text-lg text-gray-300 max-w-md mx-auto">Aim precisely to hit the target zones</p>
        </header>
      )}
      
      {isMobile && (
        <header className="py-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight">Golden Shot</h1>
        </header>
      )}
      
      <main className="flex-1 flex items-center justify-center py-2">
        <GameContainer />
      </main>
      
      {!isMobile && (
        <footer className="py-6 text-center text-sm text-gray-400">
          <p>Shoot the ball into golden zone for maximum discount</p>
        </footer>
      )}
    </div>
  );
};

export default Index;
