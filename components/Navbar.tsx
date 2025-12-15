import React from 'react';
import { ShoppingCart, Menu, Settings, Home } from 'lucide-react';
import { PageView } from '../types';

interface NavbarProps {
  cartCount: number;
  setView: (view: PageView) => void;
  currentView: PageView;
  toggleSidebar: () => void;
}

// Custom SVG Logo Component to ensure it always renders without external dependencies
const Logo: React.FC = () => (
  <svg viewBox="0 0 300 110" className="h-full w-auto" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="blueGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style={{stopColor:'#004890', stopOpacity:1}} />
        <stop offset="100%" style={{stopColor:'#00366d', stopOpacity:1}} />
      </linearGradient>
    </defs>
    
    {/* Grouping for scaling/positioning */}
    <g transform="translate(10, 5)">
      {/* Letter A */}
      {/* Left leg */}
      <path d="M20 80 L50 20" stroke="url(#blueGrad)" strokeWidth="16" strokeLinecap="round" />
      {/* Right leg (Red Accent) */}
      <path d="M50 20 L80 80" stroke="#d31a28" strokeWidth="16" strokeLinecap="round" />
      {/* Crossbar */}
      <path d="M35 55 L65 55" stroke="url(#blueGrad)" strokeWidth="10" strokeLinecap="round" />

      {/* Letter M */}
      <path d="M100 80 L100 20 L130 70 L160 20 L160 80" fill="none" stroke="url(#blueGrad)" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round"/>
      
      {/* The Green Leaf */}
      <path d="M150 20 C 180 -10, 200 10, 190 40 C 170 40, 160 30, 150 20" fill="#479d46" />
      <path d="M150 20 Q 170 25, 190 40" stroke="white" strokeWidth="2" fill="none" opacity="0.5"/>

      {/* Brand Name Text */}
      <text x="100" y="105" fontFamily="sans-serif" fontSize="18" fontWeight="800" fill="#004890" textAnchor="middle">ركن العمارية</text>
    </g>
  </svg>
);

const Navbar: React.FC<NavbarProps> = ({ cartCount, setView, currentView, toggleSidebar }) => {
  return (
    <nav className="sticky top-0 z-50 bg-white text-brand-blue shadow-lg border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-24">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer h-full py-2" onClick={() => setView(PageView.HOME)}>
             <Logo />
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8 space-x-reverse bg-gray-50 px-6 py-2 rounded-full shadow-inner">
            <button 
              onClick={() => setView(PageView.HOME)}
              className={`${currentView === PageView.HOME ? 'text-brand-red font-bold bg-white shadow-sm' : 'text-gray-500 hover:text-brand-blue'} px-4 py-1 rounded-full transition-all flex items-center gap-2`}
            >
              <Home size={18} />
              الرئيسية
            </button>
            <button 
              onClick={() => setView(PageView.MENU)}
              className={`${currentView === PageView.MENU ? 'text-brand-red font-bold bg-white shadow-sm' : 'text-gray-500 hover:text-brand-blue'} px-4 py-1 rounded-full transition-all flex items-center gap-2`}
            >
              <Menu size={18} />
              المنيو
            </button>
            <button 
              onClick={() => setView(PageView.ADMIN)}
              className={`${currentView === PageView.ADMIN ? 'text-brand-red font-bold bg-white shadow-sm' : 'text-gray-500 hover:text-brand-blue'} px-4 py-1 rounded-full transition-all flex items-center gap-2`}
            >
              <Settings size={18} />
              الإدارة
            </button>
          </div>

          {/* Cart & Mobile Menu */}
          <div className="flex items-center gap-4">
             <button 
              onClick={() => setView(PageView.CART)}
              className="relative p-2.5 bg-brand-blue text-white rounded-xl hover:bg-blue-800 transition-colors shadow-md group border border-blue-900"
            >
              <ShoppingCart size={24} className="group-hover:scale-105 transition-transform" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-brand-red text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full border-2 border-white animate-bounce">
                  {cartCount}
                </span>
              )}
            </button>
            
            {/* Mobile Sidebar Toggle */}
            <div className="md:hidden">
              <button onClick={toggleSidebar} className="text-brand-blue hover:text-brand-red">
                <Menu size={32} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;