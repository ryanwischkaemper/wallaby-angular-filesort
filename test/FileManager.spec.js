import {FileManager} from '../src/FileManager';
import * as chai from 'chai';
import { makeWallabyFileMock} from './wallaby-mock';

chai.should();
const assert = chai.assert;
const expect = chai.expect;

describe('FileManager', () => {
  let mgr;
  
  beforeEach(() => {
    mgr = new FileManager();
  });

  afterEach(() => {
    mgr = undefined;
  });

  it('Should instantiate', () => {
    const mgr = new FileManager();
    assert.isDefined(mgr, 'processor has been defined');
  });

  specify('that findEntryFiles should return a populated object if entry files exist', () => {
    const whitelist = ['app.js'];
    let files = [{path: 'app.js', fullPath: 'dummy'}];

    let result = mgr.findEntryFiles(files,whitelist);

    result.should.be.an.instanceOf(Object);
    Object.keys(result).length.should.equal(1);
    result['dummy'].path.should.equal('app.js');
    result['dummy'].fullPath.should.equal('dummy');
  });

  specify('that populateFileContents should return a populated object with content', (done) => {
    const mgr = new FileManager();
    let files =  {
      'a': makeWallabyFileMock('a'),
      'b': makeWallabyFileMock('b'),
      'c': makeWallabyFileMock('c')
    };
    
    mgr.populateFileContents(files)
      .then(result => {
        
        Object.keys(result).forEach(key => {
          expect(result[key].content).to.be.null;
        });

        done();
      });

  });

  describe('fileArrayToObject', () => {
    it('should convert an array of wallaby files to an object', () => {
      const files = [{fullPath: 'app/app.js', id: 1}, {fullPath: 'app/ctrl.js', id: 2}];

      let result = new FileManager().fileArrayToObject(files);

      expect(result).to.be.an.instanceof(Object);
      expect(result).to.have.ownProperty('app/app.js');
      expect(result).to.have.ownProperty('app/ctrl.js');

      expect(result['app/app.js']).to.equal(files[0]);
      expect(result['app/ctrl.js']).to.equal(files[1]);
    });

    it('should return an empty object if no entry files exist', () => {
      const whitelist = ['app.js'];
      let files = [{path: 'app.ts', fullPath: 'dummy'}];

      let result = mgr.findEntryFiles(files,whitelist);

      result.should.be.an.instanceOf(Object);
      Object.keys(result).length.should.equal(0);
    });
  });

  describe('containsOnlyTestFileChanges', () => {
    it('containsOnlyTestFileChanges should return false if even one file is not a test file', () => {
      let files = {
        'a': makeWallabyFileMock('a', true),
        'b': makeWallabyFileMock('b', true),
        'c': makeWallabyFileMock('c', false)
      };
      let result = new FileManager().containsOnlyTestFileChanges(files);

      result.should.be.false;
    });

    it('containsOnlyTestFileChanges should return true if all files are test files', () => {
      let files = {
        'a': makeWallabyFileMock('a', true),
        'b': makeWallabyFileMock('b', true),
        'c': makeWallabyFileMock('c', true)
      };

      let result = mgr.containsOnlyTestFileChanges(files);

      result.should.be.true;
    });
  });

});
