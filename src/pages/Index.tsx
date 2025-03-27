
import React from 'react';
import GameContainer from '@/components/GameContainer';

const Index: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#1a1a2e] to-[#16213e] text-white">
      <header className="py-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-2">Golden Shot</h1>
        <p className="text-lg text-gray-300 max-w-md mx-auto">Aim precisely to hit the target zones and win amazing discounts</p>
      </header>
      
      <main className="flex-1 flex items-center justify-center py-8">
        <GameContainer />
      </main>
      
      <footer className="py-6 text-center text-sm text-gray-400">
        <p>Shoot the ball into golden zone for maximum discount</p>
      </footer>
    </div>
  );
};

export default Index;
