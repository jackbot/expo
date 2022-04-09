import arg, { Spec } from 'arg';

import { replaceValue } from '../../utils/array';
import { CommandError } from '../../utils/errors';

/**
 *
 * @param args arguments that were passed to the command.
 * @param rawMap raw map of arguments that are passed to the command.
 * @param extraArgs extra arguments and aliases that should be resolved as string or boolean.
 * @returns parsed arguments and project root.
 */
export async function resolveStringOrBooleanArgsAsync(
  args: string[],
  rawMap: arg.Spec,
  extraArgs: arg.Spec
) {
  // Assert any missing arguments
  assertUnknownArgs(
    {
      ...rawMap,
      ...extraArgs,
    },
    args
  );

  // Collapse aliases into fully qualified arguments.
  args = collapseAliases(extraArgs, args);

  // Resolve all of the string or boolean arguments and the project root.
  return _resolveStringOrBooleanArgs(extraArgs, args);
}

export function _resolveStringOrBooleanArgs(arg: Spec, args: string[]) {
  let projectRoot: string = '.';
  const settings: Record<string, string | boolean | undefined> = {};

  const possibleArgs = Object.entries(arg)
    .filter(([, value]) => typeof value !== 'string')
    .map(([key]) => key);

  for (let i = args.length - 1; i > -1; i--) {
    const value = args[i];
    if (value.startsWith('--')) {
      settings[value] = true;
    } else {
      const nextValue = args[i - 1];
      if (possibleArgs.includes(nextValue)) {
        settings[nextValue] = value;
        i--;
      } else if (i === args.length - 1) {
        projectRoot = value;
      } else {
        // This will asserts if two strings are passed in a row and not at the end of the line.
        throw new CommandError('BAD_ARGS', `Unknown argument: ${value}`);
      }
    }
  }

  return {
    args: settings,
    projectRoot,
  };
}

export function collapseAliases(arg: Spec, args: string[]): string[] {
  const aliasMap = getAliasTuples(arg);

  for (const [arg, alias] of aliasMap) {
    args = replaceValue(args, arg, alias);
  }

  assertDuplicateArgs(args, aliasMap);
  return args;
}

export function assertUnknownArgs(arg: Spec, args: string[]) {
  const allowedArgs = Object.keys(arg);
  const unknownArgs = args.filter((arg) => !allowedArgs.includes(arg) && arg.startsWith('-'));
  if (unknownArgs.length > 0) {
    throw new CommandError(`Unknown arguments: ${unknownArgs.join(', ')}`);
  }
}

function getAliasTuples(arg: Spec): [string, string][] {
  return Object.entries(arg).filter(([, value]) => typeof value === 'string') as [string, string][];
}

export function assertDuplicateArgs(args: string[], argNameAliasTuple: [string, string][]) {
  for (const [argName, argNameAlias] of argNameAliasTuple) {
    if (args.filter((a) => [argName, argNameAlias].includes(a)).length > 1) {
      throw new CommandError(
        'BAD_ARGS',
        `Can only provide one instance of ${argName} or ${argNameAlias}`
      );
    }
  }
}
