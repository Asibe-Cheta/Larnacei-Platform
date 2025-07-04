'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    if (!isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    document.body.style.overflow = '';
  };

  return (
    <>
      <header className="bg-white shadow-md sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/images/Larnacei_coloured.png"
              alt="Larnacei Global Limited Logo"
              width={60}
              height={60}
              className="h-10"
            />
          </Link>
          
          <nav className="hidden md:flex space-x-6 items-center">
            <Link href="/" className="text-gray-700 hover:text-red-700 transition-colors">
              Home
            </Link>
            <Link href="/short-stays" className="text-gray-700 hover:text-red-700 transition-colors">
              Short Stays
            </Link>
            <Link href="/rentals" className="text-gray-700 hover:text-red-700 transition-colors">
              Rentals
            </Link>
            <Link href="/land-sales" className="text-gray-700 hover:text-red-700 transition-colors">
              Land Sales
            </Link>
            <Link href="/property-sales" className="text-gray-700 hover:text-red-700 transition-colors">
              Property Sales
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-red-700 transition-colors">
              About
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-red-700 transition-colors">
              Contact
            </Link>
          </nav>
          
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/signin" className="text-gray-700 hover:text-red-700 transition-colors">
              Sign In
            </Link>
            <Link href="/list-property" className="btn btn-primary text-sm">
              List Property
            </Link>
          </div>
          
          <div className="md:hidden">
            <button
              className="text-gray-700 focus:outline-none"
              onClick={toggleMobileMenu}
            >
              <span className="material-icons">menu</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <div className={`full-screen-menu text-white p-8 ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="flex justify-end mb-8">
          <button
            className="focus:outline-none"
            onClick={closeMobileMenu}
          >
            <span className="material-icons text-3xl">close</span>
          </button>
        </div>
        
        <nav className="flex flex-col space-y-6 text-xl text-center">
          <Link
            href="/"
            className="hover:text-red-300 flex items-center justify-center transition-colors"
            onClick={closeMobileMenu}
          >
            <span className="material-icons mr-2">home</span>
            Home
          </Link>
          <Link
            href="/short-stays"
            className="hover:text-red-300 flex items-center justify-center transition-colors"
            onClick={closeMobileMenu}
          >
            <span className="material-icons mr-2">hotel</span>
            Short Stays
          </Link>
          <Link
            href="/rentals"
            className="hover:text-red-300 flex items-center justify-center transition-colors"
            onClick={closeMobileMenu}
          >
            <span className="material-icons mr-2">apartment</span>
            Rentals
          </Link>
          <Link
            href="/land-sales"
            className="hover:text-red-300 flex items-center justify-center transition-colors"
            onClick={closeMobileMenu}
          >
            <span className="material-icons mr-2">landscape</span>
            Land Sales
          </Link>
          <Link
            href="/property-sales"
            className="hover:text-red-300 flex items-center justify-center transition-colors"
            onClick={closeMobileMenu}
          >
            <span className="material-icons mr-2">villa</span>
            Property Sales
          </Link>
          <Link
            href="/about"
            className="hover:text-red-300 flex items-center justify-center transition-colors"
            onClick={closeMobileMenu}
          >
            <span className="material-icons mr-2">info</span>
            About
          </Link>
          <Link
            href="/contact"
            className="hover:text-red-300 flex items-center justify-center transition-colors"
            onClick={closeMobileMenu}
          >
            <span className="material-icons mr-2">contact_support</span>
            Contact
          </Link>
          
          <hr className="border-gray-700 my-4" />
          
          <Link
            href="/signin"
            className="hover:text-red-300 flex items-center justify-center transition-colors"
            onClick={closeMobileMenu}
          >
            <span className="material-icons mr-2">login</span>
            Sign In
          </Link>
          <Link
            href="/list-property"
            className="btn btn-primary w-full mt-4"
            onClick={closeMobileMenu}
          >
            List Property
          </Link>
        </nav>
      </div>
    </>
  );
} 