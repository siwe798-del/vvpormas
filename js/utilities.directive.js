(function() {
    'use strict';
    angular.module('app.module.core')
        .directive('soloNumeros', soloNumeros)
        .directive('soloNumerosDos', soloNumerosDos)
        .directive('isNumber', isNumber)
        .directive('currencyMask', currencyMask)
        .directive('mascaraMonto', mascaraMonto)
        .directive('tabIndicator', tabIndicator)
        .directive('progressIndicator', progressIndicator)
        .directive('timerCountdown', ['Util', '$interval', timerCountdown])
        .directive('scrollToItem', scrollToItem)
        .directive('checkStrength', checkStrength)
        .directive('trim', trim)
        .directive('mascaraTelefono', ['$filter', mascaraTelefono])
        .directive('mascaraNoCuenta', ['$filter', mascaraNoCuenta])
        .directive('noCopyPaste', noCopyPaste)
        .directive('maskcero', maskcero)
        .directive('soloTexto', soloTexto)
        .directive('soloTextoDos', soloTextoDos)
        .directive("rfcDos", rfcDos)
        .directive('obtenerSlide', ['$parse', obtenerSlide])
        .directive("validaMailBanca", validaMailBanca)
        .directive('format', ['$filter', formatoMoneda])
        .directive('checkMayus', checkMayus)
        .directive('capsLockFixed', ['$compile', capsLockFixed])
        .directive('autoFocus', ['$timeout', autoFocus]);

    function autoFocus($timeout) {
        return {
            restrict: 'A',
            link: function($scope, $element) {
                $timeout(function() {
                    $element[0].focus();
                });
            }
        }
    }

    function checkMayus() {
        return {
            link: function(scope, element) {
                var el = '<span class="input-group-addon" id="basic-addon3">' +
                    //'<span class="glyphicon glyphicon-eject"></span>' +
                    '<span class="glyphicon glyphicon-text-background"></span>' +
                    '</span>';
                element.after(el);

                var alertMayus = element.next();
                alertMayus.hide();

                element.bind('keyup', function(e) {
                    //var character = element.val().substr(element.val().length - 1);
                    var character = e.key;

                    if ((character === character.toUpperCase() || character === 'Shift') && character.match(/[a-zA-Z]/i)) {
                        alertMayus.show();
                    } else {
                        alertMayus.hide();
                    }
                });
            }
        };
    }

    /**
     * [onlyNumbers]
     * Permite que sólo se introduzcan números en una caja de Texto
     * @return {[type]} [description]
     * @example
     * <input type="text"  solo-numeros ng-model="mynumber" />
     <input type="text"  solo-numeros ng-model="mynumber"  max-decimal ="3"  />
     >>>>>>>>>>>>>
     max-decimal ="2"//- Restringir el decimal hasta

     */
    /**
     * [existePass description]
     * @return {[type]} [description]
     */
    function isBlank(model) {
        if (typeof model == 'undefined') {
            return true;
        }
        if (typeof model == 'string' && model.length == 0) {
            return true;
        }
        return false;
    };

    /**
     * [validaBanco description]
     * @return {[type]} [description]
     */
    function validaBanco(pass) {
        var _contieneBanco = /(vepormas|bxmas|grupofinanciero|banco)/i.test(pass);
        return _contieneBanco;
    };

    /**
     * [validaConsecutivos description]
     * @return {[type]} [description]
     */
    function validaConsecutivos(pass) {
        var isConsecutivo = false;
        if (typeof pass != 'undefined') {
            var pwd = pass.toLowerCase();
            for (var i = 0; i < pwd.length; i++) {
                if (i > 1) {
                    if (
                        (pwd.charCodeAt(i - 2) == pwd.charCodeAt(i - 1) && pwd.charCodeAt(i - 1) == pwd.charCodeAt(i)) // mas de dos caracteres repetidos
                        ||
                        (pwd.charCodeAt(i - 2) + 1 == pwd.charCodeAt(i - 1) && pwd.charCodeAt(i - 1) + 1 == pwd.charCodeAt(i)) // mas de dos caracteres consecutivos ascendentes
                        ||
                        (pwd.charCodeAt(i - 2) - 1 == pwd.charCodeAt(i - 1) && pwd.charCodeAt(i - 1) - 1 == pwd.charCodeAt(i)) // mas de dos caracteres consecutivos descendentes
                    ) {
                        isConsecutivo = true;
                        break;
                    }
                }
            }
        }
        return isConsecutivo;
    };

    /**
     * [validaNombreUsuario description]
     * @return {[type]} [description]
     */
    function validaNombreUsuario(username, pass) {
        var _contieneNombreUsuario = new RegExp(username, 'i');
        return _contieneNombreUsuario.test(pass);
    };

    function obtenerSlide($parse) {
        return {
            require: 'carousel',
            link: function(scope, element, attrs, carouselCtrl) {
                var fn = $parse(attrs.onCarouselChange);
                var origSelect = carouselCtrl.select;
                carouselCtrl.select = function(nextSlide, direction) {
                    if (nextSlide !== this.currentSlide) {
                        fn(scope, {
                            nextSlide: nextSlide,
                            direction: direction,
                        });
                    }
                    return origSelect.apply(this, arguments);
                };
            }
        };
    }

    function soloNumerosDos() {
        return {
            require: 'ngModel',
            link: function(scope, element, attr, ngModelCtrl) {
                function fromUser(text) {
                    if (text) {
                        var transformedInput = text.replace(/[^0-9]/g, '');

                        if (transformedInput !== text) {
                            ngModelCtrl.$setViewValue(transformedInput);
                            ngModelCtrl.$render();
                        }
                        return transformedInput;
                    } else if (text.length == 0) {
                        return '';
                    }
                    return undefined;
                }

                ngModelCtrl.$parsers.push(fromUser);
            }
        };
    }


    function soloNumeros() {
        return {
            require: 'ngModel',
            link: function(scope, element, attr, ngModelCtrl) {
                function fromUser(text) {
                    if (text) {
                        var transformedInput = text.replace(/[^0-9]/g, '');

                        if (transformedInput !== text) {
                            ngModelCtrl.$setViewValue(transformedInput);
                            ngModelCtrl.$render();
                        }
                        return transformedInput;
                    }
                    return undefined;
                }

                ngModelCtrl.$parsers.push(fromUser);
            }
        };
    }

    function soloTextoDos() {
        return {
            require: 'ngModel',
            link: function(scope, element, attr, ngModelCtrl) {
                function ingreso(texto) {
                    if (texto) {
                        var transformarInput = texto.replace(/[^a-zA-Z0-9]/g, '');

                        if (transformarInput !== texto) {
                            ngModelCtrl.$setViewValue(transformarInput);
                            ngModelCtrl.$render();
                        }
                        return transformarInput;
                    } else if (texto.length == 0) {
                        return '';
                    }
                    return undefined;
                }

                ngModelCtrl.$parsers.push(ingreso);
            }
        };
    }


    function soloTexto() {
        return {
            require: 'ngModel',
            link: function(scope, element, attr, ngModelCtrl) {
                function ingreso(texto) {
                    if (texto) {
                        var transformarInput = texto.replace(/[^a-zA-Z0-9 ]*$/g, '');

                        if (transformarInput !== texto) {
                            ngModelCtrl.$setViewValue(transformarInput);
                            ngModelCtrl.$render();
                        }
                        return transformarInput;
                    }
                    return undefined;
                }

                ngModelCtrl.$parsers.push(ingreso);
            }
        };
    }

    function rfcDos() {
        return {
            require: 'ngModel',
            link: function(scope, element, attr, ngModelCtrl) {
                function ingreso(texto) {
                    if (texto) {
                        var transformarInput = texto.replace(/[^a-zA-Z0-9&]/g, '');

                        if (transformarInput !== texto) {
                            ngModelCtrl.$setViewValue(transformarInput);
                            ngModelCtrl.$render();
                        }
                        return transformarInput;
                    } else if (texto.length == 0) {
                        return '';
                    }
                    return undefined;
                }

                ngModelCtrl.$parsers.push(ingreso);
            }
        };
    }

    /**
     * [isNumber description]
     * @return {Boolean} [description]
     */
    function isNumber() {
        return {
            require: 'ngModel',
            link: function(scope, element, attrs, ngModel) {
                var dd = scope;
                scope.$watch(attrs.ngModel, function(newValue, oldValue) {

                    var arr = String(newValue).split("");
                    if (arr.length === 0) return;
                    if (arr.length === 1 && (arr[0] == '-' || arr[0] === '.')) return;
                    if (arr.length === 2 && newValue === '-.') return;
                    if (isNaN(newValue)) {
                        attrs.ngModel = oldValue;
                    }
                });
            }
        };
    }

    /**
     * [currencyMask]
     * Enmascara un número a formato de miles separados por coma 1,000,000.00
     * @return {[type]} [description]
     * @url https://github.com/ManuelQuiroz/angular-currency-mask/
     * @example
     *
     <input ng-model='amount' type='text' currency-mask decimallimit='7' />
     {{decimallimit}} Indica el número de decimales necesarios
     <br>
     <strong>Monto sin formato:</strong>
     {{amount}}
     <br>
     <strong>Currency Filtered Amount:</strong>
     {{amount | currency}}
     */
    function mascaraMonto() {
        var directive = {
            restrict: 'E',
            require: 'ngModel',
            scope: {
                monto: '=ngModel',
                placeholderTexto: '@placeholder',
                validacion: '@validator',
                ngDisabled: '@ngDisabled',
                readonly: '@ngReadonly'
            },
            // transclude: true,
            template: function(element, attrs) {
                if (!angular.isUndefined(attrs.validator)) {
                    return '<div class="input-group" ng-model="monto" validator="' + attrs.validator + '" name="' + attrs.name + '">' +
                        '<span class="input-group-addon">' +
                        '<i class="fa fa-usd" aria-hidden="true"></i>' +
                        '</span>' +
                        '<input type="text" class="form-control 1" id="monto" ng-readonly="{{readonly}}" ng-disabled="{{ngDisabled}}" ng-model="inputValue" placeholder="{{placeholderTexto}}" maxlength="28" trim />' +
                        '</div>';
                } else {
                    return '<div class="input-group" ng-model="monto" name="' + attrs.name + '">' +
                        '<span class="input-group-addon">' +
                        '<i class="fa fa-usd" aria-hidden="true"></i>' +
                        '</span>' +
                        '<input type="text" class="form-control 2" id="monto"  ng-readonly="{{readonly}}"  ng-model="inputValue" placeholder="{{placeholderTexto}}" maxlength="28" trim />' +
                        '</div>';
                }
            },
            link: function(scope, element, attrs) {
                var cadena = '';
                scope.inputValue = scope.monto;

                scope.$watch('inputValue', function(value, oldValue) {
                    cadena = String(value);

                    /* Si se tienen ceros a la izquierda */
                    while (cadena.charAt(0) == '0') {
                        cadena = cadena.substr(1);
                    }
                    cadena = cadena.replace(/[^\d.\',']/g, '');
                    /* Si se tienen puntos decimales */
                    var puntos = cadena.indexOf(".");
                    if (puntos >= 0) {
                        cadena = cadena.slice(0, (puntos + 3));
                    }
                    /* Dividimos la parte entera de la parte decimal */
                    var enteroDecimal = cadena.split(".");
                    var parteEntera = enteroDecimal[0];
                    var parteDecimal = enteroDecimal[1];

                    /* Validamos que la parte decimal no exceda los 19 digitos */
                    if (parteEntera.replaceAll(',', '').length > 19) {
                        parteEntera = parteEntera.slice(0, -1);
                    }


                    parteEntera = parteEntera.replace(/[^\d]/g, '');
                    /* Dividimos la parte entera con comas (,) cada 3 digitos de derecha a izquierda */
                    if (parteEntera.length > 3) {
                        var dividirEnteros = Math.floor(parteEntera.length / 3);
                        while (dividirEnteros > 0) {
                            var ultimaComa = parteEntera.indexOf(",");
                            if (ultimaComa < 0) {
                                ultimaComa = parteEntera.length;
                            }

                            if ((ultimaComa - 3) > 0) {
                                parteEntera = parteEntera.splice((ultimaComa - 3), 0, ",");
                            }
                            dividirEnteros--;
                        }
                    }

                    /* Incluimos el punto a la parte decimal */
                    if (angular.isUndefined(parteDecimal)) {
                        parteDecimal = "";
                    } else {
                        parteDecimal = "." + parteDecimal;
                    }

                    parteDecimal = parteDecimal.replaceAll(',', '');

                    scope.inputValue = parteEntera + parteDecimal;
                    /* Agregamos el monto con la mascara al scope de presentación */
                    scope.monto = scope.inputValue.replaceAll(',', '');
                    /* Agregamos el monto sin comas al scope de transacción */
                });
            }
        };

        return directive;
    }

    function currencyMask() {
        return {
            restrict: 'A',
            require: 'ngModel',
            scope: {
                decimallimit: '='
            },
            link: function(scope, element, attrs, ngModelController) {
                // Run formatting on keyup
                var numberWithCommas = function(value, addExtraZero) {
                    if (addExtraZero === undefined) {
                        addExtraZero = false;
                    }
                    value = value.toString();
                    value = value.replace(/[^0-9\.]/g, '');
                    var parts = value.split('.');
                    parts[0] = parts[0].replace(/\d{1,3}(?=(\d{3})+(?!\d))/g, '$&,');
                    if (parts[1] && parts[1].length > scope.decimallimit) {
                        parts[1] = parts[1].substring(0, scope.decimallimit);
                    }
                    if (addExtraZero && parts[1] && (parts[1].length === 1)) {
                        parts[1] = parts[1] + '0';
                    }
                    return parts.join('.');
                };
                var applyFormatting = function() {
                    var value = element.val();
                    var original = value;
                    if (!value || value.length === 0) {
                        return;
                    }
                    value = numberWithCommas(value, true);
                    if (value !== original) {
                        element.val(value);
                        element.triggerHandler('input');
                    }
                };
                element.bind('keyup', function(e) {
                    var keycode = e.keyCode;
                    var isTextInputKey = (keycode > 47 && keycode < 58) || // number keys
                        keycode === 32 || keycode === 8 || // spacebar or backspace
                        (keycode > 64 && keycode < 91) || // letter keys
                        (keycode > 95 && keycode < 112) || // numpad keys
                        (keycode > 185 && keycode < 193) || // ;=,-./` (in order)
                        (keycode > 218 && keycode < 223) || // [\]' (in order)
                        keycode === 226; // <> keys

                    if (isTextInputKey) {
                        applyFormatting();
                    }
                });
                ngModelController.$parsers.push(function(value) {
                    if (!value || value.length === 0) {
                        return value;
                    }
                    value = value.toString();
                    value = value.replace(/[^0-9\.]/g, '');
                    return value;
                });
                ngModelController.$formatters.push(function(value) {
                    if (!value || value.length === 0) {
                        return value;
                    }
                    value = numberWithCommas(value, true);
                    return value;
                });
            }
        };
    }

    function maskcero() {
        return {
            scope: { longitumaxima: "=" },
            required: "ngModel",
            restrict: 'A',
            link: function(scope, element, attrs, ngModelController) {
                ngModelController.$parsers.push(function(value) {
                    var num = parseInt(value, 10);
                    scope.longitudmaxima = parseInt(scope.longitudmaxima, 10);
                    if (isNaN(num) || isNaN(scope.longitudmaxima)) {
                        return value;
                    }
                    num = '' + num;
                    while (num.length < scope.longitudmaxima) {
                        num = '0' + num;
                    }
                    return value;
                });
                ngModelController.$formatters.push(function(value) {
                    return value;
                });
            }
        };
    }

    /**
     * [tabIndicator description]
     * @return {[type]} [description]
     */
    function tabIndicator() {
        var directive = {
            restrict: 'E',
            replace: true,
            scope: {
                numTabs: '=numtabs',
                tabActive: '@tabactive'
            },
            templateUrl: 'modules/core/views/elements/panel-tab.html',
            controller: ['$scope', '$rootScope', function($scope, $rootScope) {}],
            link: function(scope, element, attrs) {
                scope.getNumber = function(num) {
                    return new Array(num);
                };
            }
        };
        return directive;
    }

    /**
     * [progressIndicator description]
     * @return {[type]} [description]
     */
    function progressIndicator() {
        var directive = {
            restrict: 'E',
            replace: true,
            scope: {
                numSteps: '=numstep',
                stepActive: '@stepactive'
            },
            templateUrl: 'modules/core/views/elements/panel-indicator.html',
            controller: ['$scope', '$rootScope', function($scope, $rootScope) {}],
            link: function(scope, element, attrs) {
                scope.getNumber = function(num) {
                    return new Array(num);
                };
            }
        };
        return directive;
    }

    /**
     * [timerCountdown description]
     * @param  {[type]} Util      [description]
     * @param  {[type]} $interval [description]
     * @return {[type]}           [description]
     */
    function timerCountdown(Util, $interval) {
        var directive = {
            restrict: 'A',
            scope: {
                date: '@'
            },
            controller: ['$scope', '$rootScope', function($scope, $rootScope) {}],
            link: function(scope, element) {
                var future;
                future = new Date(scope.date);
                $interval(function() {
                    var diff;
                    diff = Math.floor((future.getTime() - new Date().getTime()) / 1000);
                    return element.text(Util.dhms(diff));
                }, 1000);
            }
        };
        return directive;
    }

    /**
     * [scrollToItem description]
     * @return {[type]} [description]
     */
    function scrollToItem() {
        var directive = {
            restrict: 'A',
            scope: {
                scrollTo: '@'
            },
            link: function(scope, $elm, attr) {
                $elm.on('click', function() {
                    $('html,body').animate({
                        scrollTop: $(scope.scrollTo).offset().top
                    }, 'slow');
                });
            }
        };
        return directive;
    }

    /**
     * [checkStrength description]
     * @return {[type]} [description]
     */
    function checkStrength() {

        return {
            replace: false,
            transclude: false,
            restrict: 'A',
            scope: {
                checkStrength: "=",
                userPrincipalName: "@",
                actualPass: "=?"
            },
            link: function(scope, iElement, iAttrs) {

                var strength = {
                    colors: ['#F00', '#F00', '#FF0', '#FF0', '#c3d500'],
                    mesureStrength: function(p, // nuevo password
                        q, // USERNAME
                        r // password actual
                    ) {

                        var _force = 0;

                        if (!isBlank(r) && !isBlank(p) && r == p) {
                            // rojo fase 2, es decir casi amarilla
                            _force = 2;
                            return _force;
                        }

                        if (validaBanco(p) || validaConsecutivos(p) || validaNombreUsuario(q, p)) {
                            // rojo fase 2, es decir casi amarilla
                            _force = 2;
                            return _force;
                        }

                        var _lowerLetters = (p.match(/[a-z]/g) || []).length;
                        var _upperLetters = (p.match(/[A-Z]/g) || []).length;
                        var _numbers = (p.match(/[0-9]/g) || []).length;

                        var _flags = [_lowerLetters, _upperLetters, _numbers];
                        var _passedMatches = $.grep(_flags, function(item) {
                            return item > 0;
                        }).length;

                        if (_passedMatches == 3 && p.length >= 8) {
                            // puede ser amarilla o verde
                            if (_lowerLetters > 1 && _upperLetters > 1 && _numbers > 1 && p.length > 8) {
                                // es verde, seguridad máxima
                                _force = 5;
                            } else {
                                // es amarilla
                                if (p.length == 8 && _lowerLetters > 1) {
                                    // seguridad media, amarilla mínima
                                    _force = 3;
                                } else {
                                    // seguridad media avanzada, amarilla máxima
                                    _force = 4;
                                }
                            }
                        } else {
                            // es roja
                            if (p.length >= 6 && _passedMatches == 2) {
                                // rojo fase 2, es decir casi amarilla
                                _force = 2;
                            } else {
                                // rojo fase 1, muy debil
                                _force = 1;
                            }
                        }

                        return _force;

                    },
                    getColor: function(s) {
                        var idx = s;

                        /**
                         idx = 1; // a partir de 0: rojo
                         idx = 2; // todavia rojo
                         idx = 3; // a partir de xx: amarillo
                         idx = 4; // todavia amarillo
                         idx = 5; // a partir de xx: verde
                         **/

                        return { idx: idx, col: this.colors[idx - 1] };

                    }
                };

                scope.$watchGroup(["checkStrength", "actualPass"], function(newValues, oldValues) {

                    if (isBlank(scope.checkStrength)) {
                        iElement.css({ "display": "none" });
                    } else {
                        var c = strength.getColor(
                            strength.mesureStrength(scope.checkStrength, scope.userPrincipalName, scope.actualPass)
                        );
                        iElement.css({ "display": "inline" });
                        iElement.children('li')
                            .css({ "background": "#DDD" })
                            .slice(0, c.idx)
                            .css({ "background": c.col });
                    }

                });

            },
            template: '<li class="point"></li>' +
                '<li class="point"></li>' +
                '<li class="point"></li>' +
                '<li class="point"></li>' +
                '<li class="point"></li>'
        };
    }

    /**
     * [trim]
     * Elimina espacios de la cadena al introducir caracteres en el campo
     * @return {[type]} [description]
     */
    function trim() {
        var directive = {
            link: function(scope, element, attrs) {
                // element.on('input keyup paste', function(event) {
                element.on('keyup paste', function(event) {
                    var temp1 = element[0].selectionStart,
                        temp2 = element[0].selectionEnd;
                    if (element.val()[0] === ' ') {
                        temp1 = temp2 = 0;
                    }
                    element.val(element.val().trim());
                    element[0].selectionStart = temp1;
                    element[0].selectionEnd = temp2;
                });
            }
        };
        return directive;
    }

    /**
     * [noCopyPaste]
     * Evita que se copie y pegue información en un cuadro de texto
     * @return {[type]} [description]
     *
     */
    function noCopyPaste() {
        var directive = {
            //scope: {},
            controller: ['$scope', '$rootScope', function($scope, $rootScope) {}],
            link: function(scope, element, attrs) {
                element.on('cut copy paste', function(event) {
                    event.preventDefault();
                });
            }
        };
        return directive;
    }

    /**
     * [mascaraNoCuenta description]
     * @param   {[type]} $filter [description]
     * @return  {[type]}         [description]
     * @example <mascara-NoCuenta placeholder="numero" ng-model='myModel.accountnumber'></mascara-NoCuenta>
     *
     */
    function mascaraNoCuenta($filter) {
        var directive = {
            restrict: 'E',
            scope: {},
            transclude: true,
            template: '<input ng-model="inputValue" ng-disabled="{{ngDisabled}}" type="noCuenta" class="form-control" placeholder="{{numeroCuentaPlaceholder}}" title="Número de cuenta (Formato: (9999 9999 9999 9999)">',
            link: function(scope, $elm, attr) {
                scope.inputValue = scope.accountnumberModel;
                scope.$watch('inputValue', function(value, oldValue) {
                    value = String(value);
                    var number = value.replace(/[^0-9]+/g, '');
                    scope.accountnumberModel = number;
                    scope.inputValue = $filter('accountnumber')(number);
                });
            }
        };
        return directive;
    }

    function validaMailBanca() {
        return {
            require: 'ngModel',
            link: function(scope, element, attr, ngModelCtrl) {
                function ingreso(texto) {
                    if (texto) {
                        var transformarInput = texto.replace(/[^a-zA-Z0-9.@_\-]/g, '');

                        if (transformarInput !== texto) {
                            ngModelCtrl.$setViewValue(transformarInput);
                            ngModelCtrl.$render();
                        }
                        return transformarInput;
                    } else if (texto.length == 0) {
                        return '';
                    }
                    return undefined;
                }

                ngModelCtrl.$parsers.push(ingreso);
            }
        };
    }


    /**
     * [mascaraTelefono description]
     * @param  {[type]} $filter [description]
     * @return {[type]}         [description]
     * @example
     * <mascara-telefono placeholder="numero" ng-model='myModel.phonenumber'></mascara-telefono>
     */
    function mascaraTelefono($filter) {
        var directive = {
            restrict: 'E',
            scope: {
                phonenumberPlaceholder: '@placeholder',
                phonenumberModel: '=ngModel',
                ngChange: '&',
                ngDisabled: '@ngDisabled'
            },
            transclude: true,
            //template: '<input name="telefonoDirective" ng-model="phonenumberModel" ng-disabled="{{ngDisabled}}"  type="tel" class="form-control" placeholder="{{phonenumberPlaceholder}}" title="Número de teléfono (Formato: (999) 999-9999)" trim>',
            template: '<input ng-model="inputValue" ng-disabled="{{ngDisabled}}" ng-model="ngModel" type="tel" class="form-control" placeholder="{{phonenumberPlaceholder}}" title="Número de teléfono (Formato: (999) 999-9999)">',

            link: function(scope, $elm, attr) {

                scope.inputValue = scope.phonenumberModel;

                scope.$watch('inputValue', function(value, oldValue) {

                    value = String(value);
                    var number = value.replace(/[^0-9]+/g, '');
                    scope.phonenumberModel = number;
                    scope.inputValue = $filter('phonenumber')(number);
                    scope.ngChange();
                });
            }
        };
        return directive;
    }


    function formatoMoneda($filter) {
        return {
            require: '?ngModel',
            link: function(scope, elem, attrs, ctrl) {
                if (!ctrl) return;

                ctrl.$formatters.unshift(function(a) {
                    return $filter(attrs.format)(ctrl.$modelValue, '')
                });

                elem.bind('blur', function(event) {
                    var plainNumber = elem.val().replace(/[^\d|\-+|\.+]/g, '');
                    elem.val($filter(attrs.format)(plainNumber, ''));
                });

                elem.bind('focus', function(event) {
                    var plainNumber = elem.val().replace(/[\,]/g, '');
                    elem.val(plainNumber);
                });
            }
        };
    }

    function capsLockFixed($compile) {
        return {
            restrict: 'A',
            scope: true,
            link: function(scope, element) {
                var CAPS_LOCK = 20;

                var IMAGE_ADDON =
                    '<div id="imgAddOn" class="capslock abscont">' +
                    '<div class="capslock relcont">' +
                    '<img id="imgCapsLock" src="assets/images/capslock.png" height="20">' +
                    '</div>' +
                    '</div>';

                var GROUP_ADDON =
                    '<span id="addOnCapsLock" class="input-group-addon">' +
                    '<img src="assets/images/capslock.png" height="20">' +
                    '</span>';

                var FIXED_POPUP =
                    '<div id="capsLockFixed" class="aviso"">' +
                    '<img class="icono" src="assets/images/capslock.png" />' +
                    '<label class="mensaje">Mayúsculas activadas</label>' +
                    '</div>';

                var iniCapsLockFIxed = function() {
                    if ($('#capsLockFixed').length === 0) {
                        $('body').append(FIXED_POPUP);
                    }

                    $('#capsLockFixed').hide();
                }

                var iniGroupAndImageAddon = function() {
                    if (element.parent().hasClass('input-group')) {
                        element.after(GROUP_ADDON);
                        element.next('#addOnCapsLock').hide();
                    } else {
                        element.after(IMAGE_ADDON);
                        element.next('#imgAddOn').find('#imgCapsLock').hide();
                    }
                };

                var toggleFixedPopUp = function(showHide) {
                    if (showHide) {
                        $('#capsLockFixed').fadeIn(500);
                        element.next('#addOnCapsLock').show();
                        element.next('#imgAddOn').find('#imgCapsLock').show();
                    } else {
                        $('#capsLockFixed').fadeOut(500);
                        element.next('#addOnCapsLock').hide();
                        element.next('#imgAddOn').find('#imgCapsLock').hide();
                    }
                }

                iniCapsLockFIxed();
                iniGroupAndImageAddon();

                element.bind('keydown', function(e) {
                    if (e.which === CAPS_LOCK) {
                        toggleFixedPopUp(event.getModifierState('CapsLock'));
                    }
                });

                element.bind('keypress', function(e) {
                    var flag = e.key.match(/[A-ZÑ]/) !== null;
                    toggleFixedPopUp(flag);
                });

                element.bind('blur', function() { toggleFixedPopUp(false); });

                scope.$on('$destroy', function() {
                    $('#capsLockFixed').remove();
                });
            }
        }
    }

})();

String.prototype.splice = function(idx, rem, s) {
    return (this.slice(0, idx) + s + this.slice(idx + Math.abs(rem)));
};

String.prototype.replaceAll = function(find, replace) {
    var str = this;
    return str.replace(new RegExp(find.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'), replace);
};