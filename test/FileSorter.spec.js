import {FileSorter} from '../src/FileSorter';
import * as chai from 'chai';
import { makeNewWallabyMock, makeNgDepsMock, makeWallabyFileMock } from './wallaby-mock';

chai.should();
const assert = chai.assert;
const expect = chai.expect;

describe('AngularFileSorter', () => {
  let wallabyMock;

  beforeEach(() => {
    wallabyMock = makeNewWallabyMock();
  });

  afterEach(() => {
    wallabyMock = undefined;
  });

  it('Should instatiate', () => {
    let sorter = new FileSorter();
    assert.isDefined(sorter, 'sorter has been defined');
  });

  describe('isDependecyUsedInAnyDeclaration', () => {
    it('should return false if no angular modules are present', ()=> {
      let sorter = new FileSorter();
      let ngDeps = {};

      let result = sorter.isDependecyUsedInAnyDeclaration(null, ngDeps);

      result.should.be.false;
    });

    it('should return true if angular modules are present and contain the dependency', ()=> {
      let sorter = new FileSorter();
      const dependency = 'app';
      let ngDeps = {modules: {app: {}}};

      let result = sorter.isDependecyUsedInAnyDeclaration(dependency, ngDeps);

      result.should.be.true;
    });

    it('Should return true if the dependency is present within the dependencies of each angular module', ()=> {
      let sorter = new FileSorter();

      const dependency = 'app';
      let ngDeps = {modules: {core: [dependency]}};

      let result = sorter.isDependecyUsedInAnyDeclaration(dependency, ngDeps);

      result.should.be.true;
    });

    it('Should return false if the dependency is not present within the dependencies of each angular module', ()=> {
      let sorter = new FileSorter();

      const dependency = 'app';
      let ngDeps = {modules: {core: []}};

      let result = sorter.isDependecyUsedInAnyDeclaration(dependency, ngDeps);

      result.should.be.false;
    });

  });

  describe('isAngularFile', () => {
    it('should return true only if file is in whitelist', () => {
      const whitelist = ['ctrl.js'];
      let sorter = new FileSorter();

      let file = {path: 'ctrl.js'};
      let result = sorter.isAngularFile(file, whitelist);

      result.should.be.true;
    });
  });

  describe('sort', () => {
    it('should return a sorted array', () => {
      let moduleFiles = {
        'feature1': {},
        'doit': {},
        'feature2': {},
        'core': {},
        'app': {}
      };

      const nodes = Object.keys(moduleFiles)
        .concat(['ctrl'])
        .map(file => file);

      const edges = [
        ['app', 'feature2'],
        ['app', 'feature1'],
        ['feature1', 'core'],
        ['feature1', 'doit'],
        ['feature2', 'core'],
        ['ctrl', 'doit'],
        ['doit', 'feature2']
      ];

      const expected = ['core', 'feature2', 'doit', 'ctrl', 'feature1', 'app'];

      const sorter = new FileSorter(wallabyMock.logger);
      sorter.moduleFiles = moduleFiles;
      sorter.sortNodes = nodes;
      sorter.sortEdges = edges;

      let result = sorter.sort();

      result.should.be.instanceOf(Array);
      console.log(result);
     // result.should.deep.equal(expected);
    });

    xit('should return a sorted array2', () => {
      const modules = ['core', 'feature2', 'doit', 'feature1', 'app'];
      const edges = [
        ['app', 'feature2'],
        ['app', 'feature1'],
        ['feature1', 'core'],
        ['feature1', 'doit'],
        ['feature2', 'core'],
        ['ctrl', 'doit'],
        ['doit', 'feature2']
      ];
      
      let ngDeps = makeNgDepsMock(['ctrl'], modules, edges);
      //console.log(ngDeps)
      let moduleFiles = {
        'feature1': {},
        'doit': {},
        'feature2': {},
        'core': {},
        'app': {}
      };

      const nodes = Object.keys(moduleFiles)
        .concat(['ctrl'])
        .map(file => file);

      
      const expected = [{}, 'ctrl', 'app', 'core', 'feature2', 'doit'];

      const sorter = new FileSorter(wallabyMock.logger);
      sorter.moduleFiles = moduleFiles;
      sorter.sortNodes = nodes;
      sorter.sortEdges = edges;

      let result = sorter.sort();

      result.should.be.instanceOf(Array);
      result.should.deep.equal(expected);
    });
  });

});
