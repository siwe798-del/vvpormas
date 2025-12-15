(function () {
    'use strict';
    
    angular.module('webApp.inicio')
    .controller('Geolocalizacion', Geolocalizacion);
    Geolocalizacion.$inject = ['$scope', '$uibModalInstance', 'message'];
  
    function Geolocalizacion($scope, $uibModalInstance, message) {

      $scope.message = message;
      $scope.aceptar = function () {
        $uibModalInstance.dismiss('cancel');
      };
    }
  })();