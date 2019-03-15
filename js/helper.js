var cli = require('cli');
var fs = require('fs');
var helper = {};

//Helper methods
//get the source path based on sync direction
helper.getSource = function( syncDirection, remoteServer, config ){
  if( syncDirection === 'up' ){
    return '.';
  }else if ( syncDirection === 'down') {
    return config.servers[remoteServer].host + ':' + config.servers[remoteServer].path + '/';
  }
}

//get the destination path based on sync direction
helper.getDestination = function( syncDirection, remoteServer, config ){
  if( syncDirection === 'up' ){
    return config.servers[remoteServer].host + ':' + config.servers[remoteServer].path;
  }else if ( syncDirection === 'down') {
    return '.';
  }
}

//merge the global exlucdes with the server specific excludes
helper.getExludes = function( remoteServer, config ){
  return config.excludeGlobal.concat(config.servers[remoteServer].exclude);
}

//get the size(length) of an object
helper.Objectsize = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

//Output info messages as rsync runs
helper.stdoutFunc = function(data){
  cli.info(data);
}

//Output error messages as rsync runs
helper.stderrFunc = function(data){
  cli.error(data);
}

//simple fatal error handler
helper.onErr = function(err) {
  console.fatal(err);
}

/**
 * initializes a new .projectsync.js file
 * @method function
 * @return {null} will add the file to the current directory
 */
helper.init = function(){
  //check if file exists
  try {
    fs.accessSync( './.projectsync.js', fs.F_OK);

    //file already exists
    cli.fatal(".projectsync.js already exists.");

  } catch (e) {
    //create file
    fs.writeFile( './.projectsync.js', helper.skeleton(), function(err) {
        if(err) {
            return cli.fatal(err);
        }

        cli.ok("New .projectsync.js started.");
        return;
    });
  }
}

helper.skeleton = function(){
  return JSON.stringify({
    "servers": {
      "prod": {
        "host": "ADD_YOUR_PROD_USER@HOST_HERE",
        "path": "ADD_YOUR_FULL_FILE_PATH_HERE",
        "exclude": [],
        "delete": false
      },
      "dev": {
        "host": "ADD_YOUR_DEV_USER@HOST_HERE",
        "path": "ADD_YOUR_FULL_FILE_PATH_HERE",
        "exclude": [],
        "delete": false
      }
    },
    "excludeGlobal": [
      ".projectsync.js",
      ".git"
    ]
  }, null, 2);
}

module.exports = helper;
