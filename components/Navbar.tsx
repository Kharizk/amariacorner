import React from 'react';
import { ShoppingCart, Menu, Settings, Home, Heart, Award, Moon, Sun } from 'lucide-react';
import { PageView } from '../types';

interface NavbarProps {
  cartCount: number;
  setView: (view: PageView) => void;
  currentView: PageView;
  toggleSidebar: () => void;
  favoritesCount: number;
  points: number;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

// Custom SVG Logo Component
const Logo: React.FC = () => (
  <svg viewBox="0 0 300 110" className="h-full w-auto" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="blueGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style={{stopColor:'#004890', stopOpacity:1}} />
        <stop offset="100%" style={{stopColor:'#00366d', stopOpacity:1}} />
      </linearGradient>
    </defs>
    
    <g transform="translate(10, 5)">
      <path d="M20 80 L50 20" stroke="url(#blueGrad)" strokeWidth="16" strokeLinecap="round" />
      <path d="M50 20 L80 80" stroke="#d31a28" strokeWidth="16" strokeLinecap="round" />
      <path d="M35 55 L65 55" stroke="url(#blueGrad)" strokeWidth="10" strokeLinecap="round" />
      <path d="M100 80 L100 20 L130 70 L160 20 L160 80" fill="none" stroke="url(#blueGrad)" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M150 20 C 180 -10, 200 10, 190 40 C 170 40, 160 30, 150 20" fill="#479d46" />
      <path d="M150 20 Q 170 25, 190 40" stroke="white" strokeWidth="2" fill="none" opacity="0.5"/>
      <text x="100" y="105" fontFamily="sans-serif" fontSize="18" fontWeight="800" fill="#004890" textAnchor="middle" className="dark:fill-blue-400">ركن العمارية</text>
    </g>
  </svg>
);

const Navbar: React.FC<NavbarProps> = ({ cartCount, setView, currentView, toggleSidebar, favoritesCount, points, isDarkMode, toggleTheme }) => {
  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-slate-900 text-brand-blue dark:text-white shadow-lg border-b border-gray-100 dark:border-slate-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-24">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer h-full py-2" onClick={() => setView(PageView.HOME)}>
             <Logo />
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-6 space-x-reverse bg-gray-50 dark:bg-slate-800 px-6 py-2 rounded-full shadow-inner border border-gray-100 dark:border-slate-700">
            <button 
              onClick={() => setView(PageView.HOME)}
              className={`${currentView === PageView.HOME ? 'text-brand-red font-bold bg-white dark:bg-slate-700 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-brand-blue dark:hover:text-blue-300'} px-4 py-1 rounded-full transition-all flex items-center gap-2`}
            >
              <Home size={18} />
              الرئيسية
            </button>
            <button 
              onClick={() => setView(PageView.MENU)}
              className={`${currentView === PageView.MENU ? 'text-brand-red font-bold bg-white dark:bg-slate-700 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-brand-blue dark:hover:text-blue-300'} px-4 py-1 rounded-full transition-all flex items-center gap-2`}
            >
              <Menu size={18} />
              المنيو
            </button>
             <button 
              onClick={() => setView(PageView.FAVORITES)}
              className={`${currentView === PageView.FAVORITES ? 'text-brand-red font-bold bg-white dark:bg-slate-700 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-brand-blue dark:hover:text-blue-300'} px-4 py-1 rounded-full transition-all flex items-center gap-2`}
            >
              <Heart size={18} fill={currentView === PageView.FAVORITES ? "currentColor" : "none"} />
              المفضلة
              {favoritesCount > 0 && <span className="text-xs bg-brand-red text-white px-1.5 rounded-full">{favoritesCount}</span>}
            </button>
            <button 
              onClick={() => setView(PageView.ADMIN)}
              className={`${currentView === PageView.ADMIN ? 'text-brand-red font-bold bg-white dark:bg-slate-700 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-brand-blue dark:hover:text-blue-300'} px-4 py-1 rounded-full transition-all flex items-center gap-2`}
            >
              <Settings size={18} />
              الإدارة
            </button>
          </div>

          {/* Cart, Points & Theme Toggle */}
          <div className="flex items-center gap-3">
             {/* Loyalty Points */}
             <div className="hidden sm:flex flex-col items-end leading-none">
                <span className="text-[10px] text-gray-500 dark:text-gray-400 font-bold">نقاط الولاء</span>
                <div className="flex items-center gap-1 text-brand-leaf font-bold">
                   <Award size={16} />
                   <span>{points}</span>
                </div>
             </div>

             {/* Theme Toggle */}
             <button 
               onClick={toggleTheme}
               className="p-2.5 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-yellow-400 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
               title={isDarkMode ? "الوضع النهاري" : "الوضع الليلي"}
             >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
             </button>

             <button 
              onClick={() => setView(PageView.CART)}
              className="relative p-2.5 bg-brand-blue text-white rounded-xl hover:bg-blue-800 transition-colors shadow-md group border border-blue-900"
            >
              <ShoppingCart size={24} className="group-hover:scale-105 transition-transform" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-brand-red text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full border-2 border-white dark:border-slate-900 animate-bounce">
                  {cartCount}
                </span>
              )}
            </button>
            
            {/* Mobile Sidebar Toggle */}
            <div className="md:hidden">
              <button onClick={toggleSidebar} className="text-brand-blue dark:text-white hover:text-brand-red">
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