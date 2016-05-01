import { PostProcessor } from '../src/PostProcessor';
import {FileManager} from '../src/FileManager';
import * as chai from 'chai';
import * as sinon from 'sinon';
import { makeNewWallabyMock, makeWallabyFileMock } from './wallaby-mock';

chai.should();
const assert = chai.assert;
const expect = chai.expect;

describe('PostProcessor', () => {
  let wallabyMock;

  beforeEach(() => {
    wallabyMock = makeNewWallabyMock();
  });

  afterEach(() => {
    wallabyMock = undefined;
  });

  it('Should instantiate', () => {
    const processor = new PostProcessor();
    assert.isDefined(processor, 'processor has been defined');
  });

  describe('create', () => {

    context('only test files were modified', () => {
      it('should not attempt to find all entry files', () => {
        let wallabyMock = makeNewWallabyMock();
        wallabyMock.affectedFiles = [makeWallabyFileMock('',true)];

        let fileManager = new FileManager();
        let spy = sinon.spy(fileManager,'findEntryFiles');

        let sut = new PostProcessor({}, fileManager, wallabyMock);

        return sut.create()().then(() => {
          spy.restore();
          spy.callCount.should.be.equal(0);
        });
      });

      it('should not attempt to read file contents', () => {
        let wallabyMock = makeNewWallabyMock();
        wallabyMock.affectedFiles = [makeWallabyFileMock('',true)];

        let fileManager = new FileManager();
        let spy = sinon.spy(fileManager,'populateFileContents');

        let sut = new PostProcessor({}, fileManager, wallabyMock);

        return sut.create()().then(() => {
          spy.restore();
          spy.callCount.should.be.equal(0);
        });
      });
    });

    context('source files were modified', () => {
      it('should use all wallaby files as a basis for searching for entry files', () => {
        let wallabyMock = makeNewWallabyMock();

        wallabyMock.allFiles = [makeWallabyFileMock('',false)];
        wallabyMock.affectedFiles = [makeWallabyFileMock('',false)];

        let whitelist = ['a'];

        let fileManager = new FileManager();
        let spy = sinon.spy(fileManager,'findEntryFiles');

        let sut = new PostProcessor({whitelist}, fileManager, wallabyMock);

        return sut.create()().then(() => {
          spy.restore();
          
          spy.callCount.should.be.equal(1);
          spy.calledWith(wallabyMock.allFiles,whitelist).should.be.true;
        });

      });
    });

  });
  
});
