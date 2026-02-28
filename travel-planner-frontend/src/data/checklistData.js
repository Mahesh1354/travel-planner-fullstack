// Pre-defined checklist categories and items
export const checklistCategories = [
  {
    id: 'documents',
    name: 'Documents',
    icon: '📄',
    color: 'blue',
    items: [
      { id: 'passport', name: 'Passport', category: 'documents', isRequired: true },
      { id: 'visa', name: 'Visa (if required)', category: 'documents', isRequired: false },
      { id: 'drivers-license', name: "Driver's License", category: 'documents', isRequired: false },
      { id: 'id-card', name: 'National ID Card', category: 'documents', isRequired: false },
      { id: 'flight-tickets', name: 'Flight Tickets / E-tickets', category: 'documents', isRequired: true },
      { id: 'hotel-confirmations', name: 'Hotel Confirmations', category: 'documents', isRequired: false },
      { id: 'travel-insurance', name: 'Travel Insurance Documents', category: 'documents', isRequired: false },
      { id: 'vaccination-cert', name: 'Vaccination Certificate', category: 'documents', isRequired: false },
      { id: 'passport-photos', name: 'Passport Photos', category: 'documents', isRequired: false },
      { id: 'itinerary', name: 'Printed Itinerary', category: 'documents', isRequired: false },
    ]
  },
  {
    id: 'money',
    name: 'Money & Cards',
    icon: '💰',
    color: 'green',
    items: [
      { id: 'cash', name: 'Local Currency Cash', category: 'money', isRequired: true },
      { id: 'credit-cards', name: 'Credit/Debit Cards', category: 'money', isRequired: true },
      { id: 'atm-cards', name: 'ATM Cards', category: 'money', isRequired: false },
      { id: 'travel-money-card', name: 'Travel Money Card', category: 'money', isRequired: false },
      { id: 'bank-contacts', name: 'Bank Emergency Contacts', category: 'money', isRequired: false },
      { id: 'tip-money', name: 'Small Bills for Tips', category: 'money', isRequired: false },
    ]
  },
  {
    id: 'electronics',
    name: 'Electronics',
    icon: '📱',
    color: 'purple',
    items: [
      { id: 'phone', name: 'Smartphone', category: 'electronics', isRequired: true },
      { id: 'charger', name: 'Phone Charger', category: 'electronics', isRequired: true },
      { id: 'powerbank', name: 'Power Bank', category: 'electronics', isRequired: false },
      { id: 'adapter', name: 'Universal Travel Adapter', category: 'electronics', isRequired: true },
      { id: 'camera', name: 'Camera', category: 'electronics', isRequired: false },
      { id: 'camera-charger', name: 'Camera Charger', category: 'electronics', isRequired: false },
      { id: 'laptop', name: 'Laptop/Tablet', category: 'electronics', isRequired: false },
      { id: 'laptop-charger', name: 'Laptop Charger', category: 'electronics', isRequired: false },
      { id: 'headphones', name: 'Headphones/Earbuds', category: 'electronics', isRequired: false },
      { id: 'e-reader', name: 'E-Reader', category: 'electronics', isRequired: false },
      { id: 'sim-cards', name: 'Local SIM Cards', category: 'electronics', isRequired: false },
      { id: 'usb-cables', name: 'USB Cables', category: 'electronics', isRequired: false },
    ]
  },
  {
    id: 'clothing',
    name: 'Clothing',
    icon: '👕',
    color: 'pink',
    items: [
      { id: 'underwear', name: 'Underwear', category: 'clothing', isRequired: true },
      { id: 'socks', name: 'Socks', category: 'clothing', isRequired: true },
      { id: 't-shirts', name: 'T-shirts/Tops', category: 'clothing', isRequired: true },
      { id: 'pants', name: 'Pants/Jeans', category: 'clothing', isRequired: true },
      { id: 'shorts', name: 'Shorts', category: 'clothing', isRequired: false },
      { id: 'dresses', name: 'Dresses/Skirts', category: 'clothing', isRequired: false },
      { id: 'swimwear', name: 'Swimwear', category: 'clothing', isRequired: false },
      { id: 'sleepwear', name: 'Sleepwear', category: 'clothing', isRequired: false },
      { id: 'jacket', name: 'Jacket/ Coat', category: 'clothing', isRequired: false },
      { id: 'raincoat', name: 'Raincoat/Umbrella', category: 'clothing', isRequired: false },
      { id: 'hat', name: 'Hat/Cap', category: 'clothing', isRequired: false },
      { id: 'scarf', name: 'Scarf/Gloves', category: 'clothing', isRequired: false },
      { id: 'sunglasses', name: 'Sunglasses', category: 'clothing', isRequired: false },
      { id: 'belt', name: 'Belt', category: 'clothing', isRequired: false },
      { id: 'formal-wear', name: 'Formal Wear', category: 'clothing', isRequired: false },
    ]
  },
  {
    id: 'toiletries',
    name: 'Toiletries',
    icon: '🧴',
    color: 'yellow',
    items: [
      { id: 'toothbrush', name: 'Toothbrush', category: 'toiletries', isRequired: true },
      { id: 'toothpaste', name: 'Toothpaste', category: 'toiletries', isRequired: true },
      { id: 'deodorant', name: 'Deodorant', category: 'toiletries', isRequired: true },
      { id: 'shampoo', name: 'Shampoo/Conditioner', category: 'toiletries', isRequired: false },
      { id: 'soap', name: 'Body Wash/Soap', category: 'toiletries', isRequired: false },
      { id: 'face-wash', name: 'Face Wash', category: 'toiletries', isRequired: false },
      { id: 'moisturizer', name: 'Moisturizer', category: 'toiletries', isRequired: false },
      { id: 'sunscreen', name: 'Sunscreen', category: 'toiletries', isRequired: false },
      { id: 'razor', name: 'Razor/Shaving Kit', category: 'toiletries', isRequired: false },
      { id: 'hairbrush', name: 'Hairbrush/Comb', category: 'toiletries', isRequired: false },
      { id: 'makeup', name: 'Makeup', category: 'toiletries', isRequired: false },
      { id: 'contact-lenses', name: 'Contact Lenses/Solution', category: 'toiletries', isRequired: false },
      { id: 'feminine-products', name: 'Feminine Products', category: 'toiletries', isRequired: false },
      { id: 'nail-clippers', name: 'Nail Clippers', category: 'toiletries', isRequired: false },
      { id: 'tissues', name: 'Tissues/Wet Wipes', category: 'toiletries', isRequired: false },
    ]
  },
  {
    id: 'health',
    name: 'Health & First Aid',
    icon: '💊',
    color: 'red',
    items: [
      { id: 'medications', name: 'Prescription Medications', category: 'health', isRequired: true },
      { id: 'first-aid-kit', name: 'First Aid Kit', category: 'health', isRequired: false },
      { id: 'pain-relief', name: 'Pain Relief (Ibuprofen/Paracetamol)', category: 'health', isRequired: false },
      { id: 'allergy-meds', name: 'Allergy Medication', category: 'health', isRequired: false },
      { id: 'motion-sickness', name: 'Motion Sickness Tablets', category: 'health', isRequired: false },
      { id: 'digestive-aids', name: 'Digestive Aids', category: 'health', isRequired: false },
      { id: 'band-aids', name: 'Band-aids/Plasters', category: 'health', isRequired: false },
      { id: 'antiseptic', name: 'Antiseptic Wipes/Cream', category: 'health', isRequired: false },
      { id: 'thermometer', name: 'Thermometer', category: 'health', isRequired: false },
      { id: 'covid-tests', name: 'COVID-19 Tests', category: 'health', isRequired: false },
      { id: 'masks', name: 'Face Masks', category: 'health', isRequired: false },
      { id: 'hand-sanitizer', name: 'Hand Sanitizer', category: 'health', isRequired: false },
    ]
  },
  {
    id: 'misc',
    name: 'Miscellaneous',
    icon: '🎒',
    color: 'gray',
    items: [
      { id: 'luggage-locks', name: 'Luggage Locks', category: 'misc', isRequired: false },
      { id: 'luggage-tags', name: 'Luggage Tags', category: 'misc', isRequired: false },
      { id: 'packing-cubes', name: 'Packing Cubes', category: 'misc', isRequired: false },
      { id: 'laundry-bag', name: 'Laundry Bag', category: 'misc', isRequired: false },
      { id: 'reusable-bag', name: 'Reusable Shopping Bag', category: 'misc', isRequired: false },
      { id: 'water-bottle', name: 'Reusable Water Bottle', category: 'misc', isRequired: false },
      { id: 'snacks', name: 'Travel Snacks', category: 'misc', isRequired: false },
      { id: 'travel-pillow', name: 'Travel Pillow', category: 'misc', isRequired: false },
      { id: 'eye-mask', name: 'Eye Mask', category: 'misc', isRequired: false },
      { id: 'earplugs', name: 'Earplugs', category: 'misc', isRequired: false },
      { id: 'book', name: 'Book/Kindle', category: 'misc', isRequired: false },
      { id: 'journal', name: 'Travel Journal/Pen', category: 'misc', isRequired: false },
      { id: 'phrase-book', name: 'Phrase Book/Translator App', category: 'misc', isRequired: false },
      { id: 'umbrella', name: 'Umbrella', category: 'misc', isRequired: false },
    ]
  }
];

// Pre-departure checklist
export const preDepartureChecklist = [
  { id: 'visa-check', name: 'Check visa requirements', category: 'pre-departure' },
  { id: 'passport-validity', name: 'Check passport validity (6+ months)', category: 'pre-departure' },
  { id: 'vaccinations', name: 'Check required vaccinations', category: 'pre-departure' },
  { id: 'travel-insurance', name: 'Purchase travel insurance', category: 'pre-departure' },
  { id: 'flight-checkin', name: 'Online flight check-in', category: 'pre-departure' },
  { id: 'seat-selection', name: 'Select seats', category: 'pre-departure' },
  { id: 'hotel-confirm', name: 'Confirm hotel bookings', category: 'pre-departure' },
  { id: 'activity-bookings', name: 'Confirm activity bookings', category: 'pre-departure' },
  { id: 'currency-exchange', name: 'Exchange currency / Notify bank', category: 'pre-departure' },
  { id: 'international-plan', name: 'Activate international phone plan', category: 'pre-departure' },
  { id: 'download-maps', name: 'Download offline maps', category: 'pre-departure' },
  { id: 'download-translator', name: 'Download translator app', category: 'pre-departure' },
  { id: 'copy-documents', name: 'Make copies of important documents', category: 'pre-departure' },
  { id: 'digital-copies', name: 'Save digital copies in cloud', category: 'pre-departure' },
  { id: 'share-itinerary', name: 'Share itinerary with family', category: 'pre-departure' },
  { id: 'pet-sitter', name: 'Arrange pet sitter', category: 'pre-departure' },
  { id: 'house-sitter', name: 'Arrange house sitter', category: 'pre-departure' },
  { id: 'mail-hold', name: 'Hold mail delivery', category: 'pre-departure' },
  { id: 'plant-care', name: 'Arrange plant care', category: 'pre-departure' },
  { id: 'thermostat', name: 'Adjust thermostat', category: 'pre-departure' },
  { id: 'lights-timer', name: 'Set lights on timer', category: 'pre-departure' },
  { id: 'alarm-system', name: 'Set alarm system', category: 'pre-departure' },
];

// Weather-based recommendations
export const getWeatherBasedItems = (weatherCondition) => {
  const items = [];
  
  if (weatherCondition?.toLowerCase().includes('rain')) {
    items.push(
      { id: 'umbrella-weather', name: 'Umbrella', category: 'weather' },
      { id: 'raincoat-weather', name: 'Raincoat', category: 'weather' },
      { id: 'waterproof-bag', name: 'Waterproof bag cover', category: 'weather' },
      { id: 'waterproof-shoes', name: 'Waterproof shoes', category: 'weather' }
    );
  }
  
  if (weatherCondition?.toLowerCase().includes('sun') || weatherCondition?.toLowerCase().includes('clear')) {
    items.push(
      { id: 'sunscreen-weather', name: 'Sunscreen (high SPF)', category: 'weather' },
      { id: 'sunglasses-weather', name: 'Sunglasses', category: 'weather' },
      { id: 'hat-weather', name: 'Sun hat', category: 'weather' },
      { id: 'light-clothing', name: 'Light clothing', category: 'weather' }
    );
  }
  
  if (weatherCondition?.toLowerCase().includes('snow') || weatherCondition?.toLowerCase().includes('cold')) {
    items.push(
      { id: 'winter-jacket', name: 'Winter jacket', category: 'weather' },
      { id: 'gloves', name: 'Gloves', category: 'weather' },
      { id: 'scarf-weather', name: 'Scarf', category: 'weather' },
      { id: 'thermal-wear', name: 'Thermal wear', category: 'weather' },
      { id: 'winter-boots', name: 'Winter boots', category: 'weather' }
    );
  }
  
  return items;
};