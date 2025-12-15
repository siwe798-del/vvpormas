// https://tc39.github.io/ecma262/#sec-array.prototype.includes
if (!Array.prototype.includes) {
    Object.defineProperty(Array.prototype, 'includes', {
      value: function(searchElement, fromIndex) {
  
        if (this == null) {
          throw new TypeError('"this" es null o no está definido');
        }
  
        // 1. Dejar que O sea ? ToObject(this value).
        var o = Object(this);
  
        // 2. Dejar que len sea ? ToLength(? Get(O, "length")).
        var len = o.length >>> 0;
  
        // 3. Si len es 0, devuelve false.
        if (len === 0) {
          return false;
        }
  
        // 4. Dejar que n sea ? ToInteger(fromIndex).
        //    (Si fromIndex no está definido, este paso produce el valor 0.)
        var n = fromIndex | 0;
  
        // 5. Si n ≥ 0, entonces
        //  a. Dejar que k sea n.
        // 6. Else n < 0,
        //  a. Dejar que k sea len + n.
        //  b. Si k < 0, Dejar que k sea 0.
        var k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);
  
        function sameValueZero(x, y) {
          return x === y || (typeof x === 'number' && typeof y === 'number' && isNaN(x) && isNaN(y));
        }
  
        // 7. Repite, mientras k < len
        while (k < len) {
          // a. Dejar que elementK sea el resultado de ? Get(O, ! ToString(k)).
          // b. Si SameValueZero(searchElement, elementK) es true, devuelve true.
          if (sameValueZero(o[k], searchElement)) {
            return true;
          }
          // c. Incrementa k por 1.
          k++;
        }
  
        // 8. Devuelve false
        return false;
      }
    });
  }