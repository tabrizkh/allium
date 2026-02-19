import { Recipient, Occasion } from "./types";

export const recipientLabels: Record<Recipient, string> = {
  wife: "Жене",
  mom: "Маме",
  children: "Детям",
  colleague: "Коллеге",
  friend: "Друзьям",
};

export const occasionLabels: Record<Occasion, string> = {
  wedding: "Свадьба",
  nishan: "Нишан",
  gift: "Подарок",
  holiday: "Праздник",
  birthday: "День рождения",
};

export const recipients = Object.keys(recipientLabels) as Recipient[];
export const occasions = Object.keys(occasionLabels) as Occasion[];
