import { Category, Product, Voucher, Store, StoreReview } from '../types';

export const MOCK_STORES: Store[] = [
  {
    id: 'STORE_001',
    name: 'RAHIM PHARMACY',
    nameBn: 'রহিম ফার্মেসি',
    ownerId: 'USER_001',
    logo: 'https://images.unsplash.com/photo-1576602976047-174e57a47881?w=200&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1586015555751-63bb77f4322a?w=1200&auto=format&fit=crop&q=80',
    rating: 4.8,
    reviewCount: 1250,
    responseRate: '99%',
    category: 'Pharmacy & Healthcare',
    categoryBn: 'ফার্মেসি ও স্বাস্থ্যসেবা',
    location: 'Dhanmondi, Dhaka - 1209',
    locationBn: 'ধানমন্ডি, ঢাকা - ১২০৯',
    contactPhone: '+880 1711-002233',
    contactEmail: 'contact@rahimpharmacy.com',
    openingHours: '8:00 AM – 11:30 PM (Daily)',
    openingHoursBn: 'সকাল ৮:০০ – রাত ১১:৩০ (প্রতিদিন)',
    deliveryInfo: 'Express Home Delivery in 2-4 hours across Dhaka',
    deliveryInfoBn: 'ঢাকায় ২-৪ ঘণ্টার মধ্যে জরুরি ওষুধ হোম ডেলিভারি',
    joinedYear: 2019,
    isVerified: true,
    totalProducts: 42,
    offers: ['ফার্স্ট মেডিসিন অর্ডারে ১০% ছাড়', '৳৯৯৯ এর অর্ডারে ফ্রি ডেলিভারি'],
    description: 'Rahim Pharmacy is a verified Smart Business store providing 100% authentic medicines, baby food, and healthcare essentials directly to customers.',
    descriptionBn: 'স্মার্ট বিজনেসের সাথে সংযুক্ত অনুমোদিত ফার্মেসি। শতভাগ আসল ওষুধ, প্রেসক্রিপশন মেডিসিন ও স্বাস্থ্যপণ্য।'
  },
  {
    id: 'STORE_002',
    name: 'Anker Bangladesh Official Store',
    nameBn: 'অ্যাঙ্কার বাংলাদেশ অফিসিয়াল স্টোর',
    ownerId: 'USER_002',
    logo: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=200&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&auto=format&fit=crop&q=80',
    rating: 4.9,
    reviewCount: 3420,
    responseRate: '99%',
    category: 'Electronics & Audio Gadgets',
    categoryBn: 'ইলেকট্রনিক্স ও অডিও গ্যাজেট',
    location: 'Gulshan 1, Dhaka, Bangladesh',
    locationBn: 'গুলশান ১, ঢাকা, বাংলাদেশ',
    contactPhone: '+880 1712-445566',
    contactEmail: 'support@ankerbd.com',
    openingHours: '9:00 AM – 10:00 PM',
    openingHoursBn: 'সকাল ৯:০০ – রাত ১০:০০',
    deliveryInfo: 'Official 18 Months Brand Warranty & Express Courier',
    deliveryInfoBn: '১৮ মাসের অফিশিয়াল ওয়ারেন্টি ও সারা দেশে নিরাপদ হোম ডেলিভারি',
    joinedYear: 2021,
    isVerified: true,
    totalProducts: 28,
    offers: ['সাউন্ডকোর ইয়ারবাডসে মেগা ভাউচার', 'অফিসিয়াল ওয়ারেন্টি কার্ড অন্তর্ভুক্ত'],
    description: 'Official flagship store for Anker & Soundcore audio and power accessories in Bangladesh.',
    descriptionBn: 'বাংলাদেশে অ্যাঙ্কার ও সাউন্ডকোরের অনুমোদিত ফ্ল্যাগশিপ অনলাইন স্টোর।'
  },
  {
    id: 'STORE_003',
    name: 'Xiaomi Authorized Flagship Store',
    nameBn: 'শাওমি অথরাইজড ফ্ল্যাগশিপ স্টোর',
    ownerId: 'USER_003',
    logo: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200&auto=format&fit=crop&q=80',
    rating: 4.8,
    reviewCount: 2890,
    responseRate: '98%',
    category: 'Smartphones & Smart Devices',
    categoryBn: 'স্মার্টফোন ও স্মার্ট ডিভাইস',
    location: 'Jamuna Future Park, Dhaka',
    locationBn: 'যমুনা ফিউচার পার্ক, ঢাকা',
    contactPhone: '+880 1819-887766',
    contactEmail: 'sales@xiaomibd-flagship.com',
    openingHours: '10:00 AM – 9:00 PM',
    openingHoursBn: 'সকাল ১০:০০ – রাত ৯:০০',
    deliveryInfo: 'Fast delivery with 1 year official brand replacement guarantee',
    deliveryInfoBn: '১ বছরের অফিসিয়াল ব্র্যান্ড রিপ্লেসমেন্ট গ্যারান্টি',
    joinedYear: 2020,
    isVerified: true,
    totalProducts: 54,
    offers: ['স্মার্টওয়াচে ফ্রি অতিরিক্ত স্ট্র্যাপ', '৳৫০০০+ অর্ডারে ৳৩০০ ভাউচার'],
    description: 'Genuine Xiaomi smart devices, smartwatches, ecosystem products, and accessories.',
    descriptionBn: 'শতভাগ আসল শাওমি স্মার্ট ডিভাইস ও হোম অ্যাপ্লায়েন্স।'
  },
  {
    id: 'STORE_004',
    name: 'Elegance Fashion BD',
    nameBn: 'এলিগ্যান্স ফ্যাশন বিডি',
    ownerId: 'USER_004',
    logo: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=200&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&auto=format&fit=crop&q=80',
    rating: 4.7,
    reviewCount: 850,
    responseRate: '95%',
    category: 'Men & Women Fashion',
    categoryBn: 'পুরুষ ও নারীদের পোশাক',
    location: 'Narayanganj & Bashundhara City, Dhaka',
    locationBn: 'নারায়ণগঞ্জ ও বসুন্ধরা সিটি, ঢাকা',
    contactPhone: '+880 1912-334455',
    contactEmail: 'orders@elegancefashionbd.com',
    openingHours: '10:00 AM – 10:00 PM',
    openingHoursBn: 'সকাল ১০:০০ – রাত ১০:০০',
    deliveryInfo: 'Nationwide Home Delivery with Easy 7-Day Size Exchange',
    deliveryInfoBn: 'দেশজুড়ে হোম ডেলিভারি ও ৭ দিনে সাইজ এক্সচেঞ্জ সুবিধা',
    joinedYear: 2022,
    isVerified: true,
    totalProducts: 36,
    offers: ['যেকোনো ২টি পাঞ্জাবিতে ১০% বিশেষ ছাড়', 'ফ্রি ক্যাশ অন ডেলিভারি'],
    description: 'Handcrafted Panjabis, Kurtas and traditional wear with premium jacquard & cotton fabrics.',
    descriptionBn: 'আকর্ষণীয় ডিজাইনের আধুনিক পাঞ্জাবি ও উৎসবের পোশাক।'
  },
  {
    id: 'STORE_005',
    name: 'Pure Organic Agro Food',
    nameBn: 'পিওর অর্গানিক এগ্রো ফুড',
    ownerId: 'USER_005',
    logo: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?w=1200&auto=format&fit=crop&q=80',
    rating: 4.9,
    reviewCount: 1120,
    responseRate: '97%',
    category: 'Pure Honey & Organic Groceries',
    categoryBn: 'সুন্দরবনের খাঁটি মধু ও পুষ্টিকর খাদ্য',
    location: 'Khulna & Mohammadpur, Dhaka',
    locationBn: 'খুলনা ও মোহাম্মদপুর, ঢাকা',
    contactPhone: '+880 1612-998877',
    contactEmail: 'info@pureorganicfood.com',
    openingHours: '8:30 AM – 9:30 PM',
    openingHoursBn: 'সকাল ৮:৩০ – রাত ৯:৩০',
    deliveryInfo: 'Hygienically Packed Glass Bottles with Cash on Delivery',
    deliveryInfoBn: 'কাচের জারে নিরাপদ প্যাকেজিং ও দ্রুত ক্যাশ অন ডেলিভারি',
    joinedYear: 2021,
    isVerified: true,
    totalProducts: 19,
    offers: ['১ কেজির পাত্রে বিশেষ কাঠের চামচ ফ্রি', '১৫% ফ্ল্যাশ ডিসকাউন্ট'],
    description: '100% natural, lab-tested honey collected directly from Sundarbans beekeepers.',
    descriptionBn: 'সুন্দরবনের গভীর অরণ্যের মৌয়ালদের থেকে সংগৃহীত খাঁটি মধু ও অর্গানিক খাবার।'
  }
];

export const MOCK_STORE_REVIEWS: StoreReview[] = [
  {
    id: 'sr-01',
    storeId: 'STORE_001',
    author: 'ডা. আব্দুল্লাহ আল মামুন',
    rating: 5,
    date: '২ দিন আগে',
    comment: 'Rahim Pharmacy always provides genuine, unexpired medicines with proper cold storage. Best pharmacy on Smart Shopping!',
    commentBn: 'রহিম ফার্মেসি সবসময় শতভাগ আসল ও দীর্ঘ মেয়াদের ওষুধ দ্রুত ডেলিভারি দেয়। অত্যন্ত নির্ভরযোগ্য সেলার!'
  },
  {
    id: 'sr-02',
    storeId: 'STORE_001',
    author: 'ফারহানা ইসলাম',
    rating: 5,
    date: '১ সপ্তাহ আগে',
    comment: 'Delivery within 2 hours in Dhanmondi. Packed safely with receipt.',
    commentBn: 'ধানমন্ডিতে মাত্র ২ ঘণ্টায় জরুরি ওষুধ পেয়েছি। ক্যাশ মেমো সহ সুন্দর প্যাকেজিং।'
  },
  {
    id: 'sr-03',
    storeId: 'STORE_002',
    author: 'তাহসিন মাহমুদ',
    rating: 5,
    date: '৪ দিন আগে',
    comment: 'Original Anker product with official warranty card. Highly recommended store.',
    commentBn: 'আসল অ্যাঙ্কার পণ্য সাথে অফিসিয়াল ওয়ারেন্টি কার্ড। বিশ্বস্ত দোকান।'
  },
  {
    id: 'sr-04',
    storeId: 'STORE_003',
    author: 'নাভিদ হাসান',
    rating: 5,
    date: '৩ দিন আগে',
    comment: 'Authentic Xiaomi smartwatch received with sealed box and IMEI sticker.',
    commentBn: 'অরিজিনাল সিলগালা করা শাওমি স্মার্টওয়াচ পেয়েছি। কোনো ত্রুটি নেই।'
  }
];

export const MOCK_CATEGORIES: Category[] = [
  {
    id: 'electronics',
    name: 'Smartphones & Gadgets',
    nameBn: 'স্মার্টফোন ও গ্যাজেট',
    iconName: 'Smartphone',
    color: '#ff6000',
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&auto=format&fit=crop&q=80',
    subcategories: [
      { name: 'Smartphones', nameBn: 'স্মার্টফোন' },
      { name: 'Wireless Earbuds', nameBn: 'ওয়্যারলেস ইয়ারবাডস' },
      { name: 'Smartwatches', nameBn: 'স্মার্টওয়াচ' },
      { name: 'Power Banks', nameBn: 'পাওয়ার ব্যাংক' }
    ]
  },
  {
    id: 'fashion',
    name: "Men's & Women's Fashion",
    nameBn: 'ফ্যাশন ও পোশাক',
    iconName: 'Shirt',
    color: '#f85606',
    image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=300&auto=format&fit=crop&q=80',
    subcategories: [
      { name: 'Panjabi & Kurtas', nameBn: 'পাঞ্জাবি ও কুর্তা' },
      { name: 'Traditional Sarees', nameBn: 'শাড়ি ও লেহেঙ্গা' },
      { name: 'Casual T-Shirts', nameBn: 'টি-শার্ট ও শার্ট' },
      { name: 'Shoes & Sneakers', nameBn: 'জুতো ও স্নিকার্স' }
    ]
  },
  {
    id: 'beauty',
    name: 'Beauty & Personal Care',
    nameBn: 'রূপচর্চা ও প্রসাধন',
    iconName: 'Sparkles',
    color: '#e91e63',
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=300&auto=format&fit=crop&q=80',
    subcategories: [
      { name: 'Skin Care Serums', nameBn: 'স্কিন কেয়ার সিরাম' },
      { name: 'Hair Trimmer & Grooming', nameBn: 'হেয়ার ট্রিমার' },
      { name: 'Fragrances & Perfumes', nameBn: 'সুগন্ধি ও পারফিউম' }
    ]
  },
  {
    id: 'home',
    name: 'Home & Kitchen Appliances',
    nameBn: 'গৃহস্থালি ও রান্নাঘর',
    iconName: 'Home',
    color: '#00a650',
    image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=300&auto=format&fit=crop&q=80',
    subcategories: [
      { name: 'Air Fryer & Blenders', nameBn: 'এয়ার ফ্রায়ার ও ব্লেন্ডার' },
      { name: 'Cookware Sets', nameBn: 'কুকওয়্যার সেট' },
      { name: 'Smart LED Lights', nameBn: 'স্মার্ট এলইডি লাইট' }
    ]
  },
  {
    id: 'computers',
    name: 'Computers & Accessories',
    nameBn: 'কম্পিউটার ও ল্যাপটপ',
    iconName: 'Laptop',
    color: '#2196f3',
    image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=300&auto=format&fit=crop&q=80',
    subcategories: [
      { name: 'Mechanical Keyboards', nameBn: 'মেকানিক্যাল কিবোর্ড' },
      { name: 'Gaming Mouse', nameBn: 'গেমিং মাউস' },
      { name: 'Fast SSDs & Storage', nameBn: 'এসএসডি ও পেনড্রাইভ' }
    ]
  },
  {
    id: 'groceries',
    name: 'Groceries & Organic Food',
    nameBn: 'গ্রোসারি ও খাঁটি খাদ্য',
    iconName: 'ShoppingBag',
    color: '#4caf50',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300&auto=format&fit=crop&q=80',
    subcategories: [
      { name: 'Organic Pure Honey', nameBn: 'খাঁটি সুন্দরবনের মধু' },
      { name: 'Ghee & Mustard Oil', nameBn: 'গাওয়া ঘি ও সরিষার তেল' },
      { name: 'Dry Fruits & Nuts', nameBn: 'ড্রাই ফ্রুটস ও বাদাম' }
    ]
  }
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'napa-500',
    storeId: 'STORE_001',
    storeName: 'RAHIM PHARMACY',
    ownerId: 'USER_001',
    sku: 'MED-NAPA-500',
    barcode: '8941100123456',
    genericName: 'Paracetamol',
    genericNameBn: 'প্যারাসিটামল',
    isPublished: true,
    title: 'Napa 500mg Paracetamol Tablets - 100 Tablets Box (Beximco)',
    titleBn: 'নাপা ৫০০ মিগ্রা প্যারাসিটামল ট্যাবলেট - ১০০টি ট্যাবলেট বক্স (বেক্সিমকো)',
    description: 'Napa (Paracetamol 500mg) provides fast-acting relief for fever, headache, toothache, and body pain. Verified authentic medicine stocked with cold-chain protocols by Rahim Pharmacy.',
    descriptionBn: 'নাপা (প্যারাসিটামল ৫০০ মিগ্রা) জ্বর, সর্দি, মাথা ব্যথা ও শারীরিক ব্যথায় দ্রুত কার্যকর বিশ্বস্ত ওষুধ। প্রস্তুতকারক: বেক্সিমকো ফার্মাসিউটিক্যালস। রহিম ফার্মেসি কর্তৃক যাচাইকৃত শতভাগ আসল ওষুধ।',
    price: 120,
    originalPrice: 130,
    discountPercent: 8,
    rating: 4.9,
    reviewCount: 310,
    category: 'groceries',
    categoryBn: 'ফার্মেসি ও স্বাস্থ্যসেবা',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=600&auto=format&fit=crop&q=80'
    ],
    brand: 'Beximco Pharmaceuticals Ltd.',
    isDarazMall: true,
    isFreeDelivery: false,
    isFlashSale: false,
    stock: 250,
    soldCount: 1420,
    soldPercent: 95,
    tags: ['Genuine Medicine', 'Verified Store', 'Best Seller'],
    attributes: [
      { name: 'Package Size', nameBn: 'প্যাকেজের সাইজ', options: ['100 Tablets Box (10 Strips)', '50 Tablets (5 Strips)'] }
    ],
    seller: {
      name: 'RAHIM PHARMACY',
      rating: 99,
      responseRate: '99%',
      location: 'Dhanmondi, Dhaka - 1209',
      joinedYear: 2019,
      storeId: 'STORE_001',
      logo: 'https://images.unsplash.com/photo-1576602976047-174e57a47881?w=200&auto=format&fit=crop&q=80',
      coverImage: 'https://images.unsplash.com/photo-1586015555751-63bb77f4322a?w=1200&auto=format&fit=crop&q=80'
    },
    reviews: [
      {
        id: 'napa-r1',
        author: 'ডা. তানজিমুল হক',
        rating: 5,
        date: 'গতকাল',
        comment: '১০০% অরিজিনাল নাপা ট্যাবলেট। রহিম ফার্মেসির দ্রুত ডেলিভারির জন্য ধন্যবাদ।',
        commentBn: '১০০% আসল ওষুধ, মেয়াদ ২০২৭ পর্যন্ত। রহিম ফার্মেসিকে ধন্যবাদ।',
        helpfulCount: 24,
        verifiedPurchase: true
      }
    ],
    warranty: '100% Genuine Medicine Guarantee',
    warrantyBn: '১০০% আসল ওষুধের গ্যারান্টি',
    specs: [
      { key: 'Generic Name', keyBn: 'জেনেরিক নাম', value: 'Paracetamol BP 500mg', valueBn: 'প্যারাসিটামল বিপি ৫০০ মিগ্রা' },
      { key: 'Manufacturer', keyBn: 'প্রস্তুতকারক', value: 'Beximco Pharma Ltd.', valueBn: 'বেক্সিমকো ফার্মাসিউটিক্যালস' },
      { key: 'Dosage Form', keyBn: 'ডোজের ধরন', value: 'Oral Tablet', valueBn: 'খাওয়ার ট্যাবলেট' },
      { key: 'DAR Reg No', keyBn: 'ডিএআর রেজি নং', value: '028-021-042', valueBn: '০২৮-০২১-০৪২' }
    ]
  },
  {
    id: 'daraz-p01',
    storeId: 'STORE_002',
    storeName: 'Anker Bangladesh Official Store',
    ownerId: 'USER_002',
    sku: 'ANK-R50I-BLK',
    barcode: '848061060012',
    genericName: 'TWS Wireless Earbuds',
    genericNameBn: 'টিডব্লিউএস ওয়্যারলেস ইয়ারবাডস',
    isPublished: true,
    title: 'Anker Soundcore R50i True Wireless Earbuds - Extra Bass, IPX5, 30H Playtime',
    titleBn: 'অ্যাঙ্কার সাউন্ডকোর আর৫০আই ট্রু ওয়্যারলেস ইয়ারবাডস - অতিরিক্ত বেস, ৩০ ঘণ্টা ব্যাটারি',
    description: '10mm drivers produce sound with powerful bass. 22 preset EQs in the soundcore app. Lightweight and compact charging case with lanyard for easy carry.',
    descriptionBn: '১০ মিমি ড্রাইভারযুক্ত দুর্দান্ত সাউন্ড কোয়ালিটি ও গভীর বেস। সাউন্ডকোর অ্যাপে ২২টি প্রি-সেট ইকুয়ালাইজার। ওয়াটার রেজিস্ট্যান্ট আইপিএক্স৫ এবং ৩০ ঘণ্টার লং প্লেটাইম।',
    price: 1590,
    originalPrice: 2490,
    discountPercent: 36,
    rating: 4.8,
    reviewCount: 428,
    category: 'electronics',
    categoryBn: 'স্মার্টফোন ও গ্যাজেট',
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=600&auto=format&fit=crop&q=80'
    ],
    brand: 'Soundcore by Anker',
    isDarazMall: true,
    isFreeDelivery: true,
    isFlashSale: true,
    stock: 45,
    soldCount: 312,
    soldPercent: 87,
    tags: ['Best Seller', 'Official Warranty', 'Free Shipping'],
    attributes: [
      { name: 'Color', nameBn: 'রং', options: ['Black', 'White', 'Blue'] }
    ],
    seller: {
      name: 'Anker Bangladesh Official Store',
      rating: 98,
      responseRate: '99%',
      location: 'Dhaka, Bangladesh',
      joinedYear: 2021
    },
    warranty: '18 Months Official Brand Warranty',
    warrantyBn: '১৮ মাসের অফিসিয়াল ব্র্যান্ড ওয়ারেন্টি',
    hotspots: [
      {
        id: 'p1-hs-1',
        x: 36,
        y: 35,
        title: '10mm BassUp Dynamic Audio Driver',
        titleBn: '১০ মিমি ডাইনামিক বেস ড্রাইভার',
        description: 'Delivers punchy, rich bass with crystal-clear high fidelity acoustics and customizable 22 EQ modes.',
        descriptionBn: 'অতিরিক্ত বেস ও নিখুঁত শব্দের জন্য ১০ মিমি ড্রাইভার, সাথে ২২টি কাস্টমাইজেবল ইকুয়ালাইজার মোড।',
        category: 'performance',
        partName: 'Acoustic Driver Unit & Silicone Ear-tips (S/M/L)',
        partNameBn: 'অ্যাকোস্টিক ড্রাইভার ও সিলিকন টিপস সেট',
        partPrice: 1999
      },
      {
        id: 'p1-hs-2',
        x: 65,
        y: 45,
        title: 'AI-Enhanced Dual Microphones',
        titleBn: 'এআই-পাওয়ার্ড ডুয়াল মাইক্রোফোন',
        description: 'Filters out background ambient noise up to 90% for ultra-clear phone calls and voice commands.',
        descriptionBn: 'পরিবেশের অনাকাঙ্ক্ষিত শব্দ দূর করে স্পষ্ট ভয়েস কল নিশ্চিত করতে উন্নত নয়েজ রিডাকশন অ্যালগরিদম।',
        category: 'spec',
        partName: 'Dual Beamforming Microphones & AI Chip',
        partNameBn: 'ডুয়াল বিমফর্মিং মাইক ও এআই প্রসেসিং চিপ',
        partPrice: 1999
      },
      {
        id: 'p1-hs-3',
        x: 50,
        y: 76,
        title: '30-Hour USB-C Fast Charging Case',
        titleBn: '৩০ ঘণ্টা ব্যাটারি ও টাইপ-সি ফাস্ট চার্জিং',
        description: '10-minute quick charge yields 2 full hours of playtime; compact matte case with lanyard hook.',
        descriptionBn: 'মাত্র ১০ মিনিট চার্জে ২ ঘণ্টা প্লেটাইম; পকেট-সাইজ ম্যাট ফিনিশ কেসিং ও ল্যানইয়ার্ড সুবিধা।',
        category: 'feature',
        partName: 'Matte Charging Case & Braided Lanyard',
        partNameBn: 'ম্যাট চার্জিং কেস ও ব্রেডেড ল্যানইয়ার্ড',
        partPrice: 1999
      }
    ],
    reviews: [
      {
        id: 'r1',
        author: 'তানভীর আহমেদ',
        rating: 5,
        date: '২ দিন আগে',
        comment: 'অসাধারণ সাউন্ড কোয়ালিটি এবং ব্যাটারি ব্যাকআপ। একদম অরিজিনাল প্রোডাক্ট!',
        commentBn: 'অসাধারণ সাউন্ড কোয়ালিটি এবং ব্যাটারি ব্যাকআপ। একদম অরিজিনাল প্রোডাক্ট!',
        helpfulCount: 34,
        verifiedPurchase: true
      },
      {
        id: 'r2',
        author: 'Mahmudul Hasan',
        rating: 5,
        date: '১ সপ্তাহ আগে',
        comment: 'Bass is super punchy. Received in 2 days in Dhaka.',
        commentBn: 'বেস দারুণ আর কানে খুব আরামদায়ক। দ্রুত ডেলিভারি পেয়েছি।',
        helpfulCount: 19,
        verifiedPurchase: true
      }
    ]
  },
  {
    id: 'daraz-p02',
    storeId: 'STORE_003',
    storeName: 'Xiaomi Authorized Flagship Store',
    ownerId: 'USER_003',
    sku: 'MI-W4-AMOLED',
    barcode: '6941812754321',
    genericName: 'Smartwatch',
    genericNameBn: 'স্মার্টওয়াচ',
    isPublished: true,
    title: 'Xiaomi Redmi Watch 4 AMOLED Smartwatch with Bluetooth Calling & GPS',
    titleBn: 'শাওমি রেডমি ওয়াচ ৪ অ্যামোলেড স্মার্টওয়াচ - ব্লুটুথ কলিং ও জিপিএস',
    description: '1.97" AMOLED ultra-large screen with 60Hz refresh rate. Metallic frame, up to 20 days battery life, and high-precision built-in GNSS positioning.',
    descriptionBn: '১.৯৭ ইঞ্চি বড় অ্যামোলেড ডিসপ্লে, স্টাইলিশ মেটালিক ফ্রেম এবং ২০ দিন পর্যন্ত ব্যাটারি ব্যাকআপ। সরাসরি ঘড়ি থেকেই ব্লুটুথ কল রিসিভ ও ডায়াল করার সুবিধা।',
    price: 8490,
    originalPrice: 10990,
    discountPercent: 23,
    rating: 4.9,
    reviewCount: 310,
    category: 'electronics',
    categoryBn: 'স্মার্টফোন ও গ্যাজেট',
    image: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80'
    ],
    brand: 'Xiaomi',
    isDarazMall: true,
    isFreeDelivery: true,
    isFlashSale: true,
    stock: 22,
    soldCount: 178,
    soldPercent: 89,
    tags: ['Daraz Mall', 'Flash Deal', 'Authentic'],
    attributes: [
      { name: 'Strap Color', nameBn: 'স্ট্র্যাপ রং', options: ['Silver Gray', 'Obsidian Black'] }
    ],
    seller: {
      name: 'Xiaomi Authorized Flagship Store',
      rating: 97,
      responseRate: '98%',
      location: 'Dhaka, Bangladesh',
      joinedYear: 2020
    },
    warranty: '1 Year Brand Warranty',
    warrantyBn: '১ বছরের অফিসিয়াল ব্র্যান্ড ওয়ারেন্টি',
    hotspots: [
      {
        id: 'p2-hs-1',
        x: 48,
        y: 35,
        title: '1.97" AMOLED 60Hz Display',
        titleBn: '১.৯৭ ইঞ্চি অ্যামোলেড ৬০ হার্জ ডিসপ্লে',
        description: 'Ultra-bright 600 nits peak brightness with LTPS energy-efficient tech and customizable watch faces.',
        descriptionBn: 'উজ্জ্বল ৬০০ নিটস ডিসপ্লে, ৬০ হার্জ মসৃণ রিফ্রেশ রেট এবং ২০০+ ক্লাউড ওয়াচ ফেস।',
        category: 'spec',
        partName: '1.97" Curved AMOLED Display Glass',
        partNameBn: '১.৯৭" কার্ভড অ্যামোলেড ডিসপ্লে মডিউল',
        partPrice: 9499
      },
      {
        id: 'p2-hs-2',
        x: 78,
        y: 45,
        title: 'Aluminum Alloy Frame & Crown',
        titleBn: 'অ্যালুমিনিয়াম অ্যালয় ফ্রেম ও ক্রাউন',
        description: 'Sturdy stainless-steel rotating crown for intuitive scrolling; sandblasted matte finish.',
        descriptionBn: 'স্টেইনলেস-স্টিল রোটেটিং ক্রাউন এবং প্রিমিয়াম মেটালিক ইউনিবডি ডিজাইন।',
        category: 'material',
        partName: 'Sandblasted Alloy Frame & Quick-Release Strap',
        partNameBn: 'স্যান্ডব্লাস্টেড অ্যালয় ফ্রেম ও কুইক রিলিজ স্ট্র্যাপ',
        partPrice: 9499
      },
      {
        id: 'p2-hs-3',
        x: 50,
        y: 72,
        title: '4-Channel PPG Sensor & 20-Day Battery',
        titleBn: '৪-চ্যানেল পিপিজি সেন্সর ও ২০ দিন ব্যাটারি',
        description: 'Continuous 24/7 heart rate, SpO2 blood oxygen tracking and up to 20 days battery life.',
        descriptionBn: '২৪/৭ হার্ট রেট ও ব্লাড অক্সিজেন পরিমাপসহ ২০ দিন পর্যন্ত একটানা ব্যাটারি ব্যাকআপ।',
        category: 'performance',
        partName: 'PPG Biometric Sensor Array & 470mAh Battery',
        partNameBn: 'পিপিজি বায়োমেট্রিক সেন্সর ও ৪৭০mAh ব্যাটারি',
        partPrice: 9499
      }
    ],
    reviews: [
      {
        id: 'r3',
        author: 'সাকিব আল হাসান',
        rating: 5,
        date: 'গতকাল',
        comment: 'ডিসপ্লে কোয়ালিটি মাশাল্লাহ প্রিমিয়াম। কলিং ফিচার একদম ক্লিয়ার।',
        commentBn: 'ডিসপ্লে কোয়ালিটি মাশাল্লাহ প্রিমিয়াম। কলিং ফিচার একদম ক্লিয়ার।',
        helpfulCount: 22,
        verifiedPurchase: true
      }
    ]
  },
  {
    id: 'daraz-p03',
    storeId: 'STORE_004',
    storeName: 'Elegance Fashion BD',
    ownerId: 'USER_004',
    sku: 'ELG-PANJ-NVY',
    barcode: '8942200334411',
    genericName: 'Cotton Silk Panjabi',
    genericNameBn: 'সুতি সিল্ক পাঞ্জাবি',
    isPublished: true,
    title: 'Premium Semi-Silk Jacquard Embroidered Traditional Panjabi for Men',
    titleBn: 'প্রিমিয়াম সেমি-সিল্ক জ্যাকোয়ার্ড কাজ করা এক্সক্লুসিভ পুরুষদের পাঞ্জাবি',
    description: 'Made with royal quality semi-silk fabric with intricate collar and chest embroidery. Perfect for Eid, weddings, and formal occasions.',
    descriptionBn: 'উচ্চমানের সেমি-সিল্ক কাপড়ে তৈরি, কলার ও বুকে আকর্ষণীয় সূচিকর্ম। ঈদ, বিয়ে কিংবা যেকোনো উৎসবের জন্য মানানসই ও অভিজাত।',
    price: 1850,
    originalPrice: 3200,
    discountPercent: 42,
    rating: 4.7,
    reviewCount: 512,
    category: 'fashion',
    categoryBn: 'ফ্যাশন ও পোশাক',
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=600&auto=format&fit=crop&q=80'
    ],
    brand: 'Aarong Fabric Craft',
    isDarazMall: false,
    isFreeDelivery: true,
    isFlashSale: true,
    stock: 60,
    soldCount: 420,
    soldPercent: 88,
    tags: ['Festive Special', 'Hot Item'],
    attributes: [
      { name: 'Size', nameBn: 'সাইজ', options: ['38 (M)', '40 (L)', '42 (XL)', '44 (XXL)'] },
      { name: 'Color', nameBn: 'রং', options: ['Navy Blue', 'Maroon', 'Bottle Green', 'White'] }
    ],
    seller: {
      name: 'Elegance Fashion BD',
      rating: 93,
      responseRate: '95%',
      location: 'Narayanganj, Bangladesh',
      joinedYear: 2022,
      storeId: 'STORE_004'
    },
    reviews: [
      {
        id: 'r4',
        author: 'ইমতিয়াজ আহমেদ',
        rating: 5,
        date: '৩ দিন আগে',
        comment: 'কাপড়ের কোয়ালিটি অনেক সফট আর ফিটিং চমৎকার। ধন্যবাদ দারাজ!',
        commentBn: 'কাপড়ের কোয়ালিটি অনেক সফট আর ফিটিং চমৎকার। ধন্যবাদ দারাজ!',
        helpfulCount: 45,
        verifiedPurchase: true
      }
    ]
  },
  {
    id: 'daraz-p04',
    storeId: 'STORE_001',
    storeName: 'RAHIM PHARMACY',
    ownerId: 'USER_001',
    sku: 'BEA-ORD-SERUM',
    barcode: '769915190602',
    genericName: 'Niacinamide Vitamin Serum',
    genericNameBn: 'নায়াসিনামাইড স্কিন সিরাম',
    isPublished: true,
    title: 'The Ordinary Niacinamide 10% + Zinc 1% High-Strength Vitamin Serum (30ml)',
    titleBn: 'দি অর্ডিনারি নায়াসিনামাইড ১০% + জিংক ১% স্কিন কেয়ার সিরাম (৩০ মি.লি)',
    description: 'Formulated with high concentration of niacinamide and zinc to reduce the appearance of blemishes, pore congestion, and balance oil production.',
    descriptionBn: 'ত্বকের তৈলাক্ত ভাব নিয়ন্ত্রণ, দাগ দূর এবং পোরস মিনিমাইজ করার জন্য বিশ্বখ্যাত সিরাম। ১০০% অরিজিনাল অথেনটিক ফর্মুলেশন।',
    price: 1250,
    originalPrice: 1750,
    discountPercent: 29,
    rating: 4.9,
    reviewCount: 689,
    category: 'beauty',
    categoryBn: 'রূপচর্চা ও প্রসাধন',
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1608248597359-00508f715e47?w=600&auto=format&fit=crop&q=80'
    ],
    brand: 'The Ordinary',
    isDarazMall: true,
    isFreeDelivery: false,
    isFlashSale: false,
    stock: 50,
    soldCount: 610,
    soldPercent: 92,
    tags: ['100% Authentic', 'Dermatologist Tested'],
    seller: {
      name: 'Korean & Global Beauty Mall',
      rating: 99,
      responseRate: '100%',
      location: 'Dhaka, Bangladesh',
      joinedYear: 2019
    },
    reviews: [
      {
        id: 'r5',
        author: 'ফারজানা আক্তার',
        rating: 5,
        date: '৪ দিন আগে',
        comment: 'একদম অরিজিনাল কানাডিয়ান ব্যাচ কোড মিলেছে। ২ সপ্তাহ ব্যবহারে ত্বকের উজ্জ্বলতা বেড়েছে।',
        commentBn: 'একদম অরিজিনাল কানাডিয়ান ব্যাচ কোড মিলেছে। ২ সপ্তাহ ব্যবহারে ত্বকের উজ্জ্বলতা বেড়েছে।',
        helpfulCount: 52,
        verifiedPurchase: true
      }
    ]
  },
  {
    id: 'daraz-p05',
    storeId: 'STORE_003',
    storeName: 'Xiaomi & Smart Electronics BD',
    ownerId: 'USER_003',
    sku: 'KIT-MIYAKO-AF',
    barcode: '8945500112233',
    genericName: 'Digital Air Fryer',
    genericNameBn: 'ডিজিটাল এয়ার ফ্রায়ার',
    isPublished: true,
    title: 'Miyako 6.5L Digital Touchscreen Air Fryer with Rapid Air Heating (1800W)',
    titleBn: 'মিয়াকো ৬.৫ লিটার ডিজিটাল টাচস্ক্রিন এয়ার ফ্রায়ার - তেলমুক্ত স্বাস্থ্যকর রান্না',
    description: 'Cook with 85% less oil while retaining crispy delicious taste. 8 one-touch cooking presets for chicken, fish, fries, baking cake, and snacks.',
    descriptionBn: '৮৫% পর্যন্ত তেল কম ব্যবহার করে মচমচে ও সুস্বাদু খাবার তৈরির ডিজিটাল এয়ার ফ্রায়ার। ৬.৫ লিটার ধারণক্ষমতা, নন-স্টিক বাস্কেট ও সহজ পরিষ্কারযোগ্য।',
    price: 6790,
    originalPrice: 8990,
    discountPercent: 24,
    rating: 4.8,
    reviewCount: 194,
    category: 'home',
    categoryBn: 'গৃহস্থালি ও রান্নাঘর',
    image: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=600&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=600&auto=format&fit=crop&q=80'
    ],
    brand: 'Miyako',
    isDarazMall: true,
    isFreeDelivery: true,
    isFlashSale: false,
    stock: 18,
    soldCount: 95,
    soldPercent: 84,
    tags: ['Daraz Mall', 'Free Delivery', 'Kitchen Star'],
    seller: {
      name: 'Miyako Official Appliance Store',
      rating: 96,
      responseRate: '97%',
      location: 'Dhaka, Bangladesh',
      joinedYear: 2020,
      storeId: 'STORE_003'
    },
    warranty: '2 Years Service Warranty',
    warrantyBn: '২ বছরের সার্ভিস ওয়ারেন্টি',
    reviews: [
      {
        id: 'r6',
        author: 'রাফিয়া বেগম',
        rating: 5,
        date: '৫ দিন আগে',
        comment: 'রোস্ট এবং ফ্রাই অসাধারণ হয়েছে কোন রকম তেল ছাড়া। পরিবারের সবাই খুশি।',
        commentBn: 'রোস্ট এবং ফ্রাই অসাধারণ হয়েছে কোন রকম তেল ছাড়া। পরিবারের সবাই খুশি।',
        helpfulCount: 18,
        verifiedPurchase: true
      }
    ]
  },
  {
    id: 'daraz-p06',
    storeId: 'STORE_002',
    storeName: 'Anker Bangladesh Official Store',
    ownerId: 'USER_002',
    sku: 'POW-BASEUS-65W',
    barcode: '6953156221055',
    genericName: 'Fast Charging Power Bank',
    genericNameBn: 'ফাস্ট চার্জিং পাওয়ার ব্যাংক',
    isPublished: true,
    title: 'Baseus 20000mAh 65W Fast Charging Power Bank with Digital Display & PD 3.0',
    titleBn: 'বেসিউস ২০,০০০ মিলিঅ্যাম্পিয়ার ৬৫ ওয়াট ফাস্ট চার্জিং পাওয়ার ব্যাংক - ল্যাপটপ ও ফোন সাপোর্ট',
    description: 'Supports high power 65W fast charging for MacBook, iPhone, Samsung, Xiaomi, and laptops. LED digital screen displays remaining battery and voltage in real-time.',
    descriptionBn: 'ল্যাপটপ, আইফোন ও অ্যান্ড্রয়েড দ্রুত চার্জ করার ৬৫ ওয়াট পাওয়ার ব্যাংক। এলইডি ডিজিটাল মিটারে ব্যাটারির চার্জের সঠিক পরিমাণ প্রদর্শিত হয়।',
    price: 3650,
    originalPrice: 4800,
    discountPercent: 24,
    rating: 4.9,
    reviewCount: 380,
    category: 'electronics',
    categoryBn: 'স্মার্টফোন ও গ্যাজেট',
    image: 'https://images.unsplash.com/photo-1609592807901-44755d9d7003?w=600&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1609592807901-44755d9d7003?w=600&auto=format&fit=crop&q=80'
    ],
    brand: 'Baseus',
    isDarazMall: true,
    isFreeDelivery: true,
    isFlashSale: true,
    stock: 35,
    soldCount: 290,
    soldPercent: 89,
    tags: ['Daraz Mall', '65W Power', 'Fast Shipping'],
    attributes: [
      { name: 'Color', nameBn: 'রং', options: ['Midnight Black', 'Pearl White'] }
    ],
    seller: {
      name: 'Baseus Official Flagship BD',
      rating: 99,
      responseRate: '99%',
      location: 'Dhaka, Bangladesh',
      joinedYear: 2021,
      storeId: 'STORE_002'
    },
    warranty: '1 Year Replacement Warranty',
    warrantyBn: '১ বছরের রিপ্লেসমেন্ট ওয়ারেন্টি',
    reviews: [
      {
        id: 'r7',
        author: 'তারেক রহমান',
        rating: 5,
        date: '১ সপ্তাহ আগে',
        comment: 'আমার ডেল ল্যাপটপ অনায়াসে চার্জ করতে পারছি। হেভি ডিউটি পাওয়ার ব্যাংক।',
        commentBn: 'আমার ডেল ল্যাপটপ অনায়াসে চার্জ করতে পারছি। হেভি ডিউটি পাওয়ার ব্যাংক।',
        helpfulCount: 29,
        verifiedPurchase: true
      }
    ]
  },
  {
    id: 'daraz-p07',
    storeId: 'STORE_005',
    storeName: 'Pure Organic Agro Food',
    ownerId: 'USER_005',
    sku: 'GRO-HONEY-500',
    barcode: '8943300556622',
    genericName: 'Raw Honey (500g)',
    genericNameBn: 'প্রাকৃতিক কাঁচা মধু (৫০০ গ্রাম)',
    isPublished: true,
    title: 'Khaas Food 100% Pure Organic Sundarbans Natural Raw Honey (500g)',
    titleBn: 'খাস ফুড ১০০% খাঁটি সুন্দরবনের প্রাকৃতিক মধু (৫০০ গ্রাম)',
    description: 'Directly collected from Sundarbans beehives with no artificial syrup or heating. Packed with natural antioxidants, enzymes, and pure aroma.',
    descriptionBn: 'সুন্দরবনের গভীর জঙ্গল থেকে মৌয়ালদের দ্বারা সরাসরি সংগৃহীত ১০০% নির্ভেজাল প্রাকৃতিক মধু। রোগ প্রতিরোধ ক্ষমতা বাড়াতে অনন্য।',
    price: 680,
    originalPrice: 850,
    discountPercent: 20,
    rating: 4.9,
    reviewCount: 820,
    category: 'groceries',
    categoryBn: 'গ্রোসারি ও খাঁটি খাদ্য',
    image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&auto=format&fit=crop&q=80'
    ],
    brand: 'Khaas Food',
    isDarazMall: true,
    isFreeDelivery: false,
    isFlashSale: false,
    stock: 100,
    soldCount: 750,
    soldPercent: 95,
    tags: ['100% Organic', 'BSTI Verified'],
    seller: {
      name: 'Khaas Food Official',
      rating: 99,
      responseRate: '100%',
      location: 'Dhaka, Bangladesh',
      joinedYear: 2018,
      storeId: 'STORE_005'
    },
    reviews: [
      {
        id: 'r8',
        author: 'ডাঃ আশরাফুল হক',
        rating: 5,
        date: '২ দিন আগে',
        comment: 'মধুর ঘ্রাণ এবং খাঁটি ভাব অতুলনীয়। প্রতিদিন সকালে খাচ্ছি।',
        commentBn: 'মধুর ঘ্রাণ এবং খাঁটি ভাব অতুলনীয়। প্রতিদিন সকালে খাচ্ছি।',
        helpfulCount: 40,
        verifiedPurchase: true
      }
    ]
  },
  {
    id: 'daraz-p08',
    storeId: 'STORE_002',
    storeName: 'Anker Bangladesh Official Store',
    ownerId: 'USER_002',
    sku: 'COM-RK-KEYBOARD',
    barcode: '8946600778899',
    genericName: 'Wireless Mechanical Keyboard',
    genericNameBn: 'ওয়্যারলেস মেকানিক্যাল কিবোর্ড',
    isPublished: true,
    title: 'Royal RGB Hot-Swappable Wireless Mechanical Gaming Keyboard with Linear Red Switches',
    titleBn: 'রয়্যাল আরজিবি ওয়্যারলেস মেকানিক্যাল গেমিং কিবোর্ড - রেড সুইচ ও ব্লুটুথ ৫.০',
    description: 'Triple connection modes (2.4G, Bluetooth 5.0, Type-C). Hot-swappable red switches, customizable RGB backlighting with 18 lighting effects.',
    descriptionBn: 'টাইপিং এবং গেমিংয়ের জন্য মসৃণ লিনিয়ার রেড সুইচ। মাল্টি-ডিভাইস কানেক্টিভিটি (পিসি, ম্যাক, আইপ্যাড) ও চমৎকার ব্যাকলিট আরজিবি মোড।',
    price: 3200,
    originalPrice: 4500,
    discountPercent: 29,
    rating: 4.8,
    reviewCount: 215,
    category: 'computers',
    categoryBn: 'কম্পিউটার ও ল্যাপটপ',
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80'
    ],
    brand: 'Royal Kludge',
    isDarazMall: false,
    isFreeDelivery: true,
    isFlashSale: true,
    stock: 14,
    soldCount: 88,
    soldPercent: 86,
    tags: ['Hot Swap', 'RGB Gaming'],
    attributes: [
      { name: 'Switch Type', nameBn: 'সুইচ প্রকার', options: ['Red Linear (Quiet)', 'Brown Tactile', 'Blue Clicky'] }
    ],
    seller: {
      name: 'TechGear BD',
      rating: 94,
      responseRate: '96%',
      location: 'Chattogram, Bangladesh',
      joinedYear: 2021
    },
    warranty: '1 Year Warranty',
    warrantyBn: '১ বছরের ওয়ারেন্টি',
    reviews: [
      {
        id: 'r9',
        author: 'সাকিব হোসাইন',
        rating: 5,
        date: '৩ দিন আগে',
        comment: 'টাইপিং ফিল অসাধারণ, আরজিবি লাইটিং চোখের শান্তি।',
        commentBn: 'টাইপিং ফিল অসাধারণ, আরজিবি লাইটিং চোখের শান্তি।',
        helpfulCount: 16,
        verifiedPurchase: true
      }
    ]
  }
];

export const MOCK_VOUCHERS: Voucher[] = [
  {
    code: 'SMART2026',
    titleEn: '৳200 OFF on Orders Above ৳1,500',
    titleBn: '৳১,৫০০ এর অর্ডারে ৳২০০ মেগা ছাড়',
    discountType: 'fixed',
    discountValue: 200,
    minSpend: 1500,
    expiresAt: '২০২৬-১২-৩১',
    isCollected: false,
    badge: 'MEGA VOUCHER',
    badgeBn: 'মেগা ভাউচার'
  },
  {
    code: 'FREESHIP',
    titleEn: 'Free Delivery on First 2 Orders',
    titleBn: 'ফ্রি হোম ডেলিভারি স্পেশাল ভাউচার',
    discountType: 'fixed',
    discountValue: 60,
    minSpend: 500,
    expiresAt: '২০২৬-১২-৩১',
    isCollected: true,
    badge: 'FREE DELIVERY',
    badgeBn: 'ফ্রি ডেলিভারি'
  },
  {
    code: 'SMART10',
    titleEn: '10% OFF Exclusive SmartShopX Shopper',
    titleBn: '১০% স্মার্টশপএক্স স্পেশাল ছাড়',
    discountType: 'percent',
    discountValue: 10,
    minSpend: 1000,
    expiresAt: '২০২৬-১২-৩১',
    isCollected: false,
    badge: 'EXCLUSIVE',
    badgeBn: 'স্পেশাল ছাড়'
  }
];

export const BANGLADESH_DIVISIONS = [
  { id: 'dhaka', name: 'Dhaka', nameBn: 'ঢাকা', deliveryFee: 60, estimatedDays: '১-২ দিন' },
  { id: 'chattogram', name: 'Chattogram', nameBn: 'চট্টগ্রাম', deliveryFee: 110, estimatedDays: '২-৩ দিন' },
  { id: 'rajshahi', name: 'Rajshahi', nameBn: 'রাজশাহী', deliveryFee: 110, estimatedDays: '২-৩ দিন' },
  { id: 'khulna', name: 'Khulna', nameBn: 'খুলনা', deliveryFee: 110, estimatedDays: '২-৩ দিন' },
  { id: 'sylhet', name: 'Sylhet', nameBn: 'সিলেট', deliveryFee: 110, estimatedDays: '২-৩ দিন' },
  { id: 'barishal', name: 'Barishal', nameBn: 'বরিশাল', deliveryFee: 120, estimatedDays: '৩-৪ দিন' },
  { id: 'rangpur', name: 'Rangpur', nameBn: 'রংপুর', deliveryFee: 120, estimatedDays: '৩-৪ দিন' },
  { id: 'mymensingh', name: 'Mymensingh', nameBn: 'ময়মনসিংহ', deliveryFee: 100, estimatedDays: '২-৩ দিন' }
];
