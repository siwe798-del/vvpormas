(function(){

function swlogger(msg) {
    var debug = true;
    debug ? console.log("%c" + msg, "background-color:#343e48;color:#c3d500;font-size:12px;padding:2px;"): '';
}
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('../service-worker.js')
        .then(function(registration) {
            swlogger('Service worker registered!');
            registration.addEventListener('updatefound', function() {
                swlogger("There are new version of app. you should reload webpage 🎉");
                const newWorker = registration.installing;
                newWorker.addEventListener('statechange', function() {
                    swlogger("sw has changed 🎉");
                });
            });
        }, function(){
            swlogger("sw can't installed :( ");
        });
    });
}

})();
