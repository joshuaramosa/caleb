import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Área de personal permitida por rol
const ROLE_ALLOWED_PREFIXES: Record<string, string[]> = {
  ADMIN: ["/admin", "/cocina", "/delivery"],
  ATENCION: ["/admin"],
  COCINA: ["/cocina"],
  REPARTIDOR: ["/delivery"],
};

const PROTECTED_PREFIXES = ["/admin", "/cocina", "/delivery"];

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Refresca la sesión si el token expiró. No quitar: importante para Server Components.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
  const isLoginPage = pathname === "/admin/login";

  // Las rutas del personal requieren sesión
  if (isProtected && !isLoginPage && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }

  // Verificación de rol para rutas protegidas
  if (isProtected && !isLoginPage && user) {
    const { data: staff } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    const allowed = staff ? (ROLE_ALLOWED_PREFIXES[staff.role] ?? []) : [];
    const canAccess = allowed.some((p) => pathname === p || pathname.startsWith(`${p}/`));

    if (!canAccess) {
      const url = request.nextUrl.clone();
      url.pathname = staff ? allowed[0] : "/admin/login";
      url.search = "";
      return NextResponse.redirect(url);
    }
  }

  // Un usuario con sesión no necesita ver el login
  if (isLoginPage && user) {
    const { data: staff } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    const url = request.nextUrl.clone();
    url.pathname = (staff && (ROLE_ALLOWED_PREFIXES[staff.role]?.[0] ?? "/admin")) ?? "/admin/login";
    return NextResponse.redirect(url);
  }

  return response;
}
