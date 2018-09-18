import { AbilityBuilder } from '@casl/ability';

export const defineAbilitiesFor = user =>
  AbilityBuilder.define((can, cannot) => {
    can('create', 'User');
    can('read', 'Lodge');

    if (user) {
      can('manage', 'Lodge', {})
    }

    if (user.isAdmin) {
      can('manage', 'Lodge');
    }
  });

export const ANONYMOUS = defineAbilitiesFor(null);
