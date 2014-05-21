/**
 * @module Jst
 */
/*global exports, require, java, sync, builtin */

(function () {
//    "use strict";

    var File = require('File'),
        rhino = require('builtin/rhino');

    /**
     */
    var Jst = {
        /**
         * Compile JST source to JavaScript source.
         *
         * @method compile
         * @param {string} s source code to compile
         * @returns {string} compiled source code (as JavaScript)
         */
        compile: function (s) {
            var script = "",
                out = '',
                ndx = 0,
                delim = null,
                len = s.length;

            while (ndx < len) {
                switch (s[ndx]) {
                    case '/':
                        if (!delim) {
                            if (s[ndx + 1] === '*') {
                                ndx += 2;
                                while (s[ndx] && s[ndx] !== '/' && s[ndx + 1] !== '*') {
                                    ndx++;
                                }
                                ndx += 2;
                            }
                            else if (s[ndx + 1] === '/') {
                                ndx += 2;
                                while (s[ndx] && s[ndx] !== '\n') {
                                    ndx++;
                                }
                                ndx++;
                            }
                            else {
                                out += s[ndx++];
                            }
                        }
                        else {
                            out += s[ndx++];
                        }
                        break;
                    case '"':
                        if (delim === '"') {
                            delim = null;
                        }
                        else {
                            if (!delim) {
                                delim = '"';
                            }
                        }
                        out += s[ndx++];
                        break;
                    case '<':
                        if (s[ndx + 1] === '%') {
                            ndx += 2;
                            while (s[ndx] && (s[ndx] === ' ' || s[ndx] === '\t')) {
                                ndx++;
                            }
                            if (s[ndx] === '=') {
                                if (out.replace(/\s/g, '').length) {
                                    script += "print('" + out + "');\n";
                                    out = '';
                                }
                                script += "print(";
                                ndx++;
                                while (s[ndx] && !(s[ndx] === '%' && s[ndx + 1] === '>')) {
                                    script += s[ndx++];
                                }
                                script += ');\n';
                                ndx += 2;
                                var blanks = '';
                                while (s[ndx] === ' ') {
                                    blanks += ' ';
                                    ndx++;
                                }
                                if (blanks.length) {
                                    script += 'print("' + blanks + '");\n';
                                }
                            }
                            else {
                                if (out.replace(/\s/g, '').length) {
                                    script += "println('" + out + "');\n";
                                    out = '';
                                }
                                while (s[ndx] && !(s[ndx] === '%' && s[ndx + 1] === '>')) {
                                    script += s[ndx++];
                                }
                                ndx += 2;
                                script += '\n';
                            }
                        }
                        else {
                            out += s[ndx++];
                        }
                        break;
                    case "'":
                        out += "\\'";
                        ndx++;
                        break;
                    case '\n':
                        if (out.replace(/\s/g, '').length) {
                            script += "println('" + out + "');\n";
                        }
                        out = '';
                        ndx++;
                        break;
                    default:
                        out += s[ndx++];
                        break;
                }
            }
            if (out.replace(/\s/g, '').length) {
                script += "println('" + out + "');\n";
            }
            return script;
        },

        /**
         * Execute an already compiled JST template
         *
         * @method execCompiled
         * @param {String} s string to append template output
         * @param {String} fn filename of source JST template
         * @param {Object} o Object to use as global object during execution of Jst
         * @returns {String} result of template execution (typically HTML)
         */
        execCompiled: function (s, fn, o) {
            o.r = o.r || '';
            o.output = o.output || '';
            o.write = o.write || function (s) {
                java.lang.System.out.print(s); // console.log(s);
            };
            decaf.extend(o, {
                print  : function (s) {
                    s = '' + s;
                    var len = s.length,
                        n;
                    for (n = 0; n < len; n++) {
                        o.output += s[n];
                        if (s[n] === '\n') {
                            this.write(o.output);
                            o.output = '';
                        }
                    }
                },
                println: function (s) {
                    this.print(s + '\n');
                }
            });

            var scope = rhino.getScope(o);
            rhino.runScript(s, fn, 0, scope);
            var ret = scope.r;
            rhino.releaseScope(scope);
            return ret;
        },

        /**
         * Load and execute a JST template
         *
         * @method exec
         * @param {string} fn name of file to load and execute
         * @param {Object} o object to use as global object during execution
         * @returns {String} result of template execution (typically HTML)
         */
        exec: function (fn, o) {
            return this.execCompiled(this.compile(new File(fn).readAll()), fn, o);
        }
    };

    decaf.extend(exports, {
        Jst: Jst
    });

}());
