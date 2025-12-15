(function() {
    'use strict';
    angular.module('webApp.inicio').controller('routingController', routingController);
    routingController.$inject = ['$location', '$scope', '$rootScope', '$window'];

    function routingController($location, $scope, $rootScope, $window) {
        var statusSteps = $rootScope.statusSteps;
        /**
         * [changeLocation description]
         * @param  {[type]} url         [description]
         * @param  {[type]} forceReload [description]
         * @return {[type]}             [description]
         */
        var changeLocation = function(url, forceReload) {
            $scope = $scope || angular.element(document).scope();
            if (forceReload || $scope.$$phase) {
                window.location = url;
            } else {
                $location.path(url);
                $scope.$apply();
            }
        };
        var params = ['height=' + screen.height, 'width=' + screen.width, 'fullscreen=yes', 'resizable=no', 'scrollbars=yes', 'toolbar=no', 'menubar=no', 'location=no', 'titlebar=Omnisuite Banking'].join(',');
        if (statusSteps.primer_ingreso === true) {
            $window.open('../banking/#/login/primer-acceso/terminos-y-condiciones', '_blank', params).moveTo(0, 0);
        } else if (statusSteps.segundo_ingreso === true) {
            $window.open('../banking/#/login/segundo-acceso/personalizar-cuentas', '_blank', params).moveTo(0, 0);
        } else if (statusSteps.temporal === true) {
            $window.open('../banking/#/configuracion/modificar-contrasena', '_blank', params).moveTo(0, 0);
        } else {
            $window.open('../banking', '_blank', params).moveTo(0, 0);
        }
        changeLocation('/web', true);
    }
})();
