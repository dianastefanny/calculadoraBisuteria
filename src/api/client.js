// -----------------------------------------------------------------------
// Conector entre la app y el backend de Laravel.
// baseURL apunta a la IP de la PC en la red local (no a 127.0.0.1/localhost),
// porque en un celular físico "localhost" significa el propio celular, no
// la PC donde corre "php artisan serve". Esta IP puede cambiar si la PC se
// reconecta a otra red o el router le asigna otra por DHCP — si vuelve a
// fallar la conexión, revisa la IP actual con "ipconfig" (Windows) y
// actualízala aquí. El backend también debe correr con
// "php artisan serve --host=0.0.0.0" para aceptar conexiones desde otros
// dispositivos de la red, no solo desde la propia PC.
// -----------------------------------------------------------------------

import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const TOKEN_KEY = "auth_token";

// Orden alfabético (A-Z, sin distinguir mayúsculas/tildes) para las listas de
// catálogos (materiales, empaques, diseños, etc.), así se encuentran más
// fácil tanto en sus pantallas como en los selectores de los formularios.
function sortByName(items) {
  return [...items].sort((a, b) =>
    a.name.localeCompare(b.name, "es", { sensitivity: "base" }),
  );
}

// expo-secure-store depende del Keychain/Keystore del sistema operativo, que
// no existe en el navegador. En Web se usa localStorage en su lugar; en
// iOS/Android se sigue usando SecureStore como antes.
const isWeb = Platform.OS === "web";

async function getStoredToken() {
  if (isWeb) return localStorage.getItem(TOKEN_KEY);
  return SecureStore.getItemAsync(TOKEN_KEY);
}

async function setStoredToken(token) {
  if (isWeb) {
    localStorage.setItem(TOKEN_KEY, token);
    return;
  }
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

async function clearStoredToken() {
  if (isWeb) {
    localStorage.removeItem(TOKEN_KEY);
    return;
  }
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

const api = axios.create({
  baseURL: "http://192.168.1.9:8000/api",
});

// Antes de enviar CUALQUIER petición, agrega automáticamente el token de
// sesión guardado (si existe) para que el servidor sepa quién es el usuario.
api.interceptors.request.use(async (config) => {
  const token = await getStoredToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;

/**
 * Saca un mensaje legible de un error de axios: usa el primer error de
 * validación de Laravel si viene (422), si no el "message" general del
 * backend, y si no hay respuesta del servidor, un mensaje de red genérico.
 */
export function getErrorMessage(error) {
  const data = error?.response?.data;
  const firstFieldError = data?.errors && Object.values(data.errors)[0]?.[0];
  return (
    firstFieldError ??
    data?.message ??
    "No se pudo conectar con el servidor. Intenta de nuevo."
  );
}

// -----------------------------------------------------------------------
// Autenticación (usadas por login.tsx, register.tsx, forgot-password.tsx)
// -----------------------------------------------------------------------

/**
 * Crea la cuenta en el backend. No guarda el token: register.tsx redirige
 * al login para que el usuario entre con sus credenciales, igual que antes.
 */
export async function registerUser({
  name,
  lastName,
  phone,
  email,
  password,
  confirmPassword,
}) {
  const { data } = await api.post("/register", {
    name,
    last_name: lastName,
    email,
    password,
    password_confirmation: confirmPassword,
    phone: phone || undefined,
  });
  return data; // { user, token }
}

/**
 * Inicia sesión y guarda el token en SecureStore para que el interceptor de
 * arriba lo use automáticamente en las siguientes peticiones.
 */
export async function loginUser({ email, password }) {
  const { data } = await api.post("/login", { email, password });
  await setStoredToken(data.token);
  return data; // { user, token }
}

/**
 * Cierra la sesión: le avisa al backend para invalidar el token actual
 * (POST /logout) y, pase lo que pase con esa llamada (sin conexión, token ya
 * vencido, etc.), siempre borra el token guardado en este dispositivo — el
 * usuario debe poder salir localmente aunque el servidor no responda.
 */
export async function logoutUser() {
  try {
    await api.post("/logout");
  } catch {
    // Si falla, igual se borra el token guardado localmente más abajo.
  }
  await clearStoredToken();
}

/**
 * Paso 1 de "Recuperar contraseña": el backend siempre responde el mismo
 * mensaje genérico exista o no la cuenta (por seguridad, no revela si un
 * correo está registrado). Si el correo existe, aquí es donde se envía el
 * código de verificación.
 */
export async function forgotPassword({ email }) {
  const { data } = await api.post("/password/forgot", { email });
  return data; // { message }
}

/**
 * Paso 2: valida el código de 6 dígitos enviado al correo.
 */
export async function verifyResetCode({ email, code }) {
  const { data } = await api.post("/password/verify-code", { email, code });
  return data; // { message }
}

/**
 * Paso 3: guarda la nueva contraseña usando el mismo código ya verificado.
 */
export async function resetPassword({
  email,
  code,
  password,
  confirmPassword,
}) {
  const { data } = await api.post("/password/reset", {
    email,
    code,
    password,
    password_confirmation: confirmPassword,
  });
  return data; // { message }
}

/**
 * Trae los datos del usuario autenticado.
 */
export async function fetchMe() {
  const { data } = await api.get("/me");
  return {
    name: data.name,
    lastName: data.last_name,
    phone: data.phone ?? "",
    email: data.email,
  };
}

/**
 * Actualiza el perfil del usuario (nombre, apellido, teléfono, correo).
 * Solo envía los campos que se pasen.
 */
export async function updateProfile({ name, lastName, phone, email }) {
  const { data } = await api.put("/me", {
    name,
    last_name: lastName,
    phone,
    email,
  });
  return {
    name: data.name,
    lastName: data.last_name,
    phone: data.phone ?? "",
    email: data.email,
  };
}

/**
 * Cambia la contraseña del usuario, verificando la contraseña actual.
 */
export async function updatePassword({
  currentPassword,
  newPassword,
  confirmNewPassword,
}) {
  const { data } = await api.put("/password", {
    current_password: currentPassword,
    password: newPassword,
    password_confirmation: confirmNewPassword,
  });
  return data; // { message }
}

// -----------------------------------------------------------------------
// Categorías de materiales (usadas por material-form-modal.tsx)
// -----------------------------------------------------------------------

export async function fetchCategories() {
  const { data } = await api.get("/material-categories");
  return sortByName(
    data.map((category) => ({
      id: String(category.id),
      name: category.name,
    })),
  );
}

// -----------------------------------------------------------------------
// Materiales (usadas por materiales.tsx y material-form-modal.tsx)
// -----------------------------------------------------------------------

// Unidades que realmente acepta el backend (App\Enums\MaterialUnit), con su
// etiqueta en español para mostrar en el selector.
export const MATERIAL_UNIT_OPTIONS = [
  { value: "unit", label: "Unidad" },
  { value: "gram", label: "Gramo" },
  { value: "kilogram", label: "Kilogramo" },
  { value: "meter", label: "Metro" },
  { value: "centimeter", label: "Centímetro" },
  { value: "package", label: "Paquete" },
  { value: "pair", label: "Par" },
];

export function getUnitLabel(value) {
  return (
    MATERIAL_UNIT_OPTIONS.find((option) => option.value === value)?.label ??
    value
  );
}

function mapMaterialFromApi(material) {
  return {
    id: String(material.id),
    categoryId: String(material.material_category_id),
    categoryName: material.category?.name ?? "",
    name: material.name,
    unit: material.unit,
    unitCost: String(material.unit_cost),
    stock: material.stock != null ? String(material.stock) : "0",
  };
}

export async function fetchMaterials() {
  const { data } = await api.get("/materials");
  return sortByName(data.map(mapMaterialFromApi));
}

export async function createMaterial({
  categoryId,
  name,
  unit,
  unitCost,
  stock,
}) {
  const { data } = await api.post("/materials", {
    material_category_id: Number(categoryId),
    name,
    unit,
    unit_cost: unitCost,
    stock: stock || undefined,
  });
  return mapMaterialFromApi(data);
}

export async function updateMaterial(
  id,
  { categoryId, name, unit, unitCost, stock },
) {
  const { data } = await api.put(`/materials/${id}`, {
    material_category_id: Number(categoryId),
    name,
    unit,
    unit_cost: unitCost,
    stock,
  });
  return mapMaterialFromApi(data);
}

export async function deleteMaterial(id) {
  await api.delete(`/materials/${id}`);
}

// -----------------------------------------------------------------------
// Empaques (usadas por empaques.tsx y packaging-form-modal.tsx)
// -----------------------------------------------------------------------

function mapPackagingFromApi(packaging) {
  return {
    id: String(packaging.id),
    name: packaging.name,
    unitCost: String(packaging.unit_cost),
    stock: packaging.stock != null ? String(packaging.stock) : "0",
  };
}

export async function fetchPackagings() {
  const { data } = await api.get("/packagings");
  return sortByName(data.map(mapPackagingFromApi));
}

export async function createPackaging({ name, unitCost, stock }) {
  const { data } = await api.post("/packagings", {
    name,
    unit_cost: unitCost,
    stock: stock || undefined,
  });
  return mapPackagingFromApi(data);
}

export async function updatePackaging(id, { name, unitCost, stock }) {
  const { data } = await api.put(`/packagings/${id}`, {
    name,
    unit_cost: unitCost,
    stock,
  });
  return mapPackagingFromApi(data);
}

export async function deletePackaging(id) {
  await api.delete(`/packagings/${id}`);
}

// -----------------------------------------------------------------------
// Diseños (usadas por disenos.tsx y design-form-modal.tsx)
// -----------------------------------------------------------------------

function mapDesignFromApi(design) {
  return {
    id: String(design.id),
    name: design.name,
    description: design.description ?? "",
    reference: design.reference ?? "",
    materials: (design.details ?? []).map((detail) => ({
      materialId: String(detail.material_id),
      quantity: String(detail.quantity),
      materialName: detail.material?.name ?? "",
      materialUnit: detail.material?.unit ?? "",
    })),
  };
}

export async function fetchDesigns() {
  const { data } = await api.get("/designs");
  return sortByName(data.map(mapDesignFromApi));
}

export async function createDesign({
  name,
  description,
  reference,
  materials,
}) {
  const { data } = await api.post("/designs", {
    name,
    description: description || undefined,
    reference: reference || undefined,
    materials: materials.map((item) => ({
      material_id: Number(item.materialId),
      quantity: item.quantity,
    })),
  });
  return mapDesignFromApi(data);
}

export async function updateDesign(
  id,
  { name, description, reference, materials },
) {
  const { data } = await api.put(`/designs/${id}`, {
    name,
    description: description || undefined,
    reference: reference || undefined,
    materials: materials.map((item) => ({
      material_id: Number(item.materialId),
      quantity: item.quantity,
    })),
  });
  return mapDesignFromApi(data);
}

export async function deleteDesign(id) {
  await api.delete(`/designs/${id}`);
}

// -----------------------------------------------------------------------
// Cálculos (usada por calculos.tsx)
// -----------------------------------------------------------------------

// -----------------------------------------------------------------------
// Configuración (usada por configuraciones.tsx)
// -----------------------------------------------------------------------

function mapConfigurationFromApi(configuration) {
  return {
    monthlySalary: String(configuration.monthly_salary),
    monthlyWorkingHours: String(configuration.monthly_working_hours),
    // Opcional: null en el backend significa "no configurado" (se reparten
    // los costos indirectos por minuto en su lugar), se representa como
    // texto vacío para que el campo se vea vacío en el formulario.
    monthlyProduction:
      configuration.monthly_production != null
        ? String(configuration.monthly_production)
        : "",
    defaultMargin: String(configuration.default_margin),
    currency: configuration.currency,
    theme: configuration.theme,
  };
}

export async function fetchConfiguration() {
  const { data } = await api.get("/configuration");
  return mapConfigurationFromApi(data);
}

/**
 * Actualiza la configuración del usuario. Todos los campos son opcionales:
 * solo se envían al backend los que se pasen (los que falten se omiten del
 * payload, ver PUT /configuration en ConfigurationController).
 * @param {{ monthlySalary?: string, monthlyWorkingHours?: string, monthlyProduction?: string, defaultMargin?: string, theme?: string, currency?: string }} params
 */
export async function updateConfiguration({
  monthlySalary,
  monthlyWorkingHours,
  monthlyProduction,
  defaultMargin,
  theme,
  currency,
} = {}) {
  const { data } = await api.put("/configuration", {
    monthly_salary: monthlySalary,
    monthly_working_hours: monthlyWorkingHours,
    // "" (campo vacío en el formulario) se manda como null explícito para
    // borrar el valor guardado — un string vacío no pasaría la validación
    // "numeric" del backend. undefined (no se tocó este campo) se omite del
    // payload por completo, ver el comentario de arriba.
    monthly_production:
      monthlyProduction === undefined
        ? undefined
        : monthlyProduction === "" || monthlyProduction === null
          ? null
          : monthlyProduction,
    default_margin: defaultMargin,
    theme,
    currency,
  });
  return mapConfigurationFromApi(data);
}

// -----------------------------------------------------------------------
// Tipos de costo (usados por indirect-cost-form-modal.tsx)
// -----------------------------------------------------------------------

export async function fetchCostTypes() {
  const { data } = await api.get("/cost-types");
  return sortByName(
    data.map((costType) => ({
      id: String(costType.id),
      name: costType.name,
    })),
  );
}

export async function createCostType({ name }) {
  const { data } = await api.post("/cost-types", { name });
  return { id: String(data.id), name: data.name };
}

// -----------------------------------------------------------------------
// Costos indirectos (usados por costos-indirectos.tsx e
// indirect-cost-form-modal.tsx)
// -----------------------------------------------------------------------

function mapIndirectCostFromApi(indirectCost) {
  return {
    id: String(indirectCost.id),
    costTypeId: String(indirectCost.cost_type_id),
    costTypeName: indirectCost.cost_type?.name ?? "",
    name: indirectCost.name,
    monthlyAmount: String(indirectCost.monthly_amount),
  };
}

export async function fetchIndirectCosts() {
  const { data } = await api.get("/indirect-costs");
  return sortByName(data.map(mapIndirectCostFromApi));
}

export async function createIndirectCost({ costTypeId, name, monthlyAmount }) {
  const { data } = await api.post("/indirect-costs", {
    cost_type_id: Number(costTypeId),
    name,
    monthly_amount: monthlyAmount,
  });
  return mapIndirectCostFromApi(data);
}

export async function updateIndirectCost(
  id,
  { costTypeId, name, monthlyAmount },
) {
  const { data } = await api.put(`/indirect-costs/${id}`, {
    cost_type_id: Number(costTypeId),
    name,
    monthly_amount: monthlyAmount,
  });
  return mapIndirectCostFromApi(data);
}

export async function deleteIndirectCost(id) {
  await api.delete(`/indirect-costs/${id}`);
}

// -----------------------------------------------------------------------
// Tipos de prestación (usados por benefit-form-modal.tsx)
// -----------------------------------------------------------------------

export async function fetchBenefitTypes() {
  const { data } = await api.get("/benefit-types");
  return sortByName(
    data.map((benefitType) => ({
      id: String(benefitType.id),
      name: benefitType.name,
    })),
  );
}

export async function createBenefitType({ name }) {
  const { data } = await api.post("/benefit-types", { name });
  return { id: String(data.id), name: data.name };
}

// -----------------------------------------------------------------------
// Prestaciones legales (usadas por configuraciones.tsx). Las 5 legales
// vienen sembradas por defecto al crear la cuenta, pero el usuario puede
// agregar otras, corregir su nombre/porcentaje, o eliminarlas.
// -----------------------------------------------------------------------

function mapBenefitFromApi(benefit) {
  return {
    id: String(benefit.id),
    benefitTypeId: String(benefit.benefit_type_id),
    benefitTypeName: benefit.benefit_type?.name ?? "",
    name: benefit.name,
    percentage: String(benefit.percentage),
  };
}

export async function fetchBenefits() {
  const { data } = await api.get("/benefits");
  return sortByName(data.map(mapBenefitFromApi));
}

export async function createBenefit({ benefitTypeId, name, percentage }) {
  const { data } = await api.post("/benefits", {
    benefit_type_id: Number(benefitTypeId),
    name,
    percentage,
  });
  return mapBenefitFromApi(data);
}

export async function updateBenefit(id, { benefitTypeId, name, percentage }) {
  const { data } = await api.put(`/benefits/${id}`, {
    benefit_type_id: benefitTypeId ? Number(benefitTypeId) : undefined,
    name,
    percentage,
  });
  return mapBenefitFromApi(data);
}

export async function deleteBenefit(id) {
  await api.delete(`/benefits/${id}`);
}

// -----------------------------------------------------------------------
// Historial (usada por historial.tsx) — reutiliza los cálculos guardados
// (GET/DELETE /calculations), no un endpoint aparte.
// -----------------------------------------------------------------------

function mapCalculationToHistoryEntry(calculation) {
  const materialNames = (calculation.design?.details ?? [])
    .map((detail) => detail.material?.name)
    .filter(Boolean);

  return {
    id: String(calculation.id),
    pieceName: calculation.design?.name ?? "Diseño eliminado",
    materialNames,
    materialsCost: Number(calculation.materials_cost),
    packagingCost: Number(calculation.packaging_cost),
    laborCost: Number(calculation.labor_cost),
    indirectCostsTotal: Number(calculation.indirect_cost),
    legalBenefitsCost: Number(calculation.benefits_cost),
    totalCost: Number(calculation.total_cost),
    profitMargin: Number(calculation.margin),
    salePrice: Number(calculation.sale_price),
    quantity: Number(calculation.quantity),
    discountPercentage:
      calculation.discount_percentage != null
        ? Number(calculation.discount_percentage)
        : null,
    finalPrice: Number(calculation.final_price),
    isSold: Boolean(calculation.is_sold),
    validUntil: calculation.valid_until,
    createdAt: calculation.created_at,
  };
}

export async function fetchHistory() {
  const { data } = await api.get("/calculations");
  return data.map(mapCalculationToHistoryEntry);
}

export async function deleteHistoryEntry(id) {
  await api.delete(`/calculations/${id}`);
}

/**
 * Marca una cotización como vendida: descuenta del stock los materiales de
 * la receta y el empaque usados (multiplicados por la cantidad de piezas).
 * El backend rechaza la operación si no hay suficiente stock de algo, o si
 * esta cotización ya se había marcado como vendida antes.
 */
export async function markCalculationSold(id) {
  const { data } = await api.post(`/calculations/${id}/mark-sold`);
  return mapCalculationToHistoryEntry(data);
}

export async function calculatePieceCost({
  designId,
  packagingId,
  productionTimeMinutes,
  packagingQuantity,
  quantity,
  discountPercentage,
  includeIndirectCosts,
  includeBenefits,
}) {
  const { data } = await api.post("/calculations", {
    design_id: Number(designId),
    production_time_minutes: productionTimeMinutes,
    packaging_id: packagingId ? Number(packagingId) : undefined,
    packaging_quantity: packagingId
      ? packagingQuantity || undefined
      : undefined,
    quantity: quantity || undefined,
    discount_percentage: discountPercentage || undefined,
    include_indirect_costs: includeIndirectCosts,
    include_benefits: includeBenefits,
  });
  return {
    materialsCost: Number(data.materials_cost),
    packagingCost: Number(data.packaging_cost),
    laborCost: Number(data.labor_cost),
    indirectCostsTotal: Number(data.indirect_cost),
    legalBenefitsCost: Number(data.benefits_cost),
    totalCost: Number(data.total_cost),
    profitMargin: Number(data.margin),
    salePrice: Number(data.sale_price),
    quantity: Number(data.quantity),
    discountPercentage:
      data.discount_percentage != null
        ? Number(data.discount_percentage)
        : null,
    finalPrice: Number(data.final_price),
    validUntil: data.valid_until,
    createdAt: data.created_at,
  };
}

// -----------------------------------------------------------------------
// Estadísticas (usadas por inicio.tsx) — resumen de conteos del usuario.
// -----------------------------------------------------------------------

export async function fetchStatistics() {
  const { data } = await api.get("/statistics/summary");
  return {
    totalMaterials: data.total_materials,
    totalMaterialCategories: data.total_material_categories,
    totalDesigns: data.total_designs,
    totalPackagings: data.total_packagings,
    totalIndirectCosts: data.total_indirect_costs,
    totalBenefits: data.total_benefits,
    totalCalculations: data.total_calculations,
    lastCalculationAt: data.last_calculation_at,
  };
}
