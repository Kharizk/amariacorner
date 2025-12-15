export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  brand: string;
  unit: string; // 'حبة' | 'كرتون' | 'كجم' etc.
  
  // Secondary Unit Options (e.g., Carton)
  secondaryUnit?: string; 
  secondaryPrice?: number;

  discountPercent?: number; // Optional discount percentage
  isNew?: boolean;
  offerQuantity?: number; // For bundle offers (e.g. 2 pieces)
  offerPrice?: number;   // Price for the bundle (e.g. 50 SAR)
}

export interface CartItem extends Product {
  quantity: number;
  selectedUnit: string; // The unit chosen by the user
  finalPrice: number;   // The price of that unit at time of purchase
  originalProductId: string; // Reference to the parent product
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  date: string;
  status: 'pending' | 'completed';
}

export enum PageView {
  HOME = 'HOME',
  MENU = 'MENU',
  ADMIN = 'ADMIN',
  CART = 'CART',
  FAVORITES = 'FAVORITES',
}

export const CATEGORIES = [
  'الكل',
  'بكجات التوفير',
  'لحوم',
  'دواجن مجمدة',
  'دواجن مبردة',
  'بطاطس',
  'خضروات',
  'معجنات',
  'أجبان وألبان',
  'زيوت وسمن',
  'صوصات',
  'فواكه'
];

export const BRANDS = [
  'الكل',
  'ركن العمارية',
  'أمريكانا',
  'سيارا',
  'ساديا',
  'كواليكو',
  'ماكين',
  'لامب وستون',
  'الذهبية',
  'المراعي',
  'نادك',
  'رضوى',
  'اليوم',
  'بوك',
  'مازولا',
  'أخرى'
];

export const UNITS = [
  'حبة',
  'كرتون',
  'كجم',
  'كيس',
  'شدة',
  'جالون',
  'علبة',
  'طبق',
  'بكج'
];