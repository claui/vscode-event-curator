# vscode-event-curator

## Requirements for contributing

Working on this TypeScript package requires the following programs
to be installed on your system:

- `yarn` (required)
- `nvm` (recommended)

## Preparing your session

To prepare your session, `cd` to the project root directory, then
run `nvm use`.

## Installing dependencies

To install dependencies, run: `yarn install`

If that fails, consult the _Maintenance_ section.

## Building the package

To build the package, run: `yarn compile`

## Running unit tests

To execute the unit tests, run: `yarn test`

## Publishing the package to the NPM registry

(tbd)

## Maintenance

### yarn install

To install the current project dependencies as specified in
`package.json` and `yarn.lock`, run `yarn install`.

### yarn clean-install

If the Yarn version has changed and you run `yarn install`, Yarn
will try to upgrade itself. That causes changes to several files,
such as the `LICENSE` files I have placed into several
subdirectories.

Anytime that happens, run the `yarn clean-install` script, a wrapper
around `yarn install` which cleans up afterwards.

Note that the `yarn clean-install` script may fail and tell you to
run `yarn install` instead. I haven’t figured out why it does that.
If that happens, run `yarn install` followed by `yarn clean-install`.

### yarn outdated

To see a list of outdated packages, run: `yarn outdated`

### yarn upgrade-lockfile

This runs `yarn up -R '**' && yarn clean-install` behind the scenes
in order to upgrade all resolutions in the lockfile as far as
possible, but leaves your `package.json` as is.

### yarn upgrade-packages

The built-in `yarn up` command can be a bit cumbersome to use if you
want to upgrade all dependencies in one go.

Running the `yarn upgrade-packages` script will upgrade all relevant
dependencies. That includes the `@types`, `@typescript-eslint`, and
`@yarnpkg` scopes but excludes Yarn itself (see the
`yarn upgrade-yarn-itself` section).

### yarn upgrade-yarn-itself

To upgrade Yarn PnP to the latest available version, run the
`yarn upgrade-yarn-itself` script.

Note that the script will only print manual instructions. That’s
because Yarn makes changes to `package.json`, and that doesn’t play
well with Yarn PnP in scripts.

### yarn upgrade-all

To also upgrade Yarn itself, run `yarn upgrade-all`.

## Patching dependencies

Sometimes you may want to tweak a dependency. This section explains how to do that using `yarn patch`.

### Start editing

To start editing a dependency, run `yarn patch <dependency>`.

### Finish editing

To commit the patch, run `yarn repatch -- <workdir>`.

For example, if the temporary working directory is `/tmp/xfs-36e26fe6/user`, run:

```shell
yarn repatch -- /tmp/xfs-36e26fe6/user
```

Note: `yarn repatch` is a custom script. It serves to work around two issues in `yarn patch-commit`:

- Using bare `yarn patch-commit` would create a nested patch while amending the patch is what I actually want.

- It may also use an incorrect key in the resolution entry it writes to `package.json`.  
  The key should match the dependency’s semver expression, not the resolved version.
  Using the latter as a key causes the resolution to never apply.  
  Example for a correct key: `"@scope/pkgname@^0.1.2"`

## Handling vulnerable dependencies

### The thing about vulnerabilities in transitive dependencies

People sometimes discover vulnerabilities in packages on which
vscode-event-curator depends.

If that happens and a patch comes out, I need to upgrade the
affected package to a newer version, which includes the patch.

But a vulnerability might also affect a package on which
vscode-event-curator depends only indirectly, e.g. through a
transitive requirement. A patch may exist for such a package, but
somewhere in the chain of dependencies (from the vulnerable package
all the way down to vscode-event-curator), the patch may be
outside the specified semver range so I **can’t upgrade** the
package via the usual `yarn up` or `yarn up -R` command.

### Dealing with the risk

If such cases arise, I’m going to try force-upgrading affected
packages, and document those upgrades in the section
_List of force-upgraded transitive dependencies_ below.  
Even if the upgrade happens to fail (or if it breaks the app and I
have to roll back the upgrade, leaving the vulnerability unpatched),
I’m also going to document that failure here.

## List of force-upgraded transitive dependencies

The goal of this list is:

- to document the drift between version requirements (in the tree
  of `package.json` files) and the resolutions in `yarn.lock`; and

- to inform about unpatched vulnerabilities.

<!-- Remove this line when adding the first entry: -->No entries yet.

<!--
I have preserved the order in which I have applied the upgrades.
The list starts with the first upgrade and ends with the latest one.
-->

<!--
### Vulnerability in …………, dependency of ………… v…………

I have manually bumped `…………`’s dependency `…………` to
v………… in order to bump the transitive dependency `…………` to v…………:

```shell
yarn set resolution --save …………@npm:………… …………
```

(Remove this section once an upgrade to `…………` is available
that depends on ………… v………… or higher.)
-->

## License

This source code repository contains code and assets sourced from
different parties. Therefore, multiple sets of license terms apply
to different parts of this source code repository.

The following table shows which terms apply to which parts of this
source code repository:

| Directory tree | Description | License | Terms |
|---|---|---|---|
| `.` | This directory | Apache-2.0 | [License](./LICENSE)<br>with License header below |
| `./.yarn/releases` | The `yarn` package manager | BSD-2-Clause | [License](./.yarn/releases/LICENSE) |
| `./.yarn/sdks` | SDK files for `yarn` | BSD-2-Clause | [License](./.yarn/sdks/LICENSE) |

In each of the directories the table mentions, you will find one
license file, named `LICENSE` or `LICENSE.txt`.  
Each license file applies to the directory that contains it,
including all subdirectories, but excluding any subdirectory tree
whose root has a license file on its own.

## License header

Copyright (c) 2023 Claudia Pellegrino

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
For a copy of the License, see [LICENSE.txt](LICENSE.txt).
