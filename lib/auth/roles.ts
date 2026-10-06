export type UserRole = "ADMIN" | "ATENCION" | "COCINA" | "REPARTIDOR";

/** Panel de inicio según el rol del usuario */
export function homeByRole(role: UserRole | null | undefined): string {
  switch (role) {
    case "COCINA":
      return "/cocina";
    case "REPARTIDOR":
      return "/delivery";
    case "ADMIN":
    case "ATENCION":
    default:
      return "/admin";
  }
}
