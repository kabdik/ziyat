import { inspect } from 'util';

import { Format, TransformableInfo } from 'logform';
import { format } from 'winston';

const clc = {
  bold: (text: string) => `\x1B[1m${text}\x1B[0m`,
  green: (text: string) => `\x1B[32m${text}\x1B[39m`,
  yellow: (text: string) => `\x1B[33m${text}\x1B[39m`,
  red: (text: string) => `\x1B[31m${text}\x1B[39m`,
  magentaBright: (text: string) => `\x1B[95m${text}\x1B[39m`,
  cyanBright: (text: string) => `\x1B[96m${text}\x1B[39m`,
};

const colorScheme: Record<string, (text: string) => string> = {
  info: clc.green,
  error: clc.red,
  warn: clc.yellow,
  debug: clc.magentaBright,
  verbose: clc.cyanBright,
};

export const customFormat = (): Format =>
  format.printf((info: TransformableInfo) => {
    const { context, level, timestamp, message, ms, ...meta } = info;

    const color = colorScheme[level];
    const { cyanBright } = clc;

    const componentName = meta.component;

    // Deduplicate meta component
    delete meta.component;

    const stringifiedMeta = JSON.stringify(meta);
    const formattedMeta = inspect(JSON.parse(stringifiedMeta), {
      colors: true,
      depth: null,
    });

    return (
      `${cyanBright(`[${componentName}]`)} ` +
      `${color(level)} ${
        typeof timestamp !== 'undefined' ? `${timestamp} ` : ''
      }${
        typeof context !== 'undefined' ? `${cyanBright(`[${context}]`)} ` : ''
      }${color(message)} ` +
      `${formattedMeta}${typeof ms !== 'undefined' ? ` ${cyanBright(ms)}` : ''}`
    );
  });
