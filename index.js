"use strict";

const _ = {
  get: require("lodash/get"),
  has: require("lodash/has"),
  set: require("lodash/set")
};


function Registry() {
  this._injects = {};
  this._decorators = {};
  
  //  Place to store data
  Object.defineProperty(this, "_registry", {
    enumerable: false,
    value: {}
  });

  //  Place to store created instances 
  Object.defineProperty(this, "_singletons", {
    enumerable: false,
    value: {}
  });
}


Registry.prototype.set = function(path, value) {
  _.set(this._registry, path, value);
  return this;
};


Registry.prototype.get = function(path, value) {
  return _.get(this._registry, path, value);
};


Registry.prototype.register = function(path, fn) {
  let args = Array.prototype.slice.call(arguments, 2);
  
  this.set(path, fn);
  
  this._injects[path] = args;
  
  return this;
}


Registry.prototype.instance = function(path, fn) {
  let args = Array.prototype.slice.call(arguments, 2);

  this.set(path, function() {
    let args = Array.prototype.slice.call(arguments);

    args.unshift(null);

    return new (Function.prototype.bind.apply(fn, args));
  });
  
  this._injects[path] = args;
  
  return this;
}


Registry.prototype.singleton = function(path) {
  let singleton = this._singletons[path];
  
  if (typeof singleton === "undefined") {
    singleton = this.factory(path);
    
    this._singletons[path] = singleton;
  }
  
  return singleton;
};


Registry.prototype.factory = function(path) {
  if (!_.has(this._registry, path)) {
    throw new Error("Missing dependency: " + path);
  }

  let fn = _.get(this._registry, path);
  let injects = this._injects[path] || [];
  
  //  Inject dependencies
  injects = injects.map(function(subpath) {
    //  Instantiate dependencies
    if (subpath in this._injects) {
      return this.singleton(subpath);
    }
    
    //  Inject non-service items
    return this.get(subpath);
  }.bind(this));
  
  let dependency = fn.apply(null, injects);
  
  //  Run decorator
  if (path in this._decorators) {
    dependency = this._decorators[path].reduce(function(ctx, item) {
      return item(ctx);
    }, dependency);
  }

  return dependency;
};


Registry.prototype.decorator = function(path, value) {
  if (typeof value !== "function") {
    throw new Error("Decorator requires to be a function");
  }

  if (!(path in this._decorators)) {
    this._decorators[path] = [];
  }

  this._decorators[path].push(value);

  return this;
};


module.exports = Registry;
