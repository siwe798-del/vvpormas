(function() {
    'use strict';
    angular.module('webApp.inicio').controller('containerController', containerController);
    //containerController.$inject = ['$http', '$stateParams', '$state', '$location'];

    //function containerController($http, $stateParams, $state, $location) {
    function containerController() { 
        var vm = this;
        vm.noWrapSlides = false;
        vm.intervalCarousel = 5000;
        vm.slides = [];
        vm.addSlide = function(i) {
            vm.slides.push({
                image: 'assets/images/slide' + i + '.jpg'
            });
        };
        for (var i = 1; i <= 3; i++) {
            vm.addSlide(i);
        }
    }
})();