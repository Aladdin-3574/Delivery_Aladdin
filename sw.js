self.addEventListener('install', function(event) {
    event.waitUntil(
    caches.open('sw-cachhe').then(function(cache) {
        return cache.addAll('index.html');
    })
);
});