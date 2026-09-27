import { z } from "zod";

export const productSchema = z.object({
  name: z.string().trim().min(1, "Indica el nombre del producto").max(120),
  defaultUnit: z.string().trim().min(1, "Selecciona una unidad").max(30),
  purchasePrice: z.coerce.number().min(0, "El precio no puede ser negativo"),
  categoryId: z.string().min(1, "Selecciona una categoría"),
  zoneId: z.string().min(1, "Selecciona una zona"),
});

export type ProductInput = z.infer<typeof productSchema>;
