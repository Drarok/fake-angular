describe("FakeModule", function () {
  var FakeModule = require('../lib/FakeModule');

  var angular;
  var module;

  beforeEach(function() {
    angular = {
      modules: {},
      factories: {},
      instances: {},
      values: {}
    };

    module = new FakeModule(angular, 'ngApp.testModule', []);
  });

  describe('config', function () {
    it('should store and return the config callback', function () {
      var success = false;

      module.config(function () {
        success = true;
      });

      module.config()();

      expect(success).toBe(true);
    });
  });

  describe('factories', function () {
    it('should fail to create a non-existent factory', function () {
      var fail = function () {
        module.factory('does-not-exist');
      };

      expect(fail).toThrowError('No such factory: does-not-exist');
    });

    it('should fail to overwrite a factory', function () {
      var fail = function () {
        module.factory('factory', function () {});
        module.factory('factory', function () {});
      };

      expect(fail).toThrowError('Attempt to overwrite factory: factory');
    });

    it('should create simple factories', function () {
      module.factory('factory', function () {
        return {
          name: 'factory'
        };
      });

      var first = module.factory('factory');
      var second = module.factory('factory');

      expect(second).toBe(first);
    });

    it('should create simple factories with dependencies', function () {
      module.factory('$factory0', function () {
        return {
          name: '$factory0'
        };
      });

      module.factory('factory1', function ($factory0) {
        return {
          name: 'factory1',
          dependencies: [ $factory0 ]
        };
      });

      module.factory('factory2', function ($factory0, factory1) {
        return {
          name: 'factory2',
          dependencies: [ $factory0, factory1 ]
        };
      });

      var first = module.factory('factory2');
      var second = module.factory('factory2');

      var factory0 = module.factory('$factory0');
      var factory1 = module.factory('factory1');

      expect(second).toBe(first);
      expect(second.dependencies[0]).toBe(factory0);
      expect(second.dependencies[1]).toBe(factory1);
    });

    it('should support $inject dependencies', function () {
      module.factory('$factory0', function () {
        return {
          name: '$factory0'
        };
      });

      var factory1 = function ($factory0) {
        return {
          name: 'factory1',
          dependencies: [
            $factory0
          ]
        };
      };
      factory1.$inject = ['$factory0'];
      module.factory('factory1', factory1);

      var first = module.factory('$factory0');
      var second = module.factory('factory1');

      expect(second.dependencies[0]).toBe(first);
    });

    it('should create array factories', function () {
      module.factory('factory', [function () {
        return {
          name: 'factory'
        };
      }]);

      var first = module.factory('factory');
      var second = module.factory('factory');

      expect(second).toBe(first);
    });

    it('should create array factories with dependencies', function () {
      module.factory('factory1', [function () {
        return {
          name: 'factory1'
        };
      }]);

      module.factory('factory2', ['factory1', function (factory1) {
        return {
          name: 'factory2',
          dependencies: [ factory1 ]
        };
      }]);

      var first = module.factory('factory2');
      var second = module.factory('factory2');

      var factory1 = module.factory('factory1');

      expect(second).toBe(first);
      expect(second.dependencies[0]).toBe(factory1);
    });

    it('should die with circular dependencies', function () {
      module.factory('factory1', ['factory2', function (factory2) {
        return {
          name: 'factory1'
        };
      }]);

      module.factory('factory2', ['factory1', function (factory1) {
        return {
          name: 'factory2'
        };
      }]);

      var fail = function () {
        module.factory('factory1');
      };

      expect(fail).toThrowError('Circular dependency: factory1 <- factory2 <- factory1');
    });
  });

  describe('values', function () {
    it('should fail to return a non-existent value', function () {
      var fail = function () {
        module.value('does-not-exist');
      };

      expect(fail).toThrowError('No such value: does-not-exist');
    });

    it('should support set and get for values', function () {
      var MyValue = {
        NAME: 'name'
      };

      module.value('MyValue', MyValue);

      expect(module.value('MyValue')).toBe(MyValue);
    });

    it ('should not allow values to be overwritten', function () {
      module.value('exists', true);

      var fail = function () {
        module.value('exists', 1);
      };

      expect(fail).toThrowError('Attempt to overwrite value: exists');
    });

    it('should resolve values as dependencies', function () {
      // Define an object so we know we got the same isntance back.
      var value = { key: true };

      // Define value and factory that depends on it.
      module.value('MyValue', value);
      module.factory('factory1', ['MyValue', function (MyValue) {
        expect(MyValue).toBe(value);
      }]);

      // Load the factory.
      module.factory('factory1');
    });
  });
});
