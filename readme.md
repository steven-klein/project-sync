# project-sync

An rsync tool for pushing and pulling files from a remote servers via the command line.  It makes simple rsync deployments easy.

## Install

Use the following commands to install this command line tool globally.

```
npm install -g project-sync
```

## Configuration

To use these commands you'll need a sync configuration file name **project-sync.json** located in your projects root directory.

You can set multiple servers to push and pull from.  At least one server is required.

Use the excludeGlobal option to set an array of exclusions that are used for all servers, and optionally set additional exclusions for individual servers.

**Sample project-sync.json file**

```
{
  "servers": {
    "prod": {
      "host": "some_user@example.com",
      "path": "/var/www/vhosts/example.com/projectFolder",
      "exclude": [
        ".env"
      ],
      "delete": true
    },
    "dev": {
      "host": "dev_user@example-dev.com",
      "path": "/var/www/example-dev.com/projectFolder",
      "exclude": [],
      "delete": false
    }
  },
  "excludeGlobal": [
    "node_modules",
    ".DS-Store",
    ".git"
  ]
}
```

## Usage

There is only one command with two required arguments [server, sync direction].  This command must be run from your projects root directory where you project-sync.json file is located. **This is important since your local path is set to the current working directory.**

```
project-sync prod up
```

To start a new sync file - with a basic skeleton for prod and dev servers run init.  This will place the project-sync.json file in your current path.

```
project-sync init
```

### Notes

* The sync will do a dry run first and allow you to decline a live run.
* You may need to set your SSH key's in an .ssh/config file.
* Set the delete key to true if you'd like to delete files on sync.

### Adding an SSH key to your keychain

To avoid access denied public key errors, try adding your SSH keys to your keychain.

```
ssh-add -K [path/to/ssh-key]
```
