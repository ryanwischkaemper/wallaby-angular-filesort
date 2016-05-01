import {FileManager} from './FileManager';
import {FileSorter} from './FileSorter';

export class PostProcessor {
  constructor(options,fileManager, wallaby) {
    this.options = typeof(options) === 'object' ? options : {};

    this.logger = {};
    this.wallaby = wallaby || null;
    this.fileManager = fileManager || new FileManager();
  }

  create() {
    return wallaby => {
      if(this.wallaby === null) this.wallaby = wallaby;
      this.logger = this.wallaby.logger;
      this.logger.debug('STARTED ANGULARFILESORT POSTPROCESSOR');

      // if the only file(s) modified were test files, then stop the postprocessor entirely
      // before we start reading the contents of each file
      if (this.fileManager.containsOnlyTestFileChanges(this.wallaby.affectedFiles)) {
        this.logger.debug('ANGULARFILESORT EXITING WITH NO REORDERING');
        return Promise.resolve();
      }

      let angularSourceFiles = this.fileManager.findEntryFiles(
        this.wallaby.allFiles, this.options.whitelist);

      return this.fileManager.populateFileContents(angularSourceFiles)
        .then(files => this.reorderAngularFiles(files));
    };
  }

  /**
   *
   * @param {Object} entryFiles
   * @returns {Promise}
   */
  reorderAngularFiles(entryFiles) {
    const files = Object.keys(entryFiles)
      .map(key => entryFiles[key]);

    const sorter = new FileSorter(this.logger);

    const finalSortedFiles = sorter.sortAngularFiles(files,
      this.options.whitelist);

    // No angular module references found, so do nothing
    if (!finalSortedFiles || !finalSortedFiles.length) return Promise.resolve();

    this.logger.debug('ANGULARFILESORT REORDERING %s FILES', finalSortedFiles.length);

    const createFilePromises = finalSortedFiles
      .map((file, index) => this.wallaby.setFileOrder({file: file, order: file.order + index}));

    return Promise.all(createFilePromises);

  }

}
