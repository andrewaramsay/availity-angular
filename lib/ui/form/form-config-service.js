(function(root) {
  'use strict';

  var availity = root.availity;

  availity.ui.factory('avFormConfigService', function($q, avConfigurationsResource, avValRequiredFieldCombinations) {
    function FormConfigService() {
      this.registeredInstances = {};
    }

    var proto = FormConfigService.prototype;

    proto.registerInstance = function(id, fn) {
      this.registeredInstances[id] = fn;
    };

    proto.unregisterInstance = function(id) {
      delete this.registeredInstances[id];
    };

    proto.triggerInstance = function(id, deferred) {
      if(this.registeredInstances[id]) {
        this.registeredInstances[id].update(deferred);
      } else {
        deferred.reject();
      }
    };

    proto.resetInstance = function(id, deferred) {
      if(this.registeredInstances[id]) {
        this.registeredInstances[id].reset(deferred);
      } else {
        deferred.resolve();
      }
    };

    proto.setRequiredFieldFunction = function(fn) {
      this.requiredFieldFn = fn;
    };

    proto._buildPayerDefinition = function(payerId, tranType, payerConfigMap, editMode) {
      var payerDef = {};
      availity.deepExtend(payerDef, _.get(payerConfigMap, payerId + '.' + tranType + '.formDefinition', payerConfigMap) || {});
      var editDef = _.get(payerConfigMap, payerId + '.' + tranType + '.edit.formDefinition', payerConfigMap);
      var newRequestDef = _.get(payerConfigMap, payerId + '.' + tranType + '.newRequest.formDefinition', payerConfigMap);
      if(editMode && editDef) {
        availity.deepExtend(payerDef, editDef);
      } else if(!editMode && newRequestDef) {
        availity.deepExtend(payerDef, newRequestDef);
      }
      return payerDef;
    };

    proto._buildBaseOverrides = function(tranType, baseOverrides, editMode) {
      var defaultOverrides = {};
      if(baseOverrides && baseOverrides[tranType]) {
        availity.deepExtend(defaultOverrides, baseOverrides[tranType]['base'] || {});
        var editDefaultOverrides = baseOverrides[tranType]['edit'];
        var newRequestDefaultOverrides = baseOverrides[tranType]['newRequest'];
        if(editMode && editDefaultOverrides) {
          availity.deepExtend(defaultOverrides, editDefaultOverrides);
        } else if(!editMode && newRequestDefaultOverrides) {
          availity.deepExtend(defaultOverrides, newRequestDefaultOverrides);
        }
      }

      return defaultOverrides;
    };

    proto._buildPayerOverrides = function(payerId, tranType, payerConfigMap, editMode) {
      var payerConfigOverrides = {};
      availity.deepExtend(payerConfigOverrides, _.get(payerConfigMap, payerId + '.' + tranType + '.payerConfigOverrides', payerConfigMap) || {});
      var editConfigOverrides = _.get(payerConfigMap, payerId + '.' + tranType + '.edit.payerConfigOverrides', payerConfigMap);
      var newRequestConfigOverrides = _.get(payerConfigMap, payerId + '.' + tranType + '.newRequest.payerConfigOverrides', payerConfigMap);
      if(editMode && editConfigOverrides) {
        availity.deepExtend(payerConfigOverrides, editConfigOverrides);
      } else if(!editMode && newRequestConfigOverrides) {
        availity.deepExtend(payerConfigOverrides, newRequestConfigOverrides);
      }
      return payerConfigOverrides;
    };

    proto.getRequestForm = function(formConfig, baseOverrides, payerConfigMap, defaultConfigs, tranType, payerId, customerId, models, ruleSet, editMode) {
      var customScopeObjects = {};
      var deferred = $q.defer();
      if(payerId) {
        var self = this;
        this._getConfiguration(customerId, payerId, tranType).then(function(configurations) {
          self.payerFormDefinition = {};
          self.payerFormConfig = {};

          var payerDef = self._buildPayerDefinition(payerId, tranType, payerConfigMap, editMode);
          var defaultOverrides = self._buildBaseOverrides(tranType, baseOverrides, editMode);
          var payerConfigOverrides = self._buildPayerOverrides(payerId, tranType, payerConfigMap, editMode);

          availity.deepExtend(self.payerFormDefinition, formConfig, payerDef);
          availity.deepExtend(self.payerFormConfig, _.first(configurations), defaultOverrides, payerConfigOverrides);
          self._buildRequestForm(deferred, self.payerFormDefinition, self.payerFormConfig, models, ruleSet, customScopeObjects);
        });
      } else {
        this.payerFormConfig = defaultConfigs[tranType];
        this.payerFormDefinition = formConfig;
        this._buildRequestForm(deferred, this.payerFormDefinition, this.payerFormConfig, models, ruleSet, customScopeObjects);
      }
      return deferred.promise;
    };

    proto.setDefaultValues = function(models) {
      this._setDefaultValues(models, this.payerFormDefinition);
    };

    proto._setDefaultValues = function(models, config, elementId) {
      if(config.elements) {
        var self = this;
        _.forEach(config.elements, function(element, myId) {
          if(myId) {
            self._setDefaultValues(models, element, myId);
          }
        });
        return;
      } else if(!elementId) {
        return;
      }
      var payerElementConfig = this.payerFormConfig.elements[elementId];
      if(payerElementConfig) {
        this._setDefaultValue(elementId, config, payerElementConfig, models);
      }
    };

    proto._getConfiguration = function(customerId, payerId, tranType) {
      var deferred = $q.defer();
      var result = avConfigurationsResource.query({params: {customerId: customerId, payerId: payerId, type: tranType}});
      result.then(function(data) {
        deferred.resolve(data.data.configurations);
      });
      return deferred.promise;
    };

    proto._buildRequestForm = function(deferred, formConfig, payerConfig, models, ruleSet, customScopeObjects) {
      this.styler = formConfig.styler;
      var formContainer = this._buildElementContainer(formConfig, payerConfig, models, ruleSet, customScopeObjects);
      if(formConfig.onAfterBuild) {
        var result = formConfig.onAfterBuild(formContainer);
        if(result && result.then) {
          result.then(function() { deferred.resolve({form: formContainer, customScope: customScopeObjects}); });
        } else {
          deferred.resolve({form: formContainer, customScope: customScopeObjects});
        }
      } else {
        deferred.resolve({form: formContainer, customScope: customScopeObjects});
      }
    };

    proto._buildElementContainer = function(containerConfig, payerConfig, models, ruleSet, customScopeObjects) {
      var elementContainer = angular.element(containerConfig.template);
      var injectionPoint = elementContainer.find('[data-inject]');
      if(injectionPoint.length === 0) {
        injectionPoint = elementContainer;
      }
      var self = this;
      if(containerConfig.ruleSetId && containerConfig.additionalValidators) {
        ruleSet[containerConfig.ruleSetId] = containerConfig.additionalValidators;
      }
      if(containerConfig.fieldCombinationId && containerConfig.fieldCombinationMap && containerConfig.ruleSetId) {
        if(payerConfig.requiredFieldCombinations &&
          payerConfig.requiredFieldCombinations[containerConfig.fieldCombinationId] &&
          payerConfig.requiredFieldCombinations[containerConfig.fieldCombinationId].length > 0) {
          ruleSet[containerConfig.ruleSetId] = {
            requiredFieldCombinations: avValRequiredFieldCombinations.getValidator(payerConfig.requiredFieldCombinations[containerConfig.fieldCombinationId], containerConfig.fieldCombinationMap)
          };
        }
      }
      if(containerConfig.elements) {
        var elements = _.sortBy(availity.objectToArray(containerConfig.elements, 'elementId'), function(element) {
          if(element.order) {
            return parseFloat(element.order);
          }
          return Number.MAX_SAFE_INTEGER;
        });
        _.forEach(elements, function(elementConfig) {
          var elementId = elementConfig.elementId;
          if(elementConfig.elements) {
            var innerContainer = self._buildElementContainer(elementConfig, payerConfig, models, ruleSet, customScopeObjects);
            injectionPoint.append(innerContainer);
          } else {
            var payerElementConfig = payerConfig.elements[elementId];
            var element = self._buildElement(elementId, elementConfig, payerElementConfig, models, ruleSet, customScopeObjects);
            if(element) {
              injectionPoint.append(element);
            }
          }
        });
      }
      return elementContainer;
    };

    proto._buildElement = function(elementId, baseElementConfig, payerElementConfig, models, ruleSet, customScopeObjects) {
      if(!payerElementConfig) {
        payerElementConfig = {type: 'Custom'};
      }
      if(baseElementConfig.ignore || payerElementConfig.type === 'Unsupported') {
        return;
      }
      if(baseElementConfig.payerFieldOverrides) {
        _.assign(payerElementConfig, baseElementConfig.payerFieldOverrides);
      }
      if(baseElementConfig.customScope) {
        customScopeObjects[elementId] = baseElementConfig.customScope;
      }

      var element = angular.element(baseElementConfig.template);
      this._updateElementModel(elementId, baseElementConfig, payerElementConfig, models);
      this._updateElementValidationRules(elementId, element, baseElementConfig, payerElementConfig, ruleSet);
      this._processElement(baseElementConfig, payerElementConfig, element, models);

      return element;
    };

    proto._updateElementModel = function(elementId, baseElementConfig, payerElementConfig, models) {
      if(payerElementConfig.type === 'Enumeration') {
        models[baseElementConfig.repeatKey] = payerElementConfig.values;
      }
      this._setDefaultValue(elementId, baseElementConfig, payerElementConfig, models);
    };

    proto._setDefaultValue = function(elementId, baseElementConfig, payerElementConfig, models) {
      if(baseElementConfig.ignoreDefaultValues) {
        return;
      }
      if(!payerElementConfig.defaultValue && !baseElementConfig.setAsUndefinedIfNoDefaultValue) {
        return;
      }
      var modelKey = baseElementConfig.modelKey ? baseElementConfig.modelKey : elementId;
      if(models[modelKey] && baseElementConfig.existingValuesOverrideDefaultValues) {
        return;
      }

      if(payerElementConfig.type === 'Date') {
        var dateFormat = baseElementConfig.dateFormat ? baseElementConfig.dateFormat : 'MMDDYYYY';
        models[modelKey] = moment(payerElementConfig.defaultValue).format(dateFormat);
      } else if(payerElementConfig.type === 'Enumeration') {
        var enumKey = baseElementConfig.enumKey ? baseElementConfig.enumKey : 'code';
        var searchObj = {};
        searchObj[enumKey] = payerElementConfig.defaultValue[enumKey];
        models[modelKey] = _.findWhere(payerElementConfig.values, searchObj);
      } else {
        models[modelKey] = payerElementConfig.defaultValue;
      }
    };

    proto._updateElementValidationRules = function(elementId, element, baseElementConfig, payerElementConfig, ruleSet) {
      if(!baseElementConfig.ruleSetId) {
        return;
      }
      var newRuleSet = {};
      var ruleSetId = baseElementConfig.ruleSetId;
      var errorMessage = payerElementConfig.errorMessage;

      if((payerElementConfig.required && !baseElementConfig.ignoreRequiredFlag) || baseElementConfig.alwaysRequired) {
        newRuleSet.required = {message: errorMessage};
      }
      if(payerElementConfig.pattern) {
        newRuleSet.pattern = {message: errorMessage, value: payerElementConfig.pattern};
      }
      if(payerElementConfig.type === 'Date') {
        if(baseElementConfig.dateFormat) {
          newRuleSet.dateFormat = {message: errorMessage, format: baseElementConfig.dateFormat};
          if(payerElementConfig.min && payerElementConfig.max) {
            newRuleSet.dateRange = {message: errorMessage, start: {value: payerElementConfig.min}, end: {value: payerElementConfig.max}};
          }
        }
      }
      if(payerElementConfig.type === 'Enumeration' && payerElementConfig.repeats) {
        newRuleSet.size = {message: errorMessage, min: payerElementConfig.minRepeats, max: payerElementConfig.maxRepeats};
      }
      var maxLength = payerElementConfig.maxLength;
      if(!maxLength) {
        maxLength = baseElementConfig.defaults ? baseElementConfig.defaults.maxLength : undefined;
      }
      if(maxLength) {
        if(element.prop('tagName') === 'INPUT') {
          element.attr('maxlength', maxLength);
        } else {
          element.find('input').attr('maxlength', maxLength);
        }
      }
      if(baseElementConfig.additionalValidators) {
        _.extend(newRuleSet, baseElementConfig.additionalValidators);
        /*var i = 0;
        _.forEach(baseElementConfig.additionalValidators, function(validator) {
          newRuleSet['additionalValidator'+i++] = validator;
        });*/
      }
      ruleSet[ruleSetId] = newRuleSet;
    };

    proto._processElement = function(baseElementConfig, payerElementConfig, element, models) {
      if(this.styler) {
        if((payerElementConfig.required && !baseElementConfig.ignoreRequiredFlag) || baseElementConfig.alwaysRequired) {
          this.styler.addRequiredStyle(element);
        } else {
          this.styler.removeRequiredStyle(element);
        }
      }
      if(payerElementConfig.unsupportedOnUI) {
        element.hide();
      }
      if(baseElementConfig.customFunctions) {
        _.forEach(baseElementConfig.customFunctions, function(fn) {
          fn(baseElementConfig, payerElementConfig, element, models);
        });
      }
    };

    return new FormConfigService();
  });

})(window);
