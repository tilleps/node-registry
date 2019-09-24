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
registry.service("randomNumber", function() {
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
let instanceOne = registry.instance("randomNumber");
let instanceTwo = registry.instance("randomNumber");
let factoryThree = registry.factory("randomNumber");

//  Instances should be the same value
tap.equal(instanceOne, instanceTwo, "instances should be the same value");

//  Factory should be different
tap.notEqual(instanceTwo, factoryThree, "factory value should be different");


//
//  Decorators
//
let postDecoratorValue;

registry.decorator("randomNumber", function(service) {
  postDecoratorValue = service;
  return service;
});

let factoryValue = registry.factory("randomNumber");

tap.equal(factoryValue, postDecoratorValue, "decorators should run after every factory");
