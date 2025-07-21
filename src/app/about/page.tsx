import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Image from 'next/image';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            About Larnacei Global Limited
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Your trusted partner in Nigerian real estate, connecting dreams with properties since our inception.
          </p>
        </div>

        {/* Company Overview */}
        <section className="mb-16">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
              <p className="text-gray-600 mb-4">
                Founded with a vision to revolutionize the Nigerian real estate market, Larnacei Global Limited
                has grown from a small startup to one of the most trusted names in property services across Nigeria.
              </p>
              <p className="text-gray-600 mb-4">
                We understand that finding the perfect property is more than just a transaction—it's about
                finding a place to call home, an investment for the future, or a space to grow your business.
              </p>
              <p className="text-gray-600">
                Our platform connects buyers, sellers, renters, and property owners with transparency,
                efficiency, and unmatched customer service.
              </p>
            </div>
            <div className="relative">
              <Image
                src="/images/Larnacei_coloured.png"
                alt="Larnacei Global Limited"
                width={400}
                height={300}
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="mb-16">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="text-center mb-6">
                <span className="material-icons text-4xl text-red-600 mb-4">flag</span>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Our Mission</h3>
              </div>
              <p className="text-gray-600 text-center">
                To provide seamless, transparent, and reliable real estate services that empower
                individuals and businesses to make informed property decisions across Nigeria.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="text-center mb-6">
                <span className="material-icons text-4xl text-red-600 mb-4">visibility</span>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Our Vision</h3>
              </div>
              <p className="text-gray-600 text-center">
                To become the leading digital real estate platform in Nigeria, setting industry
                standards for innovation, customer service, and market transparency.
              </p>
            </div>
          </div>
        </section>

        {/* Core Values */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Our Core Values</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-icons text-2xl text-red-600">verified</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Trust & Transparency</h3>
              <p className="text-gray-600">
                We believe in building lasting relationships through honest, transparent dealings
                and reliable information.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-icons text-2xl text-red-600">support_agent</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Customer Excellence</h3>
              <p className="text-gray-600">
                Every interaction is an opportunity to exceed expectations and deliver
                exceptional service to our clients.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-icons text-2xl text-red-600">trending_up</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Innovation</h3>
              <p className="text-gray-600">
                We continuously embrace new technologies and methods to improve
                the real estate experience for everyone.
              </p>
            </div>
          </div>
        </section>

        {/* Services */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">What We Offer</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <span className="material-icons text-3xl text-red-600 mb-4">apartment</span>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Property Sales</h3>
              <p className="text-gray-600 text-sm">
                Comprehensive property listings with detailed information and professional support.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <span className="material-icons text-3xl text-red-600 mb-4">hotel</span>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Short Stays</h3>
              <p className="text-gray-600 text-sm">
                Vacation rentals and temporary accommodations for travelers and visitors.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <span className="material-icons text-3xl text-red-600 mb-4">home</span>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Long-term Rentals</h3>
              <p className="text-gray-600 text-sm">
                Residential and commercial properties available for extended lease periods.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <span className="material-icons text-3xl text-red-600 mb-4">landscape</span>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Landed Properties</h3>
              <p className="text-gray-600 text-sm">
                Plots of land and development sites for investment and construction projects.
              </p>
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Our Team</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-32 h-32 bg-gray-300 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="material-icons text-4xl text-gray-600">person</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-1">Experienced Professionals</h3>
              <p className="text-gray-600">
                Our team consists of real estate experts with years of industry experience.
              </p>
            </div>

            <div className="text-center">
              <div className="w-32 h-32 bg-gray-300 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="material-icons text-4xl text-gray-600">groups</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-1">Dedicated Support</h3>
              <p className="text-gray-600">
                Customer service specialists ready to assist you throughout your property journey.
              </p>
            </div>

            <div className="text-center">
              <div className="w-32 h-32 bg-gray-300 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="material-icons text-4xl text-gray-600">psychology</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-1">Market Experts</h3>
              <p className="text-gray-600">
                Local market specialists who understand the unique dynamics of Nigerian real estate.
              </p>
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="bg-red-600 text-white p-8 rounded-lg text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-6">
            Whether you're buying, selling, or renting, we're here to help you succeed.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/contact" className="btn btn-outline-white">
              Contact Us
            </a>
            <a href="/properties" className="btn btn-white">
              Browse Properties
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
} 