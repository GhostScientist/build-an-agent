import fs from 'fs-extra';
import path from 'path';

export function validateProjectName(name: string): true | string {
  if (!name || name.trim().length === 0) {
    return 'Project name is required';
  }

  if (!/^[a-zA-Z][a-zA-Z0-9-_]*$/.test(name)) {
    return 'Project name must start with a letter and contain only letters, numbers, hyphens, and underscores';
  }

  if (name.length > 214) {
    return 'Project name must be less than 214 characters';
  }

  return true;
}

export function validatePackageName(name: string): true | string {
  if (!name || name.trim().length === 0) {
    return 'Package name is required';
  }

  // npm package name validation
  if (!/^(@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/.test(name)) {
    return 'Invalid npm package name. Must be lowercase and can contain hyphens, dots, and underscores';
  }

  return true;
}

export function validateAuthor(name: string): true | string {
  if (!name || name.trim().length === 0) {
    return 'Author name is required';
  }

  return true;
}

export async function checkDirectoryExists(projectPath: string): Promise<boolean> {
  return fs.pathExists(projectPath);
}

export function toPackageName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-');
}

export function toProjectName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-');
}
