(function() {
    'use strict';
    angular.module('app.module.core')
      .controller('ModalFooterController', ModalFooterController);
    ModalFooterController.$inject = ['$scope', '$rootScope', '$uibModal', '$uibModalInstance','optionBanner'];

    function ModalFooterController($scope, $rootScope, $uibModal, $uibModalInstance,optionBanner) {
        $scope.optionBanner = optionBanner;
        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };

        $scope.toggleScroll = function(id){
        	var val = angular.element('#' + id).contents()[0].getElementsByTagName("html")[0].style.overflowY;
        	if(val == 'scroll'){
        		setTimeout(function(){
        			angular.element('#' + id).contents()[0].getElementsByTagName("html")[0].style.overflowY = "";
        		}, 100);
        	}else{
        		setTimeout(function(){
        			angular.element('#' + id).contents()[0].getElementsByTagName("html")[0].style.overflowY = "scroll";
        		}, 100);
        	}
        };
    }
})();
