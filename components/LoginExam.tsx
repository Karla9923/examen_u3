"use client";

import { useMemo, useState } from "react";
import {
  autenticarUsuario,
  cerrarSesionUsuario,
  configurarPersistencia,
} from "@/firebase/auth";

type AuthUser = {
  email: string;
};

function esCorreoValido(correo: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(correo.trim());
}

export default function LoginExam() {
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [recordarme, setRecordarme] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [usuario, setUsuario] = useState<AuthUser | null>(null);

  const tituloBoton = useMemo(() => {
    return cargando ? "Entrando..." : "Entrar";
  }, [cargando]);

  async function procesarAcceso(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!correo || !contrasena) {
      setError("Todos los campos son obligatorios");
      return;
    }

    if (!esCorreoValido(correo)) {
      setError("Correo no válido");
      return;
    }

    try {
      setCargando(true);

      await configurarPersistencia(recordarme);

      const credencial = await autenticarUsuario(correo, contrasena);

      setUsuario({
        email: credencial.user.email || "",
      });
    } catch (err: any) {
      const codigo = err.code;

      if (codigo === "auth/user-not-found") {
        setError("El correo no está registrado");
      } else if (codigo === "auth/wrong-password") {
        setError("Contraseña incorrecta");
      } else {
        setError("Error al iniciar sesión");
      }
    } finally {
      setCargando(false);
    }
  }

  async function salir() {
    await cerrarSesionUsuario();
    setUsuario(null);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#9cd2d3] px-4">
      <section className="w-full max-w-md bg-white p-8 rounded-3xl shadow-lg">

        {!usuario ? (
          <>
            <div className="mb-10 text-center">
              <h1 className="text-3xl font-bold text-[#114c5f]">
                Acceso escolar
              </h1>

              <p className="text-base font-medium text-[#4a6eb0] mt-2">
                Inicio de sesión
              </p>

              <p className="text-sm text-gray-500">
                Ingresa tus credenciales
              </p>
            </div>

            <form onSubmit={procesarAcceso} className="space-y-5">

              <div>
                <label className="block text-sm text-[#114c5f] mb-1">
                  Correo
                </label>
                <input
                  type="email"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  className="w-full border border-[#9cd2d3] rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#4a6eb0]"
                />
              </div>

              <div>
                <label className="block text-sm text-[#114c5f] mb-1">
                  Contraseña
                </label>
                <input
                  type={mostrarContrasena ? "text" : "password"}
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                  className="w-full border border-[#9cd2d3] rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#4a6eb0]"
                />

                <p
                  onClick={() => setMostrarContrasena(!mostrarContrasena)}
                  className="text-sm mt-2 text-[#4a6eb0] cursor-pointer hover:underline"
                >
                  {mostrarContrasena ? "Ocultar contraseña" : "Mostrar contraseña"}
                </p>
              </div>

              <label className="flex items-center gap-2 text-sm text-[#114c5f]">
                <input
                  type="checkbox"
                  checked={recordarme}
                  onChange={(e) => setRecordarme(e.target.checked)}
                />
                Recordarme
              </label>

              {error && (
                <div className="text-sm bg-[#9cd2d3] text-[#114c5f] p-2 rounded-lg">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={cargando}
                className="w-full bg-[#4a6eb0] text-white py-2.5 rounded-xl font-semibold hover:opacity-90 disabled:opacity-50"
              >
                {tituloBoton}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center space-y-6">
            <div className="bg-[#9cd2d3] p-8 rounded-2xl">
              <h1 className="text-2xl font-bold text-[#114c5f]">
                Acceso escolar
              </h1>

              <p className="text-2xl font-semibold text-[#114c5f] mt-3">
                Bienvenido
              </p>

              <p className="text-[#114c5f] mt-2 break-all">
                {usuario.email}
              </p>
            </div>

            <button
              onClick={salir}
              className="w-full bg-[#114c5f] text-white py-2.5 rounded-xl font-semibold hover:opacity-90"
            >
              Cerrar sesión
            </button>
          </div>
        )}
      </section>
    </main>
  );
}