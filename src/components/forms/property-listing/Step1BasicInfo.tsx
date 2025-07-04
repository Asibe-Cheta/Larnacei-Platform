'use client';

interface PropertyListingData {
  title: string;
  category: 'SHORT_STAYS' | 'LONG_TERM_RENTALS' | 'LANDED_PROPERTIES' | 'PROPERTY_SALES';
  type: 'APARTMENT' | 'HOUSE' | 'VILLA' | 'LAND' | 'COMMERCIAL' | 'OFFICE' | 'SHOP' | 'WAREHOUSE';
  price: string;
  currency: 'NGN';
  description: string;
}

interface Step1BasicInfoProps {
  formData: PropertyListingData;
  updateFormData: (updates: Partial<PropertyListingData>) => void;
}

const categories = [
  { value: 'SHORT_STAYS', label: 'Short Stays', description: 'Vacation rentals, holiday homes' },
  { value: 'LONG_TERM_RENTALS', label: 'Long-term Rentals', description: 'Residential leases' },
  { value: 'LANDED_PROPERTIES', label: 'Landed Properties', description: 'Land for sale' },
  { value: 'PROPERTY_SALES', label: 'Property Sales', description: 'Houses for purchase' }
];

const propertyTypes = {
  SHORT_STAYS: [
    { value: 'APARTMENT', label: 'Apartment' },
    { value: 'HOUSE', label: 'House' },
    { value: 'VILLA', label: 'Villa' }
  ],
  LONG_TERM_RENTALS: [
    { value: 'APARTMENT', label: 'Apartment' },
    { value: 'HOUSE', label: 'House' },
    { value: 'VILLA', label: 'Villa' },
    { value: 'COMMERCIAL', label: 'Commercial' }
  ],
  LANDED_PROPERTIES: [
    { value: 'LAND', label: 'Land' }
  ],
  PROPERTY_SALES: [
    { value: 'APARTMENT', label: 'Apartment' },
    { value: 'HOUSE', label: 'House' },
    { value: 'VILLA', label: 'Villa' },
    { value: 'COMMERCIAL', label: 'Commercial' },
    { value: 'OFFICE', label: 'Office' },
    { value: 'SHOP', label: 'Shop' },
    { value: 'WAREHOUSE', label: 'Warehouse' }
  ]
};

export default function Step1BasicInfo({ formData, updateFormData }: Step1BasicInfoProps) {
  const handleInputChange = (field: keyof PropertyListingData, value: any) => {
    updateFormData({ [field]: value });
    
    // Reset type when category changes
    if (field === 'category') {
      const availableTypes = propertyTypes[value as keyof typeof propertyTypes];
      if (availableTypes.length > 0) {
        updateFormData({ type: availableTypes[0].value as any });
      }
    }
  };

  const formatPrice = (value: string) => {
    // Remove all non-digit characters
    const numericValue = value.replace(/\D/g, '');
    
    // Format with commas
    if (numericValue) {
      return new Intl.NumberFormat('en-NG').format(parseInt(numericValue));
    }
    
    return '';
  };

  const handlePriceChange = (value: string) => {
    const formatted = formatPrice(value);
    handleInputChange('price', formatted);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Basic Property Information</h2>
        <p className="text-gray-600">Tell us about your property - this is what potential buyers/renters will see first.</p>
      </div>

      {/* Property Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
          Property Title *
        </label>
        <input
          type="text"
          id="title"
          value={formData.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          placeholder="e.g., Beautiful 3-Bedroom Villa in Lekki"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
          required
        />
        <p className="mt-1 text-sm text-gray-500">
          Create an attractive title that highlights the best features of your property
        </p>
      </div>

      {/* Property Category */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Property Category *
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map((category) => (
            <button
              key={category.value}
              type="button"
              onClick={() => handleInputChange('category', category.value)}
              className={`p-4 border-2 rounded-lg text-left transition-colors ${
                formData.category === category.value
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="font-medium text-gray-900">{category.label}</div>
              <div className="text-sm text-gray-500">{category.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Property Type */}
      <div>
        <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
          Property Type *
        </label>
        <select
          id="type"
          value={formData.type}
          onChange={(e) => handleInputChange('type', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
        >
          {propertyTypes[formData.category].map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      {/* Price */}
      <div>
        <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
          Price *
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">₦</span>
          </div>
          <input
            type="text"
            id="price"
            value={formData.price}
            onChange={(e) => handlePriceChange(e.target.value)}
            placeholder="0"
            className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
            required
          />
        </div>
        <p className="mt-1 text-sm text-gray-500">
          {formData.category === 'SHORT_STAYS' && 'Price per night'}
          {formData.category === 'LONG_TERM_RENTALS' && 'Price per year'}
          {(formData.category === 'LANDED_PROPERTIES' || formData.category === 'PROPERTY_SALES') && 'Total price'}
        </p>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          Property Description *
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          rows={6}
          placeholder="Describe your property in detail. Include key features, amenities, and what makes it special..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
          required
        />
        <p className="mt-1 text-sm text-gray-500">
          Minimum 50 characters. Be detailed and highlight unique features.
        </p>
      </div>

      {/* Summary */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-gray-900 mb-2">Summary</h3>
        <div className="text-sm text-gray-600 space-y-1">
          <p><strong>Category:</strong> {categories.find(c => c.value === formData.category)?.label}</p>
          <p><strong>Type:</strong> {propertyTypes[formData.category].find(t => t.value === formData.type)?.label}</p>
          <p><strong>Price:</strong> ₦{formData.price || '0'}</p>
          <p><strong>Description:</strong> {formData.description.length} characters</p>
        </div>
      </div>
    </div>
  );
} 