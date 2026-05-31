import { AppShell } from "@/components/app/AppShell";
import { CookieStoreClient } from "@/components/cookies/CookieStoreClient";

export default function CookiesPage() {
  return (
    <AppShell>
      <CookieStoreClient />
    </AppShell>
  );
}
