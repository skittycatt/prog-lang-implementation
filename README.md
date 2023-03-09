# Typescript Template

This repository was built from a custom-built template for a console-based [Typescript](https://www.typescriptlang.org) program designed for editing in [Visual Studio Code](https://code.visualstudio.com) or [Github Codespaces](https://github.com/features/codespaces).
Below, we outline the contents of the template for your reference if you need to build your own Typescript project.

## Package Management

We use [NPM](https://npmjs.com) for package management.
The package is initialized with:

~~~console
$> npm init
~~~

With default values given for the `package.json` file that is created.
In particular, a few scripts/sub-commands are given so that building, testing, _etc._, can be run via `npm run`.
See `package.json` to see what these commands do.

Note that the template uses the [Unlicense](https://unlicense.org) license which is replicated in `LICENSE`.
We recommend that you change the license as needed.

## Typescript

The Typescript compiler is installed as a (local) npm development package via `npm`:

~~~console
$> npm install typescript --save-dev
~~~

Development packages are packages that only used during program development, not program execution.

`tsconfig.json` contains default options to the Typescript compiler, `tsc`.
In particular, we specify that source files are contained in the `/src` directory and output files are placed in the `/dist` directory.
See the [tsconfig refeence](https://www.typescriptlang.org/tsconfig) for more information on these options.

## ESLint

We use [ESLint](https://eslint.org) to lint our code.
When coupled with appropriate Visual Studio Code plugin, ESLint provides strong support to enforce style and healthy code practices during development.
We installed `eslint` via the `eslint/config` helper tool:

~~~console
$> npm init @eslint/config
~~~

Arbitrarily, we chose the [Javascript Standard](https://standardjs.com) style for ESLint to enforce.
Feel free to customize this style template or choose a different style altogether.
`.eslintrc.js` contains these settings and the [ESLint user guide](https://eslint.org/docs/latest/use/configure/) provides a comprehensive reference for the file.

## Jest

We use [Jest](https://jestjs.io) as a testing framework for Typescript projects.
There are many such frameworks available; we choose Jest both because of its popularity and its ease of setup and use.

~~~console
$> npm install --save-dev jest ts-jest @types/jest
$> npx ts-jest config:init
~~~

The last command adds a Jest configuration file, `jest.config.js`, to the project.

## Devcontainer Configuration

The `/.devcontainer/devcontainer.json` file configures the runtime instance created when the project is loaded within a Github Codespace.
The file is the default configuration file provided by Microsoft in its [Node.js container template](https://github.com/microsoft/vscode-remote-try-node) with appropriate modifications for these kinds of projects.

Notably, if this project is run in a local version of Visual Studio Code, we recommend installing the following plugins to manage your work:

+   [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
+   [Github Classroom](https://marketplace.visualstudio.com/items?itemName=GitHub.classroom)

## Git Configuration

`.gitignore` is pre-populated so that Git ignores all build files generated by the project.

I want to write a language where you can replace operator symbols with words instead. It is an esoteric language that will have no real purpose for being used instead of other languages, serving the sole purpose of helping me learn how to write a compiler. The language will be based on a mixture of C and Scheme style syntax, with operators in between their arguments, and required parentheses. It also coerces Booleans into 0 or 1 if a number operator is used, and coerces numbers into Booleans in Boolean operations (where n > 0 is `true`, and n <= 0 is `false`)

Tentative language specs:

~~~
t ::= Nat | Bool

a ::= + | plus | - | minus | * | multiply | / | divide

b ::= and | && | or | ||

e ::= n | b | (e1 a e2) | (e1 b e2)

----------
n : Nat

----------
b : Bool

e1 : t1
e2 : t2
---------
(e1 a e2) : Nat
(e1 b e2) : Bool 
~~~