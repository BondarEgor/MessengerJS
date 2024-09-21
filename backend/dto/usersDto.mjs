const statusMapping = {
  online: 'online',
  offline: 'offline',
  away: 'away',
  default: 'offline',
};

const roleMapping = {
  user: 'user',
  admin: 'admin',
  block: 'blocked',
  default: 'user',
};

const getStatus = (status) => {
  return statusMapping[status] || statusMapping.default;
};

const getRole = (role) => {
  return roleMapping[role] || roleMapping.default;
};
export class UsersDto {
  constructor(user, role, status) {
    this.username = user?.username;
    this.status = getStatus(status);
    this.role = getRole(role);
    this.userId = user?.userId;
    this.email = user?.email;
  }
}
