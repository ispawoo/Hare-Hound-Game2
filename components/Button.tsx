
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ children, ...props }) => {
  return (
    <button
      {...props}
      className="px-6 py-3 bg-cyan-600 text-white font-bold text-lg rounded-lg shadow-md hover:bg-cyan-700 active:bg-cyan-800 transform hover:-translate-y-1 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-opacity-75 disabled:bg-gray-500 disabled:cursor-not-allowed"
    >
      {children}
    </button>
  );
};

export default Button;
