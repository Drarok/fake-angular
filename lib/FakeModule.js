(function () {
  function FakeModule(angular, name, dependencies) {
    this.configCallback = false;
    this.angular = angular;
    this.name = name;
    this.dependencies = dependencies;
    this.factories = {};
  }

  FakeModule.prototype.config = function (config) {
    if (config === undefined) {
      return this.configCallback;
    }

    this.configCallback = config;

    return this;
  };

  function setterFactory(type, suffix) {
    return function (name, proto) {
      return this.resolve(name + (suffix || ''), proto, type);
    };
  }

  FakeModule.prototype.controller = setterFactory('controller', 'Ctrl');
  FakeModule.prototype.directive = setterFactory('directive');
  FakeModule.prototype.factory = setterFactory('factory');
  FakeModule.prototype.filter = setterFactory('filter', 'Filter');

  FakeModule.prototype.value = function (name, value) {
    if (value === undefined) {
      // Act as a getter.
      if (this.angular.values[name] === undefined) {
        throw new Error('No such value: ' + name);
      }

      return this.angular.values[name];
    } else {
      // Act as a setter.
      if (this.angular.values[name]) {
        throw new Error('Attempt to overwrite value: ' + name);
      }

      this.angular.values[name] = value;

      return this;
    }
  };

  FakeModule.prototype.resolve = function (name, proto, type, deps) {
    if (proto) {
      // With proto passed in, behave as a setter.
      if (this.angular.factories[name]) {
        throw new Error('Attempt to overwrite ' + type + ': ' + name);
      }

      this.angular.factories[name] = proto;

      return this;
    } else {
      if (!deps) {
        deps = [];
      } else {
        if (deps.indexOf(name) !== -1) {
          var error = name + ' <- ';
          deps.reverse().forEach(function (dep) {
            error += dep + ' <- ';
          });
          throw new Error('Circular dependency: ' + error.slice(0, -4));
        }
      }

      // With no proto passed in, we need to create/return instances.
      if (this.angular.instances[name]) {
        return this.angular.instances[name];
      }

      if (!(proto = this.angular.factories[name])) {
        throw new Error('No such ' + type + ': ' + name);
      }

      var _this = this;
      var args = [];

      if (Array.isArray(proto)) {
        // Explicit array notation.
        args = proto.slice();
        proto = args.pop();
      } else if (proto.$inject) {
        args = proto.$inject.slice();
      } else {
        // Implicit function parameter notation.
        var match = proto.toString().match(/^function \(([^)]+)\)/);

        if (match) {
          args = match[1].split(',').map(function (arg) {
            return arg.trim();
          });
        }
      }

      // Resolve dependency names to instances.
      args = args.map(function (dependency) {
        deps.push(name);
        var instance = _this.resolve(dependency, null, null, deps);
        deps.pop();
        return instance;
      });

      return (this.angular.instances[name] = proto.apply(proto, args));
    }
  };

  module.exports = FakeModule;
}());
