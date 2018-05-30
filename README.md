# Kumori Platform command line application

This application can be used to boost the process of developing services for Kumori Platform. This application helps with:

* Managing a workspace creating initial versions of elements under development by using templates.
* Interacting with Kumori Platform.

## The Kumori Platform service model

The services deployed in Kumori Platform must follow a very specific service model known as the `Kumori Platform Service Model`. This model is based in the followinf main concepts:

* Component: it is a runnable piece of code which must implement a given API. A component can interact with other components by using channels. A component can also have some configuration parameters and require some resources to work (CPU, RAM, persitent volumes, ...)
* Service Application: defines a specific topology of components connecting their channels.
* Service or deployment: it is an instance of a service application and it is composed by several instance of each of its components. The number of instances might variate in time.
* Stamp: is an instance of the Kumori Platform. Only one stamp is considered THE Kumori Platform. However, in some cases specific stamps can be created by the Kumori team for specific purposes.

## The command line application commands

This application currently supports the following commands:

```
Usage: kumori [options] [command]

Options:

  -V, --version  output the version number
  -h, --help     output usage information

Commands:

  component      Manages components
  deployment     Manages deployments
  resource       Manages resources
  runtime        Manages runtimes
  service        Manages services
  set            Manages workspace configuration parameters
  stamp          Manages stamps
  init           Populates the current folder with the worspace folders structure
  help [cmd]     display help for [cmd]
```

Each one of those commands have several subcommands.

### Init command

Created a brand new workspace. A workspace is a folder with the following structure:

```
.
├── builts
├── components
├── dependencies
├── deployments
├── kumoriConfig.json
├── resources
├── runtimes
├── services
├── templates
└── tests
```

The `kumoriConfig.json` file contains the configuration used in this workspace. The `build` folder can be used to store bundles with prepacked elements. The `components`, `services`, `deployments`, `resources` and `runtimes` store the different elements under development. The `templates` folder contains the templates used by the scaffolding subcommands. Includes some templated by default but you can add your own ones. The scaffolding subcommands use [doT.js](http://olado.github.io/doT/index.html) template library.

### Component command

Supports the following subcommands:

```
Usage: kumori-component [options] [command]

Options:

  -h, --help                   output usage information

Commands:

  add [options] <name>         Adds a new component to the workspace
  build [options] <name>       Creates a distributable version of the component
  register [options] <name>    Registers a component in a stamp
  remove [options] <name>      Removes an existing component from the workspace
  unregister [options] <name>  Unregisters a component from a stamp
```

With them, components can be added to the workspace, build distributable versions of them, register them to Kumori Platform (the official one or any other one), remove them to the workspace and unregister one version of that component in Kumori Platform.

### Deployment command

Supports the following subcommands:

```
Usage: kumori-deployment [options] [command]

Options:

  -h, --help                                output usage information

Commands:

  add [options] <name> <service>            Adds a new deployment configuration to the workspace
  update [options] <name>                   Updates a deployment configuration in the workspace
  deploy [options] <name>                   Creates a new service in the target stamp
  ps [options]                              Lists the services currently running in the target stamp
  remove <name>                             Removes an existing deployment from the workspace
  scale [options] <urn> <role> <instances>  Unregisters a component from a stamp
  undeploy [options] <urn>                  Undeploys a service from the target stamp
```

With them, a developer can define new configurations for the service applications in the workspace, use them to create new services in Kumori Platform, list the current services hosted in Kumori Platform, remove a configuration from the workspace, scale a given service component or undeploy a hosted service.

### Resource command

Supports the following subcommand:

```
Usage: kumori-resource [options] [command]

Options:

  -h, --help                   output usage information

Commands:

  add [options] <name>         Adds a new resource to the workspace
  register [options] <name>    Registers a resource in a stamp
  remove [options] <name>      Removes an existing resource from the workspace
  unregister [options] <name>  Unregisters a resource from a stamp
```

In this case, a resource refers to platform elements that can be registered and assigned to services (like volumes, certificates and so on). The subcommands for this commands can be used to create define new resources, create them un a platform and remove previously created and registered resources.

### Runtime command

A runtime is the environment used to execute components instances. In essence, a runtime is a Docker image. Developers can create new runtimes from scratch but it is strongly recommended to extend one of the existing runtimes:

* `eslap://eslap.cloud/runtime/native/X_Y_Z`: enviroment used to executed components implemented in Node.jS. `XYZ` represent the major, minor and patch version of the runtime. Each version might support different versions of the component API and include a different version of NodeJS.
* `eslap://eslap.cloud/runtime/java/X_Y_Z`: enviroment used to executed components implemented in Java. `XYZ` represent the major, minor and patch version of the runtime.

Usually, users will not create custom runtimes and use directly the native one. However, the command line application can help in the process of creating new runtimes with the following subcommands:

```
Usage: kumori-runtime [options] [command]

Options:

  -h, --help                   output usage information

Commands:

  add [options] <name>         Adds a new runtime to the workspace
  build [options] <name>       Creates a distributable version of the runtime
  register [options] <name>    Registers a runtime in a stamp
  remove [options] <name>      Removes an existing runtime from the workspace
  unregister [options] <name>  Unregisters a runtime from a stamp
```

The subcommands `add` and `remove` are used to create and remove custom runtime configuration (Dockerfile and manifest) in the workspace.

The `build` subcommand is used to create the Docker image. We strongly recommend to use this subcommand instead of the plain `docker build` since this subcommand will create a delta image containing only the docker layers on the top of the parent native image used. That might reduce a lot the weight of the resultin image.

Finally, `register` and `unregister` subcommands are used to upload or remove images from the Kumori Platform.

### Service command

This command is used to manage the service applications in the workspace and includes the following subcommands:

````
Usage: kumori-service [options] [command]

Options:

  -h, --help                   output usage information

Commands:

  add [options] <name>         Adds a new service to the workspace
  register [options] <name>    Registers a service in a stamp
  remove [options] <name>      Removes an existing service from the workspace
  unregister [options] <name>  Unregisters a service from a stamp
````

The subcommands `add` and `remove` are used to define new service applications in the workspace and remove them. The subcommands `register` and `unregister` are used to upload and remove the service applications from the Kumori Platform.

### Set command

This one is used mainly to change the default values used when adding new elements to the workspace.

```
Usage: kumori-set [options] [command]

Options:

  -h, --help       output usage information

Commands:

  domain <domain>  Changes the default domain used in the workspace elements
```

Currently, only the default domain can be set, usually to the developer's company domain. The domain is used to name the elements.

### Stamp command

The stamp command register new platforms in the command line client. By default, the client comes with Local Stamp and the official kumori platform registered.

```
Usage: kumori-stamp [options] [command]

Options:

  -h, --help                        output usage information

Commands:

  add [options] <name> <admission>  Adds a new stamp to the workspace
  update [options] <name>           Updates the information of a previously registered stamp
  remove <name>                     Removes a stamp
  use <name>                        Sets a stamp as the default stamp
```

For each stamp the following information must be provided:

* The stamp nickname. This is used to refere to this stamp in other commands.
* The stamp admission URL. This is used by the command line application to interact with the Kumori Platform.
* The stamp authentication token. This token can be picked up from the platform dashboard. Recall that tokens expire.

So, taken that into account, with the `add` subcommand a new platform can be registered. The `update` subcommand can be used to change the configuration of a previously registered stamp. The `remove` subcommand deletes a previously registered Kumori Platform instance. Finally, the `use` subcommand sets the Kumori Platform used by default.