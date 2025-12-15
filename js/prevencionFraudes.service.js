(function() {
  
  /**
   * @name prevencionFraudesService
   * @module app.module.core.service.prevencionFraudes
   * @description Servicio Prevención de fraudes
   * @requires
   */
  angular.module('app.module.core')
    .service('prevencionFraudesService', prevencionFraudesServiceFunction);

  prevencionFraudesServiceFunction.$inject = ['$log', '$q', 'rsaModalService', 'RSAExceptionHandlerService', 'RSABufferService', 'RSAEnrichedRequestService', 'paramsFixed'];

  function prevencionFraudesServiceFunction($log, $q, rsaModal, RSAExceptionHandler, RSABuffer, RSAEnrichedRequest, paramsFixed) {
    /* Private */
    var transactionListByObtrsa = localStorage.getItem('obtrsa') ? localStorage.getItem('obtrsa').split(',') : ['loginwb05'];
    var _delegate = null;
    var _accountsInfo = [];

    /**
     * @name prevencionFraudesService.rsaFlowStarted
     * @description Launch the Modal and send enrolling or challenge data to RSA.
     * @requires Object - ....
     * @return Object - Promise regarding RSA response.
     */
    function rsaFlowStarted(dataResponse, sourceArguments, _context, actionType, requireToken) {
      var dataResponseEnriched = angular.extend(dataResponse, {
        actionType: actionType,
        _context:  _context,
        sourceArguments: sourceArguments,
        showToken: requireToken
      });
      var modalDataTransform = {
        customModalOptions: {},
        rsaData: dataResponseEnriched,
        doRsaRequest: doRsaRequest
      }

      return $q(function(resolve, reject) {
        rsaModal.show(modalDataTransform)
          .then(
            function successfulByModal(modalDataContinue) {
              var code = parseInt(modalDataContinue.data.code);
              if (code == 200 || code == 202) {
                return resolve(modalDataContinue);
              }
              return reject(modalDataContinue);
            },
            function failureByModal(modalDataCancel) {
              RSAExceptionHandler.cancelByModal(modalDataCancel);
            }
          )
      });
    }

    /**
     * @name prevencionFraudesService.doRsaRequest
     * @description ....
     * @requires Object - ....
     * @return Object - Promise regarding RSA response.
     */
    function doRsaRequest(_context, _sourceArguments, objToRsa, withRsaNode) {
      _sourceArguments[1] = angular.extend(_sourceArguments[1], { "rsa": objToRsa } );
      if (!withRsaNode && _sourceArguments[1].hasOwnProperty('rsa')) {
        delete _sourceArguments[1].rsa;
      }
      return _delegate.send.apply(_context, _sourceArguments);
    }

    /**
     * @name prevencionFraudesService.handleResponse_switchPhase
     * @description ....
     * @requires Object - ....
     * @return Object - ...
     */
    function handleResponse_switchPhase(switchOption, mainResponse, sourceArguments, _context, resolve) {
      
      switch (switchOption) {
        // Avoit pass -> RSA user exist but without challenge questions -> Enrollment
        case 204:
        case 404:
          rsaFlowStarted(mainResponse.data, sourceArguments, _context, 'enrollment', false)
            .then(
              function enrollmentSuccess(dataByEnrollment) {
                resolve(mainResponse);
              },
              function enrollmentFailure(errorByEnrollment) {
                RSAExceptionHandler.httpCode(errorByEnrollment.data);
              }
            );
          break;

        // Avoit pass -> Action required by RSA -> CHALLENGE
        case 201:
          var isNotLogin = sourceArguments[0] !== "loginwb05";
          rsaFlowStarted(mainResponse.data, sourceArguments, _context, 'challenge', isNotLogin)
            .then(
              function challengeSuccess(responseChallenge) {
                ( isNotLogin ) ? resolve(responseChallenge) : resolve(mainResponse);
              },
              function challengeFailure(errorByChallenge) {
                RSAExceptionHandler.httpCode(errorByChallenge.data);
              }
            );
          break;

        case 600:
          RSAExceptionHandler.missingPhone(mainResponse.data);
          break;
        // Avoit pass -> Handle exception
        case 400:
        case 423:
          RSAExceptionHandler.httpCode(mainResponse.data);
          break;
        // Allow pass -> No action required
        case 200:
        case 202:
        default:
          resolve(mainResponse);
      }
    }


    /* Public */
    /**
     * @name prevencionFraudesService.getAndSetDelegate
     * @description Get $delegate of decorator.
     * @requires Object - $delegate.
     * @return null
     */
    function getAndSetDelegate(__delegate) {
      _delegate = __delegate;
    }

    /**
     * @name prevencionFraudesService.getTransactionListByObtrsa
     * @description ...
     * @requires Object - ....
     * @return null
     */
    function getTransactionListByObtrsa(transactionList) {
      transactionListByObtrsa = transactionList.data && transactionList.data.data || ['loginwb05'];
      this.transactionListByObtrsa = transactionListByObtrsa;
      localStorage.setItem('obtrsa', transactionListByObtrsa);
    }

    /**
     * @name prevencionFraudesService.addDevicePrintHeader
     * @description Get client info and collect into string.
     * @requires Object - Current config headers.
     * @return Object - Transform config headers, Device-Print-Rsa and Geo-Location-Rsa added.
     */
    function addDevicePrintHeader(config) {
      var tokenStr = (localStorage.getItem('x-token') != "null" && localStorage.getItem('x-token'))
        ? localStorage.getItem('x-token')
        : null;
      var xtokenId = tokenStr
        ? tokenStr
        : (config.X_TOKEN_ID && config.X_TOKEN_ID != "" )
          ? config.X_TOKEN_ID
          : paramsFixed.session().idSesion;
      var moreHeaders = {
        "Device-Print-Rsa": encode_deviceprint(),
        "Geo-Location-Rsa": getGeolocationStruct(),
        "X_TOKEN_ID": xtokenId
      }
      var headersExtend = angular.extend(config.headers || {headers: {'Content-Type': 'application/json'}}, moreHeaders);
      return angular.extend(config, moreHeaders, { headers: headersExtend });
    }

    /**
     * Agrega datos obtrsa a transacciones 
     * @param {object} data 
     */
    function addEnrichedObtrsa(sourceArguments) {
      if ( transactionListByObtrsa.find(function (item) { return item === ("/" + sourceArguments[0]) })) {
        return RSAEnrichedRequest.extend(sourceArguments[0], sourceArguments[1], RSABuffer.get());
      }
      return sourceArguments[1];
    }

    /**
     * @name prevencionFraudesService.handleResponse
     * @description Catch and handle main flow from serviceUtil.send
     * @requires Object - ...
     * @return Object - ...
     */
    function handleResponse(mainResponse, sourceArguments, _context) {
      localStorage.setItem('x-token', mainResponse.headers('X_TOKEN_ID'));

      return $q(function(resolve, reject) {
        if (sourceArguments[0] === 'loginwb05') {
          // LOGIN IS >
          if (mainResponse.data.code !== 200) {
            if (mainResponse.data.code == 423) { // hay ocasiones en que el bloqueo de RSA [code:423] llega desde este punto
              RSAExceptionHandler.httpCode(mainResponse.data);
            } else {
              reject(mainResponse);
            }
          } else {
            if (mainResponse.data.rsa) {
              // RSA flow get started
              handleResponse_switchPhase(mainResponse.data.rsa.code, mainResponse, sourceArguments, _context, resolve);
            } else {
              // RSA flow don't need it
              resolve(mainResponse);
            }
          }
        } else {
          // IS NO LOGIN >
          if ( transactionListByObtrsa.find(function (item) { return item === ("/" + sourceArguments[0]) })) {
            handleResponse_switchPhase(mainResponse.data.code, mainResponse, sourceArguments, _context, resolve);
          } else {
            // RSA flow don't need it
            resolve(mainResponse);
          }
        }
      });
    }


    /////////////////////
    // Service exposes //
    /////////////////////
    this.addDevicePrintHeader = addDevicePrintHeader;
    this.handleResponse = handleResponse;
    this.getTransactionListByObtrsa = getTransactionListByObtrsa;
    this.getAndSetDelegate = getAndSetDelegate;
    this.transactionListByObtrsa = transactionListByObtrsa;
    this.addEnrichedObtrsa = addEnrichedObtrsa;
  }

})();
