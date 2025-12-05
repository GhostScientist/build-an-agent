import ora, { type Ora } from 'ora';
import { styles } from './styles.js';

export function createSpinner(text: string): Ora {
  return ora({
    text,
    color: 'cyan',
    spinner: 'dots',
  });
}

export async function withSpinner<T>(
  text: string,
  fn: () => Promise<T>,
  successText?: string
): Promise<T> {
  const spinner = createSpinner(text);
  spinner.start();

  try {
    const result = await fn();
    spinner.succeed(successText ?? text.replace('...', ''));
    return result;
  } catch (error) {
    spinner.fail(styles.error(`Failed: ${text}`));
    throw error;
  }
}
