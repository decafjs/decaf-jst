/**
 * @module Jst
 * @main
 */
/*global require, include, exports */

(function() {

    var Jst = require('lib/Jst').Jst;

    include.paths.push('./jst');
    require.paths.push('./jst');
    require.extensions.jst = include.extensions.jst = function(fn) {
        return Jst.exec(fn, {
            r: '',
            inject : function(fn) {
                Jst.exec(fn, this);
            }
        });
    };

    decaf.extend(exports, {
        Jst : Jst
    });
}());
