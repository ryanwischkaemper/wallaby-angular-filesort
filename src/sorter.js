import ngDep from 'ng-dependencies';
import * as toposort from 'toposort';
import * as minimatch from 'minimatch';

export class AngularFileSorter {
  constructor(logger) {
    this.logger = logger;

    this.moduleFiles = {};
    this.sortNodes = [];
    this.sortEdges = [];
    this.ANGULAR_MODULE = 'ng';
  }
  
  sortAngularFiles(files, whitelist) {
    this.populateDependencyGraph(files, whitelist);
    return this.sort();
  }

  populateDependencyGraph(files, whitelist) {
    // main purpose is populating this.sortNodes and this.sortEdges
    files
      .filter(file => this.isAngularFile(file, whitelist))
      .filter(file => {
        let willBeSorted = false;
        let deps;

        try {
          deps = ngDep(file.content);
        }
        catch (err) {
          this.logger.error(`Error in parsing: "${file.fullPath}", ${err.message}`);
          return true;
        }

        if (deps.modules) {
          // Store references to each file with a declaration:
          Object.keys(deps.modules).forEach((name) => {
            this.moduleFiles[name] = file;
            if (name !== this.ANGULAR_MODULE && name !== 'ngLocale') {
              willBeSorted = true;
            }
          });
        }

        if (deps.dependencies) {
          // Add each file with dependencies to the array to sort:
          deps.dependencies.forEach((dep) => {
            if (this.isDependecyUsedInAnyDeclaration(dep, deps)) {
              // this.logger.debug(dep + ' NOT USED IN ANY DECLARATION');
              return;
            }
            if (dep === this.ANGULAR_MODULE) {
              return;
            }
            // this.logger.debug('pushing ' + file.path + ' into sortEdges. (dep is ' + dep + ')');
            this.sortEdges.push([file, dep]);
            willBeSorted = true;
          });
        }

        if (willBeSorted) {
          this.sortNodes.push(file);
        }
        return !willBeSorted;
      });
  }

  sort() {
    // Convert all module names to actual files with declarations:
    for (let i = 0; i < this.sortEdges.length; i++) {
      const moduleName = this.sortEdges[i][1];
      const declarationFile = this.moduleFiles[moduleName];
      if (declarationFile) {
        this.sortEdges[i][1] = declarationFile;
      } else {
        // Depending on module outside list (possibly a 3rd party one),
        // don't care when sorting:
        this.sortEdges.splice(i--, 1);
      }
    }

    // Sort the sortNodes with sortEdges as dependency tree:
    const finalSortedFiles = [];
    toposort.array(this.sortNodes, this.sortEdges)
      .reverse()
      .forEach(file => finalSortedFiles.push(file));

    return finalSortedFiles;
  }

  isAngularFile(file, whitelist) {
    return !!(whitelist.length && this.inWhitelist(file.path, whitelist));
  }

  inWhitelist(filePath, whitelist) {
    return whitelist.some((whitelistPath) => {
      const mm = new minimatch.Minimatch(whitelistPath);
      return mm.match(filePath);
    });
  }

  isDependecyUsedInAnyDeclaration(dependency, ngDeps) {
    if (!ngDeps.modules) {
      return false;
    }
    if (dependency in ngDeps.modules) {
      return true;
    }
    return Object.keys(ngDeps.modules).some((module) => {
      return ngDeps.modules[module].indexOf(dependency) > -1;
    });
  }


}
