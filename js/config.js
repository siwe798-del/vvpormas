(function() {
  'use strict';

  angular.module('config', [])
  .constant('APP',{
    name: 'Omnisuite',
    app: 'omnisuite',
    images: 'assets/images/',
    lazyConfig: function(lazyLoadObj) {
        lazyLoadObj['cache'] = false; //if ['cache'] === false (appending timestamp in script) in lazyLoad request.
        return lazyLoadObj;
    }
  });
})();
