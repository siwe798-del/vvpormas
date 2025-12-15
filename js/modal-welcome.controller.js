(function () {
  'use strict';
  
  angular.module('webApp.inicio')
  .controller('MsgBienvenidaPrimerAcceso', ModalWelcomeFirstAccess);
  ModalWelcomeFirstAccess.$inject = ['$scope', '$uibModalInstance', '$state'];

  function ModalWelcomeFirstAccess($scope, $uibModalInstance, $state) {
    $scope.clickWellcomeModal = function () {
      $state.go('ingresar', { route: 'registro' });
      $uibModalInstance.dismiss('cancel');
    };
  }
})();