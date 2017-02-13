// Onsen UI SystemJS config

let angular2onsenui = '';

if (window._isLocalDev) {
  angular2onsenui = '../../OnsenUI/bindings/angular2';
} else if (window._onsNightlyBuild) {
  angular2onsenui = 'https://crossorigin.me/https://circleci.com/api/v1/project/OnsenUI/OnsenUI/latest/artifacts/0/$CIRCLE_ARTIFACTS/angula2-onsenui';
} else {
  angular2onsenui = 'https://unpkg.com/angular2-onsenui' + (window._onsAngular2LibVersion ? ('@' + window._onsAngular2LibVersion) : '');
}

System.config({
  map: {
    'angular2-onsenui': angular2onsenui + '/dist/bundles/angular2-onsenui.umd.js' + (window._onsNightlyBuild ? '?branch=master&filter=successful' : ''),
    '@angular/core': 'https://unpkg.com/@angular/core@2.0.0/bundles/core.umd.min.js',
    '@angular/compiler': 'https://unpkg.com/@angular/compiler@2.0.0/bundles/compiler.umd.min.js',
    '@angular/common': 'https://unpkg.com/@angular/common@2.0.0/bundles/common.umd.min.js',
    '@angular/forms': 'https://unpkg.com/@angular/forms@2.0.0/bundles/forms.umd.min.js',
    '@angular/platform-browser': 'https://unpkg.com/@angular/platform-browser@2.0.0/bundles/platform-browser.umd.min.js',
    '@angular/platform-browser-dynamic': 'https://unpkg.com/@angular/platform-browser-dynamic@2.0.0/bundles/platform-browser-dynamic.umd.min.js',
    'rxjs': 'https://unpkg.com/rxjs@5.0.0-beta.11',
    'process': 'https://unpkg.com/process@0.11.9'
  },
  packages: {
    'angular2-onsenui': {
      format: 'cjs',
    },
    'core-js': {
      main: 'index.js',
      format: 'cjs'
    },
    'typescript': {
      format: 'cjs'
    },
    'app': {
      defaultExtension: 'ts',
      format: 'esm'
    }
  },
  meta: {
    'inline': {
      loader: 'inline-loader'
    }
  },
  transpiler: 'typescript',
  typescriptOptions: {
    'emitDecoratorMetadata': true
  }
});

System.amdDefine('inline-loader', [], function() {
  return {
    fetch: function() {
      return new Promise(function(resolve, reject) {
        if (document.readyState === 'complete') {
          load();
        } else {
          window.onload = load;
        }

        function load() {
          var target = document.querySelector('script[type="text/typescript"]');

          if (target) {
            resolve(target.textContent);
          } else {
            reject('Error: inline-loader fail.');
          }
        }
      });
    }
  };
});

System.import('inline');

