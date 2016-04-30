import { AngularFileSortProcessor } from '../src/processor';
import * as chai from 'chai';
import { makeNewWallabyMock } from './wallaby-mock';

chai.should();
const assert = chai.assert;
const expect = chai.expect;

describe('AngularFileSortProcessor', () => {
  let wallabyMock;

  beforeEach(() => {
    wallabyMock = makeNewWallabyMock();
  });

  afterEach(() => {
    wallabyMock = undefined;
  });

  it('Should instatiate', () => {
    const processor = new AngularFileSortProcessor();
    assert.isDefined(processor, 'processor has been defined');
  });

  describe('fileArrayToObject', () => {

    it('Should convert an array of wallaby files to an object', () => {
      const files = [{fullPath: 'app/app.js', id: 1}, {fullPath: 'app/ctrl.js', id: 2}];

      let result = AngularFileSortProcessor.fileArrayToObject(files);

      expect(result).to.be.an.instanceof(Object);
      expect(result).to.have.ownProperty('app/app.js');
      expect(result).to.have.ownProperty('app/ctrl.js');

      expect(result['app/app.js']).to.equal(files[0]);
      expect(result['app/ctrl.js']).to.equal(files[1]);
    });
  });

  describe('findEntryFiles', ()=> {
    it('should return an empty object if no entry files exist', () => {
      const whitelist = ['app.js'];
      let trackedFiles = [{path: 'app.ts', fullPath: 'dummy'}];

      let result = AngularFileSortProcessor.findEntryFiles(trackedFiles, whitelist);

      result.should.be.an.instanceOf(Object);
      Object.keys(result).length.should.equal(0);
    });

    it('should return a populated object if entry files exist', () => {
      const whitelist = ['app.js'];
      let trackedFiles = [{path: 'app.js', fullPath: 'dummy'}];

      let result = AngularFileSortProcessor.findEntryFiles(trackedFiles, whitelist);

      result.should.be.an.instanceOf(Object);
      Object.keys(result).length.should.equal(1);
      result['dummy'].path.should.equal('app.js');
      result['dummy'].fullPath.should.equal('dummy');
    });
  })

});
