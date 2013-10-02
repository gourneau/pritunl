define([
  'jquery',
  'underscore',
  'backbone',
  'demo/data'
], function($, _, Backbone, demoData) {
  'use strict';
  /*jshint -W106:true */
  var routes = {};
  var responseDelay = 150;

  var uuid = function() {
    var id = '';
    id += Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    id += Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    id += Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    id += Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    id += Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    id += Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    id += Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    id += Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    return id;
  };

  var authPost = function(request) {
    if (request.data.username !== demoData.auth.username ||
        request.data.password !== demoData.auth.password) {
      setTimeout(function() {
        request.error({
          responseJSON: {
            error: 'auth_not_valid',
            error_msg: 'Username or password is not valid.'
          },
          status: 401
        });
      }, responseDelay);
      return;
    }

    setTimeout(function() {
      request.success({});
    }, responseDelay);
  };
  routes['POST+auth'] = authPost;

  var authGet = function(request) {
    setTimeout(function() {
      request.success({
        authenticated: demoData.auth.authenticated
      });
    }, responseDelay);
  };
  routes['GET+auth'] = authGet;

  var authDelete = function(request) {
    demoData.auth.authenticated = false;
    setTimeout(function() {
      request.success({});
    }, responseDelay);
  };
  routes['DELETE+auth'] = authDelete;

  var checkEvents = function(request, lastEvent, count) {
    setTimeout(function() {
      var i;
      var event;
      var events = [];

      for (i = 0; i < demoData.events.length; i++) {
        event = demoData.events[i];
        if (event.time <= lastEvent) {
          continue;
        }
        events.push(event);
      }

      if (events.length) {
        request.success(events);
      }
      else {
        count += 1;
        if (count > (30 / 0.3)) {
          request.success([]);
        }
        else {
          checkEvents(request, lastEvent, count);
        }
      }
    }, 300);
  };

  var eventGet = function(request, lastEvent) {
    lastEvent = parseInt(lastEvent, 10);
    if (!lastEvent) {
      request.success([{
        id: uuid(),
        type: 'time',
        resource_id: null,
        time: Math.round(new Date().getTime() / 1000)
      }]);
      return;
    }

    checkEvents(request, lastEvent, 0);
  };
  routes['GET+event'] = eventGet;

  var logGet = function(request) {
    setTimeout(function() {
      request.success(demoData.logEntries);
    }, responseDelay);
  };
  routes['GET+log'] = logGet;

  var organizationGet = function(request) {
    var id;
    var orgs = [];

    for (id in demoData.orgs) {
      orgs.push(demoData.orgs[id]);
    }

    setTimeout(function() {
      request.success(orgs);
    }, responseDelay);
  };
  routes['GET+organization'] = organizationGet;

  var organizationPost = function(request) {
    var id = uuid();
    demoData.orgs[id] = {
      id: id,
      name: request.data.name,
    };
    setTimeout(function() {
      request.success({});
    }, responseDelay);
  };
  routes['POST+organization'] = organizationPost;

  var organizationPut = function(request, org_id) {
    demoData.orgs[org_id].name = request.data.name;
    setTimeout(function() {
      request.success({});
    }, responseDelay);
  };
  routes['PUT+organization'] = organizationPut;

  var demoAjax = function(request) {
    var url = request.url.split('/');
    var method = url.splice(1, 1)[0];
    var vars = url.splice(1);
    var type = request.type;
    vars.unshift(request);

    if (request.data && request.dataType === 'json') {
      request.data = JSON.parse(request.data);
    }

    window.console.log(type, method, vars);

    if (routes[type + '+' + method]) {
      routes[type + '+' + method].apply(this, vars);
    }
  };

  return demoAjax;
});