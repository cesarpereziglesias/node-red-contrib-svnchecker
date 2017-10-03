module.exports = function(RED) {

    var svn = require("./svn"),
        intervalId = null;

    function SVNCheckerNode(config) {
        RED.nodes.createNode(this,config);
        this.config = {
            name: config.name,
            url: config.urlrepo,
            refresh: config.refresh,
            username: config.username,
            password: config.password
        };
        var node = this,
            lastCheckDate = new Date();

        intervalId = setInterval(function() {
            svn.logFromDate(node.config.url, {username: node.config.username, password: node.config.password}, lastCheckDate).then(function(result) {
                    if (result.length > 0) {
                        node.send({
                            payload: {
                                project: node.config.name,
                                log: result
                            }
                        });
                    }
                }, function(error) {
                    console.log(error);
                });
            lastCheckDate = new Date();
        }, node.config.refresh * 60 * 1000);


        /**
         * Remove interval when node is stopped
         */
        this.on('close', function (done) {
            clearInterval(intervalId);
            done();
        });
    }
    RED.nodes.registerType("svnchecker", SVNCheckerNode);

}
