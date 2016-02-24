import PluginHooks from './hooks';
import GroupsHooks from './submodules/groups/hooks';
import UsersHooks from './submodules/users/hooks';
import DirectoriesHooks from './submodules/directories/hooks';

module.exports = function (Store, dispatch, name, options) {
  const {Hooks} = options;

  // Set plugin's hooks
  PluginHooks.initialize(Hooks);
  // Set submodule hooks
  GroupsHooks.initialize(Hooks);
  UsersHooks.initialize(Hooks);
  DirectoriesHooks.initialize(Hooks);
};

