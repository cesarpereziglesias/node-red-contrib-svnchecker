module.exports = function(RED) {

    var svn = require("./svn");

    function SVNCheckerNode(config) {
        RED.nodes.createNode(this,config);
        this.config = {
            name: config.name,
            url: config.urlrepo,
            refresh: config.refresh,
            username: config.username,
            password: config.password
        };
        var node = this;

        node.lastCheckDate = new Date();

        node.intervalId = setInterval(function() {
            svn.logFromDate(node.config.url, {username: node.config.username, password: node.config.password}, node.lastCheckDate).then(function(result) {
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
            node.lastCheckDate = new Date();
        }, node.config.refresh * 60 * 1000);


    }
    RED.nodes.registerType("svnchecker", SVNCheckerNode);

    SVNCheckerNode.prototype.close = function() {
        // Remove interval when node is stopped
        if (this.intervalId != null) {
            clearInterval(this.intervalId);
        }
    };

}
