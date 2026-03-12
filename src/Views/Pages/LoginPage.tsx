import React, { useState, useEffect, useRef } from 'react';
import LoginForm from '../Components/LoginForm';

const LoginPage: React.FC = () => {
  // Mouse position state for the interactive background
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePos({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div 
      ref={containerRef}
      className="flex min-h-screen w-full bg-slate-900 text-white overflow-hidden relative"
    >
      {/* Interactive Cursor Glow Background (Hidden on mobile) */}
      <div 
        className="hidden md:block absolute pointer-events-none rounded-full blur-[100px] opacity-40 transition-opacity duration-300"
        style={{
          background: 'radial-gradient(circle, rgba(99,102,241,0.8) 0%, rgba(139,92,246,0) 70%)',
          width: '600px',
          height: '600px',
          left: mousePos.x,
          top: mousePos.y,
          transform: 'translate(-50%, -50%)',
          zIndex: 0
        }}
      />

      {/* Left side: Interactive Visual/Animation (Hidden on mobile) */}
      <div className="hidden md:flex flex-col flex-1 justify-center items-center z-10 p-12 relative overflow-hidden bg-slate-900/50 backdrop-blur-sm border-r border-slate-800">
        <div className="max-w-lg text-left relative z-10">
          <div className="inline-block px-4 py-2 rounded-full bg-indigo-500/10 text-indigo-400 font-medium text-sm mb-6 border border-indigo-500/20">
            Welcome to Thrift-Through
          </div>
          <h1 className="text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400 leading-tight">
            Discover Hidden Gems.
          </h1>
          <p className="text-xl text-slate-400 leading-relaxed mb-12">
            Join our community of thrifters and find unique items that tell a story.
          </p>
          
          {/* Abstract geometric animation layer */}
          <div className="relative w-64 h-64 mx-auto mt-8">
            <div 
              className="absolute inset-0 border border-indigo-500/30 rounded-full animate-[spin_8s_linear_infinite]"
              style={{
                transform: `rotate(${mousePos.x * 0.05}deg)`,
                transition: 'transform 0.2s ease-out'
              }}
            ></div>
            <div 
              className="absolute inset-4 border border-purple-500/30 rounded-full animate-[spin_12s_linear_infinite_reverse]"
              style={{
                transform: `rotate(${mousePos.x * -0.08}deg)`,
                transition: 'transform 0.2s ease-out'
              }}
            ></div>
            <div 
              className="absolute inset-8 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 rounded-full blur-xl animate-pulse"
            ></div>
            
            {/* Interactive floating elements reacting to mouse */}
            <div 
              className="absolute w-4 h-4 rounded-full bg-indigo-400 shadow-[0_0_15px_rgba(129,140,248,0.8)]"
              style={{
                left: '20%',
                top: '20%',
                transform: `translate(${mousePos.x * 0.02}px, ${mousePos.y * 0.02}px)`,
                transition: 'transform 0.1s ease-out'
              }}
            />
            <div 
              className="absolute w-6 h-6 rounded-full bg-purple-400 shadow-[0_0_20px_rgba(192,132,252,0.8)]"
              style={{
                right: '15%',
                bottom: '25%',
                transform: `translate(${mousePos.x * -0.03}px, ${mousePos.y * -0.03}px)`,
                transition: 'transform 0.1s ease-out'
              }}
            />
            <div 
              className="absolute w-3 h-3 rounded-full bg-pink-400 shadow-[0_0_10px_rgba(244,114,182,0.8)]"
              style={{
                right: '30%',
                top: '10%',
                transform: `translate(${mousePos.x * 0.04}px, ${mousePos.y * -0.02}px)`,
                transition: 'transform 0.1s ease-out'
              }}
            />
          </div>
        </div>
        
        {/* Background ambient grid */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0wIDBoNDB2NDBIMHoiIGZpbGw9Im5vbmUiLz4KPHBhdGggZD0iTTAgMGg0MHY0MEgwem0zOSAzOUgwVjFoMzl2Mzh6IiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDMpIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiLz4KPC9zdmc+')] opacity-50 z-0 mask-image:linear-gradient(to_bottom,transparent,black,transparent)"></div>
      </div>

      {/* Right side: Login Form (Full width on mobile) */}
      <div className="flex-1 flex flex-col justify-center items-center z-10 p-6 sm:p-12 relative bg-slate-900">
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;