# Fake Angular [![Build Status](https://travis-ci.org/Drarok/fake-angular.svg "Build Status")](https://travis-ci.org/Drarok/fake-angular)

This package provides a "fake Angular.js", used for quick and dirty testing.

Say you want to test a custom function that sorts users by descending age, shown here:

```js
// …/app/js/services.js
var env = 'test';

angular.module('myApp.services', [])
  .factory('DB', function (DBFactory) {
    // Pretend that DBFactory is defined somewhere for this example.
    return DBFactory.getInstance(env);
  })
  .factory('UserPosts', ['DB', function (DB) {
    return (user) {
      return DB.findPostsByUser(user)
        .then(function (posts) {
          return posts.sort(function (a, b) {
            if (a.age === b.age) {
              return 0;
            } else {
              return b.age - a.age;
            }
          });
        });
    };
  }]);
```

You could test this without having to split your Angular pieces up into "real" functions:

```js
// …/spec/ServicesSpec.js
var FakeAngular = require('fake-angular');
global.angular = new FakeAngular();
require('../app/js/services.js');

describe('myApp.services', function () {

  var module = global.angular.module('myApp.services');

  describe('UserPosts', function () {
    var UserPosts = module.factory('UserPosts');

    it('should return posts in descending age order', function (done) {
      UserPosts().then(function (posts) {
        var actual = posts.map(function (post) {
          return post.age;
        });

        expect(actual).toEqual([23, 22, 20, 5]);
      }).then(done);
    });
  });

});
```
