
import React from 'react';

const Confetti: React.FC = () => {
  const confettiCount = 100;
  const confetti = Array.from({ length: confettiCount }).map((_, i) => {
    const style: React.CSSProperties = {
      left: `${Math.random() * 100}%`,
      animationDuration: `${Math.random() * 3 + 2}s`,
      animationDelay: `${Math.random() * 2}s`,
      backgroundColor: `hsl(${Math.random() * 360}, 70%, 50%)`,
    };
    return <div key={i} className="confetti-piece" style={style}></div>;
  });

  return (
    <div className="confetti-container">
      {confetti}
      <style>{`
        .confetti-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 100;
          overflow: hidden;
        }

        .confetti-piece {
          position: absolute;
          top: -20px;
          width: 10px;
          height: 20px;
          opacity: 0;
          animation-name: fall;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }

        @keyframes fall {
          0% {
            transform: translateY(0vh) rotateZ(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(105vh) rotateZ(720deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default Confetti;
