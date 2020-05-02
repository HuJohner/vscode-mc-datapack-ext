# mc-datapack
[Visual Studio Code](https://code.visualstudio.com) extenstion that allows you to quickly create Minecraft datapacks. 

Inspired by [this Rust application](https://github.com/oOBoomberOo/Nucleus).

[![github-license-badge]](https://github.com/HuJohner/vscode-mc-datapacks-ext)

## Features

New Datapack context command to create basic datapack structure including:

* pack.mcmeta (Required)

* /data

* reset and main functions (/data/<author>/functions/<namespace>)

* respective load and tick tags (/data/minecraft/tags/functions)

* datapack advancement (/data/gobal/advancements)

* more to come...

New MCFunction file context command to create a function with file header.

Extension configuration to set default author username.

## Requirements

There are no requirements or dependencies but I highly recommend using a MCFunctions language extension for syntax highlighting like [this](https://marketplace.visualstudio.com/items?itemName=arcensoth.language-mcfunction).

## Known Issues

Feel free to report any issues that you have.

## Release Notes

### 0.0.3

## Added

- new mcfunction file command
- extension config

### 0.0.2

## Added

- reset and main functions
- load and tick tags
- datapack advancement

### 0.0.1

Initial commit of unreleased mc-datapack extension. 

-----------------------------------------------------------------------------------------------------------
