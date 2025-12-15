(function () {
  'use strict';
  angular.module('app.module.core')
    .service('serviceUtil', serviceUtil);
  serviceUtil.$inject = ['$rootScope', '$http', '$q', 'sweetAlert', 'APP', '$base64', 'readConfig', 'paramsFixed', 'getPropertie'];

  function serviceUtil($rootScope, $http, $q, sweetAlert, APP, $base64, readConfig, paramsFixed, getPropertie) {
    /**================================ */
    /**========init vars============== */
    var self = this,
      band = false;
    /**========init $rootScope============== */
    $rootScope.api = getPropertie.storage('api');
    /**============functions==================== */
    this.reviewServer = function (ipMachine) {
      var apiServer,
        api = getPropertie.storage('api');
      if (typeof ipMachine == 'undefined' || !readConfig.existMachine(ipMachine) || !readConfig.reviewEnvDev()) {
        apiServer = api['ipServer'];
      } else if (readConfig.existMachine(ipMachine) && readConfig.reviewEnvDev()) {
        apiServer = api[ipMachine];
      }
      return apiServer;
    }
    /**
     * [handledException]
     */
    this.handledException = function (error, objDataRecieve) {
      var defered = $q.defer(),
        promise = defered.promise,
        api = getPropertie.storage('api'),
        wsErrNoAlert = ['frama01'],
        wsName = error.config.url.split("/").pop();

      if (typeof objDataRecieve.alert === 'undefined') {
        
        if ( error.status == 423) {
          if (!band) {
            swal({
              title: 'ERROR',
              html: "<p class='text-center'> Tu usuario ha sido bloqueado, favor de contacta a línea Bx+. </p>",
              type: "error",
              showCancelButton: false,
              confirmButtonText: "Aceptar",
            }).then(function () {
              location.reload(api.pathApp + '/web/#/');
            });
            band = true;
          }
        } else if (error.status == 418 ) {
          if (!band) {
            swal({
              title: 'ERROR',
              html: "<p class='text-center'> Tu sesión ha expirado. Si lo deseas, ingresa nuevamente. </p>",
              type: "error",
              showCancelButton: false,
              confirmButtonText: "Aceptar",
            }).then(function () {
              location.reload(api.pathApp + '/web/#/');
            });
            band = true;
          }
        } else if (error.status >= 500) {
          sweetAlert.message('Ocurrió un error de comunicación, por favor intenta nuevamente', 'error');
        } else if (error.status == 401) {

          swal({
            title: 'ALERTA',
            html: '<p class="text-center">' + error.data.message + '</p>',
            type: "error",
            showCancelButton: false,
            confirmButtonText: "Aceptar"
          }).then(function () {});

        } else {

          if (error.data) {
            if (typeof error.data.message === 'undefined') {
              error.data.message = 'Ocurrió un error de comunicación, por favor intenta nuevamente';
            } else if (error.data.message === '') {
              error.data.message = 'Ocurrió un error de comunicación, por favor intenta nuevamente';
            }

            if (!wsErrNoAlert.includes(wsName)) {
              swal({
                title: 'ALERTA',
                text: '<p class="text-center">' + error.data.message + '</p>',
                type: "info",
                showCancelButton: false,
                confirmButtonText: "Aceptar"
              });
            }
          } else {
            if (!navigator.onLine) {
              swal({
                title: 'ERROR',
                text: '<p class="text-center">No cuentas con conexión a internet</p>',
                type: "error",
                showCancelButton: false,
                confirmButtonText: "Aceptar"
              });
            }
          }
        }
      } else if (objDataRecieve.alert == 'noAlert') { defered.reject(error); }
      defered.resolve(error);
      return promise;
    }


    /**
     * [fluidContinue]
     */


    this.fluidContinue = function (objDataRecieve) {

      var defered = $q.defer(),
        promise = defered.promise;
      //if (objDataRecieve.objectData.sesion) { delete objDataRecieve.objectData.sesion };

      $http({
        method: 'POST',
        url: objDataRecieve.apiDefault + objDataRecieve.wsCat,
        data: objDataRecieve.objectData,
        timeout: objDataRecieve.customTimeout ? objDataRecieve.customTimeout : 0,
        headers: {
          'Geo-Location-Rsa-Custom': objDataRecieve.geolocationCustom
        }
      }).then(function (data) {
        // se comprueba si el data esta definido
        if (data.data != null || !angular.undefined(data.data)) {
          defered.resolve(data);
        } else {
          sweetAlert.message('El resultado es indefinido', 'error');
        }
      }).catch(function (error) {
        if (typeof objDataRecieve.customTimeout == "number" && typeof objDataRecieve.callback == "function") {
          objDataRecieve.callback()
        } else {
          self.handledException(error, objDataRecieve).then(function (errorHandl) {
            defered.resolve(errorHandl);
          })
        }
      })
      return promise;
    } // fluidContinue
    /**
     * [load]
     */
    this.load = function (wsCat, objData, ipMachine, alert) {
        objData.sesion = paramsFixed.session();

        var defered = $q.defer(),
          promise = defered.promise,
          api = getPropertie.storage('api'),
          apiServer = self.reviewServer(ipMachine),
          dataSend = {
            wsCat: wsCat,
            objectData: objData,
            alert: alert,
          };

        if ($.isEmptyObject(api)) {
          return promise;
        }
        dataSend.apiDefault = apiServer + api.context;
        if (typeof dataSend.apiDefault === 'undefined') {
          sweetAlert.message('Ws ' + wsCat + ' is not defined', 'info');
        } else {
          self.fluidContinue(dataSend).then(function (dataFluid) {
            defered.resolve(dataFluid);
          })
        }
        return promise;
      }, //load
      this.send = function (wsCat, objData, ipMachine, alert, customTimeout, callback, typeContext, geolocationCustom) {
        var defered = $q.defer(),
          promise = defered.promise,
          dataSend,
          api = getPropertie.storage('api'),
          apiServer = self.reviewServer(ipMachine),
          contextType = (typeContext === "sat") ? api.sat_context : api.context;

        if ($.isEmptyObject(api)) {
          return promise;
        }

        dataSend = {
          wsCat: wsCat,
          objectData: objData,
          alert: alert,
          customTimeout: customTimeout,
          callback: callback,
          geolocationCustom: geolocationCustom
        };

        dataSend.apiDefault = apiServer + contextType;
        if (typeof dataSend.apiDefault === 'undefined') {
          sweetAlert.message('Ws ' + wsCat + ' is not defined', 'warning');
        } else {
          self.fluidContinue(dataSend).then(function (dataFluid) {
            defered.resolve(dataFluid);
          })
        }
        return promise;
      }, //send

      this.headersConfig = {};
  }
})();
