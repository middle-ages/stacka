import { termSize, bitmap, BitmapRole } from 'src/stacka';

/**
 * With no arguments, shows all character bitmaps in every box drawing character
 * role.
 *
 * If given a command separated list of such roles, they will be the only roles shown.
 *
 * If given `-h` shows the names of all roles.
 *
 * Example:
 *
 * ```txt
 * bitmaps.ts elbow,hLine
 * ```
 */

const allRoles = bitmap.roles;

if (process.argv[2] === '-h') {
  console.log('All box drawing character roles: ' + allRoles.join(','));
  process.exit();
}

const [width] = termSize();

const roles =
  process.argv[2] !== undefined
    ? (process.argv[2].split(',') as BitmapRole[])
    : allRoles;

const report = bitmap.rolesReport(width)(roles);

console.log(report);
