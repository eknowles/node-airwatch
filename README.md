# node-airwatch
---

[![Build Status](https://img.shields.io/travis/eknowles/node-airwatch/master.svg)](http://travis-ci.org/eknowles/node-airwatch) [![Coveralls](https://img.shields.io/coveralls/eknowles/node-airwatch/master.svg)](https://coveralls.io/r/eknowles/node-airwatch?branch=master) [![GitHub Issues](https://img.shields.io/github/issues/eknowles/node-airwatch.svg)](https://github.com/eknowles/node-airwatch/issues)

Node wrapper for the AirWatch REST API

# Install
```sh
$ npm install --save airwatch
```

## Usage
First, `require` this module.
```js
var AirWatch = require('airwatch');
```

`AirWatch` is now a namespace (implemented as an object) containing the AirWatchService class.

Then you'll want to create an instance of AirWatch, pass a config object and assign event listeners.

```js
var aw = new AirWatch(config);
aw.on('debug', console.log);
```

## Config
To identify yourself with the AirWatch REST API you need to pass your credentials and other important information.

```json
    {
        "username": "myusername",
        "password": "mYaIrWaTcHpAsSwOrD",
        "groupid": "123",
        "apicode": "1A2BC3DEFGE5OIC87",
        "host": "0.0.0.0"
    }
```

# Documentation

Documentation is written in jsdocs. Can be generated with `grunt jsdocs`.

# License

MIT © [Edward Knowles](http://eknowles.com)

# Testing
Coming soon...


# Contribute
Please feel free to contribute anyway you can, issues, tests, pr all welcome. For commit messages please use the conventions below (Taken from AngularJS)

## Git Commit Guidelines
We have very precise rules over how our git commit messages can be formatted.  This leads to **more
readable messages** that are easy to follow when looking through the **project history**.  But also,
we use the git commit messages to **generate the change log**.

### Commit Message Format
Each commit message consists of a **header**, a **body** and a **footer**.  The header has a special
format that includes a **type**, a **scope** and a **subject**:

```
<type>(<scope>): <subject>
<BLANK LINE>
<body>
<BLANK LINE>
<footer>
```

Any line of the commit message cannot be longer 100 characters! This allows the message to be easier
to read on github as well as in various git tools.

### Type
Must be one of the following:

* **feat**: A new feature
* **fix**: A bug fix
* **docs**: Documentation only changes
* **style**: Changes that do not affect the meaning of the code (white-space, formatting, missing
  semi-colons, etc)
* **refactor**: A code change that neither fixes a bug or adds a feature
* **perf**: A code change that improves performance
* **test**: Adding missing tests
* **chore**: Changes to the build process or auxiliary tools and libraries such as documentation
  generation

### Scope
The scope could be anything specifying place of the commit change.

### Subject
The subject contains succinct description of the change:

* use the imperative, present tense: "change" not "changed" nor "changes"
* don't capitalize first letter
* no dot (.) at the end

### Body
Just as in the **subject**, use the imperative, present tense: "change" not "changed" nor "changes"
The body should include the motivation for the change and contrast this with previous behavior.

### Footer
The footer should contain any information about **Breaking Changes** and is also the place to
reference GitHub issues that this commit **Closes**.
