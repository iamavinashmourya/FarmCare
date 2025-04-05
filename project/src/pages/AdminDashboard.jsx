import React, { useState } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { marketPrices, schemes } from '../services/api';

function AdminDashboard() {
  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold mb-8">Admin Dashboard</h2>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">Market Prices Management</h3>
          <PriceForm />
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">Schemes Management</h3>
          <SchemeForm />
        </div>
      </div>
    </div>
  );
}

function PriceForm() {
  const [formData, setFormData] = useState({
    crop_name: '',
    price: '',
    state: '',
    region: '',
    date_effective: '',
    image: null,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await marketPrices.addPrice(formData);
      toast.success('Price added successfully');
      setFormData({
        crop_name: '',
        price: '',
        state: '',
        region: '',
        date_effective: '',
        image: null,
      });
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to add price');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <input
          type="text"
          className="input-field"
          placeholder="Crop Name"
          value={formData.crop_name}
          onChange={(e) => setFormData({ ...formData, crop_name: e.target.value })}
          required
        />
        <input
          type="number"
          className="input-field"
          placeholder="Price"
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
          required
        />
        <input
          type="text"
          className="input-field"
          placeholder="State"
          value={formData.state}
          onChange={(e) => setFormData({ ...formData, state: e.target.value })}
          required
        />
        <input
          type="text"
          className="input-field"
          placeholder="Region"
          value={formData.region}
          onChange={(e) => setFormData({ ...formData, region: e.target.value })}
          required
        />
        <input
          type="date"
          className="input-field"
          value={formData.date_effective}
          onChange={(e) => setFormData({ ...formData, date_effective: e.target.value })}
          required
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })}
        />
        <button type="submit" className="btn-primary w-full">
          Add Price
        </button>
      </div>
    </form>
  );
}

function SchemeForm() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    eligibility: '',
    benefits: '',
    state: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await schemes.addScheme(formData);
      toast.success('Scheme added successfully');
      setFormData({
        name: '',
        description: '',
        eligibility: '',
        benefits: '',
        state: '',
      });
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to add scheme');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <input
          type="text"
          className="input-field"
          placeholder="Scheme Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
        <textarea
          className="input-field"
          placeholder="Description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          required
        />
        <textarea
          className="input-field"
          placeholder="Eligibility"
          value={formData.eligibility}
          onChange={(e) => setFormData({ ...formData, eligibility: e.target.value })}
          required
        />
        <textarea
          className="input-field"
          placeholder="Benefits"
          value={formData.benefits}
          onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
          required
        />
        <input
          type="text"
          className="input-field"
          placeholder="State"
          value={formData.state}
          onChange={(e) => setFormData({ ...formData, state: e.target.value })}
          required
        />
        <button type="submit" className="btn-primary w-full">
          Add Scheme
        </button>
      </div>
    </form>
  );
}

export default AdminDashboard;