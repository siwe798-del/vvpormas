(function() {
	'use strict';
	angular.module('app.module.core')
	.factory('captchaFactory',
		function () {
			return {
				get: function(){
			var icons = [
			 'anchor',
			 'automobile',
			 'balance-scale',
			 'bank',
			 'beer',
			 'bicycle',
			 'briefcase',
			 'building',
			 'cab',
			 'calculator',
			 'camera-retro',
			 'coffee',
			 'credit-card',
			 'cutlery',
			 'diamond',
			 'futbol-o',
			 'gift',
			 'home',
			 'laptop',
			 'money',
			 'motorcycle',
			 'paw',
			 'shopping-cart',
			 'suitcase',
			 'television',
			 'umbrella'
			];

				var len = icons.length, temp, i, obj;

				while (len) {
			    	i = Math.floor(Math.random() * len--);

				    temp = icons[len];
				    icons[len] = icons[i];
				    icons[i] = temp;
				}
				
				obj = { iconsList:icons.slice(0,4), valid:icons[Math.floor(Math.random()*4)] };

				return obj;
			}
		};
	});
})();
