export function makeNewWallabyMock(){
  return {
    allFiles: [],
    affectedFiles: [],
    anyFilesAdded: false,
    anyFilesDeleted: false,
    logger: makeNewLoggerMock()
  }
}

function makeNewLoggerMock(){
  return {
    'debug': function(){},
    'info': function(){},
    'warning': function(){},
    'error': function(){}
  };
}

export function makeWallabyFileMock(path) {
  return {
    path,
    fullPath: `full-${path}`,
    content: ''
  };
}

/**
 *
 * @param {Array<string>} dependencies
 * @param {Array<string>} modules
 * @param {Array<Array<string>>} moduleDeps
 * @returns {{dependencies: Array, modules: {}}}
 */
export function makeNgDepsMock(dependencies, modules, moduleDeps) {
  let interModuleDeps = [];
  dependencies = dependencies || [];

  let groupedModuleDeps = moduleDeps.reduce((acc, item) => {
    if (modules.indexOf(item[0]) === -1) return acc;
    acc[item[0]] = acc[item[0]] || [];

    const moduleDep = item[1];
    if (interModuleDeps.indexOf(moduleDep) === -1) {
      interModuleDeps.push(moduleDep);
    }
    acc[item[0]].push(moduleDep);
    
    return acc;
  }, {});

  modules.forEach(name => {
    if (!groupedModuleDeps.hasOwnProperty(name)) {
      groupedModuleDeps[name] = [];
    }
  });

  return {
    dependencies: interModuleDeps.concat(dependencies),
    modules: groupedModuleDeps
  };
}

function makeNewNgDepsModuleMock() {
  return {
    
  };
}
