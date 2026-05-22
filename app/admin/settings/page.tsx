import { getCardTemplates } from "@/app/actions/addons";
import SettingsPage from "@/components/admin/SettingsPage";

export const dynamic = "force-dynamic";

export default async function Page() {
  const cardTemplates = await getCardTemplates();

  return (
    <div>
      <h1 className="text-3xl font-serif font-bold mb-8">Настройки</h1>
      <SettingsPage 
        cardTemplates={cardTemplates} 
      />
    </div>
  );
}
