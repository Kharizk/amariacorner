import { Product } from './types';

// Helper to generate consistent search-based image URLs
// This replaces AI generation with direct image search results
const getProductImage = (query: string) => {
  return `https://tse2.mm.bing.net/th?q=${encodeURIComponent(query)}&w=500&h=500&c=7&rs=1&p=0`;
};

export const INITIAL_PRODUCTS: Product[] = [
  // Bundles (New Category)
  {
    id: 'b1',
    name: 'بوكس الشواء الملكي',
    description: 'كل ما تحتاجه للشواء: 24 برجر أمريكانا + كيس بطاطس + خبز برجر + صوص شيدر.',
    price: 99,
    category: 'بكجات التوفير',
    brand: 'ركن العمارية',
    unit: 'بكج',
    image: getProductImage('bbq burger kit food box'),
    offerQuantity: 1,
    offerPrice: 85,
    isNew: true
  },
  {
    id: 'b2',
    name: 'بكج سحور رمضان',
    description: 'كرتون دجاج سيارا + كيس سمبوسة كبير + عجينة رقائق + لبنة المراعي.',
    price: 180,
    category: 'بكجات التوفير',
    brand: 'ركن العمارية',
    unit: 'بكج',
    image: getProductImage('ramadan food box frozen'),
    discountPercent: 15
  },

  // Americana
  {
    id: '1',
    name: 'برجر بقري أمريكانا',
    description: 'برجر بقري بالبهارات العربية الكلاسيكية، 24 قطعة.',
    price: 45,
    category: 'لحوم',
    brand: 'أمريكانا',
    unit: 'كيس',
    secondaryUnit: 'كرتون',
    secondaryPrice: 250, // Example carton price
    image: getProductImage('Americana beef burger package'),
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
    secondaryUnit: 'كرتون',
    secondaryPrice: 210,
    image: getProductImage('Americana chicken nuggets bag'),
  },
  {
    id: '3',
    name: 'لحم مفروم غنم أمريكانا',
    description: 'لحم غنم مفروم ناعم ممتاز، 400 جرام.',
    price: 12,
    category: 'لحوم',
    brand: 'أمريكانا',
    unit: 'حبة',
    secondaryUnit: 'كرتون',
    secondaryPrice: 220, // 20 pieces roughly
    image: getProductImage('Americana minced mutton meat'),
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
    secondaryUnit: 'كرتون',
    secondaryPrice: 165, // 10 pieces
    image: getProductImage('Sadia frozen whole chicken'),
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
    secondaryUnit: 'كرتون',
    secondaryPrice: 380, // 6 bags
    image: getProductImage('Sadia chicken breast fillets bag'),
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
    secondaryUnit: 'كرتون',
    secondaryPrice: 260,
    image: getProductImage('Seara spicy chicken strips'),
  },
  {
    id: '7',
    name: 'دجاج سيارا كامل',
    description: 'كرتون دجاج سيارا مجمد 10 حبات * 1000 جم.',
    price: 150,
    category: 'دواجن مجمدة',
    brand: 'سيارا',
    unit: 'كرتون',
    image: getProductImage('Seara frozen chicken box'),
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
    secondaryUnit: 'كرتون',
    secondaryPrice: 130, // 4 bags
    image: getProductImage('McCain french fries bag'),
  },
  {
    id: '9',
    name: 'بطاطس تويستر لامب وستون',
    description: 'بطاطس تويستر (لولبية) متبلة، المفضلة للمطاعم.',
    price: 42,
    category: 'بطاطس',
    brand: 'لامب وستون',
    unit: 'كيس',
    secondaryUnit: 'كرتون',
    secondaryPrice: 195, // 5 bags
    image: getProductImage('Lamb Weston twister fries bag'),
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
    secondaryUnit: 'كرتون',
    secondaryPrice: 95, // 4 bags
    image: getProductImage('Golden french fries bag'),
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
    secondaryUnit: 'كرتون',
    secondaryPrice: 190,
    image: getProductImage('Radwa fresh chicken'),
  },
  {
    id: '12',
    name: 'فيليه صدور اليوم',
    description: 'صدور دجاج مبردة طازجة من مزارع اليوم، 450 جم.',
    price: 24,
    category: 'دواجن مبردة',
    brand: 'اليوم',
    unit: 'طبق',
    image: getProductImage('Alyoum chicken breast fillet'),
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
    image: getProductImage('Qualiko chicken escalope'),
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
    image: getProductImage('Puck cheddar cheese jar'),
  },
  {
    id: '15',
    name: 'زيت قلي مازولا',
    description: 'زيت ذرة نقي للقلي والطبخ، 9 لتر.',
    price: 95,
    category: 'زيوت وسمن',
    brand: 'مازولا',
    unit: 'جالون',
    image: getProductImage('Mazola corn oil 9L'),
  },
  {
    id: '16',
    name: 'سمن نباتي شوكة وملعقة',
    description: 'سمن بنكهة الزبدة، مثالي للحلويات والمأكولات الشعبية.',
    price: 18,
    category: 'زيوت وسمن',
    brand: 'أخرى',
    unit: 'علبة',
    image: getProductImage('Vegetable ghee spoon and fork'),
  },
  {
    id: '17',
    name: 'جبنة موزاريلا مبشورة',
    description: 'جبنة موزاريلا للبيتزا والمعجنات، تمط وتذوب.',
    price: 40,
    category: 'أجبان وألبان',
    brand: 'المراعي',
    unit: 'كيس',
    image: getProductImage('Almarai mozzarella cheese shredded'),
  }
];