import React, { useEffect } from 'react';
import { FaCheck, FaTimes } from 'react-icons/fa';

const PasswordRules = ({ password, show, onAllRulesMet }) => {
  // Password validation rules
  const rules = [
    {
      id: 'length',
      text: 'At least 6 characters',
      valid: password.length >= 6
    },
    {
      id: 'uppercase',
      text: 'At least one uppercase letter',
      valid: /[A-Z]/.test(password)
    },
    {
      id: 'lowercase',
      text: 'At least one lowercase letter',
      valid: /[a-z]/.test(password)
    },
    {
      id: 'number',
      text: 'At least one number',
      valid: /\d/.test(password)
    },
    {
      id: 'special',
      text: 'At least one special character',
      valid: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    }
  ];

  // Check if all rules are met
  useEffect(() => {
    const allRulesMet = rules.every(rule => rule.valid);
    if (allRulesMet) {
      onAllRulesMet();
    }
  }, [password, onAllRulesMet]);

  if (!show) return null;

  return (
    <div className="absolute mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50">
      <h4 className="text-sm font-medium text-gray-700 mb-2">Password must contain:</h4>
      <ul className="space-y-2">
        {rules.map(rule => (
          <li 
            key={rule.id}
            className={`flex items-center text-sm ${
              rule.valid ? 'text-green-600' : 'text-gray-500'
            }`}
          >
            {rule.valid ? (
              <FaCheck className="w-4 h-4 mr-2 text-green-500" />
            ) : (
              <FaTimes className="w-4 h-4 mr-2 text-gray-400" />
            )}
            {rule.text}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PasswordRules; 
import { FaCheck, FaTimes } from 'react-icons/fa';

const PasswordRules = ({ password, show, onAllRulesMet }) => {
  // Password validation rules
  const rules = [
    {
      id: 'length',
      text: 'At least 6 characters',
      valid: password.length >= 6
    },
    {
      id: 'uppercase',
      text: 'At least one uppercase letter',
      valid: /[A-Z]/.test(password)
    },
    {
      id: 'lowercase',
      text: 'At least one lowercase letter',
      valid: /[a-z]/.test(password)
    },
    {
      id: 'number',
      text: 'At least one number',
      valid: /\d/.test(password)
    },
    {
      id: 'special',
      text: 'At least one special character',
      valid: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    }
  ];

  // Check if all rules are met
  useEffect(() => {
    const allRulesMet = rules.every(rule => rule.valid);
    if (allRulesMet) {
      onAllRulesMet();
    }
  }, [password, onAllRulesMet]);

  if (!show) return null;

  return (
    <div className="absolute mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50">
      <h4 className="text-sm font-medium text-gray-700 mb-2">Password must contain:</h4>
      <ul className="space-y-2">
        {rules.map(rule => (
          <li 
            key={rule.id}
            className={`flex items-center text-sm ${
              rule.valid ? 'text-green-600' : 'text-gray-500'
            }`}
          >
            {rule.valid ? (
              <FaCheck className="w-4 h-4 mr-2 text-green-500" />
            ) : (
              <FaTimes className="w-4 h-4 mr-2 text-gray-400" />
            )}
            {rule.text}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PasswordRules; 