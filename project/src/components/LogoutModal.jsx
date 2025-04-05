import React from 'react';
import { FiLogOut } from 'react-icons/fi';
import { useTranslation } from '../hooks/useTranslation';

const LogoutModal = ({ isOpen, onCancel, onConfirm }) => {
  const { t } = useTranslation();
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity"
        onClick={onCancel}
      ></div>

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 transform transition-all">
        <div className="p-6">
          {/* Icon */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
            <FiLogOut className="h-8 w-8 text-green-600" />
          </div>

          {/* Content */}
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {t('logout')}
            </h3>
            <p className="text-gray-500 mb-6">
              {t('logoutConfirmation')}
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition-colors"
              onClick={onCancel}
            >
              {t('cancel')}
            </button>
            <button
              type="button"
              className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
              onClick={onConfirm}
            >
              {t('confirm')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal; 