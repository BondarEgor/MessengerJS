export const diContainer = (() => {
  const dependencies = {};

  const register = (name, factory) => {
    dependencies[name] = factory;
  };

  const resolve = (name) => {
    if (dependencies[name] === undefined) {
      throw new Error(`Dependency "${name}" not found`);
    }
    
    return dependencies[name]();
  };

  return {
    register,
    resolve,
  };
})();
