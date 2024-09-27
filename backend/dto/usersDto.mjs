import { userRoleMapping, userStatusMapping } from './constants.mjs';

function getUserStatus(status) {
  return userStatusMapping[status] || userStatusMapping.default;
}

function getUserRole(role) {
  return userStatusMapping[role] || userRoleMapping.default;
}

export function userMapper({ name, email }, status, role) {
  return {
    role: getUserRole(role),
    status: getUserStatus(status),
    name,
    email,
  };
}
