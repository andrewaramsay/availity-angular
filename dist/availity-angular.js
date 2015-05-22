/**
 * availity-angular v0.8.0 -- May-22
 * Copyright 2015 Availity, LLC 
 */

// Source: /lib/core/index.js


(function(root) {

  'use strict';

  var availity = root.availity || {};
  availity.VERSION = 'v0.8.0';
  availity.MODULE = 'availity';
  availity.core = angular.module(availity.MODULE, ['ng']);

  var originalModule = angular.module;
  var modules = [];

  angular.module = function(name, deps) {

    if(deps && _.indexOf(modules, name) !== -1 ) {
      throw new Error('redefining module: ' + name);
    }

    modules.push(name);

    return originalModule(name, deps);
  };

  root.availity = availity;

  if(typeof module !== 'undefined' && module.exports) {
    module.exports = availity;
  }

})(window);


// Source: /lib/core/utils/strings.js
(function(root) {

  'use strict';

  var availity = root.availity;

  // https://github.com/epeli/underscore.string/blob/cebddf40cf2e10f0e9b596d9654edd0a1cfefc15/helper/makeString.js
  availity._stringify = function(object) {
    if(object === null) {
      return '';
    }
    return '' + object;
  };

  // https://github.com/epeli/underscore.string/blob/cebddf40cf2e10f0e9b596d9654edd0a1cfefc15/isBlank.js
  availity.isBlank = function(str) {
    return (/^\s*$/).test(availity._stringify(str));
  };

})(window);

// Source: /lib/core/utils/uuid.js
(function(root) {

  'use strict';

  var availity = root.availity;

  var uid = ['0', '0', '0'];

  availity.uuid = function(prefix) {
    var index = uid.length;
    var digit;

    while(index) {
      index--;
      digit = uid[index].charCodeAt(0);
      if(digit === 57 /*'9'*/) {
        uid[index] = 'A';
        return prefix ? prefix + uid.join('') : uid.join('');
      }
      if(digit === 90  /*'Z'*/) {
        uid[index] = '0';
      } else {
        uid[index] = String.fromCharCode(digit + 1);
        return prefix ? prefix + uid.join('') : uid.join('');
      }
    }
    uid.unshift('0');
    return prefix ? prefix + uid.join('') : uid.join('');
  };

})(window);

// Source: /lib/core/utils/urls.js
(function(root) {

  'use strict';

  var availity = root.availity;

  availity.REGEX_API_URL = /^.*?api.availity.com(.*)$/;

  availity.getRelativeUrl = function(url) {
    var result = url.match(availity.REGEX_API_URL);
    if(result && result[1]) {
      return '/api' + result[1];
    }

    return url;
  };

})(window);

// Source: /lib/core/utils/throttle.js
// Original => https://github.com/mgcrea/angular-strap/blob/master/src/helpers/debounce.js

(function(root) {

  'use strict';

  var availity = root.availity;

  availity.core.constant('AV_THROTTLE', {
    OPTIONS: {
      wait: 1000,
      update: false,
      trailing: true,
      leading: false
    }
  });

  availity.core.factory('avThrottle', function(AV_THROTTLE, $timeout) {

    return function(fn, wait, options) {

      options = _.merge({}, AV_THROTTLE.OPTIONS, options);

      wait = wait ? wait : AV_THROTTLE.THRESHOLD;
      var update = angular.isDefined(options.update) ? options.update : AV_THROTTLE.UPDATE;
      var timer = null;

      return function() {
        var context = options.context || this;
        var args = arguments;

        if(!timer) {
          if(options.leading !== false) {
            fn.apply(context, args);
          }

          var later = function() {
            timer = null;
            if(options.trailing !== false) {
              fn.apply(context, args);
            }
          };

          timer = $timeout(later, wait, update);
        }

        return timer;

      };
    };
  });

})(window);

// Source: /lib/core/logger/logger.js
// Orginal => https://github.com/ericzon/angular-ny-logger/blob/0c594e864c93e7f33d36141200096bc6139ddde1/angular-ny-logger.js
(function(root) {

  'use strict';

  var availity = root.availity;

  availity.core.provider('AvLogger', function() {

    var _enabled = false;

    this.enabled = function(enabled) {
      _enabled = !!enabled;
    };

    this.$get = function($injector) {

      var AvLogger = function(context, $delegate) {

        this.context = context || '';
        this.$log = $delegate;

      };

      var proto = AvLogger.prototype;

      AvLogger.supplant = function(str, o) {

        var _supplant = function (a, b) {
          var r = o[b];
          return r;
        };

        return str.replace(/\{([^{}]*)\}/g, _supplant);
      };

      AvLogger.isObject = function(element) {
        var elemStr = ( !angular.isUndefined(element) && !angular.isUndefined(element.constructor) ) ? element.constructor.toString() : '';
        return (elemStr.indexOf('Object') > -1);
      };

      AvLogger.getFormattedTimestamp = function(date) {

        return AvLogger.supplant('{0}:{1}:{2}:{3}', [
          date.getHours(),
          date.getMinutes(),
          date.getSeconds(),
          date.getMilliseconds()
        ]);

      };

      proto._log = function(originalFn, args) {

        // Allow enabling logger through query params
        // Ex:
        //
        // http://localhost:3000/ui.html#avLogger

        var hash = window.location.hash;
        hash = hash || '';

        if(!_enabled && hash.indexOf('avLogger') < 0 && originalFn !== 'error') {
          return;
        }

        var now  = AvLogger.getFormattedTimestamp(new Date());
        var message = '';
        var supplantData = [];

        var context = this.context ? ' [' + this.context + '] ' : '';

        switch(args.length) {
          case 1:
            // (1) If the user supplied one argument, then the argument must be
            // the message itself and _log()
            // will print: <timestamp> - <context>: <message>
            supplantData = args[0];
            message = AvLogger.supplant('{0}{1} - {2}', [now, context, args[0]]);
            break;
          case 3:
            // (3) If the user supplied three arguments, then the first argument
            // is a method name, the second is the message and the third is an
            // object of variables to interpolate with the message. For this, _log()
            // will print: <timestamp> - <context> - <method name>('<message>')
            supplantData = args[2];
            message = AvLogger.supplant("{0}{1} - {2}(\'{3}\')", [now, context, args[0], args[1]]);
            break;
          case 2:
            // (2) If the user provided two arguments, we need to find out whether
            // they supplied a method name or an interpolation object.
            // In order to figure that out, we’ll check the type of the last argument.
            // If it is a string, then it has to be the message itself while the
            // first argument is the method name. Otherwise consider the first argument
            // as the message and the second as array of interpolation variables.
            // The output print will be according to this check.
            if(typeof args[1] === 'string') {
              message = AvLogger.supplant("{0}{1} - {2}(\'{3}\')", [now, context, args[0], args[1]]);
            } else {
              supplantData = args[1];
              message = AvLogger.supplant('{0}{1} - {2}', [now, context, args[0]]);
            }
            break;
        }

        var $log = this.$log || $injector.get('$log');

        var params = (AvLogger.isObject(supplantData)) ? [message, supplantData] : [AvLogger.supplant(message, supplantData)];
        $log[originalFn].apply(null, params);

      };

      proto.log = function() {
        this._log('log', arguments);
      };

      proto.info = function() {
        this._log('info', arguments);
      };

      proto.warn = function() {
        this._log('warn', arguments);
      };

      proto.debug = function() {
        this._log('debug', arguments);
      };

      proto.error = function() {
        this._log('error', arguments);
      };

      return AvLogger;

    };

  });


})(window);

// Source: /lib/core/logger/logger-config.js
(function(root) {

  'use strict';

  var availity = root.availity;

  availity.core.config(function($provide) {

    $provide.decorator('$log', function($delegate, AvLogger) {
      return new AvLogger(null, $delegate);
    });

  });

})(window);

// Source: /lib/core/polling/polling.js
(function(root) {
  'use strict';

  var availity = root.availity;

  availity.core.constant('AV_POLLING', {
    INTERVAL: 1000, // delay in ms before retrying an async request
    MAX_ELAPSED_TIME: 5000, // max time in ms before polling stops and rejects original request
    MAX_RETRY: 30, // # of times the request will be tried
    DECAY: 1.2, // % the polling interval decays after every retry
    // maximum time polling is allowed before rejecting the request
    EVENTS: {
      MAX_RETRY: 'av:polling:max:retry'
    },
    REGEX_URL: /^.*?api.availity.com(.*)$/ // capture the relative url from API
  });

  var PollingServiceFactory = function($rootScope, $q, $injector, $timeout, $log, AV_POLLING, AV_API) {

    var AvPollingService = function() {
      this.pendingRequests = []; // stores all request for polling
    };

    var proto = AvPollingService.prototype;

    proto.response = function(response) {

      if(this.isAsyncResponse(response)) {
        return this.onAsyncReponse(response);
      }

      return response || $q.when(response);
    };

    proto.setDefaults = function(config) {

      var defaultOptions = {
        pollingInterval: AV_POLLING.INTERVAL,
        pollingDecay: AV_POLLING.DECAY,
        pollingMaxInterval: AV_POLLING.MAX_ELAPSED_TIME,
        pollingRetryCount: 0,
        pollingStartTime: new Date().getTime()
      };

      return _.extend(defaultOptions, config);
    };

    proto.responseError = function(response) {
      // Return the promise rejection
      return $q.reject(response);
    };

    /**
     * API layer return a link with a polling url for
     * async responses.
     *
     * @param  {Object}  response ajax response
     * @return {Boolean} true if response has status of 202 (accepted) and location param in header with uri+session link
     */
    proto.isAsyncResponse = function(response) {

      return response &&
        response.config &&
        response.config.api &&
        response.status &&
        response.status === 202 &&
        angular.isFunction(response.headers) && !availity.isBlank(response.headers(AV_API.HEADERS.LOCATION));
    };

    proto.onAsyncReponse = function(response) {

      response.config = this.setDefaults(response.config);

      var deferred = $q.defer();

      this.queueRequest(deferred, response);

      // [rm3]: Can't call notify before you return promise object?
      $timeout(function() {
        // Notify deferred listeners with the original server response
        deferred.notify(response);
      }, 0, false);

      return deferred.promise;
    };

    proto.getUrl = function(url) {

      var result = url.match(AV_POLLING.REGEX_URL);
      if(result && result[1]) {
        return '/api' + result[1];
      }

      return url;
    };

    proto.queueRequest = function(deferred, response) {

      var self = this;
      // server replies with location header so set the url into config
      var _url = availity.getRelativeUrl(response.headers(AV_API.HEADERS.LOCATION));
      var _config = response.config;

      var config = {
        method: 'GET',
        api: true,
        pollingInterval: _config.pollingInterval,
        pollingMaxRetry: _config.pollingMaxRetry,
        pollingMaxInterval: _config.pollingMaxInterval,
        pollingStartTime: _config.pollingStartTime,
        _pollingDecay: _config._pollingDecay,
        pollingRetryCount: _config.pollingRetryCount,
        pollingDecay: _config.pollingDecay,
        url: _url, /* set the url from the server response */
        cache: false
      };

      var request = {
        id: availity.uuid('request-'),
        config: config,
        deferred: deferred
      };

      var timeout = this.getPollingTimeout(config);

      // each async request should run on its own timer
      var timer = $timeout(function() {
        self.retryRequest(request.id);
      }, timeout, false);

      request.timer = timer;

      // add the async request to the queue
      this.pushRequest(request);

    };

    proto.popRequest = function(id) {

      var index = null;
      var request = null;

      for(var i = 0; i < this.pendingRequests.length; i++) {
        if(this.pendingRequests[i].id === id) {
          index = i;
          break;
        }
      }

      request = this.pendingRequests[index];
      this.pendingRequests.splice(index, 1);

      return request;
    };

    proto.pushRequest = function(request) {
      this.pendingRequests.push(request);
    };

    proto.getPollingTimeout = function(config) {
      return config.pollingDecay * config.pollingInterval;
    };

    proto.isPollingMaxTimeout = function(config) {
      var now = new Date().getTime();
      var elaspedTime = now - config.pollingStartTime;
      var isElapsed = elaspedTime > config.pollingMaxInterval;
      return isElapsed;
    },

      proto.isMaxRetried = function(config) {
        return config.pollingRetryCount >= AV_POLLING.MAX_RETRY;
      };

    proto.isPollable = function(config) {
      var _isTimeout = this.isPollingMaxTimeout(config);
      var _isMax = this.isMaxRetried(config);

      return _isTimeout || _isMax ? false : true;

    };

    proto.retryRequest = function(id) {

      var self = this;
      var request = this.popRequest(id);
      $timeout.cancel(request.timer);

      var config = request.config;

      var deferred = request.deferred;

      if(!this.isPollable(config)) {
        $log.info('Rejecting pollable response due to timeout');
        return deferred.reject(request);
      }

      // increment counters and polling timeouts
      this.increment(config);

      function successCallback(response) {
        if(self.isAsyncResponse(response)) {
          deferred.notify(response);
          self.queueRequest(request.deferred, response);
        } else {
          deferred.resolve(response);
        }
      }

      function errorCallback(response) {
        deferred.reject(response);
      }

      // Silly circular dependency trick
      var $http = $injector.get('$http');

      $http(config).then(successCallback, errorCallback);

    };

    proto.increment = function(config) {
      this.incrementCounter(config);
      this.incrementDecay(config);
    };

    proto.incrementDecay = function(config) {
      if(!config._pollingDecay) {
        // store the original decay param
        config._pollingDecay = config.pollingDecay;
      }
      config.pollingDecay *= config._pollingDecay;
    };

    proto.incrementCounter = function(config) {
      config.pollingRetryCount++;
    };

    proto.clearRequests = function() {
      angular.forEach(this.pendingRequests, function(request) {
        $timeout.cancel(request.timer);
      });
      this.pendingRequests = [];
    };

    return new AvPollingService();

  };

  availity.core.factory('avPollingService', PollingServiceFactory);

})(window);

// Source: /lib/core/api/api-factory.js
(function(root) {

  'use strict';

  var availity = root.availity;

  availity.core.constant('AV_API', {
    HEADERS: {
      ID: 'X-API-ID',
      GLOBAL_ID: 'X-Global-Transaction-ID',
      SESSION_ID: 'X-Session-ID',
      LOCATION: 'Location',
      OVERRIDE: 'X-HTTP-Method-Override',
      CALLBACK_URL: 'X-Callback-URL',
      CUSTOMER_ID: 'X-Availity-Customer-ID'
    }
  });

  var defaultOptions = {
    // pre-prend the url with a value like `/public` so we can build urls like `public/api/v1/*`
    prefix: '',
    // default base url for endpoints
    path: '/api',
    // url to resource endpoint like `coverages` or `payers`
    url: null,
    // defaults to version 1
    version: '/v1',
    // governance level `/internal`
    level: '',
    // post-pend the url with `.json`, `.txt` or `.xml`
    suffix: '',
    // cache all request by default
    cache: true,
    // flag used to enable behaviors around the Availity Rest API
    api: true,
    // # of times the polling service has tried to get a response
    pollingRetryCount: 0,
    // in ms
    pollingInterval: 1000,
    // % the polling interval decays after every retry
    pollingDecay: 1.2,
    // maximum time polling is allowed before rejecting the request
    pollingMaxInterval: 30000

  };

  // Factory that creates ApiResourcess
  var ApiResourcesFactory = function($http, $q, avPollingService) {

    var AvApiResource = function(options) {

      if(!options) {
        throw new Error('[options] cannot be null or undefined');
      }

      // if string the assume url is being passed in
      if(angular.isString(options)) {
        options = options.charAt(0) === '/' ? options : '/' + options;
        options = angular.extend({}, {url: options});
      }

      if(!options.url) {
        throw new Error('[url] cannot be null');
      }

      // get the default options and merge into this instance
      this.options = angular.extend({}, defaultOptions, (options || {}));
    };

    // Alias the prototype
    var proto = AvApiResource.prototype;

    proto._config = function(config) {
      return angular.extend({}, this.options, (config || {}));
    },

    proto._getUrl = function(id) {
      if(this.options.api) {
        return this._getApiUrl(id);
      }

      return this.options.url;
    };

    proto._createResponse = function(data, status, headers, config) {
      return {
        data: data,
        status: status,
        headers: headers,
        config: config
      };
    };

    proto._request = function(config, afterCallback) {

      var self = this;
      var defer = $q.defer();

      $http(config)
        .success(function(data, status, headers, _config) {

          var _response = {
            data: data,
            status: status,
            headers: headers,
            config: _config
          };

          // handle the async response if applicable
          var _promise = $q.when(avPollingService.response(_response));
          // notify the promise listener of the original response
          defer.notify(_response);

          // handle the polling service promise
          _promise.then(function(successResponse) {

            // if service has a callback then call it
            // var response = self._createResponse(data, status, headers, _config);
            if(afterCallback) {
              successResponse = afterCallback.call(self, successResponse);
            }
            defer.resolve(successResponse);
          }, function(errorResponse) {
            defer.reject(errorResponse);
          }, function(notifyResponse) {
            defer.notify(notifyResponse);
          });

        }).error(function(data, status, headers, _config) {
          var response = self._createResponse(data, status, headers, _config);
          defer.reject(response);
        });

      var promise = defer.promise;

      // recreate the success callback ala $http
      promise.success = function(fn) {
        promise.then(function(response) {
          fn(response.data, response.status, response.headers, response.config);
        });
        return promise;
      };

      // recreate the error callback ala $http
      promise.error = function(fn) {
        promise.then(null, function(response) {
          fn(response.data, response.status, response.headers, config);
        });
        return promise;
      };

      promise.always = promise['finally'];

      return promise;
    };

    proto._getApiUrl = function(id) {
      id = id ? '/' + id : '';
      return this.options.prefix + this.options.path + this.options.level + this.options.version + this.options.url + id + this.options.suffix;
    };

    proto.create = function(data, config) {

      if(!data) {
        throw new Error('called method without [data]');
      }

      if(this.beforeCreate) {
        this.beforeCreate(this, data);
      }

      config = this._config(config);
      config.method = 'POST';
      config.url = this._getUrl();
      config.data = data;

      return this._request(config, this.afterCreate);

    },


    proto.get = function(id, config) {

      if(!id) {
        throw new Error('called method without [id]');
      }

      config = this._config(config);
      config.method = 'GET';
      config.url = this._getUrl(id);

      return this._request(config, this.afterGet);

    };

    proto.query = function(config) {

      config = this._config(config);
      config.method = 'GET';
      config.url = this._getUrl();

      return this._request(config, this.afterQuery);

    };

    proto.update = function(id, data, config) {

      if(!id || !data) {
        throw new Error('called method without [id] or [data]');
      }

      config = this._config(config);
      config.method = 'PUT';
      config.url = this._getUrl(id);
      config.data = data;

      if(this.beforeUpdate) {
        data = this.beforeUpdate(data);
      }

      return this._request(config, this.beforeUpdate, this.afterUpdate);


    };

    proto.remove = function(id, config) {
      if(!id) {
        throw new Error('called method without [id]');
      }

      config = this._config(config);
      config.method = 'DELETE';
      config.url = this._getUrl(id);

      return this._request(config, this.afterRemove);
    };

    proto.beforeCreate = null;
    proto.afterCreate = null;
    proto.afterQuery = null;
    proto.afterGet = null;
    proto.beforeUpdate = null;
    proto.afterUpdate = null;
    proto.afterRemove = null;

    return AvApiResource;

  };

  availity.core.factory('AvApiResource', ApiResourcesFactory);

})(window);

// Source: /lib/core/api/api-users.js
(function(root) {
  'use strict';

  var availity = root.availity;

  var UserServiceFactory = function(AvApiResource, $q) {

    var AvUsersResource = function() {
      this.user = null;
      AvApiResource.call(this, 'users');
    };

    angular.extend(AvUsersResource.prototype, AvApiResource.prototype, {

      afterGet: function(response) {
        var user = response.data.user ? response.data.user : response.data;
        this.user = user;
        return user;
      },

      me: function() {

        if(this.user) {
          return $q.when(this.user);
        }

        return this.get('me');
      }

    });

    return new AvUsersResource();

  };

  availity.core.factory('avUsersResource', UserServiceFactory);

})(window);

// Source: /lib/core/api/api-coverages.js
(function(root) {

  'use strict';

  var availity = root.availity;

  availity.core.factory('avCoveragesResource', function(AvApiResource) {
    return new AvApiResource({version: '/v1', url: '/configurations', cache: false});
  });

})(window);

// Source: /lib/core/api/api-configurations.js
(function(root) {

  'use strict';

  var availity = root.availity;

  availity.core.factory('avConfigurationsResource', function(AvApiResource) {
    return new AvApiResource({version: '/v1', url: '/configurations'});
  });

})(window);

// Source: /lib/core/api/api-log-messages.js
(function(root) {

  'use strict';

  var availity = root.availity;

  var LogMessagesFactory = function(AvApiResource) {

    var logMessagesResource = new AvApiResource({
      version: '/v1',
      url: '/log-messages'
    });

    var buildRequest = function(level, entries) {

      var requestPayload = {};

      if(entries.level) {
        delete entries.level;
      }

      requestPayload.level = level;
      requestPayload.entries = entries;

      return requestPayload;
    };

    return {

      debug: function(entries) {
        return logMessagesResource.create(buildRequest('debug', entries));
      },

      info: function(entries) {
        return logMessagesResource.create(buildRequest('info', entries));
      },

      warn: function(entries) {
        return logMessagesResource.create(buildRequest('warn', entries));
      },

      error: function(entries) {
        return logMessagesResource.create(buildRequest('error', entries));
      }

    };
  };

  availity.core.factory('avLogMessagesResource', LogMessagesFactory);

})(window);

// Source: /lib/core/api/api-documents.js
(function(root) {

  'use strict';

  var availity = root.availity;

  var AvDocumentsResourceFactory = function(AvApiResource) {

    var AvDocumentsResource = function() {
      AvApiResource.call(this, 'documents');
    };

    angular.extend(AvDocumentsResource.prototype, AvApiResource.prototype, {

      getContents: function(id) {
        var config = this._config();
        config.url = this.getContentsUrl(id);
        return this._request(config);
      },

      getContentsUrl: function(id) {
        return this._getUrl(id) + '/contents';
      }

    });

    return new AvDocumentsResource();

  };

  availity.core.factory('avDocumentsResource', AvDocumentsResourceFactory);

})(window);

// Source: /lib/core/api/api-organizations.js
(function(root) {

  'use strict';

  var availity = root.availity;

  var OrganizationResourceFactory = function(AvApiResource) {

    var OrganizationResource = function() {
      AvApiResource.call(this, 'organizations');
    };

    angular.extend(OrganizationResource.prototype, AvApiResource.prototype, {

      getOrganizations: function() {
        return this.query().then(function(response) {
          return response.data.organizations ? response.data.organizations : response.data;
        });
      }

    });

    return new OrganizationResource();
  };

  availity.core.factory('avOrganizationsResource', OrganizationResourceFactory);

})(window);

// Source: /lib/core/api/api-codes.js
(function(root) {

  'use strict';

  var availity = root.availity;

  availity.core.factory('avCodesResource', function(AvApiResource) {
    return new AvApiResource({version: '/v1', url: '/codes'});
  });

})(window);

// Source: /lib/core/api/api-user-permissions.js
(function(root) {

  'use strict';

  var availity = root.availity;

  var AvUserPermissionsResourceFactory = function(AvApiResource) {

    var AvUserPermissionsResource = function() {
      AvApiResource.call(this, {
        level: '/internal',
        version: '/v1',
        url: '/axi-user-permissions'
      });
      this.sessionDate = moment().toISOString();
    };

    angular.extend(AvUserPermissionsResource.prototype, AvApiResource.prototype, {

      afterQuery: function(response) {
        return response.data.axiUserPermissions ? response.data.axiUserPermissions : [];
      },

      getPermissions: function(permissionIds, region) {
        var self = this;
        return this.query({
          params: {
            permissionId: permissionIds,
            region: region,
            sessionDate: self.sessionDate
          }
        });
      }

    });

    return new AvUserPermissionsResource();

  };

  availity.core.factory('avUserPermissionsResource', AvUserPermissionsResourceFactory);

})(window);

// Source: /lib/core/authorizations/user-authorizations.js
(function(root) {
  'use strict';

  var availity = root.availity;

  var AvUserAuthorizationsFactory = function($q, $log, avUserPermissionsResource) {

    /**
     *
     * @constructor
     */
    var AvUserAuthorizations = function() {
      /**
       * Region is used to return permission/resources relative to region. If null service will
       * return all permission relative to current.  If value 'ALL' used it will return value relative
       * to all regions the user has access to.
       * @type {string}
       */
      this.region = null;
      /**
       * PermissionIds contains the set of permissionIds to request from service. If user of service calls
       * setPermissionIds() or call getPermissions() with complete set of permissionIds needed by application,
       * then service should only make that one hit to retrieve permission information.
       * @type {Array}
       */
      this.permissionIds = [];
    };

    var proto = AvUserAuthorizations.prototype;

    proto.setRegion = function(region) {
      this.region = region;
      return this;
    };

    proto.setPermissionIds = function(permissionIds) {
      if(!angular.isArray(permissionIds)) {
        throw new Error('permissionsIds must be an array of string IDs for avUserAuthorizations#addPermissionIds');
      }
      this.permissionIds = permissionIds;
      return this;
    };

    proto.isAuthorized = function(permissionId) {
      return this.getPermission(permissionId).then(function(permission) {
        return permission.isAuthorized;
      });
    };

    proto.isAnyAuthorized = function(permissionIds) {
      return this.getPermissions(permissionIds).then(function(permissions) {
        var permission = _.findWhere(permissions, {isAuthorized: true});
        return permission !== undefined;
      });
    };

    proto.getPermission = function(permissionId) {
      if(!angular.isString(permissionId)) {
        throw new Error('permissionsId must be a string ID for avUserAuthorizations#getPermission');
      }

      return this.getPermissions([permissionId])
        .then(function(_permissions) {
          return _permissions[permissionId];
        });
    };

    proto.getPermissions = function(permissionIds) {
      var self = this;

      if(!angular.isArray(permissionIds)) {
        throw new Error('permissionsIds must be an array of string IDs for avUserAuthorizations#getPermissions');
      }
      // merge permission ids to reduce calls to backend
      self.permissionIds = _.union(self.permissionIds, permissionIds);

      return avUserPermissionsResource
        .getPermissions(self.permissionIds, self.region)
        .then(function(_permissions) {
          return self.toPermissionMap(permissionIds, _permissions);
        });
    };

    proto.getOrganizations = function(permissionId) {
      return this.getPermission(permissionId).then(function(permission) {
        return permission.organizations;
      });
    };

    proto.getPayers = function(permissionId, organizationId) {
      return this.getPermission(permissionId).then(function(permission) {
        var organization = _.findWhere(permission.organizations, {id: organizationId});

        if(organization && organization.resources) {
          return organization.resources;
        }
        return [];
      });

    };

    /**
     * Converts array permissions to map with value for each permissionId, creating empty permission
     * if can't find permission in array
     * @private
     */
    proto.toPermissionMap = function(permissionIds, permissions) {
      var self = this;
      var map = {};
      permissions = _.slice(permissions);
      _.forEach(permissionIds, function(permissionId) {
        var key = {id: permissionId};
        var permission = _.findWhere(permissions, key);
        permission = permission ? self.toPermission(permission) : self.toPermission(key);
        map[permission.id] = permission;
      });
      return map;
    };

    /**
     * Convert a permission resource into a structure that is easier to work with.
     * @private
     */
    proto.toPermission = function(permission) {
      return {
        id: permission.id,
        description: permission.description ? permission.description : '',
        geographies: permission.geographies ? permission.geographies : [],
        organizations: permission.organizations ? permission.organizations : [],
        isAuthorized: permission.organizations ? permission.organizations.length > 0 : false
      };
    };

    return new AvUserAuthorizations();

  };

  availity.core.factory('avUserAuthorizations', AvUserAuthorizationsFactory);

})(window);

// Source: /lib/core/session/session.js
(function(root) {
  'use strict';

  var availity = root.availity;

  availity.core.constant('AV_SESSION', {
    SESSION_TIMEOUT: 'av:auth:session:timeout',
    NOT_AUTHORIZED: 'av:auth:not:authorized'
  });

  availity.core.factory('avSession', function($q, avUsersResource) {

    var AvSession = function() {
      this.user = null;
      this.permissions = null;
    };

    var proto = AvSession.prototype;

    proto.getUser = function() {
      var self = this;

      if(this.user) {
        return $q.when(this.user);
      }

      return avUsersResource.me().then(function(user) {
        self.user = user;
        return self.user;
      });
    };


    proto.destroy = function() {
      this.user = null;
      this.permisions = null;
    };

    return new AvSession();
  });

})(window);

// Source: /lib/core/idle/idle.js
// Inspiration => https://github.com/HackedByChinese/ng-idle
//
// Rules:
//
//  * ping after 3 minutes from last human activity
//  * reset session after api success except 401
//  * idle show after 25 of inactivity
//
(function(root) {

  'use strict';

  var availity = root.availity;

  availity.core.constant('AV_IDLE', {
    EVENTS: {
      IDLE_INACTIVE: 'av:idle:inactive',
      IDLE_ACTIVE: 'av:idle:active',
      SESSION_TIMEOUT_ACTIVE: 'av:idle:session:active',
      SESSION_TIMEOUT_REDIRECT: 'av:idle:session:redirect',
      HUMAN: 'keydown.av.idle mousedown.av.idle keydown.av.idle',
      MACHINE: '$locationChangeSuccess'
    },
    INTERVALS: {
      PING: 3 * 60 * 1000, // 3 minutes
      IDLE: 25 * 60 * 1000, // 25 minutes
      SESSION: 30 * 60 * 1000 // 30 minutes
    },
    URLS: {
      HOME: '/availity/web/public.elegant.login',
      PING: '/api/v1/users/me'
    }
  });

  availity.core.provider('avIdle', function(AV_IDLE) {

    var enabled = true;
    var pingUrl;
    var redirectUrl;
    var sessionTimeout;
    var idleTimeout;
    var pingTimeout;

    this.enable = function(value) {
      if(arguments.length) {
        enabled = !!value;
      }
      return enabled;
    };

    this.setSessionTimeout = function(timeout) {
      sessionTimeout = timeout || AV_IDLE.INTERVALS.SESSION;
    };

    this.setIdleTimeout = function(timeout) {
      idleTimeout = timeout || AV_IDLE.INTERVALS.IDLE;
    };

    this.setPingTimeout = function(timeout) {
      pingTimeout = timeout || AV_IDLE.INTERVALS.PING;
    };

    this.setPingUrl = function(url) {
      pingUrl = url || AV_IDLE.URLS.PING;
    };

    this.$get = function(AV_IDLE, $log, $document, $rootScope, $timeout, avThrottle, $q, $injector) {

      var AvIdle = function() {

        // $timeout references
        this._idleTimer = null;
        this._sessionTimer = null;
        this._pingTimer = null;
        this._keepAlive = null;

        // flag used to track if the if user is idle or session expired
        this.idleActive = false;
        this.sessionActive = false;

        this.listeners = [];

        this.init();

      };

      var proto = AvIdle.prototype;

      proto.init = function() {

        if(!enabled) {
          this.stop();
          return;
        }

        this.start();
      };

      proto.start = function() {

        $log.info('avIdle start');

        var self = this;
        var listener;

        !sessionTimeout && this.setSessionTimeout();
        !idleTimeout && this.setIdleTimeout();
        !pingTimeout && this.setPingTimeout();
        !pingUrl && this.setPingUrl();
        !redirectUrl && this.setRedirectUrl();

        $rootScope.$on('$destroy', function() {
          self.stop();
        });

        $document.find('body').on(AV_IDLE.EVENTS.HUMAN, function(event) {
          self.onEvent(event);
        });

        listener = $rootScope.$on(AV_IDLE.EVENTS.MACHINE, function(event, oldUrl, newUrl) {
          if(oldUrl !== newUrl) {
            self.onEvent(event);
          }
        });
        this.listeners.push(listener);

        $rootScope.$on(AV_IDLE.EVENTS.SESSION_TIMEOUT_REDIRECT, function() {
          document.location.href = redirectUrl;
        });

        this.startIdleTimer();
        this.startSessionTimer();
      };

      proto.stop = function() {

        $document.find('body').off(AV_IDLE.EVENTS.HUMAN);

        // turns off Angular event listeners @see http://stackoverflow.com/a/14898795
        _.each(this.listeners, function(listener) {
          listener();
        });

        this.stopPing();
        this.stopSessionTimer();
        this.stopIdleTimer();
      };

      proto.isEnabled = function() {
        return enabled;
      };

      proto.enable = function(value) {
        if(arguments.length) {
          enabled = !!value;
        }

        return this;
      };

      proto.setSessionTimeout = function(timeout) {
        sessionTimeout = timeout || AV_IDLE.INTERVALS.SESSION;
        return this;
      };

      proto.setIdleTimeout = function(timeout) {
        idleTimeout = timeout || AV_IDLE.INTERVALS.IDLE;
        return this;
      };

      proto.setPingTimeout = function(timeout) {
        pingTimeout = timeout || AV_IDLE.INTERVALS.PING;
        return this;
      };

      proto.setPingUrl = function(url) {
        pingUrl = url || AV_IDLE.URLS.PING;
        return this;
      };

      proto.setRedirectUrl = function(url) {
        redirectUrl = url || AV_IDLE.URLS.HOME;
        return this;
      };

      proto.response = function(response) {

        if(this.isApiRequest(response)) {
          this.startSessionTimer();
        }

        return response;
      };

      proto.isApiRequest = function(response) {
        return response && response.config && response.config.api;
      };

      proto.responseError = function(response) {

        if(this.isApiRequest(response) && response.status !== 401) {
          this.startSessionTimer();
        }

        if(this.isApiRequest() && response.status === 401) {
          this.stopPing();
        }

        return $q.reject(response);
      };

      proto.startSessionTimer = function() {

        var self = this;

        this.stopSessionTimer();

        var later = function() {
          $log.info('avIdle session has TIMED OUT');
          self.stop();
          $rootScope.$broadcast(AV_IDLE.EVENTS.SESSION_TIMEOUT_ACTIVE);
        };

        $log.info('avIdle session timer has STARTED');
        this._sessionTimer = $timeout(later, sessionTimeout, false);

      };

      proto.stopSessionTimer = function() {
        $log.info('avIdle session timer has STOPPED');
        $timeout.cancel(this._sessionTimer);
      };

      proto.startIdleTimer = function() {

        var self = this;

        this.stopIdleTimer();

        var later = function() {
          self.stopIdleTimer();
          $log.info('avIdle is IDLING');
          $rootScope.$broadcast(AV_IDLE.EVENTS.IDLE_ACTIVE);
        };

        $log.info('avIdle idle timer has STARTED');
        this._idleTimer = $timeout(later, idleTimeout, false);
      };

      proto.stopIdleTimer = function() {
        $log.info('avIdle idle timer has STOPPED');
        $timeout.cancel(this._idleTimer);
      };

      proto.startPing = function() {

        if(!this._keepAlive) {
          $log.info('avIdle ping timer has STARTED');
          this._keepAlive = avThrottle(this.keepAlive, pingTimeout, {context: this});
        }

        this._pingTimer = this._keepAlive();
      };

      proto.stopPing = function() {
        $log.info('avIdle ping timer has STOPPED');
        if(this._pingTimer) {
          $timeout.cancel(this._pingTimer);
        }
      };

      proto.keepAlive = function() {

        // destroy the reference to that a new throttle gets created upon
        // next user or system event
        this._keepAlive = null;
        var $http = $injector.get('$http');

        $http.get(pingUrl, {
          cache: false,
          api: true
        }).success(function() {
          $log.info('avIdle keep-alive SUCCESS');
        }).error(function() {
          $log.error('avIdle keep-alive FAILURE');
        });
      };

      proto.onEvent = function() {
        this.startIdleTimer();
        this.startPing();
      };

      return new AvIdle();

    };

  });

})(window);

// Source: /lib/core/idle/idle-interceptor.js
(function(root) {

  'use strict';

  var availity = root.availity;

  availity.core.factory('avIdleInterceptor', function(avIdle) {
    return {
      response: function(response) {
        return avIdle.response(response);
      },
      responseError: function(response) {
        return avIdle.responseError(response);
      }
    };

  });

  availity.core.config(function($httpProvider) {
    $httpProvider.interceptors.push('avIdleInterceptor');
  });

})(window);

// Source: /lib/core/validation/validator.js
(function(root) {

  'use strict';

  var availity = root.availity;

  availity.core.value('avValConfig', {
    classes: {
      valid: 'ng-valid',
      invalid: 'ng-invalid',
      dirty: 'ng-dirty',
      pristine: 'ng-pristine',
      touched: 'ng-touched',
      untouched: 'ng-untouched',
      submitted: 'ng-submitted'
    },
    validators: [
      'avValPattern',
      'avValSize',
      'avValRequired',
      'avValDateRange',
      'avValDate'
    ]
  });

  availity.core.constant('AV_VAL', {
    EVENTS: {
      REVALIDATE: 'av:val:revalidate',
      SUBMITTED: 'av:val:submitted',
      FAILED: 'av:val:failed',
      RESET: 'av:val:reset'
    },
    DEBOUNCE: 500,
    DATE_FORMAT: {
      SIMPLE: 'MM/DD/YYYY'
    },
    PATTERNS: {
      ALPHA_ONLY: /[^A-Za-z]+/g,
      NUMERIC_ONLY: /[^0-9]+/g
    }
  });

  availity.core.provider('avVal', function() {

    var that = this;

    this.rules = {};

    this.addRules = function(rules) {
      this.rules = angular.extend(this.rules, rules);
    };

    this.$get = function($injector, $rootScope, $http, $log, avValConfig, AV_VAL) {

      var AvValidation = function() {
        this.rules = that.rules;
        this.validators = [];
        this.initValidators();
      };

      var proto = AvValidation.prototype;

      proto.initValidators = function() {
        var self = this;

        angular.forEach(avValConfig.validators, function(name) {
          var validator = $injector.get(name);
          self.validators[validator.name] = validator;
        });
      };

      proto.clearAll = function() {
        // this.validators.splice(0, this.validators.length);
        // this.rules = {};
      };

      proto.addRules = function(rules) {
        this.rules = angular.extend(this.rules, rules);
        $rootScope.$broadcast(AV_VAL.EVENTS.REVALIDATE);
      };

      proto.validate = function(key, element, value, ruleName) {

        var self = this;

        var rules = this.rules[key];
        if(!rules) {
          $log.error('Failed to get rules key [' + key + '].  Forms must be tagged with a rules set name for validation to work.');
          return;
        }
        var contraints = rules[ruleName];
        if(!contraints) {
          $log.info('Rule named [' + ruleName + '] could not be found in the current schema.');
          contraints = [];
        }

        var el = element[0];
        var results  = [];
        var violations = [];
        var _valid = true;

        angular.forEach(contraints, function(rule, contraintName) {

          if(!rule) {
            // when extended rule sets, a user can pass nulls to cancel out a rule so if
            // one doesn't exist just continue
            return;
          }

          var validator = self.validators[contraintName];

          if(angular.isUndefined(validator)) {
            $log.warn('No validator defined for `' + name + '`');
            return;
          }

          var valid = validator.validate(value, rule);

          var validationResult = {
            valid: valid,
            ruleName: ruleName,
            contraintName: contraintName,
            value: value,
            message: rule.message,
            field: el.name || el.id
          };

          // $log.info(validationResult);

          var result = angular.extend({}, rule, validationResult);

          results.push(result);
          if(!valid) {
            violations.push(validationResult);
          }
          _valid = _valid && valid;
        });

        return {
          isValid: _valid,
          all: results, // all the constraint results
          violations: violations
        };

      };

      return new AvValidation();
    };

  });
})(window);

// Source: /lib/core/validation/validators/validator-utils.js
(function(root) {

  'use strict';

  var availity = root.availity;

  availity.core.factory('avValUtils', function() {

    return {

      isDefined: function(value) {
        return angular.isDefined(value) && value !== '' && value !== null;
      },

      isEmpty: function(value) {
        return !this.isDefined(value) || $.trim(value) === '';
      }
    };

  });
})(window);


// Source: /lib/core/validation/validators/validator-size.js
(function(root) {

  'use strict';

  var availity = root.availity;

  availity.core.factory('avValSize', function(avValUtils) {

    var validator =  {
      name: 'size',
      validate: function(value, rule) {
        var minLength = rule.min || 0;
        var maxLength = rule.max;

        value = value || '';
        return avValUtils.isEmpty(value) || value.length >= minLength && (maxLength === undefined || value.length <= maxLength);
      }
    };

    return validator;

  });
})(window);

// Source: /lib/core/validation/validators/validator-pattern.js
(function(root) {
  'use strict';

  var availity = root.availity;

  availity.core.factory('avValPattern', function(avValUtils) {

    var validator =  {
      name: 'pattern',
      REGEX: /^\/(.*)\/([gim]*)$/, //regular expression to test a regular expression
      asRegExp: function(pattern) {
        var match;

        if(pattern.test) {
          return pattern;
        } else {
          match = pattern.match(validator.REGEX);
          if(match) {
            return new RegExp(match[1], match[2]);
          } else {
            throw ('Expected ' + pattern + ' to be a RegExp');
          }
        }
      },
      validate: function(value, rule) {
        var values = _.isArray(rule.value) ? rule.value : [rule.value];

        var valid = false;

        _.each(values, function(expresion) {
          var pattern = validator.asRegExp(expresion);
          if(avValUtils.isEmpty(value) || pattern.test(value)) {
            valid = true;
          }
        });

        return valid;
      }
    };

    return validator;

  });
})(window);

// Source: /lib/core/validation/validators/validator-required.js
(function(root) {

  'use strict';

  var availity = root.availity;

  availity.core.factory('avValRequired', function(avValUtils) {

    var validator =  {
      name: 'required',
      validate: function(value) {
        return !avValUtils.isEmpty(value);
      }
    };

    return validator;

  });
})(window);

// Source: /lib/core/validation/validators/validator-date-range.js
(function(root) {

  'use strict';

  var availity = root.availity;

  availity.core.factory('avValDateRange', function(AV_VAL, avValUtils) {

    var validator = {

      name: 'dateRange',

      getStartDate: function(start) {
        return validator.setMin(moment().add(start.value, start.units));
      },

      getEndDate: function(end) {
        return validator.setMax(moment().add(end.value, end.units) );
      },

      setMin: function(value) {

        // [fix]: if time is provided this may cause issues.
        value.set('hours', 0);
        value.set('minutes', 0);
        value.set('seconds', 0);

        return value;
      },

      setMax: function(value) {

        // [fix]: if time is provided this may cause issues.
        value.set('hours', 23);
        value.set('minutes', 59);
        value.set('seconds', 59);

        return value;
      },

      validation: function(value, rules) {

        var date;
        var startDate;
        var endDate;

        date = moment(value, rules.format || AV_VAL.DATE_FORMAT.SIMPLE);
        date.set('hours', 0);
        date.set('minutes', 0);
        date.set('seconds', 0);

        if(!avValUtils.isEmpty(rules.start.units) && !avValUtils.isEmpty(rules.end.units)) {
          startDate = validator.getStartDate(rules.start);
          endDate = validator.getEndDate(rules.end);
        } else {
          startDate = moment(rules.start.value, rules.format);
          endDate = validator.setMax(moment(rules.end.value, rules.format));
        }
        return date.isBetween(startDate, endDate, 'day') || date.isSame(startDate, 'day') || date.isSame(endDate, 'day');
      },

      validate: function(value, rule) {
        return avValUtils.isEmpty(value) || validator.validation(value, rule);
      }

    };

    return validator;
  });
})(window);

// Source: /lib/core/validation/validators/validator-date-format.js
(function(root) {

  'use strict';

  var availity = root.availity;

  availity.core.factory('avValDate', function(AV_VAL, avValUtils) {

    var validator = {
      name: 'dateFormat',
      validate: function(value, rules) {
        var format = rules && rules.format ? rules.format : AV_VAL.DATE_FORMAT.SIMPLE;
        return avValUtils.isEmpty(value) || moment(value, format, true).isValid();
      }
    };
    return validator;
  });
})(window);

// Source: /lib/core/utils/globals.js
(function(root) {

  'use strict';

  var availity = root.availity;

  availity.core.constant('AV_GLOBALS', {
    REGIONS: [
      {
        'name': 'Alabama',
        'code': 'AL'
      },
      {
        'name': 'Alaska',
        'code': 'AK'
      },
      {
        'name': 'Arizona',
        'code': 'AZ'
      },
      {
        'name': 'Arkansas',
        'code': 'AR'
      },
      {
        'name': 'California',
        'code': 'CA'
      },
      {
        'name': 'Colorado',
        'code': 'CO'
      },
      {
        'name': 'Connecticut',
        'code': 'CT'
      },
      {
        'name': 'Delaware',
        'code': 'DE'
      },
      {
        'name': 'District Of Columbia',
        'code': 'DC'
      },
      {
        'name': 'Florida',
        'code': 'FL'
      },
      {
        'name': 'Georgia',
        'code': 'GA'
      },
      {
        'name': 'Hawaii',
        'code': 'HI'
      },
      {
        'name': 'Idaho',
        'code': 'ID'
      },
      {
        'name': 'Illinois',
        'code': 'IL'
      },
      {
        'name': 'Indiana',
        'code': 'IN'
      },
      {
        'name': 'Iowa',
        'code': 'IA'
      },
      {
        'name': 'Kansas',
        'code': 'KS'
      },
      {
        'name': 'Kentucky',
        'code': 'KY'
      },
      {
        'name': 'Louisiana',
        'code': 'LA'
      },
      {
        'name': 'Maine',
        'code': 'ME'
      },
      {
        'name': 'Maryland',
        'code': 'MD'
      },
      {
        'name': 'Massachusetts',
        'code': 'MA'
      },
      {
        'name': 'Michigan',
        'code': 'MI'
      },
      {
        'name': 'Minnesota',
        'code': 'MN'
      },
      {
        'name': 'Mississippi',
        'code': 'MS'
      },
      {
        'name': 'Missouri',
        'code': 'MO'
      },
      {
        'name': 'Montana',
        'code': 'MT'
      },
      {
        'name': 'Nebraska',
        'code': 'NE'
      },
      {
        'name': 'Nevada',
        'code': 'NV'
      },
      {
        'name': 'New Hampshire',
        'code': 'NH'
      },
      {
        'name': 'New Jersey',
        'code': 'NJ'
      },
      {
        'name': 'New Mexico',
        'code': 'NM'
      },
      {
        'name': 'New York',
        'code': 'NY'
      },
      {
        'name': 'North Carolina',
        'code': 'NC'
      },
      {
        'name': 'North Dakota',
        'code': 'ND'
      },
      {
        'name': 'Ohio',
        'code': 'OH'
      },
      {
        'name': 'Oklahoma',
        'code': 'OK'
      },
      {
        'name': 'Oregon',
        'code': 'OR'
      },
      {
        'name': 'Pennsylvania',
        'code': 'PA'
      },
      {
        'name': 'Rhode Island',
        'code': 'RI'
      },
      {
        'name': 'South Carolina',
        'code': 'SC'
      },
      {
        'name': 'South Dakota',
        'code': 'SD'
      },
      {
        'name': 'Tennessee',
        'code': 'TN'
      },
      {
        'name': 'Texas',
        'code': 'TX'
      },
      {
        'name': 'Utah',
        'code': 'UT'
      },
      {
        'name': 'Vermont',
        'code': 'VT'
      },
      {
        'name': 'Virginia',
        'code': 'VA'
      },
      {
        'name': 'Washington',
        'code': 'WA'
      },
      {
        'name': 'West Virginia',
        'code': 'WV'
      },
      {
        'name': 'Wisconsin',
        'code': 'WI'
      },
      {
        'name': 'Wyoming',
        'code': 'WY'
      }
    ]
  });

})(window);

//# sourceMappingURL=maps/availity-angular.js.map