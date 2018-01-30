# Onsen UI Playground

Playground, interactive tutorial and issue reporter for Onsen UI.

Try it here: http://onsenui.github.io/playground

# Contributing

We always appreciate contributions in form of issues or pull requests. For questions about OnsenUI please ask in our [community](https://community.onsen.io/).  

First, clone the repository with `git@github.com:OnsenUI/playground.git`. After that just run a simple http-server for example:

```bash
$ npm install -g http-server
$ http-server . -c-1 -o -p 9000
```

In order to create new tutorials simply add an HTML file to the corresponding directory under `./tutorial/`. After that, include a line in `./js/modules.js` to index it in the app. Please check the existing examples to understand the proper syntax. Also add the necessary keywords to `modulesDefaultKeywords` (same file) to make the tutorial searchable.

# Configuration

By default, this app fetches the latest released version of Onsen UI and the bindings. This can be modified by running `app.setVersion(libName, version)` in the Developer Console, where `libName` is a string matching 'onsenui', 'react-onsenui' or any other bindings; and `version` is a string containing the exact version, e.g. '2.0.5'.

All the libs version are listed under `app.config.versions` (`undefined` value means `latest`).

# Local Development

If the playground app is served locally together with Onsen UI repo, it will fetch local versions for Onsen UI and the bindings. It requires Onsen UI main repo directory to be located in the same level:

```
workspace/
├── Onsen UI/     (main repo)
└── playground/     (playground repo)

http-server workspace -c-1
// Navigate to localhost:8080/playground/
```

This can be disabled by running `app.config.local = false;` in Developer Console and reloading the demo.

## Testing Onsen UI

Open this on a device browser while serving locally. It will automatically switch to `tabs.html` view and can be used to manually debug Onsen UI with any framework.

# Other Features

* `tabs.html` view: `tab-visibility` binary parameter can be used to toggle tabs visibility: `?tab-visibility=1110` shows everything except "Docs" tab.
* `embed-compact.html` view: `docs` boolean parameter is used to optionally hide the Docs panel (`?docs=false`).
* `index.html` view: `issue` numeric parmeter can be included to fetch a GitHub issue information. E.g. `?issue=2204`.
* `index.html` view: `external` parmeter can specify an external URL to a tutorial-like document. E.g. `?external=https://onsen.io/playground/tutorial/other/knockout_bindings.html`.
