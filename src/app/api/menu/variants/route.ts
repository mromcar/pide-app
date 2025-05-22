import { requireAuth } from "@/middleware/auth-middleware";
import { variantService } from "@/services/variant-service";
import { createVariantSchema } from "@/schemas/variant";
import { jsonOk, jsonError } from "@/utils/api";

export async function GET(request: Request) {
  try {
    const session = await requireAuth();
    const { searchParams } = new URL(request.url);
    const language = searchParams.get('lang') || 'es';

    const variants = await variantService.getAllVariants(
      session.user.establishment_id,
      language
    );
    return jsonOk({ variants });
  } catch (error) {
    return jsonError(error.message);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAuth('ADMIN');
    const body = await request.json();
    const validatedData = createVariantSchema.parse(body);

    const variant = await variantService.createVariant({
      ...validatedData,
      establishment_id: session.user.establishment_id
    });
    return jsonOk({ variant });
  } catch (error) {
    return jsonError(error.message);
  }
}
