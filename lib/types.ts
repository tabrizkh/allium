export type Story = {
  id: string;
  title: string | null;
  description: string | null;
  mediaUrl: string;
  type: "image" | "video";
  isActive: boolean;
  categoryId: string;
};

export type SliderItem = {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  imageUrl: string;
  buttonText: string;
  buttonLink: string;
  isActive: boolean;
};

export type CategoryAttribute = {
  id: string;
  name: string;
  options: {
    id: string;
    name: string;
  }[];
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  stories: Story[];
  attributes?: CategoryAttribute[];
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
  isTrending: boolean;
  inStock: boolean;
  productOptions: string; // JSON string
  recipients?: string[];
  occasions?: string[];
  orderItems: any[];
  favorites: any[];
  createdAt: string;
  updatedAt: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  role?: string;
  phone?: string | null;
};
