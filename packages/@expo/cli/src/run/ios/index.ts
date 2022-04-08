#!/usr/bin/env node
import arg from 'arg';
import chalk from 'chalk';

import { Command } from '../../../bin/cli';
import * as Log from '../../log';
import {
  assertArgs,
  assertWithOptionsArgs,
  getProjectRoot,
  isBoolOrString,
} from '../../utils/args';
import { logCmdError } from '../../utils/errors';

export const expoRunIos: Command = async (argv) => {
  const args = assertWithOptionsArgs(
    {
      // Types
      '--help': Boolean,
      '--no-build-cache': Boolean,
      '--no-install': Boolean,
      '--no-bundler': Boolean,
      '--device': Boolean,
      // '--device': arg.flag((...foo: any[]) => {
      //   const argIndex = process.argv.findIndex((arg) => '--device' === arg || '-d' === arg);
      //   const nextArg = process.argv[argIndex + 1];
      //   console.log(foo, argIndex, nextArg);
      //   return undefined;
      // }),
      '--scheme': String,
      '--configuration': String,
      '--port': Number,
      // Aliases
      '-p': '--port',
      '-d': '--device',
      '-h': '--help',
    },
    {
      argv,
      stopAtPositional: false,
      permissive: true,
    }
  );

  if (args['--help']) {
    Log.exit(
      chalk`
      {bold Description}
        Run the iOS app binary locally

      {bold Usage}
        $ npx expo run:ios

      Options 
        --no-build-cache                 Clear the native derived data before building
        --no-install                     Skip installing dependencies
        --no-bundler                     Skip starting the Metro bundler
        --scheme [scheme]                Scheme to build
        --configuration <configuration>  Xcode configuration to use. Debug or Release. Default: Debug
        -d, --device [device]            Device name or UDID to build the app on
        -p, --port <port>                Port to start the Metro bundler on. Default: 8081
        -h, --help                       Output usage information
    `,
      0
    );
  }

  const { runIosAsync } = await import('./runIosAsync');
  return runIosAsync(getProjectRoot(args), {
    // Parsed options
    buildCache: !args['--no-build-cache'],
    install: !args['--no-install'],
    bundler: !args['--no-bundler'],

    device: args['--device'],
    port: args['--port'],
    scheme: args['--scheme'],
    configuration: args['--configuration'],
  }).catch(logCmdError);
};
