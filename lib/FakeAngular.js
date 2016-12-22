(function () {
  var FakeModule = require('./FakeModule');

  function FakeAngular() {
    this.modules = {};
    this.factories = {};
    this.instances = {};
    this.values = {};
  }

  FakeAngular.prototype.module = function (name, dependencies) {
    if (dependencies) {
      if (this.modules[name]) {
        throw new Error('Module already exists: ' + name);
      }

      this.modules[name] = new FakeModule(this, name, dependencies);
    }

    return this.modules[name];
  };

  module.exports = FakeAngular;
}());
