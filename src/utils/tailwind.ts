export const cardProductoClasses =
  "bg-white rounded-2xl shadow p-4 mb-4 flex items-center justify-between transition-all duration-150 hover:shadow-lg";

export const categoriaSectionClasses =
  "mt-8 pt-4 border-t";

export const categoriaTituloClasses =
  "text-xl font-semibold mb-4 text-gray-900";

export const productoNombreClasses =
  "font-semibold text-gray-900";

export const productoDescripcionClasses =
  "text-sm text-gray-500";

export const productoPrecioClasses =
  "text-sm text-gray-700 mt-1";

export const contadorClasses =
  "flex items-center space-x-2";

export const contadorBtnClasses =
  "px-2 py-1 rounded bg-gray-200 text-lg font-bold transition-all duration-150 hover:bg-gray-300";

export const btnPrincipalClasses =
  "bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-xl shadow transition-all duration-150";

export const btnFinalizarPedidoClasses =
  "bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow transition-all duration-150 font-bold";

export const resumenPedidoFijoClasses =
  "fixed bottom-0 left-0 w-full bg-white shadow-lg p-4 flex justify-between items-center z-50";

export const fondoAppClasses =
  "bg-gray-50 min-h-screen pb-32";

export const navbarClasses = "bg-green-500 text-white p-4";
export const navbarContainerClasses = "container mx-auto flex justify-between items-center";
export const navbarLogoClasses = "text-2xl font-bold";
export const navbarLinkClasses = "text-lg mx-4 hover:text-green-300";
export const navbarCartBtnClasses = "bg-green-500 text-white py-2 px-4 rounded";

export const pageMainClasses = "bg-gray-50 min-h-screen p-4";
export const pageTitleClasses = "text-2xl font-bold mb-4 text-gray-900";
export const pageSectionClasses = "mb-4";

export const loginMainClasses = "max-w-sm mx-auto mt-20";
export const loginTitleClasses = "text-2xl font-bold mb-4 text-center text-gray-900";
export const loginFormClasses = "flex flex-col gap-4 bg-white p-6 rounded-2xl shadow";
export const loginInputClasses = "border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-150";
export const loginBtnClasses = "bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl shadow font-bold transition-all duration-150";
export const loginErrorClasses = "text-red-600 text-center";

export const appContainerClasses =
  "max-w-4xl mx-auto px-4 sm:px-8 py-8 " +
  "font-sans bg-gray-50 min-h-screen";

export const idiomaSelectorClasses =
  "flex justify-center gap-2 py-6";

export const idiomaBtnClasses = (active: boolean) =>
  `px-4 py-1 rounded-full transition-all duration-150 border
   ${active
    ? "bg-blue-600 text-white font-bold border-blue-600"
    : "bg-white text-gray-700 border-gray-300 hover:bg-blue-50"
  }`;

export const productoImgWrapperClasses =
  "w-full h-40 mb-2 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center";

export const productoImgClasses =
  "object-cover w-full h-full";

export const resumenPedidoBarraLateralClasses =
  "fixed right-0 top-0 h-full w-80 bg-white shadow-lg p-6 flex flex-col z-50 border-l border-gray-200";

export const resumenPedidoTituloClasses =
  "text-lg font-bold mb-4 text-gray-900";

export const resumenPedidoProductoClasses =
  "flex justify-between items-center mb-2 text-gray-700";

export const resumenPedidoTotalClasses =
  "mt-4 text-xl font-extrabold text-blue-700";

export const btnCantidadCompactoClasses =
  "w-8 h-8 rounded-full flex items-center justify-center bg-gray-200 text-gray-700 text-xl font-bold hover:bg-blue-100 transition";

export const indicadorCantidadClasses =
  "w-6 text-center font-semibold text-gray-900";
