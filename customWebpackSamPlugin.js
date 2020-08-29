'use strict';
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
      };
    return __assign.apply(this, arguments);
  };
var __importStar =
  (this && this.__importStar) ||
  function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result['default'] = mod;
    return result;
  };
Object.defineProperty(exports, '__esModule', { value: true });
var fs = __importStar(require('fs'));
var yaml_cfn_1 = require('yaml-cfn');
const { Template } = require('webpack');
var AwsSamPlugin = /** @class */ (function () {
  function AwsSamPlugin(options) {
    this.options = __assign({ vscodeDebug: true }, options);
  }
  // Returns the name of the SAM template file or null if it's not found
  AwsSamPlugin.prototype.templateNames = function () {
    var templates = ['template.yaml'];
    var allFound = true;

    templates.forEach(function (templateName) {
      if (!fs.existsSync(templateName)) {
        allFound = false;
      }
    });

    return allFound ? templates : null;
  };
  // Returns a webpack entry object based on the SAM template
  AwsSamPlugin.prototype.entry = function () {
    var templateNames = this.templateNames();

    if (templateNames === null) {
      console.log('No SAM template found...');
      return null;
    }

    var entryPoints = {};
    this.samConfig = {};

    templateNames.forEach((templateName) => {
      this.samConfig[templateName] = yaml_cfn_1.yamlParse(fs.readFileSync(templateName).toString());
      this.launchConfig = {
        version: '0.2.0',
        configurations: []
      };
      var defaultRuntime =
        this.samConfig[templateName].Globals &&
        this.samConfig[templateName].Globals.Function &&
        this.samConfig[templateName].Globals.Function.Runtime
          ? this.samConfig[templateName].Globals.Function.Runtime
          : null;
      var defaultHandler =
        this.samConfig[templateName].Globals &&
        this.samConfig[templateName].Globals.Function &&
        this.samConfig[templateName].Globals.Function.Handler
          ? this.samConfig[templateName].Globals.Function.Handler
          : null;

      // Loop through all of the resources
      for (var resourceKey in this.samConfig[templateName].Resources) {
        var resource = this.samConfig[templateName].Resources[resourceKey];
        // Find all of the functions
        if (resource.Type === 'AWS::Serverless::Function') {
          var properties = resource.Properties;
          if (!properties) {
            throw new Error(resourceKey + ' is missing Properties');
          }
          if (!['nodejs8.10', 'nodejs10.x'].includes(properties.Runtime || defaultRuntime)) {
            throw new Error(resourceKey + ' has an unsupport Runtime. Must be nodejs8.10 or nodejs10.x');
          }
          if (!properties.Handler || defaultHandler) {
            throw new Error(resourceKey + ' is missing a Handler');
          }
          var handler = (properties.Handler || defaultHandler).split('.');
          if (handler.length !== 2) {
            throw new Error(resourceKey + ' Handler must contain exactly one "."');
          }
          if (!properties.CodeUri) {
            throw new Error(resourceKey + ' is missing a CodeUri');
          }
          var basePath = properties.CodeUri ? './' + properties.CodeUri : '.';
          var fileBase = basePath + '/' + handler[0];
          for (var _i = 0, _a = ['.ts', '.js']; _i < _a.length; _i++) {
            var ext = _a[_i];
            if (fs.existsSync('' + fileBase + ext)) {
              this.launchConfig.configurations.push({
                name: resourceKey,
                type: 'node',
                request: 'attach',
                address: 'localhost',
                port: 5858,
                localRoot: '${workspaceRoot}/.aws-sam/build/' + resourceKey,
                remoteRoot: '/var/task',
                protocol: 'inspector',
                stopOnEntry: false,
                outFiles: ['${workspaceRoot}/.aws-sam/build/' + resourceKey + '/app.js'],
                sourceMaps: true
              });

              entryPoints[resourceKey] = '' + fileBase + ext;
              this.samConfig[templateName].Resources[resourceKey].Properties.CodeUri = resourceKey;
              this.samConfig[templateName].Resources[resourceKey].Properties.Handler = 'app.' + handler[1];
            }
          }
        }
      }
    });

    return entryPoints;
  };
  AwsSamPlugin.prototype.apply = function (compiler) {
    var _this = this;
    compiler.hooks.afterEmit.tap('SamPlugin', function (compilation) {
      var templateNames = ['template.yaml'];

      templateNames.forEach((templateName, templateIndex) => {
        if (_this.samConfig[templateName] && _this.launchConfig) {
          fs.writeFileSync('.aws-sam/build/' + templateName, yaml_cfn_1.yamlDump(_this.samConfig[templateName]));
          if (_this.options.vscodeDebug && templateIndex === 0) {
            if (!fs.existsSync('.vscode')) {
              fs.mkdirSync('.vscode');
            }
            fs.writeFileSync('.vscode/launch.json', JSON.stringify(_this.launchConfig));
          }
        } else {
          console.log('It looks like SamPlugin.entryPoints() was not called');
        }
      });
    });
  };
  return AwsSamPlugin;
})();
module.exports = AwsSamPlugin;
