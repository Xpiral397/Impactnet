'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useState, useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { MapPin, Users, Target } from 'lucide-react';

// Dynamically import Globe to avoid SSR issues
const Globe = dynamic(() => import('react-globe.gl'), { ssr: false });

// Nigeria coordinates: Osun and Oyo states
const locations = [
  {
    lat: 7.5629,
    lng: 4.5200,
    name: 'Osun State',
    city: 'Osogbo',
    volunteers: 180,
    projects: 7,
    color: '#16a34a',
    image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=800&h=600&fit=crop'
  },
  {
    lat: 7.3775,
    lng: 3.9470,
    name: 'Oyo State',
    city: 'Ibadan',
    volunteers: 167,
    projects: 5,
    color: '#4ade80',
    image: 'https://images.unsplash.com/photo-1509099863731-ef4bff19e808?q=80&w=800&h=600&fit=crop'
  }
];

// Global donor locations (major cities) -> Nigeria arcs
const donorArcs = [
  { startLat: 40.7128, startLng: -74.0060, endLat: 7.5629, endLng: 4.5200, color: '#16a34a' }, // New York -> Osun
  { startLat: 51.5074, startLng: -0.1278, endLat: 7.5629, endLng: 4.5200, color: '#16a34a' }, // London -> Osun
  { startLat: 34.0522, startLng: -118.2437, endLat: 7.3775, endLng: 3.9470, color: '#4ade80' }, // LA -> Oyo
  { startLat: 35.6762, startLng: 139.6503, endLat: 7.3775, endLng: 3.9470, color: '#4ade80' }, // Tokyo -> Oyo
  { startLat: -33.8688, startLng: 151.2093, endLat: 7.5629, endLng: 4.5200, color: '#16a34a' }, // Sydney -> Osun
];

function GlobeComponent() {
  const globeEl = useRef<any>();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    if (globeEl.current) {
      // Auto-rotate
      globeEl.current.controls().autoRotate = true;
      globeEl.current.controls().autoRotateSpeed = 0.5;

      // Point camera to Nigeria
      globeEl.current.pointOfView({ lat: 7.5, lng: 4.5, altitude: 2.5 }, 1000);
    }
  }, []);

  if (!isClient) {
    return (
      <div className="w-full h-[600px] flex items-center justify-center bg-gradient-to-br from-green-50 to-gray-50 rounded-3xl">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
            <MapPin className="w-12 h-12 text-green-600 animate-pulse" />
          </div>
          <p className="text-gray-600 font-medium">Loading Interactive Globe...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[600px] rounded-3xl overflow-hidden shadow-2xl">
      <Globe
        ref={globeEl}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"

        // Points for locations
        pointsData={locations}
        pointLat="lat"
        pointLng="lng"
        pointColor="color"
        pointAltitude={0.02}
        pointRadius={0.6}
        pointLabel={(d: any) => `
          <div style="background: white; padding: 12px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
            <div style="font-size: 16px; font-weight: bold; color: #000; margin-bottom: 8px;">${d.name}</div>
            <div style="font-size: 14px; color: #666; margin-bottom: 4px;">${d.city}</div>
            <div style="font-size: 14px; color: #666; margin-bottom: 4px;">${d.volunteers} Volunteers</div>
            <div style="font-size: 14px; color: #16a34a; font-weight: 600;">${d.projects} Active Projects</div>
          </div>
        `}

        // Network arcs showing donation flows from global donors
        arcsData={donorArcs}
        arcStartLat="startLat"
        arcStartLng="startLng"
        arcEndLat="endLat"
        arcEndLng="endLng"
        arcColor="color"
        arcStroke={0.5}
        arcDashLength={0.4}
        arcDashGap={0.2}
        arcDashAnimateTime={3000}
        arcAltitude={0.3}
        arcAltitudeAutoScale={0.5}

        // Rings animation at Nigeria locations
        ringsData={locations}
        ringLat="lat"
        ringLng="lng"
        ringColor={() => 'rgba(22, 163, 74, 0.6)'}
        ringMaxRadius={3}
        ringPropagationSpeed={2}
        ringRepeatPeriod={2000}
      />
    </div>
  );
}

export default function GlobalReach() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-24 bg-gradient-to-b from-green-50/30 to-white">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-black mb-4">
            Our Global <span className="text-green-600">Reach</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            See where we're making a difference. Currently serving communities across Nigeria.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Globe */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            <Suspense fallback={
              <div className="w-full h-[600px] flex items-center justify-center bg-gradient-to-br from-green-50 to-gray-50 rounded-3xl">
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                    <MapPin className="w-12 h-12 text-green-600 animate-pulse" />
                  </div>
                  <p className="text-gray-600 font-medium">Loading Interactive Globe...</p>
                </div>
              </div>
            }>
              <GlobeComponent />
            </Suspense>
          </motion.div>

          {/* Location Details */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="space-y-8"
          >
            <div>
              <h3 className="text-3xl font-bold text-black mb-6">Active Locations</h3>
              <p className="text-gray-600 mb-8">
                Our network spans across Nigeria, with dedicated volunteers and impactful projects transforming communities.
              </p>
            </div>

            {locations.map((location, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 20 }}
                animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
                transition={{ duration: 0.6, delay: 0.6 + index * 0.2 }}
                className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-200"
              >
                {/* Location Photo */}
                <div className="relative h-48 w-full overflow-hidden">
                  <img
                    src={location.image}
                    alt={location.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 text-white">
                    <h4 className="text-xl font-bold mb-1">{location.name}</h4>
                    <div className="flex items-center gap-1 text-sm">
                      <MapPin className="w-4 h-4" />
                      {location.city}
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-green-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="w-5 h-5 text-green-600" />
                        <p className="text-sm text-gray-600 font-medium">Volunteers</p>
                      </div>
                      <p className="text-2xl font-bold text-green-600">{location.volunteers}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="w-5 h-5 text-black" />
                        <p className="text-sm text-gray-600 font-medium">Projects</p>
                      </div>
                      <p className="text-2xl font-bold text-black">{location.projects}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            <div className="pt-4">
              <button className="w-full px-8 py-4 bg-green-600 text-white font-semibold rounded-full hover:bg-green-700 transition-colors duration-200">
                Expand to Your Region
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
