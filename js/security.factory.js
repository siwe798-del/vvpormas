(function () {
    'use strict';
    angular.module('app.module.core')
        .factory('httpRequestInterceptor', httpRequestInterceptor)
        .factory('reviewXTokenID', reviewXTokenID)
        .factory('reviewRsaHeaders', reviewRsaHeaders)

    /**
     * [wsNoToken]
     */
    function wsNoToken(wsCat) {
        var clear = false,
            cleanS = ["loginwb05", "lvuwb03", "lvncwb01", "lvuwb01", "loginwb11", "loginms01"];
        if (cleanS.indexOf(wsCat) != -1) {
            clear = true;
        }
        return clear;
    }

    /**
    * [reviewXTokenID]
    * Exist Review TokenID in HEADERs 
    */
    function reviewXTokenID() {
        var factReview = {}
        factReview.exist = function (response) {
            var exist = false;
            if (response) {
                exist = true;
                factReview.setResponse(response)
            }
            return exist;
        }
        factReview.setResponse = function (response) {
            var xToken = response.X_TOKEN_ID
            return xToken;
        }
        return factReview;
    }

    reviewRsaHeaders.$inject = ['$injector'];
    function reviewRsaHeaders($injector) {
        var rsaFactory = {};
        rsaFactory.addRsaHeaders = function(config) {
            if (config.url.indexOf('/loginwb05') != -1 && config.method == "POST") {
                var moreHeaders = {
                    "Device-Print-Rsa": encode_deviceprint(),
                    "Geo-Location-Rsa": getGeolocationStruct(),
                    "Geo-Location-Rsa-Custom" : localStorage.getItem('GeoLocationInfo')
                }
                config.headers = angular.extend(config.headers, moreHeaders);
                //localStorage.removeItem('GeoLocationInfo');
            }

            return config;
        }
        rsaFactory.getRSAToken = function() {
            var rsa_xtoken = localStorage.getItem('x-token');
            return rsa_xtoken && rsa_xtoken != "null" && rsa_xtoken != "" ? rsa_xtoken: $injector.get('paramsFixed').session().idSesion;
        }
        return rsaFactory;
    }

    /**
    * [httpRequestInterceptor description]
    * @param  {[type]} $q  [description]
    */
    httpRequestInterceptor.$inject = ['paramsFixed', '$q', 'reviewXTokenID', 'reviewRsaHeaders'];
    function httpRequestInterceptor(paramsFixed, $q, reviewXTokenID, reviewRsaHeaders) {
        return {
            request: function (config) {

                var wsCat = config.url.substr(config.url.lastIndexOf('/') + 1);
                if (wsNoToken(wsCat) && (localStorage['x-token'] !== null)){localStorage.removeItem('x-token'); }

                config = reviewRsaHeaders.addRsaHeaders(config); //ENRICH HEADERS WITH RSA DATA
                config.headers['Content-Type'] = 'application/json';
                config.headers['X_TOKEN_ID'] = reviewXTokenID.exist() ? reviewXTokenID.setResponse() : reviewRsaHeaders.getRSAToken();
                config.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains';
                config.headers['Geo-Location-Rsa'] = getGeolocationStruct(); 

                if (config.headers.clearForceChache === true) {
                    config.headers["Cache-Control"] = "no-cache, no-store, private, max-age=0";
                    config.headers['Pragma'] = 'no-cache';
                    config.headers['Expires'] = new Date();
                    config.cached = false
                }
   
                return config;
            }, response: function (response) {
                var defered = $q.defer(),
                    promise = defered.promise;
                    
               
                if (response.config.method == 'POST') {
                    reviewXTokenID.exist(response.config.headers)
                    if (response.config.headers.X_TOKEN_ID) { localStorage.setItem('x-token', response.config.headers.X_TOKEN_ID) }
                }
                defered.resolve(response);
                return promise;
            },
            responseError: function (responseErro) {
                
                return $q.reject(responseErro);
            }
        };
    }
    /****** Fin del archivo ****/
})();