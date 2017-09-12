# OnsenUI-Tutorial
Interactive tutorial for Onsen UI.

Try it here: http://onsenui.github.io/tutorial

#Contributing

We always appreciate contributions in form of issues or pull requests. For questions about OnsenUI please ask in our [community](https://community.onsen.io/)
First clone the repository with `git@github.com:OnsenUI/tutorial.git`. After that just run a simple http-server for example:

```bash
$ npm install -g http-server
$ http-server
```

In order to create new tutorials simply add an HTML file to the corresponding directory under `./tutorial/`. After that, include a line in `./js/modules.js` to index it in the app. Please check the existing examples to understand the proper syntax.

# Changing versions

By default, this app fetches the latest released version of Onsen UI and the bindings. This can be modified by running `app.setVersion(libName, version)` in the Developer Console, where `libName` is a string matching 'onsenui', 'react-onsenui' or any other bindings; and `version` is a string containing the exact version, e.g. '2.0.5'.

# Local Development

If the tutorial app is served locally together with Onsen UI repo, it will fetch local versions for Onsen UI and the bindings. It requires Onsen UI main repo directory to be located in the same level:

```
workspace/
├── Onsen UI/     (main repo)
└── tutorial/     (tutorial repo)

http-server workspace -c-1
// Navigate to localhost:8080/tutorial/
```

This can be disabled by running `app.config.local = false;` in Developer Console and reloading the demo.

