( function () {
    'use strict';

    angular.module( 'webApp.inicio' ).controller( 'ModalCerrarSesionController', ModalCerrarSesionController );

    ModalCerrarSesionController.$inject = [ '$scope', 'sessionHandler', 'sweetAlert', 'serviceUtil', '$uibModalInstance', 'modalObj' ];

    function ModalCerrarSesionController( $scope, sessionHandler, sweetAlert, serviceUtil, $uibModalInstance, modalObj ) {
        $scope.message = modalObj.message;

        $scope.nuevaSesion = function () {
            var paramsLogout = { subject: { principal: modalObj.user } };

            serviceUtil.send( 'logoutwb09', paramsLogout, 1,'noAlert', 9000 ).then( function( response ) {
                if( response.data.code === 200 ) {
                    reintentarLogin();
                } else {
                    sweetAlert.message( response.data.message, 'warning' );
                }
            });

            $uibModalInstance.dismiss( 'cancel' );
        };

        $scope.regresarLogin = function() {
            sessionHandler.goToWeb();
            $uibModalInstance.dismiss( 'cancel' );
        };

        var reintentarLogin = function() {
            $scope.vm.validaUser( $scope.vm.password )
        };
    }

})();