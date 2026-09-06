# Mercurial Library

This is a collection of typescript module files that aim to make your life easier while using Redux.
Currently only targets San Andreas 1.0US

All functions and interfaces should be properly typed. Only a few have descriptions at the moment.
Feel free to open a PR if you think you can improve the libraries!

This mod also adds a menu that can be opened with Tilde (`) which lets you customize mod settings in-game, without having to close the game, edit an INI, and re-open the game.
This is achieved mainly through the exported ``registerHgMod`` function, which handles a lot of the heavy work.

For a working example, please see https://github.com/ZH-Hristov/GTA-SA-Dynamic-Car-Camera-Mod/blob/master/index.ts#L39C1-L70C3

## Requirements
[CLEO](https://cleo.li/)  
[CLEO Redux](https://re.cleo.li/)  
[CLEO+](https://github.com/JuniorDjjr/CLEOPlus/releases/latest)  

Make sure you have ImGuiReduxWin32.cleo in your CLEO_PLUGINS folder! It can be installed when installing CLEO Redux through the setup!
The menu will not show up otherwise!

## Installation
Download the mod from releases and extract ```mercurial[mem]``` into your CLEO folder
