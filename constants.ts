import { Product } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  // Americana
  {
    id: '1',
    name: 'برجر بقري أمريكانا',
    description: 'برجر بقري بالبهارات العربية الكلاسيكية، 24 قطعة.',
    price: 45,
    category: 'لحوم',
    brand: 'أمريكانا',
    unit: 'كيس',
    image: 'https://picsum.photos/400/300?random=1',
    discountPercent: 10
  },
  {
    id: '2',
    name: 'ناجت دجاج أمريكانا',
    description: 'ناجت دجاج مقرمش وسريع التحضير، عبوة عائلية.',
    price: 38,
    category: 'دواجن مجمدة',
    brand: 'أمريكانا',
    unit: 'كيس',
    image: 'https://picsum.photos/400/300?random=2',
  },
  {
    id: '3',
    name: 'لحم مفروم غنم أمريكانا',
    description: 'لحم غنم مفروم ناعم ممتاز، 400 جرام.',
    price: 12,
    category: 'لحوم',
    brand: 'أمريكانا',
    unit: 'حبة',
    image: 'https://picsum.photos/400/300?random=3',
  },

  // Sadia
  {
    id: '4',
    name: 'دجاج ساديا مجمد 1100 جم',
    description: 'دجاج كامل مجمد بدون أحشاء، مذبوح حلال.',
    price: 18,
    category: 'دواجن مجمدة',
    brand: 'ساديا',
    unit: 'حبة',
    image: 'https://picsum.photos/400/300?random=4',
    isNew: true
  },
  {
    id: '5',
    name: 'صدور دجاج طرية ساديا',
    description: 'صدور دجاج فيليه طرية ومجمدة فردياً، 2 كجم.',
    price: 65,
    category: 'دواجن مجمدة',
    brand: 'ساديا',
    unit: 'كيس',
    image: 'https://picsum.photos/400/300?random=5',
  },

  // Seara
  {
    id: '6',
    name: 'ستربس دجاج سيارا',
    description: 'شرائح دجاج (ستربس) حار ومقرمش 750 جم.',
    price: 28,
    category: 'دواجن مجمدة',
    brand: 'سيارا',
    unit: 'كيس',
    image: 'https://picsum.photos/400/300?random=6',
  },
  {
    id: '7',
    name: 'دجاج سيارا كامل',
    description: 'كرتون دجاج سيارا مجمد 10 حبات * 1000 جم.',
    price: 150,
    category: 'دواجن مجمدة',
    brand: 'سيارا',
    unit: 'كرتون',
    image: 'https://picsum.photos/400/300?random=7',
    discountPercent: 5
  },

  // Fries (McCain, Lamb Weston, Golden)
  {
    id: '8',
    name: 'بطاطس ماكين رفيعة',
    description: 'أصابع بطاطس رفيعة للقلي، مقرمشة وذهبية 2.5 كجم.',
    price: 35,
    category: 'بطاطس',
    brand: 'ماكين',
    unit: 'كيس',
    image: 'https://picsum.photos/400/300?random=8',
  },
  {
    id: '9',
    name: 'بطاطس تويستر لامب وستون',
    description: 'بطاطس تويستر (لولبية) متبلة، المفضلة للمطاعم.',
    price: 42,
    category: 'بطاطس',
    brand: 'لامب وستون',
    unit: 'كيس',
    image: 'https://picsum.photos/400/300?random=9',
    isNew: true
  },
  {
    id: '10',
    name: 'بطاطس الذهبية',
    description: 'بطاطس كلاسيكية 2.5 كجم، جودة عالية وسعر منافس.',
    price: 25,
    category: 'بطاطس',
    brand: 'الذهبية',
    unit: 'كيس',
    image: 'https://picsum.photos/400/300?random=10',
  },

  // Chilled Poultry
  {
    id: '11',
    name: 'دجاج رضوى مبرد',
    description: 'دجاج طازج مبرد، إنتاج محلي يومي، 1000 جم.',
    price: 21,
    category: 'دواجن مبردة',
    brand: 'رضوى',
    unit: 'حبة',
    image: 'https://picsum.photos/400/300?random=11',
  },
  {
    id: '12',
    name: 'فيليه صدور اليوم',
    description: 'صدور دجاج مبردة طازجة من مزارع اليوم، 450 جم.',
    price: 24,
    category: 'دواجن مبردة',
    brand: 'اليوم',
    unit: 'طبق',
    image: 'https://picsum.photos/400/300?random=12',
  },

  // Qualiko
  {
    id: '13',
    name: 'إسكالوب دجاج كواليكو',
    description: 'إسكالوب دجاج فاخر ومتبل، جاهز للقلي.',
    price: 32,
    category: 'دواجن مجمدة',
    brand: 'كواليكو',
    unit: 'كيس',
    image: 'https://picsum.photos/400/300?random=13',
  },

  // Sauces & Oils & Cheese
  {
    id: '14',
    name: 'جبنة شيدر سائلة',
    description: 'صوص جبنة شيدر للمطاعم والبرجر، 1 كجم.',
    price: 30,
    category: 'صوصات',
    brand: 'بوك',
    unit: 'حبة',
    image: 'https://picsum.photos/400/300?random=14',
  },
  {
    id: '15',
    name: 'زيت قلي مازولا',
    description: 'زيت ذرة نقي للقلي والطبخ، 9 لتر.',
    price: 95,
    category: 'زيوت وسمن',
    brand: 'مازولا',
    unit: 'جالون',
    image: 'https://picsum.photos/400/300?random=15',
  },
  {
    id: '16',
    name: 'سمن نباتي شوكة وملعقة',
    description: 'سمن بنكهة الزبدة، مثالي للحلويات والمأكولات الشعبية.',
    price: 18,
    category: 'زيوت وسمن',
    brand: 'أخرى',
    unit: 'علبة',
    image: 'https://picsum.photos/400/300?random=16',
  },
  {
    id: '17',
    name: 'جبنة موزاريلا مبشورة',
    description: 'جبنة موزاريلا للبيتزا والمعجنات، تمط وتذوب.',
    price: 40,
    category: 'أجبان وألبان',
    brand: 'المراعي',
    unit: 'كيس',
    image: 'https://picsum.photos/400/300?random=17',
  }
];