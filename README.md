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

