import Link from 'next/link';

export default function CTASection() {
  return (
    <section className="cta-gradient text-white py-16">
      <div className="container mx-auto px-4 text-center">
        <h2 className="heading-font text-3xl md:text-4xl font-bold mb-4">
          Ready to List Your Property?
        </h2>
        <p className="text-lg mb-8">
          Join thousands of property owners earning with Larnacei. Reach a wide audience of buyers and renters.
        </p>
        <div className="space-x-0 space-y-4 md:space-y-0 md:space-x-4">
          <Link href="/list-property" className="btn btn-white-bg">
            List Property
          </Link>
          <Link href="/faq" className="btn btn-outline-white">
            Learn More
          </Link>
        </div>
      </div>
    </section>
  );
} 