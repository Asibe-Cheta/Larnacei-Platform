import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Help Center
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Find answers to common questions and get the support you need for your real estate journey.
          </p>
        </div>

        {/* Search Section */}
        <div className="bg-white p-8 rounded-lg shadow-md mb-12">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">How can we help you?</h2>
            <div className="relative">
              <input
                type="text"
                placeholder="Search for help articles..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
              />
              <button className="absolute right-2 top-2 text-gray-400 hover:text-red-600">
                <span className="material-icons">search</span>
              </button>
            </div>
          </div>
        </div>

        {/* FAQ Sections */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Getting Started */}
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="material-icons text-red-600 mr-3">play_circle</span>
              Getting Started
            </h3>
            <div className="space-y-4">
              <details className="group">
                <summary className="flex justify-between items-center cursor-pointer text-lg font-semibold text-gray-900 hover:text-red-600">
                  How do I create an account?
                  <span className="material-icons group-open:rotate-180 transition-transform">expand_more</span>
                </summary>
                <div className="mt-4 text-gray-600">
                  <p>Creating an account is easy! Click the "Sign Up" button in the top navigation, fill in your details, and verify your email address. You'll be able to start browsing and saving properties immediately.</p>
                </div>
              </details>

              <details className="group">
                <summary className="flex justify-between items-center cursor-pointer text-lg font-semibold text-gray-900 hover:text-red-600">
                  How do I search for properties?
                  <span className="material-icons group-open:rotate-180 transition-transform">expand_more</span>
                </summary>
                <div className="mt-4 text-gray-600">
                  <p>Use our search bar on the homepage to find properties by location, type, or price range. You can also browse by category (Short Stays, Rentals, Land Sales, Property Sales) or use our advanced filters for more specific searches.</p>
                </div>
              </details>

              <details className="group">
                <summary className="flex justify-between items-center cursor-pointer text-lg font-semibold text-gray-900 hover:text-red-600">
                  How do I save favorite properties?
                  <span className="material-icons group-open:rotate-180 transition-transform">expand_more</span>
                </summary>
                <div className="mt-4 text-gray-600">
                  <p>When you're logged in, you can click the heart icon on any property card to save it to your favorites. You can view all your saved properties in your dashboard under "Favorites".</p>
                </div>
              </details>
            </div>
          </div>

          {/* Property Listings */}
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="material-icons text-red-600 mr-3">apartment</span>
              Property Listings
            </h3>
            <div className="space-y-4">
              <details className="group">
                <summary className="flex justify-between items-center cursor-pointer text-lg font-semibold text-gray-900 hover:text-red-600">
                  How do I list my property?
                  <span className="material-icons group-open:rotate-180 transition-transform">expand_more</span>
                </summary>
                <div className="mt-4 text-gray-600">
                  <p>Click "List Property" in the navigation menu. You'll be guided through a step-by-step process to add your property details, upload photos, and set your pricing. Our team will review and approve your listing within 24 hours.</p>
                </div>
              </details>

              <details className="group">
                <summary className="flex justify-between items-center cursor-pointer text-lg font-semibold text-gray-900 hover:text-red-600">
                  How do I contact a property owner?
                  <span className="material-icons group-open:rotate-180 transition-transform">expand_more</span>
                </summary>
                <div className="mt-4 text-gray-600">
                  <p>On any property page, you'll find a "Contact Owner" button. Click it to send a message directly to the property owner. You can also schedule viewings or ask specific questions about the property.</p>
                </div>
              </details>

              <details className="group">
                <summary className="flex justify-between items-center cursor-pointer text-lg font-semibold text-gray-900 hover:text-red-600">
                  Are all properties verified?
                  <span className="material-icons group-open:rotate-180 transition-transform">expand_more</span>
                </summary>
                <div className="mt-4 text-gray-600">
                  <p>Yes, we verify all properties listed on our platform. Our team conducts thorough checks on property details, ownership, and documentation to ensure you're dealing with legitimate listings.</p>
                </div>
              </details>
            </div>
          </div>

          {/* Payments & Transactions */}
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="material-icons text-red-600 mr-3">payment</span>
              Payments & Transactions
            </h3>
            <div className="space-y-4">
              <details className="group">
                <summary className="flex justify-between items-center cursor-pointer text-lg font-semibold text-gray-900 hover:text-red-600">
                  What payment methods do you accept?
                  <span className="material-icons group-open:rotate-180 transition-transform">expand_more</span>
                </summary>
                <div className="mt-4 text-gray-600">
                  <p>We accept various payment methods including bank transfers, credit/debit cards, and mobile money. All payments are processed securely through our trusted payment partners.</p>
                </div>
              </details>

              <details className="group">
                <summary className="flex justify-between items-center cursor-pointer text-lg font-semibold text-gray-900 hover:text-red-600">
                  Is my payment information secure?
                  <span className="material-icons group-open:rotate-180 transition-transform">expand_more</span>
                </summary>
                <div className="mt-4 text-gray-600">
                  <p>Absolutely! We use industry-standard encryption and security measures to protect your payment information. We never store your complete payment details on our servers.</p>
                </div>
              </details>

              <details className="group">
                <summary className="flex justify-between items-center cursor-pointer text-lg font-semibold text-gray-900 hover:text-red-600">
                  Can I get a refund?
                  <span className="material-icons group-open:rotate-180 transition-transform">expand_more</span>
                </summary>
                <div className="mt-4 text-gray-600">
                  <p>Refund policies vary depending on the service. For property listings, we offer a money-back guarantee if your listing doesn't receive inquiries within 30 days. Contact our support team for specific refund requests.</p>
                </div>
              </details>
            </div>
          </div>

          {/* Account & Security */}
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="material-icons text-red-600 mr-3">security</span>
              Account & Security
            </h3>
            <div className="space-y-4">
              <details className="group">
                <summary className="flex justify-between items-center cursor-pointer text-lg font-semibold text-gray-900 hover:text-red-600">
                  How do I reset my password?
                  <span className="material-icons group-open:rotate-180 transition-transform">expand_more</span>
                </summary>
                <div className="mt-4 text-gray-600">
                  <p>Go to the sign-in page and click "Forgot Password". Enter your email address, and we'll send you a link to reset your password securely.</p>
                </div>
              </details>

              <details className="group">
                <summary className="flex justify-between items-center cursor-pointer text-lg font-semibold text-gray-900 hover:text-red-600">
                  How do I update my profile information?
                  <span className="material-icons group-open:rotate-180 transition-transform">expand_more</span>
                </summary>
                <div className="mt-4 text-gray-600">
                  <p>Log into your account and go to your dashboard. Click on "Profile Settings" to update your personal information, contact details, and preferences.</p>
                </div>
              </details>

              <details className="group">
                <summary className="flex justify-between items-center cursor-pointer text-lg font-semibold text-gray-900 hover:text-red-600">
                  How do I delete my account?
                  <span className="material-icons group-open:rotate-180 transition-transform">expand_more</span>
                </summary>
                <div className="mt-4 text-gray-600">
                  <p>To delete your account, contact our support team. We'll guide you through the process and ensure all your data is properly removed from our systems.</p>
                </div>
              </details>
            </div>
          </div>
        </div>

        {/* Contact Support */}
        <div className="bg-red-600 text-white p-8 rounded-lg text-center">
          <h2 className="text-3xl font-bold mb-4">Still Need Help?</h2>
          <p className="text-xl mb-6">
            Our support team is here to help you with any questions or issues.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/contact" className="btn btn-outline-white">
              Contact Support
            </a>
            <a href="mailto:support@larnacei.com" className="btn btn-white">
              Email Us
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
} 