import React, { useState, useEffect, useMemo } from 'react';
import Navbar from './components/Navbar';
import Admin from './components/Admin';
import AIChef from './components/AIChef';
import { Product, CartItem, PageView, CATEGORIES, BRANDS } from './types';
import { INITIAL_PRODUCTS } from './constants';
import { Plus, Minus, Trash, ShoppingBag, ArrowRight, Tag, Star, Utensils, Filter } from 'lucide-react';
import { getRecipeSuggestion } from './services/geminiService';

const App: React.FC = () => {
  const [view, setView] = useState<PageView>(PageView.HOME);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [cart, setCart] = useState<CartItem[]>([]);
  
  // Dynamic State for Categories and Brands
  const [categories, setCategories] = useState<string[]>(CATEGORIES);
  const [brands, setBrands] = useState<string[]>(BRANDS);

  const [selectedCategory, setSelectedCategory] = useState('الكل');
  const [selectedBrand, setSelectedBrand] = useState('الكل');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [recipeModal, setRecipeModal] = useState<{isOpen: boolean, content: string, title: string}>({isOpen: false, content: '', title: ''});
  const [loadingRecipe, setLoadingRecipe] = useState(false);

  // Reset selected brand when category changes to avoid empty states
  useEffect(() => {
    setSelectedBrand('الكل');
  }, [selectedCategory]);

  // Compute available brands based on selected category
  const availableBrands = useMemo(() => {
    if (selectedCategory === 'الكل') {
      return brands;
    }
    
    // Find unique brands that exist within the selected category
    const relevantBrands = new Set(
      products
        .filter(p => p.category === selectedCategory)
        .map(p => p.brand)
    );

    // Return 'الكل' plus the filtered brands
    return ['الكل', ...Array.from(relevantBrands)];
  }, [selectedCategory, products, brands]);

  // Cart Helpers
  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const cartTotal = cart.reduce((sum, item) => {
    const price = item.discountPercent ? item.price * (1 - item.discountPercent / 100) : item.price;
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

  // Filter Products
  const filteredProducts = products.filter(p => {
    const categoryMatch = selectedCategory === 'الكل' || p.category === selectedCategory;
    const brandMatch = selectedBrand === 'الكل' || p.brand === selectedBrand;
    return categoryMatch && brandMatch;
  });

  // --- Components Render ---

  const renderHome = () => (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section - Blue Gradient */}
      <div className="relative bg-gradient-to-br from-brand-blue to-blue-900 h-[500px] flex items-center justify-center text-center px-4 overflow-hidden">
        {/* Abstract Shapes */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl translate-x-[-50%] translate-y-[-50%]"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-red opacity-10 rounded-full blur-3xl translate-x-[20%] translate-y-[20%]"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="flex justify-center mb-6">
             <span className="bg-brand-red text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider animate-pulse">
               جودة مضمونة 100%
             </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold font-cairo text-white mb-6 drop-shadow-xl">
            ركن العمارية
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-10 font-light max-w-2xl mx-auto leading-relaxed">
            الوجهة الأولى للمجمدات الغذائية. نوفر لك أجود المنتجات العالمية والمحلية بأسعار منافسة وخدمة متميزة.
          </p>
          <button 
            onClick={() => setView(PageView.MENU)}
            className="bg-white text-brand-blue px-10 py-4 rounded-full text-xl font-bold hover:bg-gray-50 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 flex items-center gap-3 mx-auto border-4 border-brand-blue/20"
          >
            تصفح المنتجات
            <ArrowRight className="text-brand-red" />
          </button>
        </div>
      </div>

      {/* Brands Preview */}
      <div className="py-12 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 overflow-hidden">
           <h3 className="text-center text-gray-400 font-bold mb-8">شركاء النجاح</h3>
           <div className="flex flex-wrap justify-center gap-8 items-center opacity-60 hover:opacity-100 transition-opacity">
             {brands.slice(1, 6).map(b => (
               <span key={b} className="text-2xl font-black text-gray-300 hover:text-brand-blue transition-colors cursor-default select-none">{b}</span>
             ))}
           </div>
        </div>
      </div>

      {/* Categories Preview */}
      <div className="py-16 px-4 max-w-7xl mx-auto w-full">
        <div className="flex items-end justify-between mb-12">
           <div>
              <h2 className="text-3xl font-bold text-brand-blue mb-2 font-cairo">أقسامنا المميزة</h2>
              <span className="h-1 w-20 bg-brand-red block rounded-full"></span>
           </div>
           <button onClick={() => setView(PageView.MENU)} className="text-brand-red font-bold hover:underline flex items-center gap-1">عرض الكل <ArrowRight size={16}/></button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories.slice(1).slice(0, 4).map((cat, idx) => (
             <div 
               key={cat} 
               onClick={() => { setSelectedCategory(cat); setView(PageView.MENU); }}
               className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-xl transition-all cursor-pointer border border-gray-100 hover:border-brand-blue group text-center relative overflow-hidden"
             >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-blue to-brand-red scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
                <div className="w-16 h-16 bg-blue-50 text-brand-blue rounded-full mx-auto mb-4 flex items-center justify-center text-3xl group-hover:bg-brand-blue group-hover:text-white transition-colors">
                   {idx === 0 ? '🥩' : idx === 1 ? '🍗' : idx === 2 ? '🍟' : '🧀'}
                </div>
                <h3 className="text-xl font-bold text-gray-800">{cat}</h3>
             </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderMenu = () => (
    <div className="max-w-7xl mx-auto px-4 py-8 min-h-screen">
      <div className="flex flex-col gap-6 mb-8">
        <div>
          <h2 className="text-3xl font-bold font-cairo text-brand-blue mb-2">قائمة المنتجات</h2>
          <p className="text-gray-500">تصفح منتجاتنا حسب القسم أو الشركة</p>
        </div>
        
        {/* Categories Scroller */}
        <div className="w-full overflow-hidden">
          <div className="flex items-center gap-2 mb-2 text-sm font-bold text-gray-700">
            <Filter size={16} /> تصنيف حسب القسم:
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl whitespace-nowrap transition-all border text-sm md:text-base font-medium ${
                  selectedCategory === cat 
                  ? 'bg-brand-blue text-white border-brand-blue shadow-lg shadow-blue-200' 
                  : 'bg-white text-gray-600 border-gray-200 hover:border-brand-blue hover:text-brand-blue'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Brands Scroller */}
        <div className="w-full overflow-hidden">
           <div className="flex items-center gap-2 mb-2 text-sm font-bold text-gray-700">
            <Filter size={16} /> تصنيف حسب الشركة:
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {availableBrands.map(brand => (
              <button
                key={brand}
                onClick={() => setSelectedBrand(brand)}
                className={`px-4 py-1.5 rounded-full whitespace-nowrap transition-colors border text-xs md:text-sm ${
                  selectedBrand === brand 
                  ? 'bg-brand-red text-white font-bold border-brand-red shadow-md' 
                  : 'bg-gray-100 text-gray-500 border-transparent hover:bg-white hover:border-gray-300'
                }`}
              >
                {brand}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map(product => (
          <div key={product.id} className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col h-full border border-gray-100 overflow-hidden relative">
            
            {/* Badges */}
            <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
              {product.discountPercent && (
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

            {/* Brand Badge */}
            <div className="absolute top-3 left-3 z-10">
               <span className="bg-white/90 backdrop-blur-sm text-brand-blue text-[10px] font-bold px-2 py-1 rounded-full shadow-sm border border-blue-50">
                 {product.brand}
               </span>
            </div>

            {/* Image */}
            <div className="relative h-48 overflow-hidden bg-gray-50">
              <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              <button 
                onClick={(e) => { e.stopPropagation(); handleAskChef(product); }}
                className="absolute bottom-2 left-2 bg-white/95 backdrop-blur-sm text-brand-leaf p-2 rounded-full shadow-lg hover:bg-brand-leaf hover:text-white transition-colors text-xs flex items-center gap-1 border border-brand-leaf/20"
                title="كيف أطبخ هذا؟"
              >
                <Utensils size={14} /> وصفة الشيف
              </button>
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col flex-1">
              <div className="flex justify-between items-start mb-1">
                <h3 className="text-lg font-bold text-gray-800">{product.name}</h3>
              </div>
              <p className="text-xs text-brand-blue font-bold mb-1 opacity-80">{product.brand} - {product.category}</p>
              <p className="text-sm text-gray-500 mb-4 flex-1 line-clamp-2">{product.description}</p>
              
              {/* Special Offer Badge */}
              {product.offerQuantity && product.offerPrice && (
                 <div className="mb-2">
                   <span className="inline-block bg-orange-50 text-orange-600 border border-orange-200 text-xs font-bold px-2 py-1 rounded-md animate-pulse">
                     🔥 {product.offerQuantity} حبات بـ {product.offerPrice} ريال
                   </span>
                 </div>
              )}

              <div className="mt-auto flex items-center justify-between border-t pt-3 border-gray-50">
                <div>
                   {product.discountPercent ? (
                     <div className="flex flex-col">
                       <span className="text-xs text-gray-400 line-through">{product.price} ر.س</span>
                       <div className="flex items-baseline gap-1">
                          <span className="text-xl font-bold text-brand-red">
                            {(product.price * (1 - product.discountPercent/100)).toFixed(0)} ر.س
                          </span>
                          <span className="text-xs text-gray-500">/ {product.unit}</span>
                       </div>
                     </div>
                   ) : (
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-bold text-brand-blue">{product.price} ر.س</span>
                        <span className="text-xs text-gray-500">/ {product.unit}</span>
                      </div>
                   )}
                </div>
                <button 
                  onClick={() => addToCart(product)}
                  className="bg-brand-blue text-white p-2.5 rounded-xl hover:bg-blue-800 transition-colors shadow-lg shadow-blue-100 active:scale-95 flex items-center justify-center"
                >
                  <Plus size={20} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {filteredProducts.length === 0 && (
        <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
          <p className="text-xl text-gray-400 mb-2">لا توجد منتجات مطابقة للبحث.</p>
          <button 
             onClick={() => {setSelectedCategory('الكل'); setSelectedBrand('الكل');}}
             className="text-brand-blue font-bold hover:underline"
          >
            إعادة تعيين الفلاتر
          </button>
        </div>
      )}
    </div>
  );

  const renderCart = () => (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold font-cairo text-brand-blue mb-8 flex items-center gap-3">
        <ShoppingBag />
        سلة المشتريات
      </h2>
      
      {cart.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-dashed border-gray-300">
          <ShoppingBag size={64} className="mx-auto text-gray-300 mb-4" />
          <p className="text-xl text-gray-500 mb-6">السلة فارغة</p>
          <button onClick={() => setView(PageView.MENU)} className="text-brand-blue font-bold hover:underline">العودة للتسوق</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-2 space-y-4">
             {cart.map(item => (
               <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm flex items-center gap-4 border border-gray-100">
                 <img src={item.image} alt={item.name} className="w-20 h-20 rounded-lg object-cover bg-gray-50" />
                 <div className="flex-1">
                   <h3 className="font-bold text-gray-800">{item.name}</h3>
                   <div className="flex gap-2 text-xs text-gray-500 mb-1">
                      <span>{item.brand}</span>
                      <span>•</span>
                      <span>{item.category}</span>
                      <span>•</span>
                      <span className="text-brand-blue font-bold">{item.unit}</span>
                   </div>
                   <span className="text-brand-blue text-sm font-bold">
                     {item.discountPercent 
                       ? (item.price * (1 - item.discountPercent / 100)).toFixed(0) 
                       : item.price} ر.س
                   </span>
                 </div>
                 <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1 border border-gray-200">
                   <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:bg-white rounded shadow-sm transition-colors text-brand-blue"><Minus size={16} /></button>
                   <span className="font-bold w-6 text-center">{item.quantity}</span>
                   <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:bg-white rounded shadow-sm transition-colors text-brand-blue"><Plus size={16} /></button>
                 </div>
                 <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-600 p-2"><Trash size={18} /></button>
               </div>
             ))}
           </div>
           
           <div className="lg:col-span-1">
             <div className="bg-white p-6 rounded-2xl shadow-lg border-t-4 border-brand-red sticky top-24">
               <h3 className="text-xl font-bold mb-4 border-b pb-2 text-gray-800">ملخص الطلب</h3>
               <div className="space-y-2 mb-6 text-sm text-gray-600">
                 <div className="flex justify-between">
                   <span>عدد المنتجات</span>
                   <span>{cartCount}</span>
                 </div>
                 <div className="flex justify-between">
                   <span>التوصيل</span>
                   <span>15 ر.س</span>
                 </div>
               </div>
               <div className="flex justify-between text-xl font-bold text-brand-blue mb-6 border-t pt-4">
                 <span>الإجمالي</span>
                 <span>{(cartTotal + 15).toFixed(0)} ر.س</span>
               </div>
               <button 
                 onClick={() => alert('تم إرسال الطلب بنجاح! شكراً لاختياركم ركن العمارية.')}
                 className="w-full bg-brand-blue text-white py-3 rounded-xl font-bold hover:bg-blue-800 transition-transform active:scale-95 shadow-lg flex items-center justify-center gap-2"
               >
                 إتمام الطلب
               </button>
             </div>
           </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col font-sans text-right" dir="rtl">
      <Navbar 
        cartCount={cartCount} 
        setView={setView} 
        currentView={view} 
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <main className="flex-1">
        {view === PageView.HOME && renderHome()}
        {view === PageView.MENU && renderMenu()}
        {view === PageView.CART && renderCart()}
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

      {/* Recipe Modal */}
      {recipeModal.isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-brand-blue/20 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200 border border-white/50">
            <div className="bg-brand-blue p-4 flex justify-between items-center text-white sticky top-0">
               <h3 className="font-bold text-lg flex items-center gap-2"><Utensils size={18} /> {recipeModal.title}</h3>
               <button onClick={() => setRecipeModal({...recipeModal, isOpen: false})}><Plus className="rotate-45" size={24} /></button>
            </div>
            <div className="p-6 text-gray-700 leading-relaxed whitespace-pre-line">
              {loadingRecipe ? (
                <div className="flex flex-col items-center py-10">
                   <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue mb-4"></div>
                   <p className="text-brand-blue font-bold">الشيف يجهز الوصفة...</p>
                </div>
              ) : (
                recipeModal.content
              )}
            </div>
             <div className="p-4 border-t bg-gray-50 text-center">
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