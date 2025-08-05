export const cardProductClasses = 'bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 ease-in-out font-sans';
export const productTitleClasses = 'font-bold text-lg text-gray-900';
export const productDescriptionClasses = 'text-sm text-gray-600';
export const productPriceClasses = 'text-md font-semibold text-gray-800';
export const buttonClasses = 'bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors duration-200';
export const categoryButtonClasses = 'bg-transparent border border-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-100 hover:border-gray-400 transition-all duration-200 ease-in-out';
export const activeCategoryButtonClasses = 'bg-gray-800 text-white border-gray-800';

export const categorySectionClasses =
  'w-full';

export const categoryTitleClasses =
  'w-full text-left bg-white p-4 rounded-lg shadow-sm hover:shadow-md hover:bg-transparent transition-all duration-200 ease-in-out text-2xl font-semibold text-neutral-800 font-sans';

export const   productNombreClasses
 = 'text-lg font-semibold text-neutral-800 font-sans';

export const   productDescripcionClasses = 'text-neutral-600 text-sm font-sans';

export const productPrecioClasses = 'text-neutral-900 font-medium font-sans mt-2';

export const btnPrincipalClasses =
  'mt-4 bg-black hover:bg-neutral-800 text-white font-bold py-2 px-4 rounded-lg shadow-sm transition-all duration-200 ease-in-out font-sans w-full';

export const appContainerClasses =
  'max-w-4xl mx-auto px-4 py-8 min-h-screen bg-neutral-50 flex flex-col font-sans';

export const idiomaSelectorClasses =
  'flex gap-2 justify-center items-center text-sm font-sans';

export const idiomaBtnClasses = (active: boolean) =>
  `uppercase font-semibold text-sm transition-colors duration-200 ease-in-out ${
    active
      ? 'text-black'
      : 'text-neutral-400 hover:text-black'
  }`;

export const productImgWrapperClasses =
  'w-full h-48 mb-3 rounded-lg overflow-hidden bg-neutral-100 flex items-center justify-center';

export const productoImgClasses = 'w-full h-full object-cover';

export const resumenPedidoBarraLateralClasses =
  'fixed right-0 top-0 h-full w-80 bg-white shadow-lg p-6 flex flex-col z-50 border-l border-neutral-200 font-sans';

export const resumenPedidoTituloClasses =
  'text-lg font-bold mb-4 text-neutral-800 font-sans';

export const resumenPedidoProductoClasses =
  'flex justify-between items-center mb-2 text-neutral-700 font-sans';

export const resumenPedidoTotalClasses =
  'mt-4 text-xl font-extrabold text-black font-sans';

export const btnCantidadCompactoClasses =
  'w-8 h-8 flex items-center justify-center rounded-full bg-neutral-200 hover:bg-neutral-300 disabled:opacity-50 disabled:cursor-not-allowed text-neutral-700 font-medium text-lg transition-colors font-sans';

export const indicadorCantidadClasses = 'w-6 text-center font-medium font-sans';

export const modalOverlayClasses =
  'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4';

export const modalContentClasses =
  'bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto font-sans';

export const varianteClasses = 'p-4 bg-neutral-50 rounded-lg font-sans';

export const allergenContainerClasses = 'mt-2 flex flex-wrap gap-1 font-sans';
export const allergenItemClasses = 'inline-flex items-center gap-1 px-2 py-1 bg-yellow-50 rounded-full text-xs font-sans';
