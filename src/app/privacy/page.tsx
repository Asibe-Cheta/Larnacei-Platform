import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Privacy Policy
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            How we collect, use, and protect your personal information.
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
                Larnacei Global Limited ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services.
              </p>
              <p className="text-gray-600">
                By using our Service, you consent to the data practices described in this policy. If you do not agree with our policies and practices, please do not use our Service.
              </p>
            </section>

            {/* Information We Collect */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Information We Collect</h2>
              <div className="space-y-4 text-gray-600">
                <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                <p>We may collect the following personal information:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Name and contact information (email, phone number)</li>
                  <li>Account credentials and profile information</li>
                  <li>Property preferences and search history</li>
                  <li>Communication preferences</li>
                  <li>Payment information (processed securely by third-party providers)</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-900 mt-6">Automatically Collected Information</h3>
                <p>We automatically collect certain information when you use our Service:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Device information (IP address, browser type, operating system)</li>
                  <li>Usage data (pages visited, time spent, links clicked)</li>
                  <li>Location data (with your consent)</li>
                  <li>Cookies and similar tracking technologies</li>
                </ul>
              </div>
            </section>

            {/* How We Use Information */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How We Use Your Information</h2>
              <div className="space-y-4 text-gray-600">
                <p>We use the information we collect to:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Provide and maintain our Service</li>
                  <li>Process and manage your account</li>
                  <li>Connect you with property owners and buyers</li>
                  <li>Send you relevant property listings and updates</li>
                  <li>Process payments and transactions</li>
                  <li>Improve our Service and user experience</li>
                  <li>Communicate with you about our services</li>
                  <li>Comply with legal obligations</li>
                  <li>Prevent fraud and ensure security</li>
                </ul>
              </div>
            </section>

            {/* Information Sharing */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Information Sharing and Disclosure</h2>
              <div className="space-y-4 text-gray-600">
                <p>We do not sell, trade, or rent your personal information to third parties. We may share your information in the following circumstances:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li><strong>With your consent:</strong> When you explicitly agree to share your information</li>
                  <li><strong>Service providers:</strong> With trusted third parties who help us operate our Service</li>
                  <li><strong>Property owners:</strong> To facilitate communication between users and property owners</li>
                  <li><strong>Legal requirements:</strong> When required by law or to protect our rights</li>
                  <li><strong>Business transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                </ul>
              </div>
            </section>

            {/* Data Security */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Data Security</h2>
              <div className="space-y-4 text-gray-600">
                <p>We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>
                <p>Our security measures include:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Encryption of data in transit and at rest</li>
                  <li>Regular security assessments and updates</li>
                  <li>Access controls and authentication</li>
                  <li>Secure payment processing</li>
                  <li>Employee training on data protection</li>
                </ul>
                <p>However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.</p>
              </div>
            </section>

            {/* Cookies and Tracking */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Cookies and Tracking Technologies</h2>
              <div className="space-y-4 text-gray-600">
                <p>We use cookies and similar tracking technologies to enhance your experience on our Service. These technologies help us:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Remember your preferences and settings</li>
                  <li>Analyze how our Service is used</li>
                  <li>Provide personalized content and advertisements</li>
                  <li>Improve our Service performance</li>
                </ul>
                <p>You can control cookie settings through your browser preferences, though disabling cookies may affect Service functionality.</p>
              </div>
            </section>

            {/* Third-Party Services */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Third-Party Services</h2>
              <div className="space-y-4 text-gray-600">
                <p>Our Service may contain links to third-party websites or integrate with third-party services. We are not responsible for the privacy practices of these third parties.</p>
                <p>Common third-party services we use include:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Payment processors (Paystack, etc.)</li>
                  <li>Analytics services (Google Analytics)</li>
                  <li>Email service providers</li>
                  <li>Cloud hosting services</li>
                </ul>
                <p>Please review the privacy policies of these third-party services for more information.</p>
              </div>
            </section>

            {/* Data Retention */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Data Retention</h2>
              <p className="text-gray-600">
                We retain your personal information for as long as necessary to provide our Service and fulfill the purposes outlined in this Privacy Policy. We may retain certain information for longer periods to comply with legal obligations, resolve disputes, and enforce our agreements.
              </p>
            </section>

            {/* Your Rights */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Your Rights and Choices</h2>
              <div className="space-y-4 text-gray-600">
                <p>You have the following rights regarding your personal information:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li><strong>Access:</strong> Request a copy of your personal information</li>
                  <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                  <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                  <li><strong>Portability:</strong> Request transfer of your data to another service</li>
                  <li><strong>Objection:</strong> Object to certain processing of your data</li>
                  <li><strong>Withdrawal:</strong> Withdraw consent for data processing</li>
                </ul>
                <p>To exercise these rights, please contact us using the information provided below.</p>
              </div>
            </section>

            {/* Children's Privacy */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Children's Privacy</h2>
              <p className="text-gray-600">
                Our Service is not intended for children under the age of 18. We do not knowingly collect personal information from children under 18. If you believe we have collected information from a child under 18, please contact us immediately.
              </p>
            </section>

            {/* International Transfers */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. International Data Transfers</h2>
              <p className="text-gray-600">
                Your information may be transferred to and processed in countries other than your own. We ensure that such transfers comply with applicable data protection laws and implement appropriate safeguards to protect your information.
              </p>
            </section>

            {/* Changes to Policy */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Changes to This Privacy Policy</h2>
              <p className="text-gray-600">
                We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the "Last updated" date. We encourage you to review this Privacy Policy periodically.
              </p>
            </section>

            {/* Contact Information */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Contact Us</h2>
              <p className="text-gray-600 mb-4">
                If you have any questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="space-y-2 text-gray-600">
                <p><strong>Email:</strong> info@larnaceiglobal.com</p>
                <p><strong>Phone:</strong> +234 123 456 7890</p>
                <p><strong>Address:</strong> Amaoba Plaza, No 1 Amaoba Avenue<br />
                Mgbuoba, by Location Flyover<br />
                Port Harcourt, Rivers State<br />
                Nigeria</p>
                <p><strong>Data Protection Officer:</strong> info@larnaceiglobal.com</p>
              </div>
            </section>

            {/* Platform Liability Disclaimer */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Platform Liability and Property Verification</h2>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                <div className="space-y-4 text-gray-700">
                  <p><strong>Important Disclaimer:</strong></p>
                  <p>
                    Larnacei Global Limited serves as a platform to connect property owners with potential buyers and tenants. We are <strong>not responsible or accountable</strong> for any private dealings, negotiations, or transactions that occur directly between users and property owners outside of our platform.
                  </p>
                  <p>
                    We are only accountable for transactions and services that are conducted through our official platform and processes. For your safety and protection, we strongly recommend:
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Conducting all transactions through our platform</li>
                    <li>Verifying property legitimacy by contacting us directly</li>
                    <li>Using our official communication channels</li>
                    <li>Following our recommended verification procedures</li>
                  </ul>
                  <p>
                    <strong>Property Verification Service:</strong> Before engaging in any property transaction, we encourage you to contact us directly at <strong>info@larnaceiglobal.com</strong> to confirm the legitimacy of any property listing or verify the authenticity of property owners claiming to represent properties on our platform.
                  </p>
                  <p>
                    <strong>Full Service Option:</strong> For maximum security and peace of mind, you can request our complete verification and validation service. Look for the "Let us handle the process" button on any property listing, or contact us directly to have our team manage the entire transaction process from verification to completion.
                  </p>
                  <p>
                    We cannot guarantee the accuracy, completeness, or legitimacy of properties or users outside of our verified processes.
                  </p>
                </div>
              </div>
            </section>

            {/* Complaints */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">15. Complaints</h2>
              <p className="text-gray-600">
                If you have concerns about our data practices, you may file a complaint with the relevant data protection authority in your jurisdiction. We will work with you to resolve any issues before you escalate to the authorities.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
} 