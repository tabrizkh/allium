export type Story = {
  id: string;
  title: string | null;
  title_en?: string | null;
  title_az?: string | null;
  description: string | null;
  description_en?: string | null;
  description_az?: string | null;
  mediaUrl: string;
  type: "image" | "video";
  isActive: boolean;
  categoryId: string;
};

export type SliderItem = {
  id: string;
  title: string;
  title_en?: string | null;
  title_az?: string | null;
  subtitle: string | null;
  subtitle_en?: string | null;
  subtitle_az?: string | null;
  description: string | null;
  description_en?: string | null;
  description_az?: string | null;
  imageUrl: string;
  buttonText: string;
  buttonText_en?: string | null;
  buttonText_az?: string | null;
  buttonLink: string;
  isActive: boolean;
};

export type CategoryAttribute = {
  id: string;
  name: string;
  name_en?: string | null;
  name_az?: string | null;
  options: {
    id: string;
    name: string;
    name_en?: string | null;
    name_az?: string | null;
  }[];
};

export type Packaging = {
  id: string;
  name: string;
  name_en?: string | null;
  name_az?: string | null;
  price: number;
  image: string | null;
  isAvailable: boolean;
  categoryId: string;
};

export type Category = {
  id: string;
  name: string;
  name_en?: string | null;
  name_az?: string | null;
  slug: string;
  image: string | null;
  stories: Story[];
  attributes?: CategoryAttribute[];
  packaging?: Packaging[];
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
  name_en?: string | null;
  name_az?: string | null;
  slug: string;
  description: string | null;
  description_en?: string | null;
  description_az?: string | null;
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
