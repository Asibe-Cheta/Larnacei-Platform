import Link from 'next/link';
import Image from 'next/image';

const categories = [
  {
    id: 'short-stays',
    title: 'Perfect Getaways',
    description: 'Discover unique vacation rentals, holiday homes, and serviced apartments for your next trip. Enjoy comfort, convenience, and memorable experiences.',
    image: '/images/hs5.jpg',
    ctaText: 'Explore Stays',
    ctaLink: '/short-stays',
    reverse: false
  },
  {
    id: 'rentals',
    title: 'Your Next Home',
    description: 'Find long-term residential leases, apartments, and houses for rent. Secure your ideal living space with ease and confidence.',
    image: '/images/hs4.jpg',
    ctaText: 'Find Rentals',
    ctaLink: '/rentals',
    reverse: true
  },
  {
    id: 'land-sales',
    title: 'Prime Land Investments',
    description: 'Explore plots of land for sale, agricultural land, and development sites. Invest in the future with our curated land offerings.',
    image: '/images/hs1.jpg',
    ctaText: 'Browse Land',
    ctaLink: '/land-sales',
    reverse: false
  },
  {
    id: 'property-sales',
    title: 'Dream Home Ownership',
    description: 'Achieve your homeownership goals with our diverse range of houses, apartments, and commercial properties for sale.',
    image: '/images/hs6.jpg',
    ctaText: 'Buy Properties',
    ctaLink: '/property-sales',
    reverse: true
  }
];

export default function CategoryShowcase() {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        {categories.map((category, index) => (
          <div
            key={category.id}
            className={`flex flex-col md:flex-row items-center mb-16 gap-8 ${
              index === categories.length - 1 ? 'mb-0' : ''
            }`}
          >
            <div className={`md:w-1/2 ${category.reverse ? 'md:order-2' : ''}`}>
              <Image
                src={category.image}
                alt={category.title}
                width={600}
                height={400}
                className="rounded-lg shadow-lg w-full aspect-video object-cover"
              />
            </div>
            
            <div className={`md:w-1/2 text-center md:text-left ${
              category.reverse ? 'md:pr-12' : 'md:pl-12'
            }`}>
              <h3 className="heading-font text-3xl font-bold mb-4 primary-text">
                {category.title}
              </h3>
              <p className="text-gray-600 mb-6">
                {category.description}
              </p>
              <Link href={category.ctaLink} className="btn btn-primary">
                {category.ctaText}
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
} 