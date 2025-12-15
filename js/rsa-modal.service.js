/**
 * rsaModalService servicio que se encarga de mostrar un $uibModal en el DOM.
 * @name  rsaModalService
 * @service 
 */
(function () {

  angular.module('app.module.core')
    .service('rsaModalService', rsaModalService);

  rsaModalService.$inject = ['$rootScope', '$http', '$uibModal', 'sweetAlert'];

  function rsaModalService($rootScope, $http, $uibModal, sweetAlert) {
    /* Private */
    startCollection();

    var modalConfig = {
      backdrop: true,
      keyboard: false,
      modalFade: true,
      templateUrl: '../common_modules/prevencion-fraudes/views/modal-rsa.html',
      controller: 'rsaModalCtrl',
      bindToController: true,
      controllerAs: 'vm',
      backdrop: 'static',
      windowClass: 'modal-rsa-wrapper'
    };

    var modalOptions = {
      actionButtonText: 'Continuar',
      headerText: {
        otp: 'Introduce el código de verificación que hemos enviado vía SMS a tu celular',
        challenge: 'Por favor contesta las siguientes preguntas de seguridad',
        enrollment: 'Ingresa las respuestas a tus preguntas de seguridad'
      },
      challengeType: 'challenge'
    };

    /* Public */
    /**
     * [show]
     * @param  {Objec} customModalOptions   Configuración opcional del modal (UI)
     * @param  {Object} rsaData             Data del RSA response
     * @return {promise}                    $uibModal promise
     */
    function show(modalDataTransform) {
      var tempModalDefaults  = modalConfig;
      var tempModalOptions   = {};
      var customModalOptions = modalDataTransform.customModalOptions;
      var rsaData            = modalDataTransform.rsaData;
      var doRsaRequest       = modalDataTransform.doRsaRequest
        
      //angular.extend(tempModalDefaults, modalConfig, customModalDefaults);
      angular.extend(tempModalOptions, modalOptions, customModalOptions);
        
      if (rsaData) {
        tempModalDefaults.resolve = {
          rsaData: function () {
            return rsaData;
          },
          config: function () {
            return tempModalOptions;
          },
          doRsaRequest: function () {
            return doRsaRequest;
          }
        };
      }
      
      return $uibModal.open(tempModalDefaults).result;
    };
    
    /////////////////////
    // Service exposes //
    /////////////////////
    this.show = show;
  }

})();
