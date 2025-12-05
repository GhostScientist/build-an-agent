import Enquirer from 'enquirer';
import { validateProjectName, validateAuthor, toPackageName } from '../utils/validation.js';
import { styles } from '../utils/styles.js';

const { prompt } = Enquirer;

export interface ProjectAnswers {
  projectName: string;
  author: string;
  license: string;
}

export async function promptProjectName(initial?: string): Promise<string> {
  const response = await prompt<{ projectName: string }>({
    type: 'input',
    name: 'projectName',
    message: 'What is your project name?',
    initial: initial || '',
    validate: validateProjectName,
  });

  return response.projectName;
}

export async function promptProjectDetails(projectName: string): Promise<ProjectAnswers> {
  const response = await prompt<{ author: string; license: string }>([
    {
      type: 'input',
      name: 'author',
      message: 'Author name:',
      validate: validateAuthor,
    },
    {
      type: 'select',
      name: 'license',
      message: 'License:',
      choices: [
        { name: 'MIT', message: 'MIT' },
        { name: 'Apache-2.0', message: 'Apache 2.0' },
        { name: 'GPL-3.0', message: 'GPL 3.0' },
        { name: 'BSD-3-Clause', message: 'BSD 3-Clause' },
        { name: 'ISC', message: 'ISC' },
        { name: 'UNLICENSED', message: 'Proprietary' },
      ],
      initial: 0,
    },
  ]);

  return {
    projectName,
    author: response.author,
    license: response.license,
  };
}
