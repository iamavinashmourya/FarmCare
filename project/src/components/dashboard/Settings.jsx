import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';

const API_BASE_URL = 'http://localhost:5000'; // or whatever your backend port is

const stateRegions = {
  'Andhra Pradesh': ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Kurnool', 'Rajahmundry', 'Tirupati'],
  'Arunachal Pradesh': ['Itanagar', 'Naharlagun', 'Pasighat', 'Tawang', 'Ziro'],
  'Assam': ['Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat', 'Nagaon', 'Tinsukia'],
  'Bihar': ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Darbhanga', 'Purnia'],
  'Chhattisgarh': ['Raipur', 'Bhilai', 'Bilaspur', 'Korba', 'Raigarh', 'Durg'],
  'Goa': ['Panaji', 'Margao', 'Vasco da Gama', 'Mapusa', 'Ponda'],
  'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar'],
  'Haryana': ['Gurugram', 'Faridabad', 'Panipat', 'Ambala', 'Karnal', 'Hisar'],
  'Himachal Pradesh': ['Shimla', 'Manali', 'Dharamshala', 'Kullu', 'Mandi', 'Solan'],
  'Jharkhand': ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro', 'Hazaribagh', 'Deoghar'],
  'Karnataka': ['Bengaluru', 'Mysuru', 'Hubballi', 'Mangaluru', 'Belagavi', 'Kalaburagi'],
  'Kerala': ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur', 'Kollam', 'Palakkad'],
  'Madhya Pradesh': ['Bhopal', 'Indore', 'Jabalpur', 'Gwalior', 'Ujjain', 'Sagar'],
  'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Aurangabad', 'Solapur'],
  'Manipur': ['Imphal', 'Thoubal', 'Kakching', 'Ukhrul', 'Churachandpur'],
  'Meghalaya': ['Shillong', 'Tura', 'Jowai', 'Nongpoh', 'Williamnagar'],
  'Mizoram': ['Aizawl', 'Lunglei', 'Champhai', 'Kolasib', 'Serchhip'],
  'Nagaland': ['Kohima', 'Dimapur', 'Mokokchung', 'Tuensang', 'Wokha'],
  'Odisha': ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Berhampur', 'Sambalpur', 'Puri'],
  'Punjab': ['Chandigarh', 'Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda'],
  'Rajasthan': ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Ajmer', 'Bikaner'],
  'Sikkim': ['Gangtok', 'Namchi', 'Gyalshing', 'Mangan', 'Rangpo'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Salem', 'Tiruchirappalli', 'Tirunelveli'],
  'Telangana': ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Khammam', 'Ramagundam'],
  'Tripura': ['Agartala', 'Udaipur', 'Dharmanagar', 'Kailasahar', 'Belonia'],
  'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Varanasi', 'Agra', 'Prayagraj', 'Meerut'],
  'Uttarakhand': ['Dehradun', 'Haridwar', 'Rishikesh', 'Nainital', 'Mussoorie', 'Haldwani'],
  'West Bengal': ['Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri', 'Darjeeling'],
  'Delhi': ['New Delhi', 'North Delhi', 'South Delhi', 'East Delhi', 'West Delhi'],
  'Jammu and Kashmir': ['Srinagar', 'Jammu', 'Anantnag', 'Baramulla', 'Udhampur', 'Leh'],
  'Ladakh': ['Leh', 'Kargil', 'Diskit', 'Zanskar', 'Nubra'],
  'Puducherry': ['Puducherry', 'Karaikal', 'Mahe', 'Yanam'],
  'Andaman and Nicobar Islands': ['Port Blair', 'Car Nicobar', 'Havelock', 'Diglipur'],
  'Chandigarh': ['Chandigarh'],
  'Dadra and Nagar Haveli and Daman and Diu': ['Daman', 'Diu', 'Silvassa'],
  'Lakshadweep': ['Kavaratti', 'Agatti', 'Amini', 'Andrott']
};

// Function to convert VAPID key from base64 to Uint8Array
const urlBase64ToUint8Array = (base64String) => {
  try {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  } catch (error) {
    console.error('Error converting VAPID key:', error);
    throw new Error('Invalid VAPID key format');
  }
};

const Settings = () => {
  const { user, updateUserProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [userState, setUserState] = useState(() => {
    // Initialize from localStorage or default to empty string
    return localStorage.getItem('userState') || '';
  });
  const [userRegion, setUserRegion] = useState(() => {
    // Initialize from localStorage or default to empty string
    return localStorage.getItem('userRegion') || '';
  });

  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: false,
      sms: false,
    },
    preferences: {
      language: localStorage.getItem('userLanguage') || 'en',
      state: localStorage.getItem('userState') || '',
      region: localStorage.getItem('userRegion') || '',
    },
    privacy: {
      shareLocation: true,
      shareData: false,
    }
  });

  const [pushNotificationSupported, setPushNotificationSupported] = useState(false);

  // Check push notification permission and subscription status
  useEffect(() => {
    const checkPushNotificationStatus = async () => {
      console.log('Checking push notification status...');
      
      // First check if push notifications are supported
      const supported = 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
      console.log('Push notifications supported:', supported);
      setPushNotificationSupported(supported);

      if (supported) {
        try {
          // Check permission status first
          const permission = Notification.permission;
          console.log('Current notification permission:', permission);
          
          if (permission === 'granted') {
            // Register service worker first
            const registration = await navigator.serviceWorker.register('/service-worker.js');
            console.log('Service Worker registered:', registration);

            // Check for existing subscription
            const subscription = await registration.pushManager.getSubscription();
            console.log('Existing subscription:', subscription);

            // Update UI based on subscription status
            setSettings(prev => ({
              ...prev,
              notifications: {
                ...prev.notifications,
                push: !!subscription
              }
            }));
          }
        } catch (error) {
          console.error('Error during push notification setup:', error);
        }
      }
    };

    checkPushNotificationStatus();
  }, []);

  // Fetch user profile data when component mounts
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch('/api/user/profile', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user profile');
        }

        const data = await response.json();
        const userProfile = data.user;

        if (userProfile.state && userProfile.region) {
          // Store in localStorage
          localStorage.setItem('userState', userProfile.state);
          localStorage.setItem('userRegion', userProfile.region);

          // Update state variables
          setUserState(userProfile.state);
          setUserRegion(userProfile.region);

          // Update settings
          setSettings(prev => ({
            ...prev,
            preferences: {
              ...prev.preferences,
              state: userProfile.state,
              region: userProfile.region
            }
          }));
        }

      } catch (error) {
        // If there's an error, try to use localStorage values as fallback
        const savedState = localStorage.getItem('userState');
        const savedRegion = localStorage.getItem('userRegion');
        
        if (savedState && savedRegion) {
          setUserState(savedState);
          setUserRegion(savedRegion);
          setSettings(prev => ({
            ...prev,
            preferences: {
              ...prev.preferences,
              state: savedState,
              region: savedRegion
            }
          }));
        } else {
          toast.error('Failed to load user preferences');
        }
      } finally {
        setInitialLoad(false);
      }
    };

    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  // Fetch notification preferences when component mounts
  useEffect(() => {
    const fetchNotificationPreferences = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/user/notifications/preferences`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Notification preferences:', data);
        
        // Check if we have a service worker registration and subscription
        if ('serviceWorker' in navigator && 'PushManager' in window) {
          const registration = await navigator.serviceWorker.ready;
          const subscription = await registration.pushManager.getSubscription();
          
          // Update push notification state based on both backend preferences and active subscription
          setSettings(prev => ({
            ...prev,
            notifications: {
              ...prev.notifications,
              push: !!subscription && data.preferences.push
            }
          }));
        }
      } catch (error) {
        console.error('Error fetching notification preferences:', error);
        // Don't show error toast here as it might be annoying on initial load
      }
    };

    if (user) {
      fetchNotificationPreferences();
    }
  }, [user]);

  // Handle notification toggle
  const handleNotificationChange = async (type) => {
    if (type === 'push') {
      try {
        if (!settings.notifications.push) {
          // Request permission if not granted
          let permission = Notification.permission;
          if (permission === 'default') {
            permission = await Notification.requestPermission();
          }

          if (permission === 'granted') {
            try {
              // Unregister any existing service workers first
              const registrations = await navigator.serviceWorker.getRegistrations();
              for (let registration of registrations) {
                await registration.unregister();
              }

              // Register new service worker
              const registration = await navigator.serviceWorker.register('/service-worker.js', {
                scope: '/'
              });

              // Wait for the service worker to be ready
              await navigator.serviceWorker.ready;

              // Get VAPID key
              const vapidPublicKey = 'BPnNCALLGqq9f_K4RNkwOWZbzn8GX-xhZXF5T1iKH6PvF6xDvLWUeNhHzKb3OCfrwuBZVxJAAkwwKGpVE5o-Kj4';
              
              // Check if we already have a subscription
              const existingSubscription = await registration.pushManager.getSubscription();
              if (existingSubscription) {
                await existingSubscription.unsubscribe();
              }

              // Create new subscription with proper error handling
              let subscription;
              try {
                subscription = await registration.pushManager.subscribe({
                  userVisibleOnly: true,
                  applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
                });
                console.log('Push notification subscription created:', subscription);
              } catch (subscriptionError) {
                console.error('Subscription error:', subscriptionError);
                throw new Error(`Failed to subscribe: ${subscriptionError.message}`);
              }

              // Send subscription to backend
              const response = await fetch(`${API_BASE_URL}/user/notifications/subscribe`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ subscription })
              });

              if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to save subscription on server');
              }

              // Update UI
              setSettings(prev => ({
                ...prev,
                notifications: {
                  ...prev.notifications,
                  push: true
                }
              }));

              toast.success('Push notifications enabled successfully!');
            } catch (error) {
              console.error('Push notification setup error:', error);
              toast.error(`Failed to enable push notifications: ${error.message}`);
              
              setSettings(prev => ({
                ...prev,
                notifications: {
                  ...prev.notifications,
                  push: false
                }
              }));
            }
          } else {
            toast.error(
              <div>
                <p className="font-medium">Notifications are blocked</p>
                <p className="text-sm">Please enable notifications in your browser settings</p>
                <p className="text-xs mt-1">Look for the lock icon 🔒 in your address bar</p>
              </div>,
              { duration: 5000 }
            );
          }
        } else {
          try {
            // Unsubscribe from push notifications
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();

            if (subscription) {
              await subscription.unsubscribe();

              // Notify backend
              const response = await fetch(`${API_BASE_URL}/user/notifications/unsubscribe`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
              });

              if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to unsubscribe on server');
              }

              setSettings(prev => ({
                ...prev,
                notifications: {
                  ...prev.notifications,
                  push: false
                }
              }));

              toast.success('Push notifications disabled successfully!');
            }
          } catch (error) {
            console.error('Unsubscribe error:', error);
            toast.error(`Failed to disable push notifications: ${error.message}`);
          }
        }
      } catch (error) {
        console.error('Push notification error:', error);
        toast.error('Failed to update notification settings');
      }
    } else {
      setSettings(prev => ({
        ...prev,
        notifications: {
          ...prev.notifications,
          [type]: !prev.notifications[type]
        }
      }));
    }
  };

  const handlePreferenceChange = (type, value) => {
    if (type === 'state') {
      // When state changes, reset region
      setSettings(prev => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          state: value,
          region: '' // Reset region when state changes
        }
      }));
    } else {
      setSettings(prev => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          [type]: value
        }
      }));
    }
  };

  const handlePrivacyChange = (type) => {
    setSettings(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [type]: !prev.privacy[type]
      }
    }));
  };

  const handleSaveChanges = async () => {
    try {
      setLoading(true);
      
      // Track all changes
      const changes = [];
      
      // Validate state and region before saving
      if (!settings.preferences.state || !settings.preferences.region) {
        toast.error('Please select both state and city');
        return;
      }

      // Validate if selected region belongs to selected state
      if (!stateRegions[settings.preferences.state]?.includes(settings.preferences.region)) {
        toast.error('Selected city does not belong to the selected state');
        return;
      }

      // Check what has changed
      const hasStateChanged = settings.preferences.state !== userState;
      const hasRegionChanged = settings.preferences.region !== userRegion;
      const hasLanguageChanged = settings.preferences.language !== localStorage.getItem('userLanguage');

      // Only update if there are changes
      if (!hasStateChanged && !hasRegionChanged && !hasLanguageChanged) {
        toast.info('No changes detected to update', {
          icon: '📝',
          duration: 3000
        });
        setLoading(false);
        return;
      }

      // Prepare the update data
      const updateData = {
        state: settings.preferences.state,
        region: settings.preferences.region
      };

      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update settings');
      }

      const data = await response.json();

      // Update localStorage with new values
      localStorage.setItem('userState', settings.preferences.state);
      localStorage.setItem('userRegion', settings.preferences.region);
      if (hasLanguageChanged) {
        localStorage.setItem('userLanguage', settings.preferences.language);
      }
      
      // Update the user context and stored values
      updateUserProfile(data.user);
      setUserState(settings.preferences.state);
      setUserRegion(settings.preferences.region);

      // Show success toast with changes
      if (hasStateChanged || hasRegionChanged) {
        toast.success('Profile updated successfully', {
          duration: 3000,
          style: {
            background: '#22c55e',
            color: '#fff',
            padding: '16px',
            borderRadius: '8px',
          },
          icon: '✓',
        });
      }

    } catch (error) {
      toast.error(
        <div>
          <p className="font-medium">Failed to update settings</p>
          <p className="text-sm">Please try again later</p>
        </div>,
        {
          icon: '❌',
          duration: 4000
        }
      );
    } finally {
      setLoading(false);
    }
  };

  // Get the list of regions for the current state
  const currentRegions = settings.preferences.state ? (stateRegions[settings.preferences.state] || []) : [];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Settings</h1>

      {initialLoad ? (
        <div className="flex justify-center items-center h-64">
          <svg className="animate-spin h-8 w-8 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : (
        <>
          {/* Notifications Section */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Notifications</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Email Notifications</h3>
                  <p className="text-sm text-gray-500">Receive updates via email</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.notifications.email}
                    onChange={() => handleNotificationChange('email')}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Push Notifications</h3>
                  <p className="text-sm text-gray-500">Receive push notifications</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.notifications.push}
                    onChange={() => handleNotificationChange('push')}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">SMS Notifications</h3>
                  <p className="text-sm text-gray-500">Receive updates via SMS</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.notifications.sms}
                    onChange={() => handleNotificationChange('sms')}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Preferences Section */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Preferences</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                <select
                  value={settings.preferences.language}
                  onChange={(e) => handlePreferenceChange('language', e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
                >
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                  <option value="mr">Marathi</option>
                  <option value="gu">Gujarati</option>
                  <option value="bn">Bengali</option>
                  <option value="te">Telugu</option>
                  <option value="ta">Tamil</option>
                  <option value="kn">Kannada</option>
                  <option value="ml">Malayalam</option>
                  <option value="pa">Punjabi</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State
                  <span className="text-sm text-gray-500 ml-2">
                    (Current: {userState})
                  </span>
                </label>
                <select
                  value={settings.preferences.state}
                  onChange={(e) => handlePreferenceChange('state', e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
                >
                  <option value="">{userState || 'Select State'}</option>
                  {Object.keys(stateRegions).sort().map((state) => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                  <span className="text-sm text-gray-500 ml-2">
                    (Current: {userRegion})
                  </span>
                </label>
                <select
                  value={settings.preferences.region}
                  onChange={(e) => handlePreferenceChange('region', e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
                  disabled={!settings.preferences.state}
                >
                  <option value="">{userRegion || 'Select City'}</option>
                  {currentRegions.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Privacy Section */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Privacy</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Share Location</h3>
                  <p className="text-sm text-gray-500">Allow app to access your location</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.privacy.shareLocation}
                    onChange={() => handlePrivacyChange('shareLocation')}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Share Usage Data</h3>
                  <p className="text-sm text-gray-500">Help improve the app by sharing usage data</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.privacy.shareData}
                    onChange={() => handlePrivacyChange('shareData')}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button 
              onClick={handleSaveChanges}
              disabled={loading || (!settings.preferences.state && !settings.preferences.region)}
              className={`${
                loading || (!settings.preferences.state && !settings.preferences.region)
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-green-500 hover:bg-green-600'
              } text-white px-6 py-2 rounded-lg transition-colors flex items-center`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Settings; 