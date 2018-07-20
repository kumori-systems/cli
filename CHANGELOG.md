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
