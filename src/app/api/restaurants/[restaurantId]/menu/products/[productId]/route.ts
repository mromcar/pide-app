import { requireAuth } from "@/middleware/auth-middleware";
import { productService } from "@/services/product-service";
import { updateProductSchema } from "@/schemas/product";
import { jsonOk, jsonError } from "@/utils/api";

export async function PUT(
  request: Request,
  { params }: { params: { productId: string } }
) {
  try {
    const session = await requireAuth("ADMIN");
    const body = await request.json();
    const validatedData = updateProductSchema.parse(body);

    const product = await productService.updateProduct(
      Number(params.productId),
      session.user.establishment_id,
      validatedData
    );
    return jsonOk({ product });
  } catch (error) {
    return jsonError(error.message);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { productId: string } }
) {
  try {
    const session = await requireAuth("ADMIN");
    await productService.deleteProduct(
      Number(params.productId),
      session.user.establishment_id
    );
    return jsonOk({ message: "Product deleted successfully" });
  } catch (error) {
    return jsonError(error.message);
  }
}
