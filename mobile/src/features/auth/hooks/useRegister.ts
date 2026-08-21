import { useMutation } from "@tanstack/react-query";
import { registerRequest } from "../../../api/auth.api";
import { useAuthStore } from "../../../state/authStore";

export function useRegister() {
  const setSession = useAuthStore((s) => s.setSession);

  return useMutation({
    mutationFn: registerRequest,
    onSuccess: async (data) => {
      await setSession(data.token, data.user);
    },
  });
}
