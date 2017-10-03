(function(module) {
    'use strict';

    var util = require('util'),
        exec = require( 'child_process' ).exec,
        parseXMLString = require('xml2js').parseString,
        Promise = require("bluebird");

    var __execute = function(cmd) {
        return new Promise(function(resolve, reject) {
            exec(cmd, function(err, stdout, stderr) {
                if (err) {
                    reject(stderr);
                }
                else {
                    resolve(stdout);
                }
            });
        });
    };

    var __parseOptions = function(options) {
        var params = [];
        Object.keys(options).forEach(function(key) {
            params.push("--"+key);
            params.push(options[key])
        });
        return params;
    };

    var __mapLogEntryXMLToJson = function(logEntry) {
        return {
            date: new Date(logEntry["date"][0]),
            message: logEntry["msg"][0]
        };
    };

    var svn = {
        log : function(repo, options) {
            return new Promise(function (resolve, reject) {
                var params = __parseOptions(options),
                    cmd = util.format("svn log %s %s", repo, params.join(" "));

                __execute(cmd).then(function(result) {
                    parseXMLString(result, function(err, xmlParsed) {
                        if (err) {
                            reject("Error parsing response");
                        }
                        else {
                            if (typeof xmlParsed["log"] === "object") {
                                resolve(xmlParsed["log"]["logentry"].map(__mapLogEntryXMLToJson));
                            }
                            else {
                                resolve([]);
                            }
                        }
                    });
                });
            });
        },

        logFromDate: function(repo, options, date) {

            var self = this,
                _options = Object.assign({}, options);

            _options["xml"] = "";
            _options["revision"] = util.format("{%s}:{2999-12-31}", date.toISOString())

            return new Promise(function (resolve, reject) {
                self.log(repo, _options)
                    .then(function(result) {
                        resolve(result.filter( (x) => x.date >= date) );
                    }, reject);
            });
        }
    };

    module.exports = svn;

})(module);
