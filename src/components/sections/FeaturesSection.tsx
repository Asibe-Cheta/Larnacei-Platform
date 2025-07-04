const features = [
  {
    id: 'verified',
    icon: 'verified_user',
    title: 'Verified Properties',
    description: 'Each listing is carefully vetted to ensure quality and authenticity, giving you peace of mind.'
  },
  {
    id: 'secure',
    icon: 'lock',
    title: 'Secure Transactions',
    description: 'We prioritize your safety with secure payment gateways and transparent processes for all transactions.'
  },
  {
    id: 'support',
    icon: 'support_agent',
    title: 'Expert Support',
    description: 'Our dedicated support team is always ready to assist you with any inquiries or guidance you may need.'
  }
];

export default function FeaturesSection() {
  return (
    <section className="py-16 bg-gray-100">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {features.map((feature) => (
            <div key={feature.id} className="p-6">
              <span className="material-icons text-5xl primary-text mb-4">
                {feature.icon}
              </span>
              <h4 className="text-xl font-semibold mb-2 heading-font">
                {feature.title}
              </h4>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 