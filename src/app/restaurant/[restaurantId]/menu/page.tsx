import { categoryApiService } from '@/services/api/category.api';
import { productApiService } from '@/services/api/product.api';
import MenuDisplay from '@/components/MenuDisplay';
import { CategoryDTO } from '@/types/dtos/category';
import { ProductResponseDTO } from '@/types/dtos/product';
import { uiTranslations } from '@/translations/ui'; // Asumiendo que aquí están tus traducciones
import { LanguageCode, DEFAULT_LANGUAGE } from '@/constants/languages'; // Asumiendo que tienes DEFAULT_LANGUAGE
import type { Metadata, ResolvingMetadata } from 'next';

// Definimos una interfaz para la estructura de datos que pasaremos al componente de visualización
interface MenuCategory extends CategoryDTO {
  products: ProductResponseDTO[];
}

interface RestaurantMenuPageProps {
  params: { restaurantId: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

export async function generateMetadata({
  params,
  searchParams,
}: RestaurantMenuPageProps): Promise<Metadata> {
  const lang = Array.isArray(searchParams.lang) ? searchParams.lang[0] : searchParams.lang || 'en';
  const restaurantId = params.restaurantId;
  const t = uiTranslations[lang];

  // Opcional: Podrías obtener el nombre del restaurante para incluirlo en el título
  // const establishment = await establishmentApiService.getOneById(restaurantId); // Necesitarías este servicio
  // const title = establishment ? `${t.restaurantMenu} - ${establishment.name}` : t.restaurantMenu;

  return {
    title: t.restaurantMenu, // Ejemplo: "Menú del Restaurante"
    // description: `Explora el delicioso menú de ${establishment?.name || 'nuestro restaurante'}.`
  };
}

export default async function RestaurantMenuPage({
  params,
  searchParams,
}: RestaurantMenuPageProps) {
  const lang = Array.isArray(searchParams.lang) ? searchParams.lang[0] : searchParams.lang || 'en';
  const restaurantId = params.restaurantId;
  const translations = uiTranslations[lang as LanguageCode] || uiTranslations.en;

  if (!isValidUUID(restaurantId)) {
    return <p>{translations.restaurantMenu.invalidRestaurantIdError}</p>;
  }

  try {
    const menuData = await getActiveMenuByRestaurantId(restaurantId, lang as LanguageCode);

    if (!menuData) {
      return <p>{translations.restaurantMenu.menuNotAvailableError}</p>;
    }

    if (menuData.categories.length === 0) {
      return <p>{translations.restaurantMenu.menuNoItems}</p>;
    }

    return <MenuDisplay menuData={menuData} lang={lang as LanguageCode} />;
  } catch (error) {
    console.error('Error fetching menu data:', error);
    // Consider a more specific error message based on the error type
    return <p>{translations.restaurantMenu.menuNotAvailableError}</p>; // Or a generic error
  }
}

// Considera añadir metadata para SEO
// export async function generateMetadata({ params }: RestaurantMenuPageProps) { ... }

async function getMenuData(restaurantId: number, lang: LanguageCode): Promise<MenuCategory[]> {
  try {
    // Aquí asumimos que tus servicios API pueden tomar el 'lang' para devolver traducciones si es necesario
    // o que MenuDisplay se encargará de traducir usando los datos base y el 'lang' prop.
    const categories = await categoryApiService.getAllCategoriesByEstablishment(restaurantId, lang);
    const activeCategories = categories.filter(cat => cat.is_active);

    const menu: MenuCategory[] = [];

    for (const category of activeCategories) {
      const products = await productApiService.getAllProductsByRestaurant(restaurantId, category.category_id, lang);
      const activeProducts = products.filter(prod => prod.is_active);
      // Solo añadir la categoría si tiene productos activos
      if (activeProducts.length > 0) {
        menu.push({ ...category, products: activeProducts });
      }
    }
    // Filtrar categorías que quedaron sin productos después del segundo filtro
    return menu.filter(cat => cat.products.length > 0);
  } catch (error) {
    console.error('Error fetching menu data:', error);
    // Considera un sistema de logging más robusto para producción
    // Devolver un array vacío permite a la UI manejar el estado "sin datos"
    // Si el error es crítico (ej. servicio caído), podrías lanzar el error
    // para que lo capture un ErrorBoundary o la página de error de Next.js.
    // throw error; // Descomentar si prefieres que Next.js maneje el error con una página de error
    return [];
  }
}

export async function generateMetadata(
  { params, searchParams }: RestaurantMenuPageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const restaurantId = parseInt(params.restaurantId, 10);
  const lang = searchParams?.lang || DEFAULT_LANGUAGE;
  const t = uiTranslations[lang];

  // Opcional: Podrías obtener el nombre del restaurante para incluirlo en el título
  // const establishment = await establishmentApiService.getOneById(restaurantId); // Necesitarías este servicio
  // const title = establishment ? `${t.restaurantMenu} - ${establishment.name}` : t.restaurantMenu;

  return {
    title: t.restaurantMenu, // Ejemplo: "Menú del Restaurante"
    // description: `Explora el delicioso menú de ${establishment?.name || 'nuestro restaurante'}.`
  };
}

export default async function RestaurantMenuPage({ params, searchParams }: RestaurantMenuPageProps) {
  const restaurantId = parseInt(params.restaurantId, 10);
  const lang = searchParams?.lang || DEFAULT_LANGUAGE;
  const t = uiTranslations[lang];

  if (isNaN(restaurantId)) {
    return <div className="container mx-auto p-4 text-center text-red-600">{t.invalidRestaurantIdError}</div>; // Ejemplo: "ID de restaurante inválido."
  }

  const menuData = await getMenuData(restaurantId, lang);

  if (!menuData || menuData.length === 0) {
    return <div className="container mx-auto p-4 text-center">{t.menuNotAvailableError}</div>; // Ejemplo: "No se pudo cargar el menú o no hay ítems disponibles."
  }

  return (
    <div className="container mx-auto p-4">
      {/* El título podría venir del 'establishment' si lo obtienes para metadata */}
      <h1 className="text-3xl font-bold mb-6 text-center">{t.restaurantMenu}</h1>
      <MenuDisplay menu={menuData} lang={lang} />
    </div>
  );
}

// Considera añadir metadata para SEO
// export async function generateMetadata({ params }: RestaurantMenuPageProps) { ... }