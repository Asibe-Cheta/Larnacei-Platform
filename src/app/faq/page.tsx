'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

interface FAQItem {
  question: string;
  answer: string | JSX.Element;
}

interface FAQSection {
  title: string;
  items: FAQItem[];
}

export default function FAQPage() {
  const [openItems, setOpenItems] = useState<{ [key: string]: boolean }>({});

  const toggleItem = (sectionIndex: number, itemIndex: number) => {
    const key = `${sectionIndex}-${itemIndex}`;
    setOpenItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const faqSections: FAQSection[] = [
    {
      title: "Finding Properties",
      items: [
        {
          question: "How do I search for properties on Larnacei?",
          answer: "Use our advanced search filters on the Properties page. You can filter by location, price range, property type, number of bedrooms, and amenities. Our AI-powered search also helps you find properties that match your specific needs."
        },
        {
          question: "What types of properties are available?",
          answer: "Larnacei offers four main categories: Short Stays (vacation rentals), Long-term Rentals (residential leases), Landed Properties (plots of land), and Property Sales (homes for purchase). Each category has various property types including apartments, houses, villas, commercial spaces, and land."
        },
        {
          question: "How do I contact a property owner?",
          answer: "Each property listing has contact information and an inquiry form. You can send a message directly through the platform, call the provided phone number, or use our WhatsApp integration for quick communication."
        },
        {
          question: "Are all properties verified?",
          answer: "Yes! All properties go through our moderation process before being published. Our team verifies property details, documents, and authenticity to ensure you're dealing with legitimate listings."
        }
      ]
    },
    {
      title: "Listing Your Property",
      items: [
        {
          question: "How do I list my property on Larnacei?",
          answer: (
            <div>
              <p className="mb-2">Listing your property is easy! Simply:</p>
              <ol className="list-decimal list-inside space-y-1 ml-4">
                <li>Register for a free account</li>
                <li>Click "List Property" in the navigation menu</li>
                <li>Fill out the 6-step listing form with your property details</li>
                <li>Upload high-quality photos and videos</li>
                <li>Submit for review - we'll approve within 24-48 hours</li>
              </ol>
            </div>
          )
        },
        {
          question: "What documents do I need to list my property?",
          answer: (
            <div>
              <p className="mb-2">To list your property, you may need some or all of these documents:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>Title Deed</strong> - Proof of ownership</li>
                <li><strong>Survey Plan</strong> - Property boundaries and measurements</li>
                <li><strong>Building Approval</strong> - Government construction permit</li>
                <li><strong>Certificate of Occupancy</strong> - Right to occupy the land</li>
                <li><strong>Deed of Assignment</strong> - Transfer of ownership document</li>
                <li><strong>Power of Attorney</strong> - If listing on behalf of someone else</li>
              </ul>
              <p className="mt-2 text-sm text-gray-600">Don't worry - not all documents are required for every listing type!</p>
            </div>
          )
        },
        {
          question: "How much does it cost to list my property?",
          answer: "Basic property listing is completely FREE! You only pay when you earn. We offer premium features like featured listings and enhanced visibility for a small fee, but you can successfully list and rent/sell your property at no upfront cost."
        },
        {
          question: "What are the requirements to become a property owner on Larnacei?",
          answer: (
            <div>
              <p className="mb-2">To list properties on Larnacei, you need to:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>Be 18+ years old</strong> - Legal age requirement</li>
                <li><strong>Provide valid ID</strong> - NIN, Driver's License, or International Passport</li>
                <li><strong>Own or have authority</strong> - Legal right to rent/sell the property</li>
                <li><strong>Provide accurate information</strong> - Honest property descriptions and details</li>
                <li><strong>Have contact information</strong> - Phone number and email for inquiries</li>
                <li><strong>Upload quality photos</strong> - Clear images that showcase your property</li>
              </ul>
            </div>
          )
        }
      ]
    },
    {
      title: "Getting Started - Step by Step",
      items: [
        {
          question: "What's the complete process from registration to earning?",
          answer: (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h4 className="font-semibold text-lg text-red-600 mb-4">Your Journey to Success</h4>
                <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-4">
                  <div className="flex items-center">
                    <div className="bg-red-100 text-red-600 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">1</div>
                    <span className="ml-2 font-medium">Register</span>
                  </div>
                  <div className="hidden md:block text-gray-400">→</div>
                  <div className="flex items-center">
                    <div className="bg-red-100 text-red-600 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">2</div>
                    <span className="ml-2 font-medium">Get Docs Ready</span>
                  </div>
                  <div className="hidden md:block text-gray-400">→</div>
                  <div className="flex items-center">
                    <div className="bg-red-100 text-red-600 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">3</div>
                    <span className="ml-2 font-medium">List</span>
                  </div>
                  <div className="hidden md:block text-gray-400">→</div>
                  <div className="flex items-center">
                    <div className="bg-red-100 text-red-600 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">4</div>
                    <span className="ml-2 font-medium">Get Approved</span>
                  </div>
                  <div className="hidden md:block text-gray-400">→</div>
                  <div className="flex items-center">
                    <div className="bg-green-100 text-green-600 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">5</div>
                    <span className="ml-2 font-medium text-green-600">Earn!</span>
                  </div>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-red-50 p-4 rounded-lg">
                  <h5 className="font-semibold text-red-600 mb-2">1. Register</h5>
                  <p className="text-sm">Create your free account with email verification. Add your profile information and contact details.</p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <h5 className="font-semibold text-orange-600 mb-2">2. Get Docs Ready</h5>
                  <p className="text-sm">Gather your property documents, take high-quality photos, and prepare property details.</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h5 className="font-semibold text-yellow-600 mb-2">3. List</h5>
                  <p className="text-sm">Use our easy 6-step form to create your property listing with all details and media.</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h5 className="font-semibold text-blue-600 mb-2">4. Get Approved</h5>
                  <p className="text-sm">Our team reviews and approves your listing within 24-48 hours for quality assurance.</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg md:col-span-2 lg:col-span-1">
                  <h5 className="font-semibold text-green-600 mb-2">5. Earn!</h5>
                  <p className="text-sm">Start receiving inquiries, connect with potential buyers/renters, and close deals!</p>
                </div>
              </div>
            </div>
          )
        }
      ]
    },
    {
      title: "Platform Features",
      items: [
        {
          question: "What makes Larnacei different from other property platforms?",
          answer: (
            <div>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>AI-Powered Search</strong> - Smart matching for buyers and properties</li>
                <li><strong>Comprehensive Verification</strong> - All properties and users are verified</li>
                <li><strong>Multiple Payment Options</strong> - Paystack integration for secure transactions</li>
                <li><strong>Real-time Messaging</strong> - Direct communication between parties</li>
                <li><strong>Mobile Optimized</strong> - Perfect experience on all devices</li>
                <li><strong>Nigerian Focus</strong> - Built specifically for the Nigerian property market</li>
              </ul>
            </div>
          )
        },
        {
          question: "Do you support payment processing?",
          answer: "Yes! We integrate with Paystack to provide secure payment processing. Buyers can make payments directly through the platform, and we provide transaction history and receipts for all parties."
        },
        {
          question: "How do I get support if I need help?",
          answer: (
            <div>
              <p className="mb-2">We're here to help! You can reach us through:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>Contact Form</strong> - Use our contact page for detailed inquiries</li>
                <li><strong>WhatsApp</strong> - Quick support via WhatsApp messaging</li>
                <li><strong>Email Support</strong> - Send us an email for technical issues</li>
                <li><strong>Phone Support</strong> - Call during business hours</li>
              </ul>
            </div>
          )
        }
      ]
    },
    {
      title: "Safety & Security",
      items: [
        {
          question: "How do you ensure the safety of transactions?",
          answer: "We use industry-standard security measures including SSL encryption, verified user profiles, document verification, and secure payment processing through Paystack. All communications are logged for transparency and security."
        },
        {
          question: "What if I encounter a fraudulent listing?",
          answer: "Report any suspicious activity immediately through our contact form or support channels. We have a dedicated moderation team that investigates all reports and takes swift action against fraudulent listings."
        },
        {
          question: "How is my personal information protected?",
          answer: "We follow strict privacy policies and data protection standards. Your personal information is encrypted and only shared with relevant parties during legitimate property transactions. We never sell your data to third parties."
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need to know about finding, listing, and managing properties on Larnacei
            </p>
          </div>
        </div>
      </div>

      {/* Quick Navigation */}
      <div className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4 text-center">Quick Navigation</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {faqSections.map((section, index) => (
              <a
                key={index}
                href={`#section-${index}`}
                className="text-center p-3 border border-gray-200 rounded-lg hover:border-red-300 hover:bg-red-50 transition-colors"
              >
                <div className="text-sm font-medium text-gray-900">{section.title}</div>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ Sections */}
      <div className="container mx-auto px-4 pb-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {faqSections.map((section, sectionIndex) => (
            <div key={sectionIndex} id={`section-${sectionIndex}`} className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">{section.title}</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {section.items.map((item, itemIndex) => {
                  const isOpen = openItems[`${sectionIndex}-${itemIndex}`];
                  return (
                    <div key={itemIndex} className="p-6">
                      <button
                        onClick={() => toggleItem(sectionIndex, itemIndex)}
                        className="w-full text-left flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded-lg p-2 -m-2"
                      >
                        <h3 className="text-lg font-semibold text-gray-900 pr-4">
                          {item.question}
                        </h3>
                        {isOpen ? (
                          <ChevronUpIcon className="h-5 w-5 text-gray-500 flex-shrink-0" />
                        ) : (
                          <ChevronDownIcon className="h-5 w-5 text-gray-500 flex-shrink-0" />
                        )}
                      </button>
                      {isOpen && (
                        <div className="mt-4 text-gray-700 leading-relaxed">
                          {typeof item.answer === 'string' ? (
                            <p>{item.answer}</p>
                          ) : (
                            item.answer
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-red-600 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-lg mb-8 opacity-90">
            Join thousands of property owners and buyers using Larnacei
          </p>
          <div className="space-x-0 space-y-4 md:space-y-0 md:space-x-4">
            <Link
              href="/signup"
              className="inline-block bg-white text-red-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Create Account
            </Link>
            <Link
              href="/list-property"
              className="inline-block border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-red-600 transition-colors"
            >
              List Property
            </Link>
          </div>
        </div>
      </div>

      {/* Still Have Questions */}
      <div className="bg-gray-100 py-8">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Still have questions?
          </h3>
          <p className="text-gray-600 mb-6">
            Can't find the answer you're looking for? Get in touch with our support team.
          </p>
          <Link
            href="/contact"
            className="inline-block bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}
