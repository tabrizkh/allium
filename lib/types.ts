export type Category = {
  id: string;
  name: string;
  slug: string;
  image?: string | null;
};

export type Recipient =
  | "wife"
  | "mom"
  | "children"
  | "colleague"
  | "friend";

export type Occasion =
  | "wedding"
  | "nishan"
  | "gift"
  | "holiday"
  | "birthday";

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  oldPrice?: number | null;
  images: string[];
  categoryId: string;
  category: Category;
  isPopular: boolean;
  inStock: boolean;
  recipients?: string[];
  occasions?: string[];
};

export type User = {
  id: string;
  name: string;
  email: string;
  role?: string;
  phone?: string | null;
};
