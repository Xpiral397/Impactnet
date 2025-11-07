'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import { Play, Quote, Heart } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: 'Adewale Johnson',
    location: 'Osogbo, Osun State',
    role: 'Water Project Beneficiary',
    videoThumb: '/images/testimonials/adewale.jpg',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    quote: 'The water well changed everything for our community. Our children no longer walk 5km for clean water.',
    fallbackImage: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=2070'
  },
  {
    id: 2,
    name: 'Blessing Okonkwo',
    location: 'Ibadan, Oyo State',
    role: 'Education Sponsor Recipient',
    videoThumb: '/images/testimonials/blessing.jpg',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    quote: 'Thanks to ImpactNet sponsors, all three of my children are now in school. This is a dream come true.',
    fallbackImage: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=2070'
  },
  {
    id: 3,
    name: 'Pastor Michael Adeyemi',
    location: 'Osun State',
    role: 'Community Leader',
    videoThumb: '/images/testimonials/pastor.jpg',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    quote: 'Our fellowship grew from 12 to over 200 members. The transparency of ImpactNet builds real trust.',
    fallbackImage: 'https://images.unsplash.com/photo-1509099863731-ef4bff19e808?q=80&w=2070'
  }
];

export default function VideoTestimonials() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [activeVideo, setActiveVideo] = useState<number | null>(null);

  return (
    <section ref={ref} className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-black mb-4">
            Stories of <span className="text-green-600">Impact</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Hear directly from the people whose lives have been transformed through your generosity
          </p>
        </motion.div>

        {/* Video Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="group"
            >
              {/* Video Container */}
              <div className="relative mb-6 rounded-2xl overflow-hidden shadow-lg aspect-video bg-gray-100">
                {activeVideo === testimonial.id ? (
                  <iframe
                    className="w-full h-full"
                    src={testimonial.videoUrl}
                    title={`${testimonial.name} testimonial`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <>
                    <img
                      src={testimonial.videoThumb}
                      alt={testimonial.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = testimonial.fallbackImage;
                      }}
                    />
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors duration-300" />
                    <button
                      onClick={() => setActiveVideo(testimonial.id)}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
                        <Play className="w-8 h-8 text-green-600 ml-1" />
                      </div>
                    </button>
                  </>
                )}
              </div>

              {/* Testimonial Content */}
              <div className="space-y-3">
                <p className="text-gray-700 leading-relaxed">
                  "{testimonial.quote}"
                </p>
                <div>
                  <p className="font-bold text-black">{testimonial.name}</p>
                  <p className="text-sm text-gray-600">{testimonial.location}</p>
                  <p className="text-xs text-green-600 font-medium">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center bg-green-50 rounded-3xl p-12 border border-green-200"
        >
          <Heart className="w-12 h-12 text-green-600 mx-auto mb-4" />
          <h3 className="text-3xl font-bold text-black mb-2">Join 5,842 Lives Transformed</h3>
          <p className="text-gray-600 text-lg mb-6">Your donation can be the next success story</p>
          <button className="px-8 py-4 bg-green-600 text-white font-semibold rounded-full hover:bg-green-700 transition-colors duration-200">
            Make a Difference Today
          </button>
        </motion.div>
      </div>
    </section>
  );
}
