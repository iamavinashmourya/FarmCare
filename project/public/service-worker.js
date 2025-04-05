// Service Worker for Push Notifications

// Log any errors that occur during service worker execution
self.addEventListener('error', function(event) {
  console.error('Service Worker error:', event.error);
});

// Handle service worker installation
self.addEventListener('install', function(event) {
  console.log('Service Worker installing...');
  event.waitUntil(
    Promise.resolve()
      .then(() => {
        console.log('Service Worker installed successfully');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('Service Worker installation failed:', error);
      })
  );
});

// Handle service worker activation
self.addEventListener('activate', function(event) {
  console.log('Service Worker activating...');
  event.waitUntil(
    Promise.resolve()
      .then(() => {
        console.log('Service Worker activated successfully');
        return clients.claim();
      })
      .catch(error => {
        console.error('Service Worker activation failed:', error);
      })
  );
});

// Handle push events
self.addEventListener('push', function(event) {
  console.log('Push event received:', event);

  try {
    let notificationData;
    if (event.data) {
      try {
        notificationData = event.data.json();
        console.log('Push data:', notificationData);
      } catch (error) {
        console.error('Error parsing push data:', error);
        notificationData = {
          notification: {
            title: 'New Notification',
            body: event.data.text()
          }
        };
      }
    } else {
      notificationData = {
        notification: {
          title: 'New Notification',
          body: 'You have a new notification'
        }
      };
    }

    const options = {
      body: notificationData.notification.body || 'No message content',
      icon: notificationData.notification.icon || '/favicon.ico',
      badge: notificationData.notification.badge || '/favicon.ico',
      tag: notificationData.notification.tag || 'default',
      data: notificationData.notification.data || {},
      requireInteraction: true,
      timestamp: notificationData.notification.timestamp ? new Date(notificationData.notification.timestamp).getTime() : Date.now()
    };

    event.waitUntil(
      self.registration.showNotification(
        notificationData.notification.title || 'FarmCare Notification',
        options
      ).catch(error => {
        console.error('Error showing notification:', error);
      })
    );
  } catch (error) {
    console.error('Error handling push event:', error);
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', function(event) {
  console.log('Notification clicked:', event);

  try {
    event.notification.close();

    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then(function(clientList) {
          // Try to focus an existing window
          for (const client of clientList) {
            if (client.url.includes('/dashboard') && 'focus' in client) {
              return client.focus();
            }
          }
          // If no existing window, open a new one
          if (clients.openWindow) {
            return clients.openWindow('/dashboard');
          }
        })
        .catch(function(error) {
          console.error('Error handling notification click:', error);
        })
    );
  } catch (error) {
    console.error('Error in notificationclick handler:', error);
  }
}); 