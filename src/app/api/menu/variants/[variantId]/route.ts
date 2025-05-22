import { requireAuth } from "@/middleware/auth-middleware";
import { variantService } from "@/services/variant-service";
import { updateVariantSchema } from "@/schemas/variant";
import { jsonOk, jsonError } from "@/utils/api";

export async function PUT(
  request: Request,
  { params }: { params: { variantId: string } }
) {
  try {
    const session = await requireAuth('ADMIN');
    const body = await request.json();
    const validatedData = updateVariantSchema.parse(body);

    const variant = await variantService.updateVariant(
      Number(params.variantId),
      session.user.establishment_id,
      validatedData
    );
    return jsonOk({ variant });
  } catch (error) {
    return jsonError(error.message);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { variantId: string } }
) {
  try {
    const session = await requireAuth('ADMIN');
    await variantService.deleteVariant(
      Number(params.variantId),
      session.user.establishment_id
    );
    return jsonOk({ message: 'Variant deleted successfully' });
  } catch (error) {
    return jsonError(error.message);
  }
}
