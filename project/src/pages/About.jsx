import React from 'react';
import { motion } from 'framer-motion';
import { FaLeaf, FaUsers, FaSeedling, FaHandHoldingHeart } from 'react-icons/fa';
import { Link } from 'react-router-dom';

function About() {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-32">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="text-center mb-16"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">About FarmCare</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Empowering farmers with technology and innovation for a sustainable agricultural future
          </p>
        </motion.div>

        {/* Mission Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-24">
          {[
            {
              icon: <FaLeaf className="h-8 w-8 text-green-500" />,
              title: "Sustainability",
              description: "Promoting eco-friendly farming practices for a better tomorrow"
            },
            {
              icon: <FaUsers className="h-8 w-8 text-green-500" />,
              title: "Community",
              description: "Building a strong network of farmers and agricultural experts"
            },
            {
              icon: <FaSeedling className="h-8 w-8 text-green-500" />,
              title: "Innovation",
              description: "Leveraging technology to revolutionize farming practices"
            },
            {
              icon: <FaHandHoldingHeart className="h-8 w-8 text-green-500" />,
              title: "Support",
              description: "Providing comprehensive assistance to farming communities"
            }
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 text-center group"
            >
              <div className="bg-green-50 rounded-xl p-4 inline-flex items-center justify-center mb-6 group-hover:bg-green-100 transition-colors mx-auto">
                {item.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-gray-600">{item.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Story Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-12 shadow-lg mb-24"
        >
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Our Story</h2>
            <div className="space-y-6 text-lg text-gray-600">
              <p>
                FarmCare was founded with a vision to bridge the gap between traditional farming practices and modern technology. Our journey began with a simple idea: to make farming more efficient, sustainable, and profitable for everyone involved.
              </p>
              <p>
                Today, we're proud to serve thousands of farmers across the country, providing them with tools and insights that help them make better decisions and achieve better yields. Our platform combines weather monitoring, crop health analysis, and access to government schemes all in one place.
              </p>
              <p>
                We believe in the power of technology to transform agriculture, while respecting and preserving traditional farming wisdom. Our team works tirelessly to develop solutions that are both innovative and practical, ensuring that every farmer can benefit from modern agricultural advances.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Join Our Mission</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Be part of the agricultural revolution. Join thousands of farmers who are already benefiting from FarmCare's free innovative solutions.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              to="/register"
              className="bg-green-600 text-white px-8 py-4 rounded-xl hover:bg-green-700 transition-colors font-medium text-lg shadow-md hover:shadow-lg"
            >
              Get Started Now
            </Link>
            <Link
              to="/features"
              className="border-2 border-green-600 text-green-600 px-8 py-4 rounded-xl hover:bg-green-50 transition-colors font-medium text-lg"
            >
              Explore Features
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default About; 