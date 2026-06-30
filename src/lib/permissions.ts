import { createAccessControl } from "better-auth/plugins/access";
import { adminAc, defaultStatements } from "better-auth/plugins/admin/access";

export const statement = {
  ...defaultStatements,
  teacher: ["create", "update", "delete"],
  place: ["create", "update", "delete"],
  submission: ["read", "update"],
  report: ["read", "update"],
  ontology: ["read", "update"],
} as const;

export const ac = createAccessControl(statement);

export const editor = ac.newRole({
  teacher: ["create", "update", "delete"],
  place: ["create", "update", "delete"],
  submission: ["read", "update"],
  report: ["read", "update"],
  ontology: ["read", "update"],
});

export const owner = ac.newRole({
  ...adminAc.statements,
  teacher: ["create", "update", "delete"],
  place: ["create", "update", "delete"],
  submission: ["read", "update"],
  report: ["read", "update"],
  ontology: ["read", "update"],
});

export const member = ac.newRole({});

export const roles = { owner, editor, member };

export type AppRole = keyof typeof roles;

export function isAdminRole(role: string | null | undefined) {
  return role === "owner" || role === "editor";
}
