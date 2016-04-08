app.config = {};

app.config.onsenRepo = 'OnsenUI/OnsenUI-dist';
app.config.onsenCdn = 'https://cdn.rawgit.com';
app.config.platform = 'android';

(function() {
  var request = new XMLHttpRequest();
  app.config.ready = new Promise(function(resolve) {
    request.onload = function() {
      var response = JSON.parse(this.responseText)[0];
      if (response) {
        app.config.onsenVersion = response.name;
      }else {
        console.warn('Could not fetch Onsen UI versions. Github\'s API rate limit exceeded.');
        app.config.onsenVersion = '2.0.0-beta.7';
      }

      console.info('Using OnsenUI', app.config.onsenVersion);
      resolve();
    };
  });

  app.config.ready.then(function() {
    app.config.lib = {
      js: {
        onsenui: `${app.config.onsenCdn}/${app.config.onsenRepo}/${app.config.onsenVersion}/js/onsenui.min.js`,
        angularOnsenui: `${app.config.onsenCdn}/${app.config.onsenRepo}/${app.config.onsenVersion}/js/angular-onsenui.min.js`
      },
      css: {
        onsenui: `${app.config.onsenCdn}/${app.config.onsenRepo}/${app.config.onsenVersion}/css/onsenui.css`,
        onsenuiCssComponents: `${app.config.onsenCdn}/${app.config.onsenRepo}/${app.config.onsenVersion}/css/onsen-css-components.css`
      }
    };
  });


  request.open('get', `https://api.github.com/repos/${app.config.onsenRepo}/tags`);
  request.send();
})();