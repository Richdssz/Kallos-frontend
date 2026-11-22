
"use client";

import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth/authStore";

export default function LogoutButton() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const logout = useAuthStore((state) => state.logout);

  function handleLogout() {
    logout();
    queryClient.clear();
    document.cookie =
      "kallos-auth=; Path=/; Max-Age=0; SameSite=Lax";
    router.replace("/login");
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="rounded-lg bg-[#28382c] px-5 py-3 font-semibold text-white transition hover:bg-[#486b4f]"
    >
      Sair da conta
    </button>
  );
}
