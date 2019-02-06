## [1.1.14](https://github.com/kumori-systems/cli/compare/v1.1.13...v1.1.14) (2019-02-06)


### Bug Fixes

* **dependencies:** updated the [@kumori](https://github.com/kumori)/generator-workspace dependency from 1.1.7 to 1.1.8 ([97e0d4b](https://github.com/kumori-systems/cli/commit/97e0d4b))

## [1.1.13](https://github.com/kumori-systems/cli/compare/v1.1.12...v1.1.13) (2018-10-31)


### Bug Fixes

* **generators:** updated the generator version to 1.1.7. The new version includes a Java Web application generators as a service ([0845c32](https://github.com/kumori-systems/cli/commit/0845c32))

## [1.1.12](https://github.com/kumori-systems/cli/compare/v1.1.11...v1.1.12) (2018-10-31)


### Bug Fixes

* **generators:** updated the generators version due to patch changes (removed some unused files) ([19f8344](https://github.com/kumori-systems/cli/commit/19f8344))

## [1.1.11](https://github.com/kumori-systems/cli/compare/v1.1.10...v1.1.11) (2018-10-30)


### Bug Fixes

* **java:** added new templates for java components and services ([16fe6ef](https://github.com/kumori-systems/cli/commit/16fe6ef))

## [1.1.10](https://github.com/kumori-systems/cli/compare/v1.1.9...v1.1.10) (2018-10-29)


### Bug Fixes

* **deployment:** now a service and its components are not included in the deployment bundle if the service is already registered in the platform. ([2d775bc](https://github.com/kumori-systems/cli/commit/2d775bc))

## [1.1.9](https://github.com/kumori-systems/cli/compare/v1.1.8...v1.1.9) (2018-10-03)


### Bug Fixes

* **build:** now the runtime image is installed allways, even if the dev version is found in the docker hub ([97363b4](https://github.com/kumori-systems/cli/commit/97363b4))

## [1.1.8](https://github.com/kumori-systems/cli/compare/v1.1.7...v1.1.8) (2018-09-17)


### Bug Fixes

* **dependencies:** updated versions of [@kumori](https://github.com/kumori)/workspace and [@kumori](https://github.com/kumori)/generator-workspace ([5b71632](https://github.com/kumori-systems/cli/commit/5b71632))

## [1.1.7](https://github.com/kumori-systems/cli/compare/v1.1.6...v1.1.7) (2018-09-12)


### Bug Fixes

* **dependencies:** updated the dependency with [@kumori](https://github.com/kumori)/generator-workspace from version 1.1.0 to 1.1.1 ([b8070e9](https://github.com/kumori-systems/cli/commit/b8070e9))

## [1.1.6](https://github.com/kumori-systems/cli/compare/v1.1.5...v1.1.6) (2018-09-11)


### Bug Fixes

* **dependencies:** changed the dependency with [[@kumori](https://github.com/kumori)](https://github.com/kumori)/generator-workspace from 1.0.9 to 1.1.0 ([367db75](https://github.com/kumori-systems/cli/commit/367db75))

## [1.1.5](https://github.com/kumori-systems/cli/compare/v1.1.4...v1.1.5) (2018-09-10)


### Bug Fixes

* **workspace:** changed the version of the workspace package dependency ([9dc0a89](https://github.com/kumori-systems/cli/commit/9dc0a89))

## [1.1.4](https://github.com/kumori-systems/cli/compare/v1.1.3...v1.1.4) (2018-09-10)


### Bug Fixes

* **workspace:** changed the version of the workspace package dependency ([c9032a2](https://github.com/kumori-systems/cli/commit/c9032a2))

## [1.1.3](https://github.com/kumori-systems/cli/compare/v1.1.2...v1.1.3) (2018-08-29)


### Bug Fixes

* **dependencies:** changed the dependency with [@kumori](https://github.com/kumori)/generator-workspace from 1.0.8 to 1.0.9 ([08085fe](https://github.com/kumori-systems/cli/commit/08085fe))

## [1.1.2](https://github.com/kumori-systems/cli/compare/v1.1.1...v1.1.2) (2018-07-20)


### Bug Fixes

* **dependencies:** updated dependencies with Admission Client and Generator Workspace ([dac56a5](https://github.com/kumori-systems/cli/commit/dac56a5))

# Changelog

## v1.1.1

Improved README.
Increased the version of @kumori/generator-workspace

## v1.1.0

Now the CLI shows an error and help if an unknown command or subcommand is called.
Improved some error messages.
Added `kumori stamp list` command to list detailed information about stamps registered in a workspace.
Changed `@kumori/workspace` dependency to 1.0.5, which uses yeoman generators to create elements instead of internal templates.
Bug fix. Now only names with alphanumeric characters are allowed.
Bug fix. Runtimes with empty Dockerfile (i.e., with empty `FROM` key) do not fail when `kumori runtime build` is executed.
Bug fix. The command `kumori -h` (a.k.a. `kumori --help`) was showing a `command not found` error message.
Added `kumori project add` command. This command populates the workspace with a set of elements, typically (but not necessarily) some components and a service.

## v1.0.7

Added a new flag to `kumori deployment deploy` to avoid creating default inbounds with random domains. By default this flag is set to false.
Added new templates for the "hello world" example used in the quick start guide.

## v1.0.6

Corrected bug extracting development image when `kumori component build` is executed.

## v1.0.5

Now "component build" installs the component runtime image if it is not already installed.

## v1.0.4

Minor improvements on README
In `kumori deployment add` the current service version is used if it is not specified.
Changed dependency with @kumori/workspace to 1.0.1

## v1.0.3

Implemented resources management. Currently, only a vhost template added.
Implemented register commands for components, services, runtimes and resources.
Implemented remove commands for components, services, deployments, runtimes and resources.
Implemented unregister commands for components, services, runtimes and resources.

## v1.0.2

Identical to 1.0.1 but with workspace dependency changed to 1.0.1.

## v1.0.1

Identical to 1.0.0. Patch version increased due to NPM repository problems.

## v1.0.0

Initial version. Not published due to NPM repository problems.
