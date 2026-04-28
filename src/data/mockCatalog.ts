export type CatalogProduct = {
  id: string;
  barcode: string;
  name: string;
  price: number;
  category: string;
};

export const mockCatalog: CatalogProduct[] = [
  {
    id: "1",
    barcode: "8901234567890",
    name: "Organic Whole Milk",
    price: 58,
    category: "Dairy",
  },
  {
    id: "2",
    barcode: "8909876543210",
    name: "Sourdough Bread",
    price: 42,
    category: "Bakery",
  },
  {
    id: "3",
    barcode: "8901122334455",
    name: "Free-Range Eggs (12pk)",
    price: 96,
    category: "Dairy",
  },
  {
    id: "4",
    barcode: "8909988776655",
    name: "Fresh Apples",
    price: 120,
    category: "Fruits",
  },
];
