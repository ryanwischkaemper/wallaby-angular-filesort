'use strict';
import ngDep from 'ng-dependencies';
import * as toposort from 'toposort';
import * as minimatch from 'minimatch';
import * as os from 'os';
import * as _ from 'lodash';

export class AngularFileSort {
  constructor(options) {
    this.options = typeof(options) === 'object' ? options : {};

    this._entryFiles = {};
    this._allTrackedFiles = {};
    this._affectedFilesCache = {};
    this._initRequired = false;
    this._angularFileSortCache = {};
    this.logger = {};

    this.moduleFiles = {};
    this.sortNodes = [];
    this.sortEdges = [];
    this.subsetStart = null;
    this.ANGULAR_MODULE = 'ng';
  }

  static _fileArrayToObject(files) {
    return _.reduce(files, function (memo, file) {
      memo[file.fullPath] = file;
      return memo;
    }, {});
  }

  createPostprocessor() {

    return wallaby => {

      this.logger = wallaby.logger;
      this.logger.debug('Started AngularFileSort preprocessor');
      let affectedFiles = wallaby.affectedFiles;

      //if(wallaby.anyFilesAdded || wallaby.anyFilesDeleted){
        this._initRequired = true;
        this._affectedFilesCache = {};
        this._allTrackedFiles = AngularFileSort._fileArrayToObject(wallaby.allFiles);
        affectedFiles = wallaby.allFiles;

        this._entryFiles = AngularFileSort._fileArrayToObject(
          _.filter(this._allTrackedFiles, file => _.find(this.options.whitelist, pattern => {
            let mm = new minimatch.Minimatch(pattern);
            return mm.match(file.path);
          }))
        );
      //}


      let fileContentPromises = [];
      Object.keys(this._entryFiles).forEach(key => {
        fileContentPromises.push(this._entryFiles[key].getContent().then(content => {
          this._entryFiles[key].content = content;
        }));
      });

      return new Promise((resolve, reject) => {
        let sortedFiles = [];

        Promise.all(fileContentPromises)
          .then(() => {
            let files = Object.keys(this._entryFiles).map(key => {
              return this._entryFiles[key];
            });

            sortedFiles = this.sort(files);
          })
          .then(() => {
            // No angular module references found, so do nothing
            if (this.sortNodes.length === 0) resolve();

            // Convert all module names to actual files with declarations:
            for (var i = 0; i < this.sortEdges.length; i++) {
              var moduleName = this.sortEdges[i][1];
              var declarationFile = this.moduleFiles[moduleName];
              if (declarationFile) {
                //this.logger.debug('Converting module names: ' + moduleName + '\t\n' + declarationFile.path);
                this.sortEdges[i][1] = declarationFile;
              } else {
                // Depending on module outside list (possibly a 3rd party one),
                // don't care when sorting:

                //this.logger.debug('Converting module names:dontcare: ' + moduleName);
                this.sortEdges.splice(i--, 1);
              }
            }

            // this.logger.debug('sortNodes:' + os.EOL + this.sortNodes.map(node => {
            //     return '\t\n ' + node.path;
            //   }).join(os.EOL));
            //
            // this.logger.debug('sortEdges:' + os.EOL + this.sortEdges.map(edge => {
            //     return '\t\n [' + edge[0].path + ', ' + edge[1].path + ']';
            //   }).join(os.EOL));

            // Sort the sortNodes with sortEdges as dependency tree:
            let finalSortedFiles = [];
            toposort.array(this.sortNodes, this.sortEdges)
              .reverse()
              .forEach(file => finalSortedFiles.push(file));

            // this.logger.debug('Sorted files:' + os.EOL + finalSortedFiles.map((file) => {
            //     let msg = '\t\n fullpath: ' + file.fullPath;
            //     msg += '\t\n path: ' + file.path;
            //     msg += '\t\n id: ' + file.id;
            //     msg += '\t\n order: ' + file.order;
            //     msg += '\t\n';
            //     return msg;
            //   }).join(os.EOL));

            let createFilePromises = [];

            _.forEach(finalSortedFiles, (file, index) => {

              createFilePromises.push(wallaby.createFile({
                path: file.path + '.ordered.js',
                content: file.content,
                order: file.order + index,
                original: file
              }));
            });

            this.logger.debug('ANGULARFILESORT EMITTING %s FILES', createFilePromises.length);

            return Promise.all(createFilePromises).then(() => resolve())
              .catch(err => {
                this.logger.error('error resolving createFilePromises');
                this.logger.error(err.message);
                reject(err);
              });
          });
      });
    }
  }

  sort(files) {

    return files.filter((file, index) => {
      let willBeSorted = false;
      let deps;

      if (this.options.whitelist.length && !this.inWhitelist(file.path, this.options.whitelist)) {
        //this.logger.debug('NOT IN WHITELIST');
        return true;
      }

      try {
        deps = ngDep(file.content);
      }
      catch (err) {
        //this.logger.debug('Error in parsing: "' + file.fullPath + '", ' + err.message);
        return true;
      }

      if (deps.modules) {
        ///
        // this.logger.debug('deps.modules:' + os.EOL + Object.keys(deps.modules).map((key) => {
        //     return '\t\n ' + key + '\t\n';
        //   }).join(os.EOL));

        // Store references to each file with a declaration:
        Object.keys(deps.modules).forEach((name) => {
          //this.logger.debug('storing reference for ' + name);
          this.moduleFiles[name] = file;
          if (name !== this.ANGULAR_MODULE && name !== 'ngLocale') {
            willBeSorted = true;
          }
        });
      }

      if (deps.dependencies) {
        // this.logger.debug('deps.dependencies:' + os.EOL + deps.dependencies.map((dep) => {
        //     return '\t\n' + dep;
        //   }).join(os.EOL));

        // Add each file with dependencies to the array to sort:
        deps.dependencies.forEach((dep) => {
          if (this.isDependecyUsedInAnyDeclaration(dep, deps)) {
            //this.logger.debug(dep + ' NOT USED IN ANY DECLARATION');
            return;
          }
          if (dep === this.ANGULAR_MODULE) {
            return;
          }
          //this.logger.debug('pushing ' + file.path + ' into sortEdges. (dep is ' + dep + ')');
          this.sortEdges.push([file, dep]);
          willBeSorted = true;
        });
      }

      if (willBeSorted) {
        // Store the position of the first file to be sorted, as that's where the sorted subset will be re-inserted:
        if (this.subsetStart === null) {
          this.subsetStart = index;
        }
        //this.logger.debug('pushing to sortnodes: ' + file.path);
        this.sortNodes.push(file);
      }
      return !willBeSorted;
    });
  }

  inWhitelist(filePath, whitelist) {
    return whitelist.some((whitelistPath) => {
      let mm = new minimatch.Minimatch(whitelistPath);
      return mm.match(filePath);
    });
  }

  isDependecyUsedInAnyDeclaration(dependency, ngDeps) {
    if (!ngDeps.modules) {
      //this.logger.debug('no ngdep modules for ' + dependency);
      return false;
    }
    if (dependency in ngDeps.modules) {
      //this.logger.debug('ngdep module for ' + dependency);
      return true;
    }
    return Object.keys(ngDeps.modules).some((module) => {
      return ngDeps.modules[module].indexOf(dependency) > -1;
    });
  }
}
