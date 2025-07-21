'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  const [email, setEmail] = useState('');

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter signup
    console.log('Newsletter signup:', email);
    setEmail('');
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-white py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <Image
              src="/images/Larnacei_white.png"
              alt="Larnacei Global Limited White Logo"
              width={60}
              height={60}
              className="h-10 mb-4"
            />
            <p className="text-gray-400 text-sm">
              Your Gateway to Premium Properties. Larnacei Global Limited is a trusted name in Nigerian real estate, connecting buyers, sellers, and renters.
            </p>
          </div>
          
          <div>
            <h5 className="text-lg font-semibold mb-4">Property Categories</h5>
            <ul className="space-y-2">
              <li>
                <Link href="/properties/short-stays" className="text-gray-400 hover:text-red-400 transition-colors">
                  Short Stays
                </Link>
              </li>
              <li>
                <Link href="/properties/long-term-rentals" className="text-gray-400 hover:text-red-400 transition-colors">
                  Long-term Rentals
                </Link>
              </li>
              <li>
                <Link href="/properties/landed-properties" className="text-gray-400 hover:text-red-400 transition-colors">
                  Landed Properties
                </Link>
              </li>
              <li>
                <Link href="/properties/property-sales" className="text-gray-400 hover:text-red-400 transition-colors">
                  Property Sales
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h5 className="text-lg font-semibold mb-4">Support</h5>
            <ul className="space-y-2">
              <li>
                <Link href="/help" className="text-gray-400 hover:text-red-400 transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-red-400 transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-400 hover:text-red-400 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-400 hover:text-red-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h5 className="text-lg font-semibold mb-4">Connect With Us</h5>
            <div className="flex space-x-4 mb-4">
              <a href="#" className="text-gray-400 hover:text-red-400 transition-colors">
                <span className="material-icons">facebook</span>
              </a>
              <a href="#" className="text-gray-400 hover:text-red-400 transition-colors">
                <span className="material-icons">email</span>
              </a>
              <a href="#" className="text-gray-400 hover:text-red-400 transition-colors">
                <span className="material-icons">photo_camera</span>
              </a>
            </div>
            
            <h5 className="text-md font-semibold mb-2">Newsletter Signup</h5>
            <form onSubmit={handleNewsletterSubmit} className="flex">
              <input
                className="bg-gray-700 text-white px-3 py-2 rounded-l-md focus:outline-none focus:ring-2 focus:ring-red-500 flex-grow text-sm"
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button
                className="primary-bg hover:bg-red-700 text-white px-4 py-2 rounded-r-md text-sm transition-colors"
                type="submit"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
        
        <div className="border-t border-gray-700 pt-8 text-center text-gray-500 text-sm">
          <p>© {currentYear} Larnacei Global Limited. All Rights Reserved. RC 1234567.</p>
        </div>
      </div>
    </footer>
  );
} 