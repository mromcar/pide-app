export const cardProductoClasses = 'bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow';

export const categoriaSectionClasses =
  'cursor-pointer bg-white rounded-xl shadow p-4 flex flex-col items-center transition-transform hover:scale-105';

export const categoriaTituloClasses =
  'text-lg font-bold mb-2 text-center text-gray-900';

export const productoNombreClasses = 'text-lg font-semibold mb-1';

export const productoDescripcionClasses = 'text-gray-600 text-sm mb-2';

export const productoPrecioClasses = 'text-gray-900 font-medium';

export const contadorClasses = 'flex items-center gap-2';

export const contadorBtnClasses =
  'px-2 py-1 rounded bg-gray-200 text-lg font-bold transition-all duration-150 hover:bg-gray-300';

export const btnPrincipalClasses =
  'bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-xl shadow transition-all duration-150';

export const btnFinalizarPedidoClasses =
  'bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors';

export const resumenPedidoFijoClasses =
  'fixed bottom-0 left-0 right-0 bg-white shadow p-4 flex flex-col sm:flex-row items-center gap-4 z-20 justify-between border-t';

export const fondoAppClasses =
  'bg-gray-50 min-h-screen pb-32';

export const navbarClasses = 'bg-green-500 text-white p-4';
export const navbarContainerClasses = 'container mx-auto flex justify-between items-center';
export const navbarLogoClasses = 'text-2xl font-bold';
export const navbarLinkClasses = 'text-lg mx-4 hover:text-green-300';
export const navbarCartBtnClasses = 'bg-green-500 text-white py-2 px-4 rounded';

export const pageMainClasses = 'bg-gray-50 min-h-screen p-4';
export const pageTitleClasses = 'text-2xl font-bold mb-4 text-gray-900';
export const pageSectionClasses = 'mb-4';

export const loginMainClasses = 'max-w-sm mx-auto mt-20';
export const loginTitleClasses = 'text-2xl font-bold mb-4 text-center text-gray-900';
export const loginFormClasses = 'flex flex-col gap-4 bg-white p-6 rounded-2xl shadow';
export const loginInputClasses = 'border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-150';
export const loginBtnClasses = 'bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl shadow font-bold transition-all duration-150';
export const loginErrorClasses = 'text-red-600 text-center';

export const appContainerClasses =
  'max-w-3xl mx-auto px-4 py-8 min-h-screen bg-gray-50 flex flex-col';

export const idiomaSelectorClasses =
  'mb-2 flex gap-1 justify-center items-center text-sm pr-2';

export const idiomaBtnClasses = (active: boolean) =>
  `px-2 py-0.5 rounded text-xs transition-colors duration-200 ${active
    ? 'bg-blue-600 text-white'
    : 'bg-gray-200 text-gray-800 hover:bg-blue-100'
  }`;

export const productoImgWrapperClasses =
  'w-full h-40 mb-2 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center';

export const productoImgClasses = 'w-full h-48 object-cover';

export const resumenPedidoBarraLateralClasses =
  'fixed right-0 top-0 h-full w-80 bg-white shadow-lg p-6 flex flex-col z-50 border-l border-gray-200';

export const resumenPedidoTituloClasses =
  'text-lg font-bold mb-4 text-gray-900';

export const resumenPedidoProductoClasses =
  'flex justify-between items-center mb-2 text-gray-700';

export const resumenPedidoTotalClasses =
  'mt-4 text-xl font-extrabold text-blue-700';

export const btnCantidadCompactoClasses = 'w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 font-medium text-lg transition-colors';

export const indicadorCantidadClasses = 'w-6 text-center font-medium';

export const modalOverlayClasses =
  'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4';

export const modalContentClasses =
  'bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto';

export const varianteClasses = 'p-4 bg-gray-50 rounded-lg';

export const allergenContainerClasses = 'mt-2 flex flex-wrap gap-1';
export const allergenItemClasses = 'inline-flex items-center gap-1 px-2 py-1 bg-yellow-50 rounded-full text-xs';
