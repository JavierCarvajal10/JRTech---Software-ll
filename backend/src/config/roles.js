export const ROLES = {
  OWNER: "OWNER",
  ADMIN: "ADMIN",
  CLIENTE: "CLIENTE",
};

const ROLE_GRANTS = {
  [ROLES.OWNER]: [ROLES.OWNER, ROLES.ADMIN, ROLES.CLIENTE],
  [ROLES.ADMIN]: [ROLES.ADMIN, ROLES.CLIENTE],
  [ROLES.CLIENTE]: [ROLES.CLIENTE],
};

export const userHasRole = (userRole, requiredRole) => {
  const grants = ROLE_GRANTS[userRole] ?? [];
  return grants.includes(requiredRole);
};

export const userHasAnyRole = (userRole, requiredRoles) => {
  return requiredRoles.some((r) => userHasRole(userRole, r));
};
