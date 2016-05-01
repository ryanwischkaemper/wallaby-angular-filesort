import * as minimatch from 'minimatch';
import * as _ from 'lodash';

/**
 * Handles file operations
 */
export class FileManager {

  /**
   * Returns true if all files are test files
   * @returns {boolean}
   */
  containsOnlyTestFileChanges(files) {
    const affectedFiles = this.fileArrayToObject(files);
    return Object.keys(affectedFiles).every(f => affectedFiles[f].test);
  }

	/**
   * Uses wallaby's file.getContent() method to read the contents
   * of each file and store the value in a content property on the file
   *
   * @param {Object} files
   * @returns {Promise<Object>}
   */
  populateFileContents(files) {
    let populatedFiles = Object.assign({},files);

    let promises = Object.keys(files)
      .map(key => {
        return files[key].getContent()
          .then(content => populatedFiles[key].content = content);
      });

    return Promise.all(promises)
      .then(() => populatedFiles);
  }

  /**
   * Finds files from allTrackedFiles that match the globs in the whitelist
   * @param {string[]} files
 * @param {string[]} whitelist
   * @returns {Object}
   */
  findEntryFiles(files, whitelist) {
    let allTrackedFiles = this.fileArrayToObject(files);
    
    return this.fileArrayToObject(
      _.filter(allTrackedFiles, file => _.find(whitelist, pattern => {
        const mm = new minimatch.Minimatch(pattern);
        return mm.match(file.path);
      }))
    );
  }

  /**
   *
   * @param {string[]} files
   * @returns {Object}
	 */
  fileArrayToObject(files) {
    return _.reduce(files, (memo, file) => {
      memo[file.fullPath] = file;
      return memo;
    }, {});
  }
}
