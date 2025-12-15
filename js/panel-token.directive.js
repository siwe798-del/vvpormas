(function () {
  'use strict';
  angular.module('app.module.core')
    .directive('appPanelToken', ['$http', '$state', '$rootScope', 'sweetAlert', 'serviceUtil', 'paramsFixed', appPanelToken]);

  /**
   * [appPanelToken description]
   * @param  {[type]} $http      [description]
   * @param  {[type]} $state     [description]
   * @param  {[type]} $rootScope [description]
   * @param  {[type]} APP        [description]
   * @return {[type]}            [description]
   */
  function appPanelToken($http, $state, $rootScope, sweetAlert, serviceUtil, paramsFixed) {
    var directive = {
      restrict: 'E',
      replace: true,
      transclude: true,
      scope: {
        backState: '@backstate',
        nextState: '@nextstate',
        nextService: '@execservice',
        btnStatus: '=btnstatus',
        exeCallback: '&execallback',
        beforeCallback: '&beforecallback',
        demo: '=demo',
        aceptos: '=aceptos',
        validacion: '=validacion'

      },
      templateUrl: 'modules/core/views/elements/panel-token.html',
      controller: ['$scope', '$rootScope', '$state', function ($scope, $rootScope, $state) { }],
      link: function (scope, element, attrs) {

        var api = $rootScope.api;

        /**
         * [sendToken description]
         * @param  {[type]} token [description]
         * @return {[type]}       [description]
         */
        scope.sendToken = function (token) {

          var dataObject = {
            "sesion": paramsFixed.session(),
            "data": { "token": token }
          };
          /**
           * [if] Quitar comparación demo == true para produccion
           * Cambar dataObject con valores por default para producción
           */

          scope.serviceData = $rootScope.serviceData;

          api = $rootScope.api[1] + $rootScope.api.context;

          if (typeof scope.demo === 'undefined' || (scope.demo.fluidDemo === false && scope.demo.goWebservice === false)) {
            $http.post(api + 'lvtwb04', dataObject).success(function (response, status) {
              switch (response.code) {
                case 200:
                  scope.token = '';
                  scope.executeServiceAprovedToken();
                  break;

                case 204:

                  swal({
                    title: "Alerta",
                    type: "warning",
                    text: "Contraseña dinámica incorrecta, intenta nuevamente.",
                    confirmButtonText: "Aceptar"
                  });
                  break;
              }

            }).error(function (error) {
              sweetAlert.message(error.data, 'error');
            });
          } else if (scope.demo.fluidDemo === true && scope.demo.goWebservice === false) {
            $state.go(scope.nextState);
          } else if (scope.demo.goWebservice === true && scope.demo.fluidDemo === false) {
            scope.executeServiceAprovedToken();
          }
        }

        /**
         * [executeServiceAprovedToken description]
         * @return {[type]} [description]
         */
        scope.executeServiceAprovedToken = function () {

          serviceUtil.send(scope.nextService, scope.serviceData).then(function (response) {
            switch (response.data.code) {
              case 200:
                scope.exeCallback(response);
                if (scope.nextState !== undefined && typeof scope.nextState !== "undefined" && scope.nextState !== '') {
                  $state.go(scope.nextState);
                }
                break;

              default:
                $rootScope.serviceData.data.token = '';
                sweetAlert.message(response.data.message, 'error');
            }
          });
        };
        /**
         * [btnBack description]
         * @return {[type]} [description]
         */
        scope.btnBack = function () {
          $state.go(scope.backState);
        };
        /**
         * [btnNext description]
         * @param  {[type]} numToken [description]
         * @return {[type]}          [description]
         */

        scope.btnNext = function (numToken) {

          var beforeCallbackResponse = scope.beforeCallback();
          if (typeof beforeCallbackResponse === 'object') {
            if (angular.isUndefined(beforeCallbackResponse.respuesta)) {
              return;
            } else if (beforeCallbackResponse.respuesta === false) {
              return;
            }
          }

          if (scope.aceptos !== undefined) {
            if (scope.aceptos.valid == false) {
              sweetAlert.message(scope.aceptos.message, 'warning');
              return false;
            }
          }

          if ($rootScope.serviceData.data) {
            if ($rootScope.serviceData.data.token == '') {
              $rootScope.serviceData.data.token = numToken;
            }
          }

          if (typeof numToken === 'undefined' || numToken.length === 0) {

            swal({
              title: "Alerta",
              type: "warning",
              text: "Debes introducir la clave dinámica <br/> que aparece en tu Token.",
              confirmButtonText: "Aceptar"
            });
          }
          else if (typeof $rootScope.serviceData === 'undefined' || Object.keys($rootScope.serviceData).length === 0) {

            swal({
              title: "Alerta",
              type: "warning",
              text: "No se cuenta con datos suficientes <br/> para procesar tu solicitud.",
              confirmButtonText: "Aceptar"
            });
          }
          else {
            scope.sendToken(numToken);
          }

        };

      }
    };
    return directive;
  }

})();
