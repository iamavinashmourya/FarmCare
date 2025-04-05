import React, { useState } from 'react';
import { diseaseDetection } from '../services/api';
import { toast } from 'react-toastify';

function DiseaseDetection() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      setAnalysis(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error('Please select an image first');
      return;
    }

    setLoading(true);
    try {
      const result = await diseaseDetection.uploadImage(selectedFile);
      setAnalysis(result.analysis);
      toast.success('Analysis completed successfully');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-8">Plant Disease Detection</h2>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">
              Upload Plant Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full"
            />
          </div>
          {preview && (
            <div className="mb-4">
              <img
                src={preview}
                alt="Preview"
                className="max-w-full h-auto rounded-lg"
              />
            </div>
          )}
          <button
            type="submit"
            className="btn-primary w-full"
            disabled={!selectedFile || loading}
          >
            {loading ? 'Analyzing...' : 'Analyze Image'}
          </button>
        </form>
        {analysis && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">Analysis Results</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{analysis}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default DiseaseDetection;