import { useRouter, useSearchParams } from "next/navigation";

export default function AuthPage() {
  const router = useRouter();

  const searchParams = useSearchParams();
  const origin = searchParams.get("origin");
}
