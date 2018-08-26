import { AbilityBuilder } from '@casl/ability';

export const defineAbilitiesFor = user =>
  AbilityBuilder.define((can, cannot) => {
    if (user.isAdmin()) {
      can('manage', 'all');
    } else {
      can('read', 'all');
    }
  });
