(function() {
'use strict';
  angular.module('app.module.core')
    .directive('appCounter', ['$interval', '$filter', '$rootScope', 'sessionHandler', 'serviceUtil', 'paramsFixed', appCounter]);

  /**
   * [appCounter description]
   * Revisar esto y su funcionalidad; está muy raro
   * @param  {[type]} $interval      [description]
   * @param  {[type]} $filter     [description]
   * @return {[type]}            [description]
   */
  function appCounter($interval, $filter, $rootScope, sessionHandler, serviceUtil, paramsFixed) {
    var directive = {
    restrict:"E",   
      link: function(scope, element, attrs) {	

        var timeoutId,min,time = attrs.time;

        scope.$on('$locationChangeStart', function(event, next, current) { time = 600; });
        scope.$on('$stateChangeStart', function(event, next, current) { time = 600; });
        
        element.text( $filter('fillZeroes')(min, 2) + ":" + $filter('fillZeroes')((time - (min * 60)), 2));

        function updateTime() {
          time = time - 1;
          min = Math.floor(time / 60);
          if(time == 59){
            swal({
                html: "<span style='color: #3bb0c9;'>&iexcl;Tu sesión está a punto de expirar!</span> "
                + "<br /><br /> Estimado usuario, tu sesión se cerrará en:"
                + "<br /><span style='color: #3bb0c9;'>" + $filter('fillZeroes')(time, 2) + " segundos</span>"
                + "<br /> ¿Deseas continuar en tu sesión? ",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Continuar",
                cancelButtonClass: 'btn btn-success',
                cancelButtonText: "Cerrar sesión",
                closeOnConfirm: false,
                timer: 59000,
                closeOnCancel: false}).then(
                function(dismiss) {
                  if(dismiss){
                    var data = {};
                    serviceUtil.load('latsu08', data)
                        .then(function(response) {
                          time = attrs.time;
                   });
                  } else {
                        
                        sessionHandler.logOut(
                            undefined,
                            // si en el tiempo por default(9 segundos) no se cierra sesion,
                            // es decir que el WS logoutwb09
                            // no contesta por la razón que sea, entonces
                            // se procede a ejecutar el callback. En caso de que el WS
                            // de cerrar sesión conteste exitosamente antes de los 4
                            // segundos, inmediatamente despues, se ejecuta el callback.
                            sessionHandler.goToWeb    // este es el callback
                        );

                  }
                 }
                );
          }
          element.text( $filter('fillZeroes')(min, 2) + ":" + $filter('fillZeroes')((time - (min * 60)), 2));
        }
    		  
    	$rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams, options) {
    		updateTime();
    	});

        function stopCounter() {
          if (angular.isDefined(timeoutId)) {
            $interval.cancel(timeoutId);
            timeoutId = undefined;
          }
        };

        element.on('$destroy', function() {
          $interval.cancel(timeoutId);
        });

         timeoutId = $interval(function() {
          if(time > 0){
            updateTime();
          } else{
            stopCounter();
            sessionHandler.logOut(
              undefined,
              sessionHandler.goToWeb
            );
          }
        }, 1000);
      }
    };
    return directive;
  }

})();
