(function () {

  angular.module('app.module.core')
    .service('RSABufferService', RSABufferServiceFunction);
    RSABufferServiceFunction.$inject = ['$log'];

    function RSABufferServiceFunction($log) {
      /* Private */
      var rsaBuffer = [];

      /* Public */
      // Set buffer
      function set(transaction, itsResponse) {
        inBuffer(transaction);
        var obj = {};
        obj[transaction] = itsResponse;
        return rsaBuffer.push(obj);
      }

      // Get buffer
      function get() {
        return rsaBuffer;
      }

      // Clear buffer
      function clear() {
        return rsaBuffer = [];
      }

      function inBuffer(transaction) {
        rsaBuffer = rsaBuffer.filter(function(item, i){
          var valueName = Object.keys(item)[0];  
          return valueName != transaction;
        })
      }

      /////////////////////
      // Service exposes //
      /////////////////////
      return {
        rsaBuffer: rsaBuffer,
        set: set,
        get: get,
        clear: clear,
      }
    }

})();
