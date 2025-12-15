(function() {
  /**
   * @name prevencionFraudesService
   * @module app.module.core.service.prevencionFraudes
   * @description Servicio Prevención de fraudes
   * @requires
   */
  angular.module('app.module.core')
    .config(['$provide', function($provide) {
      $provide.decorator('serviceUtil', ['$delegate', '$log', 'blockUI', 'prevencionFraudesService', 'RSABufferService', 'readConfig', serviceUtilDecoratorFunction]);
    }]);

  function serviceUtilDecoratorFunction($delegate, $log, blockUI, prevencionFraudes, RSABuffer, readConfig) {
    blockUI.start();
    prevencionFraudes.getAndSetDelegate($delegate);

    readConfig.get().then(function(data) {

      $delegate.send('obtrsa', {},'','noAlert')
        .then(
          function getTransactionListByObtrsaSuccess(response) {
            blockUI.stop();
            prevencionFraudes.getTransactionListByObtrsa(response);
          },
          function getTransactionListByObtrsaFailrure(error) {
            blockUI.stop();
          }
        );

    });

    /*
     * Methods overwritten
     */
    var load = function() {
      var sourceArguments = arguments;
      var _this = this;
      return $delegate.load.apply(this, arguments)
        .then(
          function loadDelegateSuccess(mainResponse) {
            if (prevencionFraudes.transactionListByObtrsa.length != 0) {
              RSABuffer.set(sourceArguments[0], mainResponse);
            }
            return mainResponse;
          },
          function loadDelegateFailure(dataError) {
            return dataError;
          }
        );
    };

    var sending = function() {
      return $delegate.sending.apply(this, arguments);
    };

    var send = function() {
      var sourceArguments = arguments;
      var _this = this;
      $delegate.headersConfig = prevencionFraudes.addDevicePrintHeader($delegate.headersConfig);
      sourceArguments[1] = prevencionFraudes.addEnrichedObtrsa(sourceArguments);

      return prevencionFraudes.transactionListByObtrsa.length == 0 ?
        $delegate.send.apply(this, arguments) :
        $delegate.send.apply(this, sourceArguments)
        .then(
          function sendDelegateSuccess(mainResponse) {
            return prevencionFraudes.handleResponse(mainResponse, sourceArguments, _this)
              .then(
                function handleResponseSuccess(dataSuccess) {
                  dataSuccess.config.url ? dataSuccess.config.url.indexOf("cdpcnwb07") != -1 ? null : RSABuffer.clear() : RSABuffer.clear();
                  return dataSuccess;
                },
                function handleResponseFailure(dataFail) {
                  RSABuffer.clear();
                  return dataFail;
                }
              )
          },
          function sendDelegateFailure(dataError) {
            $log.log('[ sendDelegateFailure ]>', dataError);
            return dataError;
          }
        );
    };

    return {
      load: load,
      send: send,
      sending: sending
      //sendSyncronous: sendSyncronous      
    }
  }

})();
