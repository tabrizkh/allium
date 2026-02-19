import { getAllPackaging, getCardTemplates } from "@/app/actions/addons";
import SettingsPage from "@/components/admin/SettingsPage";

export default async function Page() {
  const packaging = await getAllPackaging();
  const cardTemplates = await getCardTemplates();

  return (
    <div>
      <h1 className="text-3xl font-serif font-bold mb-8">Настройки</h1>
      <SettingsPage packaging={packaging} cardTemplates={cardTemplates} />
    </div>
  );
}
