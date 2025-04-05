import React from 'react';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Link } from 'react-router-dom';
import { FaArrowRight } from 'react-icons/fa';

const SchemeCarousel = ({ schemes }) => {
  const sliderSettings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: true,
    adaptiveHeight: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        }
      }
    ]
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-semibold">Government Schemes</h2>
        <Link 
          to="/schemes" 
          className="text-green-600 hover:text-green-700 font-medium flex items-center gap-2 transition-colors duration-150 ease-in-out"
        >
          View All
          <FaArrowRight className="text-sm" />
        </Link>
      </div>
      {schemes.length > 0 ? (
        <div className="scheme-carousel relative max-w-5xl mx-auto">
          <Slider {...sliderSettings}>
            {schemes.map((scheme, index) => (
              <div key={index} className="outline-none">
                <div className="px-4 pb-2">
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6">
                    <div className="mb-3">
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">{scheme.name}</h3>
                      <div className="h-1 w-20 bg-green-500 rounded"></div>
                    </div>
                    <p className="text-gray-600 text-sm mb-4">{scheme.description}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="bg-white bg-opacity-60 rounded p-3">
                        <span className="text-sm font-semibold text-gray-700 block mb-1">Eligibility</span>
                        <p className="text-sm text-gray-600">{scheme.eligibility}</p>
                      </div>
                      <div className="bg-white bg-opacity-60 rounded p-3">
                        <span className="text-sm font-semibold text-gray-700 block mb-1">Benefits</span>
                        <p className="text-sm text-gray-600">{scheme.benefits}</p>
                      </div>
                      <div className="bg-white bg-opacity-60 rounded p-3 md:col-span-2">
                        <span className="text-sm font-semibold text-gray-700 block mb-1">State</span>
                        <p className="text-sm text-gray-600">{scheme.state}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        </div>
      ) : (
        <div className="text-center py-4">
          <p className="text-gray-500">No government schemes available at the moment.</p>
        </div>
      )}

      <style jsx>{`
        .scheme-carousel :global(.slick-track) {
          display: flex !important;
        }
        .scheme-carousel :global(.slick-slide) {
          height: auto !important;
        }
        .scheme-carousel :global(.slick-slide > div) {
          height: 100%;
        }
        .scheme-carousel :global(.slick-list) {
          overflow: visible;
        }
        .scheme-carousel :global(.slick-prev),
        .scheme-carousel :global(.slick-next) {
          background: #ffffff !important;
          width: 32px !important;
          height: 32px !important;
          border-radius: 50% !important;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
          z-index: 1 !important;
        }
        .scheme-carousel :global(.slick-prev) {
          left: -16px !important;
        }
        .scheme-carousel :global(.slick-next) {
          right: -16px !important;
        }
        .scheme-carousel :global(.slick-prev:before),
        .scheme-carousel :global(.slick-next:before) {
          color: #22c55e !important;
          font-size: 20px !important;
        }
      `}</style>
    </div>
  );
};

export default SchemeCarousel; 