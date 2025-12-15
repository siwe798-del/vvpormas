(function() {
  'use strict';
  angular
    .module('webApp.inicio')
    .controller('HeaderController', HeaderController);
    HeaderController.$inject = ['$scope', 'APP'];

    function HeaderController($scope, APP){

      $scope.date = new Date();
      $scope.config = APP;

    }

})();
