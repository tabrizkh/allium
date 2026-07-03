import { getCardTemplates } from "@/app/actions/addons";
import SettingsPage from "@/components/admin/SettingsPage";
import { checkMaintenanceMode } from "@/app/actions/maintenance";

export const dynamic = "force-dynamic";

export default async function Page() {
  const cardTemplates = await getCardTemplates();
  const maintenanceMode = await checkMaintenanceMode();

  return (
    <div>
      <h1 className="text-3xl font-serif font-bold mb-8">Настройки</h1>
      <SettingsPage 
        cardTemplates={cardTemplates} 
        initialMaintenanceMode={maintenanceMode}
      />
    </div>
  );
}
