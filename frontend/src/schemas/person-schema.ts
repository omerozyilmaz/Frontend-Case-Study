import { z } from "zod";
import { isValidTckn } from "@/utils/tckn";

export const personFormSchema = z.object({
  first_name: z.string().min(2).max(100),
  last_name: z.string().min(2).max(100),
  tckn: z
    .string()
    .length(11, "tcknLength")
    .regex(/^\d{11}$/, "tcknLength")
    .refine(isValidTckn, { message: "tcknInvalid" }),
  email: z.string().email(),
  profession_group_id: z.number({ invalid_type_error: "professionGroup" }).int().positive(),
});

export type PersonFormValues = z.infer<typeof personFormSchema>;
