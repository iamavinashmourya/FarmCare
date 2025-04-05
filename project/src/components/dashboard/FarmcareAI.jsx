import React, { useState, useEffect } from 'react';
import { detectPlantDisease } from '../../services/api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const FarmcareAI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [result, setResult] = useState(null);
  const [responseTime, setResponseTime] = useState(null);
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const navigate = useNavigate();

  const faqItems = [
    {
      question: "How does FarmCare AI detect plant diseases and soil conditions?",
      answer: "FarmCare AI uses advanced machine learning algorithms to analyze both plant and soil images. For plants, it analyzes leaf patterns and discoloration to identify diseases. For soil, it examines soil color, texture, and visible characteristics to assess soil health, nutrient content, and potential issues."
    },
    {
      question: "What types of soil analysis can FarmCare AI perform?",
      answer: (
        <>
          Our AI system can analyze several soil characteristics:
          <ul className="list-disc ml-6 mt-2">
            <li>Soil texture and structure assessment</li>
            <li>Basic nutrient deficiency indicators</li>
            <li>Soil moisture level estimation</li>
            <li>Organic matter content indicators</li>
            <li>Common soil problem detection (salinity, erosion, compaction)</li>
            <li>Recommendations for soil improvement</li>
          </ul>
        </>
      )
    },
    {
      question: "What types of plant diseases can it detect?",
      answer: "Our AI system can detect various common plant diseases including fungal infections, bacterial diseases, viral infections, nutrient deficiencies, and pest damage across different crop types."
    },
    {
      question: "How do I take the best photo for analysis?",
      answer: (
        <>
          For best results:
          <ul className="list-disc ml-6 mt-2">
            <li>Plant Disease Analysis:</li>
            <ul className="list-disc ml-6 mt-1">
              <li>Ensure good lighting (natural daylight is best)</li>
              <li>Focus clearly on the affected leaf or plant part</li>
              <li>Include both healthy and affected areas in the image</li>
              <li>Avoid shadows and glare</li>
            </ul>
            <li className="mt-2">Soil Analysis:</li>
            <ul className="list-disc ml-6 mt-1">
              <li>Take photos in natural daylight</li>
              <li>Include a good view of the soil surface</li>
              <li>If possible, include a depth view of the soil</li>
              <li>Avoid extremely wet or dry conditions</li>
              <li>Include a reference object for scale (coin or ruler)</li>
            </ul>
          </ul>
        </>
      )
    },
    {
      question: "How accurate is the detection?",
      answer: "FarmCare AI has a high accuracy rate for both plant disease and soil analysis, but it's recommended to use it as a preliminary diagnostic tool. For critical cases, we recommend consulting with local agricultural experts or soil testing laboratories for confirmation."
    },
    {
      question: "What information is included in the analysis?",
      answer: (
        <>
          Each analysis includes:
          <ul className="list-disc ml-6 mt-2">
            <li>For Plant Diseases:</li>
            <ul className="list-disc ml-6 mt-1">
              <li>Disease identification</li>
              <li>Severity assessment</li>
              <li>Treatment recommendations</li>
              <li>Preventive measures</li>
            </ul>
            <li className="mt-2">For Soil Analysis:</li>
            <ul className="list-disc ml-6 mt-1">
              <li>Soil condition assessment</li>
              <li>Nutrient status indicators</li>
              <li>Improvement recommendations</li>
              <li>Suitable crop suggestions</li>
            </ul>
            <li className="mt-2">Additional Resources:</li>
            <ul className="list-disc ml-6 mt-1">
              <li>Local treatment options</li>
              <li>Expert consultation contacts</li>
              <li>Relevant government schemes</li>
            </ul>
          </ul>
        </>
      )
    },
    {
      question: "Can I use it for multiple crops and soil types?",
      answer: "Yes, FarmCare AI is trained on a wide variety of crops and soil types common in Indian agriculture. It can analyze soil conditions and plant health across different agricultural zones and farming systems."
    },
    {
      question: "Is my data secure?",
      answer: "Yes, all uploaded images and analysis results are securely stored and handled according to strict privacy guidelines. Your data is used only for disease detection, soil analysis, and improving the AI model's accuracy."
    },
    {
      question: "What should I do if the analysis is inconclusive?",
      answer: (
        <>
          If the analysis is inconclusive:
          <ul className="list-disc ml-6 mt-2">
            <li>Try taking another photo with better lighting or clarity</li>
            <li>Include more of the affected area or soil sample in the image</li>
            <li>Contact your local Krishi Vigyan Kendra (KVK) for expert advice</li>
            <li>Consider professional soil testing for detailed analysis</li>
            <li>Use our expert consultation feature for personalized assistance</li>
          </ul>
        </>
      )
    }
  ];

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login to use this feature');
      navigate('/login');
    }
  }, [navigate]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Clear previous results
      setResult(null);
      setError(null);
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        toast.error('Please upload a valid image file (JPEG, PNG, or GIF)');
        return;
      }

      // Clear previous preview URL
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      const fakeEvent = { target: { files: [file] } };
      handleImageChange(fakeEvent);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const formatAnalysisText = (text) => {
    // Remove asterisks and format sections
    const sections = text.split('\n\n').map(section => {
      // Remove asterisks and format section titles
      return section.replace(/\*\s?\*\*([^*]+)\*\*:/g, '$1:')
                   .replace(/\*\*/g, '')
                   .replace(/\*/g, '');
    });
    return sections;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedImage) {
      toast.error('Please select an image first');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setResponseTime(null);

      const formData = new FormData();
      formData.append('file', selectedImage);

      const startTime = Date.now();
      const response = await detectPlantDisease(formData);
      const endTime = Date.now();
      const timeTaken = (endTime - startTime) / 1000; // Convert to seconds
      setResponseTime(timeTaken);
      
      if (response && response.analysis) {
        const formattedSections = formatAnalysisText(response.analysis);
        setResult({
          sections: formattedSections
        });
        toast.success(`Analysis completed in ${timeTaken.toFixed(2)} seconds`);
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (err) {
      console.error('Error analyzing image:', err);
      if (err.message === 'No authentication token found') {
        toast.error('Please login to use this feature');
        navigate('/login');
        return;
      }
      setError(err.message || 'Failed to analyze image. Please try again.');
      toast.error(err.message || 'Failed to analyze image. Please try again.');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto font-poppins">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 font-poppins">FarmCare AI Disease Detection & Gets Solution</h1>
        <p className="text-gray-600 font-poppins">
          Upload a clear image of the affected plant leaf, soil sample or plant part to detect diseases and get AI-powered insights.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 font-poppins">
              Upload Plant Image
            </label>
            <div
              className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:border-green-500 transition-colors"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <div className="space-y-1 text-center">
                {!previewUrl ? (
                  <>
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="flex text-sm text-gray-600 justify-center font-poppins">
                      <label className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500">
                        <span>Upload a file</span>
                        <input
                          type="file"
                          className="sr-only"
                          accept="image/jpeg,image/png,image/gif"
                          onChange={handleImageChange}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500 font-poppins">PNG, JPG, GIF up to 5MB</p>
                  </>
                ) : (
                  <div className="relative">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="max-h-64 rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        URL.revokeObjectURL(previewUrl);
                        setPreviewUrl(null);
                        setSelectedImage(null);
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={!selectedImage || loading}
            className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 font-poppins ${
              (!selectedImage || loading) && 'opacity-50 cursor-not-allowed'
            }`}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="font-poppins">Analyzing...</span>
              </>
            ) : (
              'Analyze Image'
            )}
          </button>
        </form>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700 font-poppins">{error}</p>
            </div>
          </div>
        </div>
      )}

      {result && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 font-poppins">Analysis Results</h2>
          <div className="space-y-6">
            {result.sections.map((section, index) => {
              const lines = section.split('\n');
              const title = lines[0].includes(':') ? lines[0].split(':')[0].trim() : '';
              const content = lines[0].includes(':') ? 
                [lines[0].split(':')[1].trim(), ...lines.slice(1)] : 
                lines;

              return (
                <div key={index} className="space-y-2">
                  {title && (
                    <h3 className="font-semibold text-lg text-gray-900 font-poppins">
                      {title}
                    </h3>
                  )}
                  <div className="pl-4 space-y-2">
                    {content.map((line, lineIndex) => (
                      <p key={lineIndex} className="text-gray-700 leading-relaxed font-poppins font-normal">
                        {line.trim()}
                      </p>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-12 bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-bold mb-6 font-poppins">Frequently Asked Questions</h2>
        <div className="divide-y divide-gray-200">
          {faqItems.map((faq, index) => (
            <div key={index} className="py-4">
              <button
                onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                className="flex justify-between items-center w-full text-left focus:outline-none"
              >
                <h3 className="text-lg font-semibold text-gray-900 font-poppins pr-4">
                  {faq.question}
                </h3>
                <span className="flex-shrink-0">
                  <svg
                    className={`w-5 h-5 text-gray-500 transform transition-transform duration-200 ${
                      openFaqIndex === index ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </span>
              </button>
              {openFaqIndex === index && (
                <div className="mt-4 text-gray-600 font-poppins animate-fadeIn">
                  <div className="prose max-w-none">
                    {faq.answer}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FarmcareAI; 