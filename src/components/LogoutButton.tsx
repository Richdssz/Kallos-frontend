"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

export default function LogoutButton() {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);

  function handleLogout() {
    logout();

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