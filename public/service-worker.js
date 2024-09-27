const CACHE_NAME = 'my-cache-v1';
const CACHE_FILES = [
  '/',
  'index.html',
  'upload.html',
  'manifest.json',
  'styles.css',
  'app.js',
  'upload.js',
  '404.html',
];

self.addEventListener('install', (event) => {
    event.waitUntil(
      caches.open(CACHE_NAME)
        .then((cache) => {
          return Promise.all(
            CACHE_FILES.map((url) => {
              return fetch(url)
                .then((response) => {
                  if (!response.ok) {
                    throw new Error(`Failed to fetch: ${url}`);
                  }
                  return cache.put(url, response);
                })
                .catch((error) => {
                  console.error(`Error caching ${url}:`, error);
                });
            })
          );
        })
        .then(() => {
          console.log('Service Worker installation successful');
        })
        .catch((error) => {
          console.error('Service Worker installation failed:', error);
        })
    );
  });

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((key) => key !== CACHE_NAME)
        .map((key) => caches.delete(key))
    ))
  );
});

self.addEventListener('fetch', (event) => {
    if (event.request.method === 'POST') {
        return;
    }
    else {
        if (event.request.url.includes('/data/')) {
            event.respondWith(
                fetch(event.request)
                  .catch(() => {
                    return caches.match('404.html');
                  })
              );
          } else {
            event.respondWith(
                fetch(event.request)
                  .then((response) => {
                    if (response.status === 404) {
                        return caches.match("404.html");
                    }
                    if (response.ok) {
                        if (response.status === 206) {}
                        else {
                            if (event.request.method === 'POST') {
                                return;
                            }
                            else {}
                            const clonedResponse = response.clone();
                            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clonedResponse));
                        }
                        
                      }
              
                    return response;
                  })
                  .catch(() => {
                    return caches.match(event.request);
                  })
              );
          }
    }
    
  
});
