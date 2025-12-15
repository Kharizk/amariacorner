import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Navbar from './components/Navbar';
import Admin from './components/Admin';
import AIChef from './components/AIChef';
import { Product, CartItem, PageView, CATEGORIES, BRANDS } from './types';
import { INITIAL_PRODUCTS } from './constants';
import { Plus, Minus, Trash, ShoppingBag, ArrowRight, Tag, Star, Utensils, Filter, Heart, MessageCircle, ArrowUpDown, CheckCircle, Info, X, Home, Menu as MenuIcon, Settings, Search, ChevronRight, ChevronLeft, Box, Check, LayoutGrid } from 'lucide-react';
import { getRecipeSuggestion } from './services/geminiService';

// --- Toast Component ---
interface Toast {
  id: number;
  message: string;
  type: 'success' | 'info';
}

const ToastContainer: React.FC<{ toasts: Toast[], removeToast: (id: number) => void }> = ({ toasts, removeToast }) => {
  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-max max-w-[90vw] pointer-events-none">
      {toasts.map(toast => (
        <div 
          key={toast.id}
          className={`
            animate-in slide-in-from-bottom-5 fade-in duration-300
            flex items-center gap-2 px-6 py-3 rounded-full shadow-2xl backdrop-blur-md border pointer-events-auto
            ${toast.type === 'success' 
              ? 'bg-brand-blue/90 text-white border-blue-500' 
              : 'bg-gray-800/90 text-white border-gray-600'}
          `}
        >
          {toast.type === 'success' ? <CheckCircle size={18} className="text-green-400" /> : <Info size={18} />}
          <span className="font-bold text-sm">{toast.message}</span>
        </div>
      ))}
    </div>
  );
};

// Helper for Category Icons
const getCategoryIcon = (category: string) => {
  const map: Record<string, string> = {
    'الكل': '🏠',
    'بكجات التوفير': '📦',
    'لحوم': '🥩',
    'دواجن مجمدة': '❄️',
    'دواجن مبردة': '🍗',
    'بطاطس': '🍟',
    'خضروات': '🥦',
    'معجنات': '🥐',
    'أجبان وألبان': '🧀',
    'زيوت وسمن': '🌻',
    'صوصات': '🥫',
    'فواكه': '🍓'
  };
  return map[category] || '🍽️';
};

const App: React.FC = () => {
  const [view, setView] = useState<PageView>(PageView.HOME);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]); // Store Product IDs
  const [points, setPoints] = useState<number>(0);
  
  // Theme State
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // Toast State
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Dynamic State for Categories and Brands
  const [categories, setCategories] = useState<string[]>(CATEGORIES);
  const [brands, setBrands] = useState<string[]>(BRANDS);

  // Filters & Sorting & Search
  const [selectedCategory, setSelectedCategory] = useState('الكل');
  const [selectedBrand, setSelectedBrand] = useState('الكل');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('default'); // 'default', 'price-asc', 'price-desc'
  
  // Selection State (Track which unit is selected for each product card: 'primary' or 'secondary')
  const [cardUnitSelections, setCardUnitSelections] = useState<Record<string, 'primary' | 'secondary'>>({});

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [recipeModal, setRecipeModal] = useState<{isOpen: boolean, content: string, title: string}>({isOpen: false, content: '', title: ''});
  const [loadingRecipe, setLoadingRecipe] = useState(false);

  // Refs for scrolling
  const categoryScrollRef = useRef<HTMLDivElement>(null);

  // Toast Helper
  const showToast = useCallback((message: string, type: 'success' | 'info' = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Initialization Effects
  useEffect(() => {
    const savedFavs = localStorage.getItem('rokan-favorites');
    if (savedFavs) setFavorites(JSON.parse(savedFavs));
    
    const savedPoints = localStorage.getItem('rokan-points');
    if (savedPoints) setPoints(Number(savedPoints));

    const savedTheme = localStorage.getItem('rokan-theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Scroll to top when view changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [view]);

  // Persistance Effects
  useEffect(() => {
    localStorage.setItem('rokan-favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('rokan-points', points.toString());
  }, [points]);

  // Dark Mode Logic applied to Root HTML element for full immersion
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('rokan-theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('rokan-theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Reset selected brand when category changes
  useEffect(() => {
    setSelectedBrand('الكل');
  }, [selectedCategory]);

  // Smooth Scroll to Active Category
  const handleCategorySelect = (cat: string, index: number) => {
    setSelectedCategory(cat);
    if (categoryScrollRef.current) {
        const container = categoryScrollRef.current;
        const button = container.children[index] as HTMLElement;
        if (button) {
            const scrollLeft = button.offsetLeft - (container.clientWidth / 2) + (button.clientWidth / 2);
            container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
        }
    }
  };

  // Compute available brands based on selected category
  const availableBrands = useMemo(() => {
    if (selectedCategory === 'الكل') {
      return brands;
    }
    const relevantBrands = new Set(
      products
        .filter(p => p.category === selectedCategory)
        .map(p => p.brand)
    );
    return ['الكل', ...Array.from(relevantBrands)];
  }, [selectedCategory, products, brands]);

  // Cart Helpers
  const addToCart = (product: Product, e?: React.MouseEvent) => {
    if(e) e.stopPropagation();

    // Determine currently selected unit from state, or default to primary
    const selection = cardUnitSelections[product.id] || 'primary';
    const targetUnit = selection === 'secondary' && product.secondaryUnit ? product.secondaryUnit : product.unit;
    const targetPrice = selection === 'secondary' && product.secondaryPrice ? product.secondaryPrice : product.price;
    
    // Create a unique cart ID so different units of same product don't merge (e.g., "1-Carton" vs "1-Piece")
    const cartItemId = `${product.id}-${targetUnit}`;

    setCart(prev => {
      const existing = prev.find(item => item.id === cartItemId);
      if (existing) {
        // showToast(`تم زيادة كمية ${product.name} (${targetUnit})`, 'success');
        return prev.map(item => item.id === cartItemId ? { ...item, quantity: item.quantity + 1 } : item);
      }
      showToast(`تم إضافة ${product.name} (${targetUnit})`, 'success');
      return [...prev, { 
        ...product, 
        id: cartItemId, // Override ID for cart uniqueness
        originalProductId: product.id,
        quantity: 1,
        selectedUnit: targetUnit,
        finalPrice: targetPrice
      }];
    });
  };

  const removeFromCart = (cartItemId: string, e?: React.MouseEvent) => {
    if(e) e.stopPropagation();
    setCart(prev => prev.filter(item => item.id !== cartItemId));
  };

  const updateQuantity = (cartItemId: string, delta: number, e?: React.MouseEvent) => {
    if(e) e.stopPropagation();
    setCart(prev => prev.map(item => {
      if (item.id === cartItemId) {
        const newQty = item.quantity + delta;
        if (newQty <= 0) {
            return null;
        }
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(Boolean) as CartItem[]);
  };

  // Get quantity for the *currently selected unit* on the card
  const getCartQuantityForSelectedUnit = (product: Product) => {
    const selection = cardUnitSelections[product.id] || 'primary';
    const targetUnit = selection === 'secondary' && product.secondaryUnit ? product.secondaryUnit : product.unit;
    const cartItemId = `${product.id}-${targetUnit}`;
    
    return cart.find(item => item.id === cartItemId)?.quantity || 0;
  };

  // Favorites Helper
  const toggleFavorite = (e: React.MouseEvent, productId: string) => {
    e.stopPropagation();
    setFavorites(prev => {
      if (prev.includes(productId)) {
        showToast('تم الحذف من المفضلة', 'info');
        return prev.filter(id => id !== productId);
      } else {
        showToast('تم الإضافة للمفضلة ❤️', 'success');
        return [...prev, productId];
      }
    });
  };

  // Toggle unit selection on card
  const setCardUnit = (e: React.MouseEvent, productId: string, selection: 'primary' | 'secondary') => {
    e.stopPropagation();
    setCardUnitSelections(prev => ({
      ...prev,
      [productId]: selection
    }));
  };

  // WhatsApp Checkout
  const checkoutViaWhatsApp = () => {
    if (cart.length === 0) return;

    const phoneNumber = "966500000000"; 
    let message = `*طلب جديد من تطبيق ركن العمارية*%0a`;
    message += `----------------------------%0a`;
    
    cart.forEach(item => {
      // Use finalPrice which stores the unit price at time of add
      const price = item.discountPercent && item.selectedUnit === item.unit // Only apply discount to primary unit usually
        ? (item.finalPrice * (1 - item.discountPercent/100)).toFixed(0) 
        : item.finalPrice;
      
      message += `▪️ ${item.name} (${item.brand})%0a   الوحدة: ${item.selectedUnit} | الكمية: ${item.quantity} | السعر: ${price} ر.س%0a`;
    });
    
    const finalTotal = cartTotal + 15;
    
    message += `----------------------------%0a`;
    message += `*الإجمالي: ${finalTotal.toFixed(0)} ر.س* (شامل التوصيل)%0a`;
    message += `📍 يرجى إرسال الموقع لتأكيد الطلب.`;

    const earnedPoints = Math.floor(finalTotal / 10);
    setPoints(prev => prev + earnedPoints);
    showToast(`تم إرسال الطلب! كسبت ${earnedPoints} نقطة 🎉`, 'success');

    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
    setCart([]); 
    setView(PageView.HOME);
  };

  const cartTotal = cart.reduce((sum, item) => {
    let price = item.finalPrice;
    if (item.selectedUnit === item.unit && item.discountPercent) {
       price = item.finalPrice * (1 - item.discountPercent / 100);
    }
    return sum + (price * item.quantity);
  }, 0);

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // AI Recipe Helper
  const handleAskChef = async (product: Product) => {
    setLoadingRecipe(true);
    setRecipeModal({ isOpen: true, content: 'جاري سؤال الشيف... 👨‍🍳', title: product.name });
    const recipe = await getRecipeSuggestion(product);
    setRecipeModal({ isOpen: true, content: recipe, title: product.name });
    setLoadingRecipe(false);
  };

  // Filter & Sort Products
  const filteredProducts = useMemo(() => {
    let result = products.filter(p => {
      const categoryMatch = selectedCategory === 'الكل' || p.category === selectedCategory;
      const brandMatch = selectedBrand === 'الكل' || p.brand === selectedBrand;
      const searchMatch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      return categoryMatch && brandMatch && searchMatch;
    });

    if (sortOption === 'price-asc') {
      result.sort((a, b) => {
        const priceA = a.discountPercent ? a.price * (1 - a.discountPercent/100) : a.price;
        const priceB = b.discountPercent ? b.price * (1 - b.discountPercent/100) : b.price;
        return priceA - priceB;
      });
    } else if (sortOption === 'price-desc') {
      result.sort((a, b) => {
        const priceA = a.discountPercent ? a.price * (1 - a.discountPercent/100) : a.price;
        const priceB = b.discountPercent ? b.price * (1 - b.discountPercent/100) : b.price;
        return priceB - priceA;
      });
    }
    // 'default' uses the original order (Best Selling assumption)

    return result;
  }, [products, selectedCategory, selectedBrand, sortOption, searchQuery]);

  const favoriteProducts = products.filter(p => favorites.includes(p.id));

  // --- Components Render ---

  const renderProductCard = (product: Product) => {
    // Determine current view state for this card
    const selection = cardUnitSelections[product.id] || 'primary';
    const isSecondary = selection === 'secondary';
    
    // Determine values to display
    const displayUnit = isSecondary && product.secondaryUnit ? product.secondaryUnit : product.unit;
    const displayPrice = isSecondary && product.secondaryPrice ? product.secondaryPrice : product.price;
    const hasDiscount = !isSecondary && product.discountPercent; // Only show discount on primary unit for now

    // Get Cart quantity for the currently viewed unit
    const quantity = getCartQuantityForSelectedUnit(product);
    
    // Composite ID for logic
    const currentCartId = `${product.id}-${displayUnit}`;

    return (
      <div key={product.id} className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col h-full border border-gray-100 dark:border-slate-700 overflow-hidden relative transform hover:-translate-y-1">
        
        {/* Badges */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
          {hasDiscount && (
             <span className="bg-brand-red text-white text-xs font-bold px-2 py-1 rounded shadow-sm animate-pulse flex items-center gap-1">
               <Tag size={12} /> {product.discountPercent}% خصم
             </span>
          )}
          {product.isNew && (
            <span className="bg-brand-blue text-white text-xs font-bold px-2 py-1 rounded shadow-sm flex items-center gap-1">
              <Star size={12} /> جديد
            </span>
          )}
        </div>

        {/* Favorite Button (Top Left) */}
        <div className="absolute top-3 left-3 z-10">
            <button 
              onClick={(e) => toggleFavorite(e, product.id)}
              className={`p-2 rounded-full shadow-sm border backdrop-blur-sm transition-all active:scale-90 ${favorites.includes(product.id) ? 'bg-red-50 border-red-200 text-red-500' : 'bg-white/90 dark:bg-slate-900/90 border-gray-100 dark:border-slate-700 text-gray-400 hover:text-red-400'}`}
            >
               <Heart size={18} fill={favorites.includes(product.id) ? "currentColor" : "none"} />
            </button>
        </div>

        {/* Image Area */}
        <div className="relative h-48 overflow-hidden bg-gray-50 dark:bg-slate-700 cursor-pointer" onClick={() => handleAskChef(product)}>
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null; 
              target.src = `https://placehold.co/600x400/e2e8f0/1e293b?text=${encodeURIComponent(product.name)}`;
            }}
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300"></div>
          
          <button 
            onClick={(e) => { e.stopPropagation(); handleAskChef(product); }}
            className="absolute bottom-2 left-2 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm text-brand-leaf p-2 rounded-full shadow-lg hover:bg-brand-leaf hover:text-white transition-colors text-xs flex items-center gap-1 border border-brand-leaf/20 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 duration-300"
            title="كيف أطبخ هذا؟"
          >
            <Utensils size={14} />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-5 flex flex-col flex-1">
          <div className="mb-1">
             <p className="text-xs text-brand-blue dark:text-blue-400 font-bold opacity-80 mb-0.5">{product.brand}</p>
             <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 line-clamp-1 group-hover:text-brand-blue transition-colors">{product.name}</h3>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 flex-1 line-clamp-2 leading-relaxed">{product.description}</p>
          
          {/* Enhanced Segmented Unit Control */}
          {product.secondaryUnit && (
             <div className="mb-5 bg-gray-100 dark:bg-slate-700/80 p-1 rounded-xl flex relative h-10 shadow-inner">
               <button 
                 onClick={(e) => setCardUnit(e, product.id, 'primary')}
                 className={`flex-1 relative z-10 flex items-center justify-center gap-1 text-xs font-bold rounded-lg transition-all duration-200 ${!isSecondary ? 'bg-white dark:bg-slate-600 text-brand-blue dark:text-white shadow-sm ring-1 ring-black/5' : 'text-gray-500 dark:text-gray-400 hover:bg-white/50'}`}
               >
                 <span>{product.unit}</span>
                 {/* <span className="text-[10px] opacity-70">({product.price})</span> */}
               </button>
               <button 
                 onClick={(e) => setCardUnit(e, product.id, 'secondary')}
                 className={`flex-1 relative z-10 flex items-center justify-center gap-1 text-xs font-bold rounded-lg transition-all duration-200 ${isSecondary ? 'bg-white dark:bg-slate-600 text-brand-blue dark:text-white shadow-sm ring-1 ring-black/5' : 'text-gray-500 dark:text-gray-400 hover:bg-white/50'}`}
               >
                 <span>{product.secondaryUnit}</span>
                 {/* <span className="text-[10px] opacity-70">({product.secondaryPrice})</span> */}
               </button>
             </div>
          )}

          <div className="mt-auto flex items-end justify-between">
            {/* Price Display */}
            <div className="flex flex-col">
               {hasDiscount && product.discountPercent ? (
                 <>
                   <span className="text-xs text-gray-400 line-through decoration-red-400 decoration-1">{displayPrice} ر.س</span>
                   <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-brand-red">
                        {(displayPrice * (1 - product.discountPercent/100)).toFixed(0)} <span className="text-sm font-medium text-gray-500">ر.س</span>
                      </span>
                   </div>
                 </>
               ) : (
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-brand-blue dark:text-blue-300">
                        {displayPrice} <span className="text-sm font-medium text-gray-500 dark:text-gray-400">ر.س</span>
                    </span>
                  </div>
               )}
               <span className="text-[10px] text-gray-400 font-medium">لكل {displayUnit}</span>
            </div>

            {/* Action Button */}
            {quantity > 0 ? (
                <div className="flex items-center gap-3 bg-brand-blue dark:bg-blue-600 rounded-xl p-1.5 shadow-lg shadow-blue-200 dark:shadow-none animate-in fade-in zoom-in duration-200">
                    <button 
                        onClick={(e) => updateQuantity(currentCartId, 1, e)} 
                        className="w-7 h-7 flex items-center justify-center text-white bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                    >
                        <Plus size={14} strokeWidth={3} />
                    </button>
                    <span className="text-white font-bold w-4 text-center text-lg leading-none pb-1">{quantity}</span>
                    <button 
                        onClick={(e) => updateQuantity(currentCartId, -1, e)} 
                        className="w-7 h-7 flex items-center justify-center text-white bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                    >
                        {quantity === 1 ? <Trash size={14} /> : <Minus size={14} strokeWidth={3} />}
                    </button>
                </div>
            ) : (
                <button 
                  onClick={(e) => addToCart(product, e)}
                  className="bg-brand-blue dark:bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-800 dark:hover:bg-blue-500 transition-all shadow-md active:scale-95 group/btn flex items-center justify-center w-12 h-12"
                >
                  <Plus size={24} strokeWidth={2.5} className="group-hover/btn:rotate-90 transition-transform duration-300" />
                </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderHome = () => (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-brand-blue to-blue-900 dark:from-slate-900 dark:to-blue-950 h-[500px] flex items-center justify-center text-center px-4 overflow-hidden">
        {/* Abstract Shapes */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl translate-x-[-50%] translate-y-[-50%]"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-red opacity-10 rounded-full blur-3xl translate-x-[20%] translate-y-[20%]"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="flex justify-center mb-6">
             <span className="bg-brand-red text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider animate-pulse shadow-lg">
               جودة مضمونة 100%
             </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold font-cairo text-white mb-6 drop-shadow-xl tracking-tight">
            ركن العمارية
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-10 font-light max-w-2xl mx-auto leading-relaxed">
            الوجهة الأولى للمجمدات الغذائية. نوفر لك أجود المنتجات العالمية والمحلية بأسعار منافسة وخدمة متميزة.
          </p>
          <div className="flex gap-4 justify-center">
            <button 
              onClick={() => setView(PageView.MENU)}
              className="bg-white text-brand-blue px-8 py-4 rounded-full text-lg font-bold hover:bg-gray-50 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 flex items-center gap-3 border-4 border-brand-blue/20"
            >
              تصفح المنتجات
              <ArrowRight className="text-brand-red" />
            </button>
          </div>
        </div>
      </div>

      {/* Brands Preview */}
      <div className="py-12 bg-white dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 overflow-hidden">
           <h3 className="text-center text-gray-400 dark:text-gray-500 font-bold mb-8">شركاء النجاح</h3>
           <div className="flex flex-wrap justify-center gap-8 items-center opacity-60 hover:opacity-100 transition-opacity">
             {brands.slice(1, 6).map(b => (
               <span key={b} className="text-2xl font-black text-gray-300 dark:text-gray-600 hover:text-brand-blue dark:hover:text-blue-400 transition-colors cursor-default select-none">{b}</span>
             ))}
           </div>
        </div>
      </div>

      {/* Categories Preview */}
      <div className="py-16 px-4 max-w-7xl mx-auto w-full">
        <div className="flex items-end justify-between mb-12">
           <div>
              <h2 className="text-3xl font-bold text-brand-blue dark:text-white mb-2 font-cairo">أقسامنا المميزة</h2>
              <span className="h-1 w-20 bg-brand-red block rounded-full"></span>
           </div>
           <button onClick={() => setView(PageView.MENU)} className="text-brand-red font-bold hover:underline flex items-center gap-1">عرض الكل <ArrowRight size={16}/></button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories.slice(1).slice(0, 4).map((cat, idx) => (
             <div 
               key={cat} 
               onClick={() => { setSelectedCategory(cat); setView(PageView.MENU); }}
               className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm hover:shadow-xl transition-all cursor-pointer border border-gray-100 dark:border-slate-700 hover:border-brand-blue group text-center relative overflow-hidden"
             >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-blue to-brand-red scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
                <div className="w-16 h-16 bg-blue-50 dark:bg-slate-700 text-brand-blue dark:text-blue-300 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl group-hover:bg-brand-blue group-hover:text-white transition-colors duration-300">
                   {getCategoryIcon(cat)}
                </div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">{cat}</h3>
             </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderMenu = () => (
    <div className="max-w-7xl mx-auto px-4 py-8 min-h-screen pb-24">
       {/* Menu Promo Banner */}
       <div className="bg-brand-blue rounded-3xl p-6 md:p-10 mb-8 text-white relative overflow-hidden shadow-xl shadow-blue-900/20">
         <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-right">
              <span className="bg-brand-red text-white text-xs font-bold px-3 py-1 rounded-full mb-3 inline-block">عرض خاص</span>
              <h2 className="text-3xl md:text-4xl font-bold font-cairo mb-2">بكجات التوفير الجديدة</h2>
              <p className="text-blue-100 mb-6 max-w-lg">اطلب بكج الشواء أو بكج الفطور ووفر أكثر من 20% على مشترياتك. جودة عالية وسعر أقل.</p>
              <button onClick={() => setSelectedCategory('بكجات التوفير')} className="bg-white text-brand-blue px-6 py-2 rounded-xl font-bold hover:bg-gray-100 transition-colors shadow-lg">تسوق العروض</button>
            </div>
            <div className="text-6xl md:text-8xl animate-bounce-slow drop-shadow-lg">🥩</div>
         </div>
         {/* Background Patterns */}
         <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
         <div className="absolute bottom-0 left-0 w-48 h-48 bg-brand-red opacity-20 rounded-full translate-y-1/2 -translate-x-1/2"></div>
       </div>

      {/* Header and Search */}
      <div className="flex flex-col gap-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h2 className="text-3xl font-bold font-cairo text-brand-blue dark:text-white mb-2">قائمة المنتجات</h2>
            <p className="text-gray-500 dark:text-gray-400">تصفح منتجاتنا حسب القسم أو الشركة</p>
          </div>

           {/* Sort Dropdown */}
           <div className="flex items-center gap-2 bg-white dark:bg-slate-800 p-2 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700">
             <ArrowUpDown size={18} className="text-gray-500 dark:text-gray-400" />
             <select 
               value={sortOption}
               onChange={(e) => setSortOption(e.target.value)}
               className="bg-transparent border-none focus:ring-0 text-sm font-bold text-gray-700 dark:text-gray-200 cursor-pointer"
             >
               <option value="default" className="dark:bg-slate-800">الأكثر مبيعاً</option>
               <option value="price-asc" className="dark:bg-slate-800">السعر: من الأقل للأعلى</option>
               <option value="price-desc" className="dark:bg-slate-800">السعر: من الأعلى للأقل</option>
             </select>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:max-w-md mx-auto">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن منتج (مثال: برجر، دجاج...)"
              className="w-full pr-12 pl-4 py-3.5 rounded-2xl border-2 border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white focus:border-brand-blue focus:ring-4 focus:ring-blue-50 dark:focus:ring-blue-900/30 transition-all shadow-sm font-bold placeholder-gray-400"
            />
            <div className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-400">
               <Search size={22} />
            </div>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400 hover:text-red-500 bg-gray-100 dark:bg-slate-700 p-1 rounded-full transition-colors"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
        
      {/* Sticky Categories Scroller with Enhanced UI */}
      <div className="sticky top-24 z-30 bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-xl py-3 -mx-4 px-4 shadow-sm mb-6 border-b border-gray-200/50 dark:border-slate-700/50 transition-colors">
        <div className="w-full relative group">
          {/* Scroll Fade Masks */}
          <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-slate-50 dark:from-slate-900 to-transparent z-10 pointer-events-none"></div>
          <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-slate-50 dark:from-slate-900 to-transparent z-10 pointer-events-none"></div>

          <div className="overflow-x-auto pb-0 pt-1 scrollbar-hide snap-x flex items-center gap-2 px-2" ref={categoryScrollRef}>
            {categories.map((cat, idx) => (
              <button
                key={cat}
                id={`category-btn-${idx}`}
                onClick={() => handleCategorySelect(cat, idx)}
                className={`snap-center px-4 py-2.5 rounded-full whitespace-nowrap transition-all border text-sm font-bold flex items-center gap-2 flex-shrink-0 ${
                  selectedCategory === cat 
                  ? 'bg-brand-blue text-white border-brand-blue shadow-md scale-105' 
                  : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-slate-700 hover:border-brand-blue hover:text-brand-blue'
                }`}
              >
                <span>{getCategoryIcon(cat)}</span>
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Brands Scroller with Enhanced UI */}
      <div className="w-full relative mb-8 group">
         {/* Scroll Fade Masks */}
        <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-slate-50 dark:from-slate-900 to-transparent z-10 pointer-events-none"></div>
        <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-slate-50 dark:from-slate-900 to-transparent z-10 pointer-events-none"></div>

        <div className="overflow-x-auto pb-2 scrollbar-hide flex items-center gap-3 px-2">
          {availableBrands.map(brand => (
            <button
              key={brand}
              onClick={() => setSelectedBrand(brand)}
              className={`px-4 py-1.5 rounded-full whitespace-nowrap transition-all border text-xs md:text-sm font-bold flex items-center gap-2 ${
                selectedBrand === brand 
                ? 'bg-brand-red text-white border-brand-red shadow-md ring-2 ring-red-100 dark:ring-red-900' 
                : 'bg-white dark:bg-slate-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700'
              }`}
            >
              {brand}
              {selectedBrand === brand && <Check size={14} />}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map(product => renderProductCard(product))}
      </div>
      
      {filteredProducts.length === 0 && (
        <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-3xl border-2 border-dashed border-gray-200 dark:border-slate-700">
          <div className="flex justify-center mb-4">
             <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-full">
               <Search size={48} className="text-gray-300 dark:text-gray-500" />
             </div>
          </div>
          <p className="text-xl text-gray-400 mb-2 font-bold">لا توجد منتجات مطابقة للبحث.</p>
          <button 
             onClick={() => {setSelectedCategory('الكل'); setSelectedBrand('الكل'); setSearchQuery('');}}
             className="text-brand-blue dark:text-blue-400 font-bold hover:underline"
          >
            إعادة تعيين الفلاتر والبحث
          </button>
        </div>
      )}

      {/* Floating Cart Bar (Mobile/Desktop) */}
      {cart.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-3xl z-40 animate-in slide-in-from-bottom-10 fade-in duration-300">
          <div className="bg-brand-blue text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between border border-blue-400/30 backdrop-blur-xl bg-opacity-95">
             <div className="flex items-center gap-4">
               <div className="bg-white/20 p-2 rounded-xl relative">
                 <ShoppingBag size={24} />
                 <span className="absolute -top-1 -right-1 bg-brand-red text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full ring-2 ring-brand-blue">
                    {cartCount}
                 </span>
               </div>
               <div className="flex flex-col">
                  <span className="text-xs text-blue-200">الإجمالي</span>
                  <span className="font-bold text-lg font-mono">{(cartTotal).toFixed(0)} ر.س</span>
               </div>
             </div>
             
             <button 
               onClick={() => setView(PageView.CART)}
               className="bg-white text-brand-blue px-6 py-2.5 rounded-xl font-bold hover:bg-gray-100 transition-colors flex items-center gap-2 shadow-sm"
             >
               عرض السلة <ChevronLeft size={18} className="rtl:rotate-0" />
             </button>
          </div>
        </div>
      )}

    </div>
  );

  const renderFavorites = () => (
     <div className="max-w-7xl mx-auto px-4 py-8 min-h-screen">
      <div className="flex items-center gap-3 mb-8">
        <Heart size={32} className="text-brand-red fill-current" />
        <h2 className="text-3xl font-bold font-cairo text-brand-blue dark:text-white">منتجاتي المفضلة</h2>
      </div>

      {favoriteProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {favoriteProducts.map(product => renderProductCard(product))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-dashed border-gray-300 dark:border-slate-700">
          <Heart size={64} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <p className="text-xl text-gray-500 dark:text-gray-400 mb-6">قائمة المفضلة فارغة</p>
          <button onClick={() => setView(PageView.MENU)} className="text-brand-blue dark:text-blue-400 font-bold hover:underline">تصفح المنتجات لإضافتها</button>
        </div>
      )}
    </div>
  );

  const renderCart = () => (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold font-cairo text-brand-blue dark:text-white mb-8 flex items-center gap-3">
        <ShoppingBag />
        سلة المشتريات
      </h2>
      
      {cart.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-dashed border-gray-300 dark:border-slate-700">
          <ShoppingBag size={64} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <p className="text-xl text-gray-500 dark:text-gray-400 mb-6">السلة فارغة</p>
          <button onClick={() => setView(PageView.MENU)} className="text-brand-blue dark:text-blue-400 font-bold hover:underline">العودة للتسوق</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-2 space-y-4">
             {cart.map(item => (
               <div key={item.id} className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm flex items-center gap-4 border border-gray-100 dark:border-slate-700">
                 <img src={item.image} alt={item.name} className="w-20 h-20 rounded-xl object-cover bg-gray-50 dark:bg-slate-700" />
                 <div className="flex-1">
                   <h3 className="font-bold text-gray-800 dark:text-gray-100">{item.name}</h3>
                   <div className="flex flex-wrap gap-2 text-xs text-gray-500 dark:text-gray-400 mb-1">
                      <span>{item.brand}</span>
                      <span className="text-gray-300 dark:text-gray-600">•</span>
                      <span>{item.category}</span>
                   </div>
                   <div className="flex items-center gap-2 mt-1">
                      <span className="bg-blue-50 dark:bg-blue-900/30 text-brand-blue dark:text-blue-300 px-2 py-0.5 rounded-md text-xs font-bold border border-blue-100 dark:border-blue-800">
                        {item.selectedUnit}
                      </span>
                      {item.selectedUnit === 'كرتون' && <span className="text-xs text-gray-400">(جملة)</span>}
                   </div>
                   <div className="flex gap-2 items-baseline mt-2">
                      <span className="text-brand-blue dark:text-blue-300 text-sm font-black">
                        {(item.discountPercent && item.selectedUnit === item.unit)
                          ? (item.finalPrice * (1 - item.discountPercent / 100)).toFixed(0) 
                          : item.finalPrice} ر.س
                      </span>
                      {item.discountPercent && item.selectedUnit === item.unit && (
                         <span className="text-xs text-gray-400 line-through">{item.finalPrice}</span>
                      )}
                   </div>
                 </div>
                 <div className="flex items-center gap-3 bg-gray-50 dark:bg-slate-700 rounded-xl p-1.5 border border-gray-200 dark:border-slate-600">
                   <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:bg-white dark:hover:bg-slate-600 rounded-lg shadow-sm transition-colors text-brand-blue dark:text-blue-300"><Minus size={16} /></button>
                   <span className="font-bold w-6 text-center text-gray-800 dark:text-white">{item.quantity}</span>
                   <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:bg-white dark:hover:bg-slate-600 rounded-lg shadow-sm transition-colors text-brand-blue dark:text-blue-300"><Plus size={16} /></button>
                 </div>
                 <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full transition-colors"><Trash size={18} /></button>
               </div>
             ))}
           </div>
           
           <div className="lg:col-span-1">
             <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-lg border-t-4 border-brand-red sticky top-24">
               <h3 className="text-xl font-bold mb-4 border-b dark:border-slate-700 pb-2 text-gray-800 dark:text-white flex items-center gap-2"><CheckCircle size={20} className="text-brand-leaf"/> ملخص الطلب</h3>
               <div className="space-y-3 mb-6 text-sm text-gray-600 dark:text-gray-300">
                 <div className="flex justify-between">
                   <span>عدد المنتجات</span>
                   <span className="font-bold">{cartCount}</span>
                 </div>
                 <div className="flex justify-between">
                   <span>التوصيل</span>
                   <span className="font-bold">15 ر.س</span>
                 </div>
               </div>
               <div className="flex justify-between text-xl font-black text-brand-blue dark:text-blue-300 mb-6 border-t dark:border-slate-700 pt-4">
                 <span>الإجمالي</span>
                 <span>{(cartTotal + 15).toFixed(0)} ر.س</span>
               </div>
               
               <div className="flex flex-col gap-3">
                 <button 
                  onClick={checkoutViaWhatsApp}
                  className="w-full bg-[#25D366] text-white py-3.5 rounded-xl font-bold hover:bg-[#128C7E] transition-transform active:scale-95 shadow-lg flex items-center justify-center gap-2"
                >
                  <MessageCircle size={22} />
                  إتمام الطلب (واتساب)
                </button>
                 <button 
                  onClick={() => alert('سيتم تفعيل الدفع الإلكتروني قريباً')}
                  className="w-full bg-gray-100 dark:bg-slate-700 text-gray-400 py-3.5 rounded-xl font-bold cursor-not-allowed flex items-center justify-center gap-2"
                >
                  الدفع الإلكتروني (قريباً)
                </button>
               </div>

             </div>
           </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col font-sans text-right bg-slate-50 dark:bg-slate-900 text-gray-800 dark:text-gray-100 transition-colors duration-300" dir="rtl">
      <Navbar 
        cartCount={cartCount} 
        setView={setView} 
        currentView={view} 
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        favoritesCount={favorites.length}
        points={points}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
      />

      {/* Mobile Sidebar Overlay */}
      <div className={`fixed inset-0 z-[100] md:hidden transition-all duration-300 ${isSidebarOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
        
        {/* Sidebar Panel */}
        <div className={`absolute top-0 right-0 w-3/4 max-w-sm h-full bg-white dark:bg-slate-900 shadow-2xl p-6 transition-transform duration-300 ease-out flex flex-col ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
           <div className="flex justify-between items-center mb-8 border-b dark:border-slate-700 pb-4">
              <h2 className="text-2xl font-bold font-cairo text-brand-blue dark:text-white">القائمة</h2>
              <button onClick={() => setIsSidebarOpen(false)} className="text-gray-400 hover:text-red-500 bg-gray-100 dark:bg-slate-800 p-2 rounded-full transition-colors"><X size={24} /></button>
           </div>
           
           <nav className="flex flex-col gap-3 flex-1">
              <button onClick={() => { setView(PageView.HOME); setIsSidebarOpen(false); }} className={`flex items-center gap-4 p-4 rounded-xl font-bold text-lg transition-colors ${view === PageView.HOME ? 'bg-brand-blue text-white shadow-lg shadow-blue-200 dark:shadow-none' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800'}`}>
                 <Home size={22} /> الرئيسية
              </button>
              <button onClick={() => { setView(PageView.MENU); setIsSidebarOpen(false); }} className={`flex items-center gap-4 p-4 rounded-xl font-bold text-lg transition-colors ${view === PageView.MENU ? 'bg-brand-blue text-white shadow-lg shadow-blue-200 dark:shadow-none' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800'}`}>
                 <MenuIcon size={22} /> المنيو
              </button>
              <button onClick={() => { setView(PageView.FAVORITES); setIsSidebarOpen(false); }} className={`flex items-center gap-4 p-4 rounded-xl font-bold text-lg transition-colors ${view === PageView.FAVORITES ? 'bg-brand-blue text-white shadow-lg shadow-blue-200 dark:shadow-none' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800'}`}>
                 <Heart size={22} /> المفضلة {favorites.length > 0 && <span className="mr-auto bg-brand-red text-white text-xs px-2 py-0.5 rounded-full">{favorites.length}</span>}
              </button>
              <button onClick={() => { setView(PageView.CART); setIsSidebarOpen(false); }} className={`flex items-center gap-4 p-4 rounded-xl font-bold text-lg transition-colors ${view === PageView.CART ? 'bg-brand-blue text-white shadow-lg shadow-blue-200 dark:shadow-none' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800'}`}>
                 <ShoppingBag size={22} /> السلة {cart.length > 0 && <span className="mr-auto bg-brand-red text-white text-xs px-2 py-0.5 rounded-full">{cart.reduce((a,b) => a+b.quantity, 0)}</span>}
              </button>
              <button onClick={() => { setView(PageView.ADMIN); setIsSidebarOpen(false); }} className={`flex items-center gap-4 p-4 rounded-xl font-bold text-lg transition-colors ${view === PageView.ADMIN ? 'bg-brand-blue text-white shadow-lg shadow-blue-200 dark:shadow-none' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800'}`}>
                 <Settings size={22} /> الإدارة
              </button>
           </nav>
           
           <div className="mt-auto pt-6 border-t dark:border-slate-700 text-center text-gray-400 text-sm">
             <p>ركن العمارية v1.0</p>
           </div>
        </div>
      </div>

      <main className="flex-1">
        {view === PageView.HOME && renderHome()}
        {view === PageView.MENU && renderMenu()}
        {view === PageView.CART && renderCart()}
        {view === PageView.FAVORITES && renderFavorites()}
        {view === PageView.ADMIN && (
          <Admin 
            products={products} 
            setProducts={setProducts} 
            categories={categories}
            setCategories={setCategories}
            brands={brands}
            setBrands={setBrands}
          />
        )}
      </main>

      <AIChef />
      
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Recipe Modal */}
      {recipeModal.isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-brand-blue/20 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200 border border-white/50 dark:border-slate-600">
            <div className="bg-brand-blue p-4 flex justify-between items-center text-white sticky top-0">
              <h3 className="font-bold text-lg flex items-center gap-2"><Utensils size={18} /> {recipeModal.title}</h3>
              <button onClick={() => setRecipeModal({...recipeModal, isOpen: false})}><Plus className="rotate-45" size={24} /></button>
            </div>
            <div className="p-6 text-gray-700 dark:text-gray-200 leading-relaxed whitespace-pre-line">
              {loadingRecipe ? (
                <div className="flex flex-col items-center py-10">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue mb-4"></div>
                  <p className="text-brand-blue dark:text-blue-300 font-bold">الشيف يجهز الوصفة...</p>
                </div>
              ) : (
                recipeModal.content
              )}
            </div>
            <div className="p-4 border-t dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-center">
              <button 
                onClick={() => setRecipeModal({...recipeModal, isOpen: false})}
                className="bg-brand-red text-white px-6 py-2 rounded-lg font-bold hover:bg-red-700 shadow-md"
              >
                شكراً يا شيف!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;