export const diContainer = (() => {
  const dependencies = {};

  const register = (name, factory) => {
    dependencies[name] = factory;
  };

  const resolve = (name) => {
    if (dependencies[name] === undefined) {
      throw new Error(`Dependency "${name}" not found`);
    }
    if (typeof dependencies[name] === 'function') {
      return dependencies[name]();
    } else {
      return dependencies[name];
    }
  };

  return {
    register,
    resolve,
  };
})();
