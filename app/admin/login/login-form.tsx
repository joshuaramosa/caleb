"use client";

import { useActionState, useState } from "react";
import { login } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { CalebLogo } from "@/components/ui/caleb-logo";

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <Card className="w-full max-w-sm shadow-xl border-border/80 bg-card/95 backdrop-blur-sm">
      <CardHeader className="text-center pb-4">
        <div className="flex justify-center mb-2">
          <CalebLogo size="md" glow priority asLink href="/" />
        </div>
        <CardDescription className="text-xs sm:text-sm font-medium">
          Acceso seguro del personal y operaciones
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-medium">
              Correo
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="correo@caleb.pe"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm font-medium">
              Contraseña
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Guardar sesión: la próxima vez entra directo sin escribir nada */}
          <label htmlFor="remember" className="flex items-center gap-2.5 text-sm text-muted-foreground select-none">
            <input
              id="remember"
              name="remember"
              type="checkbox"
              defaultChecked
              className="size-4 shrink-0 accent-[#F0A000]"
            />
            Guardar mi sesión en este dispositivo
          </label>

          {state?.error && (
            <p role="alert" className="text-sm text-destructive text-center">
              {state.error}
            </p>
          )}

          <Button type="submit" size="lg" className="w-full text-base" disabled={pending}>
            {pending ? "Ingresando…" : "INICIAR SESIÓN"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
