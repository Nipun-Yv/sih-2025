export type Product= {
  id: number;
  title: string;
  price: number;
  originalPrice: number;
  img_url: string;
  seller: string;
  location: string;
  customisable: boolean;
  description:string;
  verified: "True";
  badge: "PREMIUM" | "BESTSELLER" | "LIMITED";
};