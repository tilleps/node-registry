"use stict";

const tap = require("tap");
const Registry = new require("./");

let registry = new Registry();

//
//  Set nested object
//
registry.set("config.db", {
  host: "localhost",
  user: "root"
});


tap.equal(registry.get("config.db.user"), "root", "set and get nested values");


//
//  Register Service
//
registry.register("randomNumber", function() {
  return Math.random();
});


//
//  Factories
//
let factoryOne = registry.factory("randomNumber");
let factoryTwo = registry.factory("randomNumber");

//  Factory one and two should be different
tap.notEqual(factoryOne, factoryTwo, "factories should be different");


//
//  Instances
//
let singletonOne = registry.singleton("randomNumber");
let singletonTwo = registry.singleton("randomNumber");
let factoryThree = registry.factory("randomNumber");

//  Instances should be the same value
tap.equal(singletonOne, singletonTwo, "singletons should be the same value");

//  Factory should be different
tap.notEqual(singletonTwo, factoryThree, "factory value should be different");


//
//  Classes
//
function Animal(type) {
  this.type = type;
}

registry.set("config.animal.type", "dog");
registry.instance("dog", Animal, "config.animal.type")

let animal = registry.singleton("dog");

tap.equal(animal.type, "dog");


//
//  Decorators
//
let postDecoratorValue;

registry.decorator("randomNumber", function(dependency) {
  postDecoratorValue = dependency;
  return dependency;
});

let factoryValue = registry.factory("randomNumber");

tap.equal(factoryValue, postDecoratorValue, "decorators should run after every factory");
