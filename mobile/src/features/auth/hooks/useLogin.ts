import { useMutation } from "@tanstack/react-query";
import { loginRequest } from "../../../api/auth.api";
import { useAuthStore } from "../../../state/authStore";

export function useLogin() {
  const setSession = useAuthStore((s) => s.setSession);

  return useMutation({
    mutationFn: loginRequest,
    onSuccess: async (data) => {
      await setSession(data.token, data.user);
    },
  });
}
