#! /usr/bin/env node

/*Require the rsync node library*/
var path = require('path');
var cli = require('cli');
var Rsync = require('rsync');
var prompt = require('prompt');
var fs = require('fs');
var helper = require('./js/helper');
var cmd,
    userArgs,
    remoteServer,
    syncDirection,
    config;

/**
 *
 * Extract the args
 * --Expecting 1
 *
 *
 */
userArgs = process.argv.slice(2);

//the remote server to sync
//may also return init here to start new sync file
remoteServer = userArgs[0];

//if init - do init
if( remoteServer === "init" ){
  //do the init function
  helper.init();

  //stop
  return false;
}

//the sync direction
syncDirection = userArgs[1];

//Some quick error checking on the args
if( syncDirection !== "up" && syncDirection !== "down" ){
  cli.fatal(
    'Please specifiy a sync direction!' +
    '\n' +
    'Acceptable arguments include: up, down'
  );
}

//More error checking, make sure there is a config file
//in the current directory - .projectsync.js
//and check if that server is specified in the config file
fs.readFile(path.resolve(process.cwd(), '.projectsync.js'), 'utf8', function(err, data){
  if(err){
    cli.fatal(
      'Your .projectsync.js file does not exist in the current working directory.\n' +
      'Please make sure your command line is located at the root of your site and that your .projectsync.js file exists.\n' +
      err
    );
  }else if (data) {
    config = require(path.resolve(process.cwd(), '.projectsync.js'));
    if(
      config.servers[remoteServer] !== undefined &&
      typeof config.servers[remoteServer] === 'object' &&
      helper.Objectsize(config.servers[remoteServer]) > 1
    ){
      cli.info(".projectsync.js file found, preparing rsync.");
      doRsync();
    }else{
      cli.fatal("Remote server named '"+ remoteServer +"' does not exist in your .projectsync.js.");
    }
    return false;
  }else {
    cli.fatal('Sync failed to complete!');
  }
});

//Check if the deployTo argument exists in the config

//the rsync method
doRsync = function(){
  cmd = Rsync.build({
      'flags': ['c', 'h', 'a', 'v', 'z', 'progress', 'n', 'stats'],
      'shell': 'ssh',
      'source': helper.getSource( syncDirection, remoteServer, config ),
      'destination': helper.getDestination( syncDirection, remoteServer, config ),
      'output': [helper.stdoutFunc, helper.stderrFunc],
      'exclude': helper.getExludes( remoteServer, config )
  });

  //set the delete flag if necessary
  if( config.servers[remoteServer].delete )
    cmd.set('delete', true);

  //do a dry run
  cmd.execute(function(error, code, command) {
      if(error){
        cli.fatal('The dry run failed: ' + error);
      }

      //let user know dry run complete and they need to choose to continue
      cli.info('Dry run complete. See output above and choose to continue with sync: [yes]');

      //display a continue prompt
      prompt.start();
      prompt.get(['continue'], function (err, result) {
        if(err){
          helper.onErr(err);
        }

        //if user doesn't choose to continue
        if( result.continue !== 'yes' ){
            cli.info('Rsync stopped.');
            return false;
        }

        //remove the dry run flag
        cmd.flags(['n'], false);

        //execute another sync
        cmd.execute(function(error, code, cmd) {
            if(error){
              cli.fatal('The live run failed: ' + error);
            }
            cli.ok('Rsync Complete!');
            return true;
        });
      });
  });
}
