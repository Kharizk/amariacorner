export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  brand: string;
  unit: string; // 'حبة' | 'كرتون' | 'كجم' etc.
  discountPercent?: number; // Optional discount percentage
  isNew?: boolean;
  offerQuantity?: number; // For bundle offers (e.g. 2 pieces)
  offerPrice?: number;   // Price for the bundle (e.g. 50 SAR)
}

export interface CartItem extends Product {
  quantity: number;
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
}

export const CATEGORIES = [
  'الكل',
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
  'طبق'
];