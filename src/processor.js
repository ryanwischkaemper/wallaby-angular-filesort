import * as minimatch from 'minimatch';
import * as _ from 'lodash';

import { AngularFileSorter } from './sorter';

export class AngularFileSortProcessor {
  constructor(options) {
    this.options = typeof(options) === 'object' ? options : {};

    this.entryFiles = {};
    this.allTrackedFiles = {};
    this.logger = {};
  }

  createPostprocessor() {
    return wallaby => {
      this.logger = wallaby.logger;
      this.logger.debug('Started AngularFileSorter preprocessor');

      this.allTrackedFiles = AngularFileSortProcessor.fileArrayToObject(wallaby.allFiles);
      this.entryFiles = AngularFileSortProcessor.findEntryFiles(this.allTrackedFiles,
        this.options.whitelist);

      const fileContentPromises = Object.keys(this.entryFiles)
        .map(key => {
          return this.entryFiles[key].getContent()
            .then(content => this.entryFiles[key].content = content);
        });
      
      return this.resolveNewFilePromises(fileContentPromises, wallaby);
    };
  }

  resolveNewFilePromises(fileContentPromises, wallaby) {
    return new Promise((resolve, reject) => {
      Promise.all(fileContentPromises)
        .then(() => {
          const files = Object.keys(this.entryFiles)
            .map(key => this.entryFiles[key]);
          
          const sorter = new AngularFileSorter(this.logger);

          const finalSortedFiles = sorter.sortAngularFiles(files,
            this.options.whitelist);

          // No angular module references found, so do nothing
          if (!finalSortedFiles || !finalSortedFiles.length) resolve();

          const createFilePromises = finalSortedFiles
            .map((file,index) => wallaby.setFileOrder({file:file,order:file.order+index}));

          this.logger.debug('ANGULARFILESORT REORDERING %s FILES',
            createFilePromises.length);

          return Promise.all(createFilePromises).then(() => resolve())
            .catch(err => {
              this.logger.error(err.message);
              reject(err);
            });
        });
    });
  }

  static findEntryFiles(trackedFiles, whitelist) {
    return AngularFileSortProcessor.fileArrayToObject(
      _.filter(trackedFiles, file => _.find(whitelist, pattern => {
        const mm = new minimatch.Minimatch(pattern);
        return mm.match(file.path);
      }))
    );
  }

  static fileArrayToObject(files) {
    return _.reduce(files, (memo, file) => {
      memo[file.fullPath] = file;
      return memo;
    }, {});
  }
}
