'use client';

import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { MapPin, Play } from 'lucide-react';

const testimonies = [
  {
    id: 1,
    name: 'Adewale Johnson',
    location: 'Osogbo, Osun State',
    testimony: 'The water well project transformed our community. Now, our children have access to clean water every day. We are forever grateful.',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=400&h=400&fit=crop',
    project: 'Clean Water Initiative'
  },
  {
    id: 2,
    name: 'Blessing Okonkwo',
    location: 'Ibadan, Oyo State',
    testimony: 'Through the education program, my three children now attend school. ImpactNet gave us hope when we had none.',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&h=400&fit=crop',
    project: 'Education Support Program'
  },
  {
    id: 3,
    name: 'Pastor Michael Adeyemi',
    location: 'Osun State',
    testimony: 'The fellowship here has grown from 12 members to over 200. The support we received helped us expand our outreach ministry.',
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=400&h=400&fit=crop',
    project: 'Fellowship Growth Initiative'
  }
];

export default function TestimonyCarousel() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % testimonies.length);
    }, 6000);

    return () => clearInterval(timer);
  }, []);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    setCurrentIndex((prev) => {
      if (newDirection === 1) {
        return (prev + 1) % testimonies.length;
      }
      return prev === 0 ? testimonies.length - 1 : prev - 1;
    });
  };

  return (
    <section ref={ref} className="py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-black mb-4">
            Lives <span className="text-green-600">Transformed</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Real stories from real people whose lives have been changed through your generosity
          </p>
        </motion.div>

        {/* Carousel */}
        <div className="relative max-w-4xl mx-auto">
          <div className="relative h-[500px] sm:h-[400px] flex items-center justify-center overflow-hidden">
            <AnimatePresence initial={false} custom={direction}>
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 }
                }}
                className="absolute w-full"
              >
                <div className="bg-white border border-gray-200 rounded-3xl p-8 sm:p-12 shadow-2xl">
                  {/* Project Tag */}
                  <div className="inline-block bg-green-50 text-green-600 text-sm font-semibold px-4 py-2 rounded-full mb-6">
                    {testimonies[currentIndex].project}
                  </div>

                  {/* Testimony Text */}
                  <blockquote className="text-xl sm:text-2xl text-gray-800 font-medium leading-relaxed mb-8 italic">
                    "{testimonies[currentIndex].testimony}"
                  </blockquote>

                  {/* Author Info with Professional Photo */}
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-green-100 shadow-lg">
                      <img
                        src={testimonies[currentIndex].image}
                        alt={testimonies[currentIndex].name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-black">{testimonies[currentIndex].name}</p>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        {testimonies[currentIndex].location}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Buttons */}
          <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 flex justify-between px-4 pointer-events-none">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => paginate(-1)}
              className="w-12 h-12 rounded-full bg-white border-2 border-black text-black shadow-lg hover:bg-black hover:text-white transition-colors duration-200 pointer-events-auto"
            >
              ←
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => paginate(1)}
              className="w-12 h-12 rounded-full bg-white border-2 border-black text-black shadow-lg hover:bg-black hover:text-white transition-colors duration-200 pointer-events-auto"
            >
              →
            </motion.button>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-3 mt-8">
            {testimonies.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setDirection(index > currentIndex ? 1 : -1);
                  setCurrentIndex(index);
                }}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex ? 'w-8 bg-green-600' : 'w-2 bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Video Testimonials CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center mt-12"
        >
          <button className="px-8 py-4 bg-green-600 text-white font-semibold rounded-full hover:bg-green-700 transition-colors duration-200 inline-flex items-center gap-2">
            <Play className="w-5 h-5" />
            Watch Video Testimonials
          </button>
        </motion.div>
      </div>
    </section>
  );
}
