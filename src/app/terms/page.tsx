import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Terms of Service
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Please read these terms carefully before using our services.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white p-8 rounded-lg shadow-md space-y-8">

            {/* Introduction */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
              <p className="text-gray-600 mb-4">
                Welcome to Larnacei Global Limited ("we," "our," or "us"). These Terms of Service ("Terms") govern your use of our website and services located at larnacei.com (the "Service").
              </p>
              <p className="text-gray-600">
                By accessing or using our Service, you agree to be bound by these Terms. If you disagree with any part of these terms, then you may not access the Service.
              </p>
            </section>

            {/* Definitions */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Definitions</h2>
              <div className="space-y-2 text-gray-600">
                <p><strong>Service:</strong> The larnacei.com website and all related services.</p>
                <p><strong>User:</strong> Any individual or entity using our Service.</p>
                <p><strong>Content:</strong> Any information, data, text, images, or other materials posted on our Service.</p>
                <p><strong>Property:</strong> Any real estate listing, including but not limited to houses, apartments, land, and commercial properties.</p>
              </div>
            </section>

            {/* User Accounts */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. User Accounts</h2>
              <div className="space-y-4 text-gray-600">
                <p>When you create an account with us, you must provide accurate, complete, and current information. You are responsible for safeguarding your account credentials and for all activities that occur under your account.</p>
                <p>You agree not to:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Use another person's account without permission</li>
                  <li>Create multiple accounts for fraudulent purposes</li>
                  <li>Share your account credentials with others</li>
                  <li>Use automated systems to access our Service</li>
                </ul>
              </div>
            </section>

            {/* Acceptable Use */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Acceptable Use</h2>
              <div className="space-y-4 text-gray-600">
                <p>You agree to use our Service only for lawful purposes and in accordance with these Terms. You agree not to:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Post false, misleading, or fraudulent information</li>
                  <li>Harass, abuse, or harm other users</li>
                  <li>Violate any applicable laws or regulations</li>
                  <li>Attempt to gain unauthorized access to our systems</li>
                  <li>Use our Service for any commercial purpose without our written consent</li>
                  <li>Interfere with or disrupt our Service</li>
                </ul>
              </div>
            </section>

            {/* Property Listings */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Property Listings</h2>
              <div className="space-y-4 text-gray-600">
                <p>When listing properties on our platform, you agree to:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Provide accurate and complete property information</li>
                  <li>Own or have legal authority to list the property</li>
                  <li>Maintain current and up-to-date listing information</li>
                  <li>Respond to inquiries in a timely manner</li>
                  <li>Not list properties that are not available for sale or rent</li>
                </ul>
                <p>We reserve the right to remove any listing that violates these terms or for any other reason at our sole discretion.</p>
              </div>
            </section>

            {/* Privacy */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Privacy</h2>
              <p className="text-gray-600">
                Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the Service, to understand our practices regarding the collection and use of your information.
              </p>
            </section>

            {/* Intellectual Property */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Intellectual Property</h2>
              <div className="space-y-4 text-gray-600">
                <p>The Service and its original content, features, and functionality are owned by Larnacei Global Limited and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.</p>
                <p>You retain ownership of any content you submit to our Service, but you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and distribute your content in connection with our Service.</p>
              </div>
            </section>

            {/* Payment Terms */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Payment Terms</h2>
              <div className="space-y-4 text-gray-600">
                <p>Some features of our Service may require payment. By using these features, you agree to pay all applicable fees and charges.</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>All fees are non-refundable unless otherwise stated</li>
                  <li>We may change our fees at any time with notice</li>
                  <li>You are responsible for all taxes associated with your use of our Service</li>
                  <li>Payment processing is handled by third-party providers</li>
                </ul>
              </div>
            </section>

            {/* Disclaimers */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Disclaimers</h2>
              <div className="space-y-4 text-gray-600">
                <p>Our Service is provided "as is" and "as available" without any warranties of any kind, either express or implied.</p>
                <p>We do not guarantee:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>The accuracy of property information</li>
                  <li>The availability of listed properties</li>
                  <li>The success of any real estate transaction</li>
                  <li>Uninterrupted access to our Service</li>
                </ul>
              </div>
            </section>

            {/* Platform Liability and Private Dealings */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Platform Liability and Private Dealings</h2>
              <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
                <div className="space-y-4 text-gray-700">
                  <p><strong>Important Disclaimer:</strong></p>
                  <p>
                    Larnacei Global Limited operates as a platform that connects property owners with potential buyers and tenants. We are <strong>NOT responsible or accountable</strong> for any private dealings, negotiations, payments, or transactions that occur directly between users and property owners outside of our official platform.
                  </p>
                  <p>
                    <strong>We are ONLY accountable for transactions and services that are conducted through our official platform and verified processes.</strong>
                  </p>
                  <p>
                    If a customer or any user chooses to deal privately with a property owner, bypassing our platform, we will not be held responsible for:
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Fraudulent activities or misrepresentations</li>
                    <li>Financial losses or damages</li>
                    <li>Property disputes or legal issues</li>
                    <li>Non-delivery of services or properties</li>
                    <li>Any other issues arising from such private dealings</li>
                  </ul>
                  <p>
                    <strong>Property Verification Service:</strong> For your protection, you may contact us directly at <strong>info@larnaceiglobal.com</strong> to confirm the legitimacy of any property listing or verify the authenticity of any person claiming to represent properties on our platform.
                  </p>
                  <p>
                    <strong>Complete Verification & Validation Service:</strong> We offer a comprehensive service where our team handles the entire verification and validation process for your property transaction. This includes property authenticity verification, owner legitimacy confirmation, secure payment processing, and legal documentation support. Look for the "Let us handle the process" option on property listings or contact us directly to arrange this service.
                  </p>
                  <p>
                    We strongly recommend conducting all transactions through our verified platform for your safety and security.
                  </p>
                </div>
              </div>
            </section>

            {/* Limitation of Liability */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Limitation of Liability</h2>
              <p className="text-gray-600">
                In no event shall Larnacei Global Limited be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your use of the Service.
              </p>
            </section>

            {/* Indemnification */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Indemnification</h2>
              <p className="text-gray-600">
                You agree to defend, indemnify, and hold harmless Larnacei Global Limited from and against any claims, damages, obligations, losses, liabilities, costs, or debt arising from your use of the Service or violation of these Terms.
              </p>
            </section>

            {/* Termination */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Termination</h2>
              <div className="space-y-4 text-gray-600">
                <p>We may terminate or suspend your account and access to our Service immediately, without prior notice, for any reason, including breach of these Terms.</p>
                <p>Upon termination, your right to use the Service will cease immediately. All provisions of these Terms which by their nature should survive termination shall survive termination.</p>
              </div>
            </section>

            {/* Governing Law */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Governing Law</h2>
              <p className="text-gray-600">
                These Terms shall be governed by and construed in accordance with the laws of Nigeria, without regard to its conflict of law provisions.
              </p>
            </section>

            {/* Changes to Terms */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">15. Changes to Terms</h2>
              <p className="text-gray-600">
                We reserve the right to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days notice prior to any new terms taking effect.
              </p>
            </section>

            {/* Contact Information */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">16. Contact Information</h2>
              <p className="text-gray-600">
                If you have any questions about these Terms, please contact us at:
              </p>
              <div className="mt-4 space-y-2 text-gray-600">
                <p><strong>Email:</strong> info@larnaceiglobal.com</p>
                <p><strong>Phone:</strong> +234 123 456 7890</p>
                <p><strong>Address:</strong> Amaoba Plaza, No 1 Amaoba Avenue<br />
                Mgbuoba, by Location Flyover<br />
                Port Harcourt, Rivers State<br />
                Nigeria</p>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
} 