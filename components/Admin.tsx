import React, { useState, useRef } from 'react';
import { Product, UNITS } from '../types';
import { Plus, Trash, Edit, Save, X, Image as ImageIcon, Filter, Sparkles, Settings as SettingsIcon, Package, Tag, Download, Upload, FileSpreadsheet, Search, Box } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { generateProductDescription } from '../services/geminiService';
import * as XLSX from 'xlsx';

interface AdminProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  categories: string[];
  setCategories: React.Dispatch<React.SetStateAction<string[]>>;
  brands: string[];
  setBrands: React.Dispatch<React.SetStateAction<string[]>>;
}

const Admin: React.FC<AdminProps> = ({ products, setProducts, categories, setCategories, brands, setBrands }) => {
  const [activeTab, setActiveTab] = useState<'products' | 'settings'>('products');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Product Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>({});
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  
  // Form Search States
  const [brandSearch, setBrandSearch] = useState('');
  const [categorySearch, setCategorySearch] = useState('');

  // Filtering States
  const [filterCategory, setFilterCategory] = useState('الكل');
  const [filterBrand, setFilterBrand] = useState('الكل');

  // Settings State
  const [newItemName, setNewItemName] = useState('');

  const filteredProducts = products.filter(p => {
    const categoryMatch = filterCategory === 'الكل' || p.category === filterCategory;
    const brandMatch = filterBrand === 'الكل' || p.brand === filterBrand;
    return categoryMatch && brandMatch;
  });

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setFormData(product);
    setIsFormOpen(true);
    setBrandSearch('');
    setCategorySearch('');
  };

  const handleDelete = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleSave = () => {
    if (!formData.name || !formData.price) return;

    const updatedProduct = {
      ...formData,
      // Ensure numeric fields are saved correctly
      offerQuantity: formData.offerQuantity ? Number(formData.offerQuantity) : undefined,
      offerPrice: formData.offerPrice ? Number(formData.offerPrice) : undefined,
      secondaryPrice: formData.secondaryPrice ? Number(formData.secondaryPrice) : undefined,
      secondaryUnit: formData.secondaryUnit || undefined,
    };

    if (editingId) {
      setProducts(prev => prev.map(p => p.id === editingId ? { ...p, ...updatedProduct } as Product : p));
    } else {
      const newProduct: Product = {
        id: Date.now().toString(),
        name: formData.name,
        description: formData.description || '',
        price: Number(formData.price),
        image: formData.image || 'https://picsum.photos/400/300',
        category: formData.category || 'عام',
        brand: formData.brand || 'أخرى',
        unit: formData.unit || 'حبة',
        discountPercent: formData.discountPercent || 0,
        isNew: true,
        offerQuantity: updatedProduct.offerQuantity,
        offerPrice: updatedProduct.offerPrice,
        secondaryUnit: updatedProduct.secondaryUnit,
        secondaryPrice: updatedProduct.secondaryPrice,
      };
      setProducts(prev => [newProduct, ...prev]);
    }
    closeForm();
  };

  const closeForm = () => {
    setEditingId(null);
    setFormData({});
    setIsFormOpen(false);
    setBrandSearch('');
    setCategorySearch('');
  };

  const handleGenerateDescription = async () => {
    if (!formData.name) return;
    setIsGeneratingDesc(true);
    const desc = await generateProductDescription(formData.name, formData.brand || '');
    setFormData(prev => ({ ...prev, description: desc }));
    setIsGeneratingDesc(false);
  };

  const handleSearchImage = () => {
    if (!formData.name) return;
    
    // Construct a search query
    const brandText = formData.brand && formData.brand !== 'أخرى' ? formData.brand : '';
    const query = `${brandText} ${formData.name} packaging`;
    
    // Use Bing Thumbnail API for "Search"
    const imageUrl = `https://tse2.mm.bing.net/th?q=${encodeURIComponent(query)}&w=500&h=500&c=7&rs=1&p=0`;
    
    setFormData(prev => ({ ...prev, image: imageUrl }));
  };

  // Excel Handlers
  const handleDownloadTemplate = () => {
    const headers = [
      'name', 
      'description', 
      'price', 
      'category', 
      'brand', 
      'unit', 
      'secondaryUnit',
      'secondaryPrice',
      'discountPercent', 
      'image', 
      'offerQuantity', 
      'offerPrice'
    ];
    
    // Sample Data row in Arabic/English to guide user
    const sampleData = [
      'مثال: برجر دجاج', 
      'وصف للمنتج...', 
      45, 
      'دواجن مجمدة', 
      'أمريكانا', 
      'كيس', 
      'كرتون',
      250,
      0, 
      'https://picsum.photos/400/300', 
      2, 
      80
    ];

    const ws = XLSX.utils.aoa_to_sheet([headers, sampleData]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Products Template");
    XLSX.writeFile(wb, "Rokan_Amaria_Products_Template.xlsx");
  };

  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);

      const newProducts: Product[] = data.map((item: any) => ({
        id: 'imported_' + Date.now() + Math.random().toString(36).substr(2, 9),
        name: item.name || 'منتج جديد',
        description: item.description || '',
        price: Number(item.price) || 0,
        category: item.category || 'عام',
        brand: item.brand || 'أخرى',
        unit: item.unit || 'حبة',
        secondaryUnit: item.secondaryUnit || undefined,
        secondaryPrice: item.secondaryPrice ? Number(item.secondaryPrice) : undefined,
        discountPercent: Number(item.discountPercent) || 0,
        image: item.image || 'https://picsum.photos/400/300',
        offerQuantity: item.offerQuantity ? Number(item.offerQuantity) : undefined,
        offerPrice: item.offerPrice ? Number(item.offerPrice) : undefined,
        isNew: true
      }));

      if (newProducts.length > 0) {
        setProducts(prev => [...newProducts, ...prev]);
        
        // Optionally update categories and brands if new ones are introduced
        const importedCategories = new Set(newProducts.map(p => p.category));
        const importedBrands = new Set(newProducts.map(p => p.brand));

        setCategories(prev => {
          const newCats = Array.from(importedCategories).filter(c => !prev.includes(c));
          return [...prev, ...newCats];
        });

        setBrands(prev => {
           const newBrands = Array.from(importedBrands).filter(b => !prev.includes(b));
           return [...prev, ...newBrands];
        });

        alert(`تم استيراد ${newProducts.length} منتج بنجاح!`);
      }
    };
    reader.readAsBinaryString(file);
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };


  // Settings Handlers
  const handleAddItem = (type: 'category' | 'brand') => {
    if (!newItemName.trim()) return;
    if (type === 'category') {
      if (!categories.includes(newItemName)) setCategories(prev => [...prev, newItemName]);
    } else {
      if (!brands.includes(newItemName)) setBrands(prev => [...prev, newItemName]);
    }
    setNewItemName('');
  };

  const handleDeleteItem = (type: 'category' | 'brand', name: string) => {
    if (confirm(`حذف ${name}؟`)) {
      if (type === 'category') setCategories(prev => prev.filter(i => i !== name));
      else setBrands(prev => prev.filter(i => i !== name));
    }
  };

  // Chart Data
  const chartData = products.slice(0, 10).map(p => ({
    name: p.name.substring(0, 15) + '...',
    sales: Math.floor(Math.random() * 100) + 10,
  }));

  const filteredBrandsForForm = brands.filter(b => b !== 'الكل' && b.includes(brandSearch));
  const filteredCategoriesForForm = categories.filter(c => c !== 'الكل' && c.includes(categorySearch));

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h2 className="text-3xl font-bold font-cairo text-brand-blue dark:text-white">لوحة التحكم</h2>
        <div className="flex bg-white dark:bg-slate-800 p-1 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
          <button 
            onClick={() => setActiveTab('products')}
            className={`px-6 py-2 rounded-md font-bold transition-all ${activeTab === 'products' ? 'bg-brand-blue text-white shadow-md' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700'}`}
          >
            المنتجات
          </button>
          <button 
             onClick={() => setActiveTab('settings')}
             className={`px-6 py-2 rounded-md font-bold transition-all ${activeTab === 'settings' ? 'bg-brand-blue text-white shadow-md' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700'}`}
          >
             الإعدادات (الأقسام/الشركات)
          </button>
        </div>
      </div>

      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in">
           {/* Manage Categories */}
           <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-brand-blue dark:text-blue-300"><SettingsIcon size={20}/> إدارة الأقسام</h3>
              <div className="flex gap-2 mb-4">
                <input 
                  type="text" 
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="اسم القسم الجديد..."
                  className="flex-1 border dark:border-slate-600 bg-white dark:bg-slate-700 p-2 rounded-lg focus:ring-brand-blue dark:text-white"
                />
                <button onClick={() => handleAddItem('category')} className="bg-brand-red text-white px-4 rounded-lg font-bold hover:bg-red-700"><Plus/></button>
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.filter(c => c !== 'الكل').map(cat => (
                  <div key={cat} className="bg-blue-50 dark:bg-slate-700 text-brand-blue dark:text-blue-200 px-3 py-1 rounded-full flex items-center gap-2 group border border-blue-100 dark:border-slate-600">
                    {cat}
                    <button onClick={() => handleDeleteItem('category', cat)} className="text-blue-300 dark:text-blue-400 hover:text-red-500"><X size={14}/></button>
                  </div>
                ))}
              </div>
           </div>

           {/* Manage Brands */}
           <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-brand-blue dark:text-blue-300"><Package size={20}/> إدارة الشركات</h3>
              <div className="flex gap-2 mb-4">
                <input 
                  type="text" 
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="اسم الشركة الجديدة..."
                  className="flex-1 border dark:border-slate-600 bg-white dark:bg-slate-700 p-2 rounded-lg focus:ring-brand-blue dark:text-white"
                />
                <button onClick={() => handleAddItem('brand')} className="bg-brand-red text-white px-4 rounded-lg font-bold hover:bg-red-700"><Plus/></button>
              </div>
              <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto">
                {brands.filter(b => b !== 'الكل').map(brand => (
                  <div key={brand} className="bg-gray-100 dark:bg-slate-700 px-3 py-1 rounded-full flex items-center gap-2 group text-gray-700 dark:text-gray-200">
                    {brand}
                    <button onClick={() => handleDeleteItem('brand', brand)} className="text-gray-400 hover:text-red-500"><X size={14}/></button>
                  </div>
                ))}
              </div>
           </div>
        </div>
      )}

      {activeTab === 'products' && (
        <>
          <div className="flex flex-wrap justify-end gap-3 mb-6">
             <button 
              onClick={handleDownloadTemplate}
              className="flex items-center gap-2 bg-brand-leaf text-white px-4 py-2 rounded-lg hover:bg-green-700 shadow-sm transition-all text-sm font-bold"
            >
              <Download size={18} />
              تحميل نموذج إكسيل
            </button>
            <div className="relative">
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleImportExcel}
                accept=".xlsx, .xls"
                className="hidden"
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 bg-brand-blue text-white px-4 py-2 rounded-lg hover:bg-blue-800 shadow-sm transition-all text-sm font-bold"
              >
                <Upload size={18} />
                رفع ملف منتجات
              </button>
            </div>
            <button 
              onClick={() => setIsFormOpen(true)}
              className="flex items-center gap-2 bg-brand-red text-white px-6 py-2 rounded-lg hover:bg-red-700 shadow-md transition-all font-bold"
            >
              <Plus size={20} />
              إضافة منتج جديد
            </button>
          </div>

          {/* Analytics Section */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 mb-8">
            <h3 className="text-xl font-bold mb-4 text-gray-700 dark:text-gray-200">تحليلات المبيعات (تجريبي)</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-slate-700" />
                  <XAxis dataKey="name" fontSize={10} interval={0} angle={-15} textAnchor="end" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} 
                    itemStyle={{ color: '#004890' }}
                  />
                  <Legend />
                  <Bar dataKey="sales" name="المبيعات" fill="#004890" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Filter Toolbar */}
          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 mb-6 flex flex-col md:flex-row gap-4 items-center">
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-200 font-bold">
              <Filter size={20} />
              <span>فرز المنتجات:</span>
            </div>
            
            <div className="flex gap-4 w-full md:w-auto">
              <select 
                value={filterCategory} 
                onChange={(e) => setFilterCategory(e.target.value)}
                className="border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-white rounded-lg p-2 focus:ring-brand-blue focus:border-brand-blue flex-1 md:w-48"
              >
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>

              <select 
                value={filterBrand} 
                onChange={(e) => setFilterBrand(e.target.value)}
                className="border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-white rounded-lg p-2 focus:ring-brand-blue focus:border-brand-blue flex-1 md:w-48"
              >
                {brands.map(brand => <option key={brand} value={brand}>{brand}</option>)}
              </select>
            </div>
            
            <div className="mr-auto text-sm text-gray-500 dark:text-gray-400">
               عدد المنتجات: {filteredProducts.length}
            </div>
          </div>

          {/* Product List */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                <thead className="bg-gray-50 dark:bg-slate-700">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">المنتج</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">الشركة</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">السعر</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">القسم</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">العروض</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap flex items-center gap-3">
                        <img src={product.image} alt={product.name} className="h-10 w-10 rounded-full object-cover border border-gray-200 dark:border-slate-600" />
                        <span className="font-medium text-gray-900 dark:text-gray-100">{product.name}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-300 font-medium">
                        {product.brand}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                           <span className="text-brand-blue dark:text-blue-300 font-bold">{product.price} ر.س <span className="text-xs text-gray-400">/ {product.unit}</span></span>
                           {product.secondaryPrice && (
                             <span className="text-gray-500 dark:text-gray-400 text-xs font-medium bg-gray-100 dark:bg-slate-600 px-1 py-0.5 rounded w-fit">{product.secondaryPrice} ر.س / {product.secondaryUnit}</span>
                           )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                          {product.category}
                        </span>
                      </td>
                       <td className="px-6 py-4 whitespace-nowrap">
                        {product.offerQuantity && product.offerPrice ? (
                          <span className="bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 px-2 py-1 rounded text-xs font-bold border border-orange-200 dark:border-orange-800">
                             {product.offerQuantity} بـ {product.offerPrice} ر.س
                          </span>
                        ) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-3">
                          <button onClick={() => handleEdit(product)} className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300">
                            <Edit size={18} />
                          </button>
                          <button onClick={() => handleDelete(product.id)} className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300">
                            <Trash size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Add/Edit Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={closeForm}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white dark:bg-slate-800 rounded-lg text-right overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
              <div className="bg-white dark:bg-slate-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4 max-h-[80vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4 border-b dark:border-slate-700 pb-2">
                   <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white" id="modal-title">
                    {editingId ? 'تعديل منتج' : 'إضافة منتج جديد'}
                  </h3>
                  <button onClick={closeForm} className="text-gray-400 hover:text-gray-500"><X size={20}/></button>
                </div>
                
                <div className="space-y-4">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">اسم المنتج</label>
                    <input 
                      type="text" 
                      className="w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-md p-2 focus:ring-brand-blue focus:border-brand-blue"
                      value={formData.name || ''}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      placeholder="مثال: برجر دجاج..."
                    />
                  </div>

                  {/* Price & Unit (Primary) */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">السعر (ر.س)</label>
                      <input 
                        type="number" 
                        className="w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-md p-2"
                        value={formData.price || ''}
                        onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                      />
                    </div>
                    <div>
                       <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الوحدة الأساسية</label>
                       <select 
                         className="w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-md p-2"
                         value={formData.unit || 'حبة'}
                         onChange={e => setFormData({...formData, unit: e.target.value})}
                      >
                        {UNITS.map(u => (
                          <option key={u} value={u}>{u}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Secondary Unit (Optional) */}
                   <div className="bg-gray-50 dark:bg-slate-900/50 p-3 rounded-lg border border-gray-200 dark:border-slate-700">
                    <h4 className="font-bold text-gray-700 dark:text-gray-300 text-sm mb-2 flex items-center gap-1"><Box size={14}/> وحدة ثانية (اختياري - كرتون)</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                         <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">اسم الوحدة (مثلاً كرتون)</label>
                         <select 
                           className="w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-md p-2 text-sm"
                           value={formData.secondaryUnit || ''}
                           onChange={e => setFormData({...formData, secondaryUnit: e.target.value})}
                        >
                          <option value="">اختر الوحدة</option>
                          {UNITS.map(u => (
                            <option key={u} value={u}>{u}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">السعر الثانوي</label>
                        <input 
                          type="number" 
                          className="w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-md p-2 text-sm"
                          value={formData.secondaryPrice || ''}
                          onChange={e => setFormData({...formData, secondaryPrice: Number(e.target.value)})}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Categories & Brands with Search */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">القسم (بحث)</label>
                      <input
                        type="text"
                        placeholder="ابحث..."
                        className="w-full text-xs border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded p-1 mb-1"
                        value={categorySearch}
                        onChange={e => setCategorySearch(e.target.value)}
                      />
                      <select 
                         className="w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-md p-2"
                         value={formData.category || ''}
                         onChange={e => setFormData({...formData, category: e.target.value})}
                      >
                        <option value="">اختر القسم</option>
                        {filteredCategoriesForForm.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الشركة (بحث)</label>
                      <input
                        type="text"
                        placeholder="ابحث..."
                        className="w-full text-xs border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded p-1 mb-1"
                        value={brandSearch}
                        onChange={e => setBrandSearch(e.target.value)}
                      />
                      <select 
                         className="w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-md p-2"
                         value={formData.brand || ''}
                         onChange={e => setFormData({...formData, brand: e.target.value})}
                      >
                        <option value="">اختر الشركة</option>
                        {filteredBrandsForForm.map(b => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Smart Description */}
                  <div>
                     <div className="flex justify-between items-center mb-1">
                       <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">الوصف</label>
                       <button 
                         type="button"
                         onClick={handleGenerateDescription}
                         disabled={isGeneratingDesc || !formData.name}
                         className="text-xs flex items-center gap-1 bg-blue-50 dark:bg-blue-900 text-brand-blue dark:text-blue-200 px-2 py-1 rounded hover:bg-blue-100 transition-colors disabled:opacity-50"
                       >
                         {isGeneratingDesc ? 'جاري الكتابة...' : <><Sparkles size={12}/> وصف ذكي</>}
                       </button>
                     </div>
                     <textarea 
                       className="w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-md p-2"
                       rows={3}
                       value={formData.description || ''}
                       onChange={e => setFormData({...formData, description: e.target.value})}
                     ></textarea>
                  </div>

                  {/* Offers Section */}
                  <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg border border-orange-100 dark:border-orange-800">
                    <h4 className="font-bold text-orange-800 dark:text-orange-300 text-sm mb-2 flex items-center gap-1"><Tag size={14}/> إضافة عرض خاص (اختياري)</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">الكمية للعرض (مثلاً 2)</label>
                        <input 
                          type="number" 
                          className="w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-md p-2 text-sm"
                          value={formData.offerQuantity || ''}
                          onChange={e => setFormData({...formData, offerQuantity: Number(e.target.value)})}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">سعر العرض (مثلاً 50)</label>
                        <input 
                          type="number" 
                          className="w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-md p-2 text-sm"
                          value={formData.offerPrice || ''}
                          onChange={e => setFormData({...formData, offerPrice: Number(e.target.value)})}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Image & Discount */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">رابط الصورة</label>
                        <button 
                           type="button"
                           onClick={handleSearchImage}
                           disabled={!formData.name}
                           className="text-xs flex items-center gap-1 bg-purple-50 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300 px-2 py-1 rounded hover:bg-purple-100 transition-colors disabled:opacity-50"
                        >
                          <Search size={12}/> بحث عن صورة
                        </button>
                      </div>
                      <input 
                        type="text" 
                        className="w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-md p-2"
                        value={formData.image || ''}
                        onChange={e => setFormData({...formData, image: e.target.value})}
                        placeholder="https://..."
                      />
                    </div>
                    <div>
                       <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">خصم مباشر (%)</label>
                      <input 
                        type="number" 
                        className="w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-md p-2"
                        value={formData.discountPercent || ''}
                        onChange={e => setFormData({...formData, discountPercent: Number(e.target.value)})}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-slate-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-lg">
                <button 
                  type="button" 
                  onClick={handleSave}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-brand-blue text-base font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue sm:ml-3 sm:w-auto sm:text-sm"
                >
                  <Save size={16} className="ml-2" />
                  حفظ
                </button>
                <button 
                  type="button" 
                  onClick={closeForm}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-slate-500 shadow-sm px-4 py-2 bg-white dark:bg-slate-600 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-500 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;