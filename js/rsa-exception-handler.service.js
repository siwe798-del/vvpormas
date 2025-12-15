(function () {

  angular.module('app.module.core')
    .service('RSAExceptionHandlerService', RSAExceptionHandlerFunction);
  RSAExceptionHandlerFunction.$inject = ['$log', '$q', '$location', '$state'];

  function RSAExceptionHandlerFunction($log, $q, $location, $state) {
    /* Private */
    // Log msg
    function log(msg) {
      $log.log('RSAExceptionHandlerService $log >| ', msg || '');
    }

    /* Public */
    /**
     * @name RSAExceptionHandlerService.cancelByModal
     * @description ...
     * @requires ...
     * @param {object} modalDataCancel ...
     * @return {null} ...
     */
    function cancelByModal(modalDataCancel) {
      log('< -cancelByModal- >', modalDataCancel);
    }

    /**
     * @name RSAExceptionHandlerService.httpCode
     * @description ...
     * @requires ...
     * @param {object} _data ...
     * @return {null} ...
     */
    function httpCode(_data) {
      // TODO: Getting message must be changed on develop proccess. So keep bear in mind.
      var msg = _data.hasOwnProperty('data') ?
        _data.data.hasOwnProperty('mensajeRsa') ?
        _data.data.mensajeRsa :
        _data.hasOwnProperty('rsa') ?
        _data.rsa.message :
        _data.message :
        _data.message;

      var callback = function () {};

      var httpCode = _data.hasOwnProperty('rsa') ? _data.rsa.code : _data.code;
      switch (httpCode) {
        case 400: //respuesta incorrecta.
          break;
        case 423:
          //usuario ha sido bloqueado en RSA, redirect login.
          msg = _data.message;
          callback = function () {
            var absoluteUrl = $location.absUrl();
            var anteriorUrl = absoluteUrl.split("#")[0];
            anteriorUrl = anteriorUrl.indexOf("/banking") !== -1 ? anteriorUrl.replace("/banking/", "/web/") : anteriorUrl;
            anteriorUrl = (anteriorUrl.indexOf("index.html") !== -1) ? anteriorUrl : anteriorUrl + "index.html";
            location.replace(anteriorUrl);
          }
          break;
      }

      swal({
        title: "Error",
        html: "<p class='text-center'>" + msg + "</p>",
        type: "error",
        showCancelButton: false,
        confirmButtonText: "Aceptar",
      }).then(function () {
        callback();
      })
    }

    function missingPhone(resp) {
      swal({
        title: "Error",
        html: "<p class='text-center'>" + resp.message + "</p>",
        type: "error",
        showCancelButton: false,
        confirmButtonText: "Aceptar",
      }).then(function () {
        $state.go(resp.data)
      })
    }

    /**
     * @name RSAExceptionHandlerService.unknownHttpCode
     * @description ...
     * @requires ...
     * @param {object} data ...
     * @return {null} ...
     */
    function unknownHttpCode(data) {
      log('< -unknownHttpCode- >', data);
    }


    /////////////////////
    // Service exposes //
    /////////////////////
    return {
      cancelByModal: cancelByModal,
      httpCode: httpCode,
      unknownHttpCode: unknownHttpCode,
      missingPhone: missingPhone
    }
  }

})();
