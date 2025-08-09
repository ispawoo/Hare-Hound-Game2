import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="w-full text-center p-6 mt-auto text-gray-500">
      <p>
        Designed with ❤️ by: 
        <a 
          href="https://instagram.com/the.ispawoo" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-cyan-400 hover:text-cyan-300 font-semibold ml-1 transition-colors duration-200"
        >
          Yasir Ispawoo
        </a>
      </p>
    </footer>
  );
};

export default Footer;
