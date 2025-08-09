
import React from 'react';
import { Difficulty } from '../types';

interface HeaderProps {
    level: number;
    difficulty: Difficulty;
}

const Header: React.FC<HeaderProps> = ({ level, difficulty }) => {
  return (
    <header className="text-center py-4 rounded-lg bg-gray-800/50 shadow-lg">
      <div className="border-b-4 border-cyan-600 pb-4 mb-4 mx-4">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            <span className="text-cyan-400">Hare</span> 
            <span className="text-gray-400">&</span> 
            <span className="text-yellow-300">Hounds</span>
            <span className="text-red-500 ml-3 text-3xl">AI</span>
          </h1>
          <p className="mt-2 text-lg text-gray-300">The classic strategy game, reimagined ✨</p>
      </div>
       <nav>
        <ul className="flex justify-center items-center flex-wrap gap-x-4 sm:gap-x-8 gap-y-2 px-4 text-sm sm:text-base text-gray-300">
          <li><a href="#" className="hover:text-cyan-400 transition-colors duration-200">About Us</a></li>
          <li><a href="#" className="hover:text-cyan-400 transition-colors duration-200">Contact</a></li>
          <li><a href="#" className="hover:text-cyan-400 transition-colors duration-200">Privacy Policy</a></li>
          <li><a href="#" className="hover:text-cyan-400 transition-colors duration-200">DMCA</a></li>
          <li><a href="#" className="hover:text-cyan-400 transition-colors duration-200">Terms & Conditions</a></li>
           <li>
            <a 
              href="https://t.me/ispawoo" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-block px-5 py-2 bg-green-600 text-white font-bold rounded-lg shadow-md hover:bg-green-700 active:bg-green-800 transform hover:-translate-y-0.5 transition-all duration-200 ease-in-out"
            >
              Contact Developer
            </a>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
