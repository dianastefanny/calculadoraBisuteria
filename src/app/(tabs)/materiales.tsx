import Ionicons from "@expo/vector-icons/Ionicons";
import { useFocusEffect } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { Pressable, Text, View } from "react-native";

import {
  deleteMaterial as deleteMaterialApi,
  fetchMaterials,
  getErrorMessage,
  getUnitLabel,
} from "@/api/client";
import { Button } from "@/components/button";
import { Card } from "@/components/card";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { FormError } from "@/components/form-error";
import {
  MaterialFormModal,
  type ApiMaterial,
} from "@/components/material-form-modal";
import { TabScreen } from "@/components/tab-screen";
import { AppColors, INK_TEXT, MUTED_TEXT, useThemeColors } from "@/constants/app-theme";
import { formatAmount, useCurrency, type CurrencyOption } from "@/constants/currency-store";

function getMaterialStatus(material: ApiMaterial): "Disponible" | "Agotado" {
  const stockNumber = Number(material.stock);
  return Number.isFinite(stockNumber) && stockNumber > 0
    ? "Disponible"
    : "Agotado";
}

function formatMaterialDetail(material: ApiMaterial, currency: CurrencyOption) {
  return `${material.stock} ${getUnitLabel(material.unit)} · ${currency.symbol}${formatAmount(material.unitCost, currency.code)} c/u`;
}

/**
 * Pestaña Materiales: primera pantalla que se muestra después de iniciar
 * sesión. Aquí se crean, editan y listan los materiales en existencia,
 * conectada al backend real (GET/DELETE /materials).
 *
 * "+ Nuevo material" y el lápiz de cada tarjeta abren el mismo
 * MaterialFormModal (sin material = crear, con material = editar); no hay
 * un formulario aparte para cada caso. El bote de basura pide confirmación
 * (ConfirmDialog) antes de eliminar.
 */
export default function Materiales() {
  const currency = useCurrency();
  const theme = useThemeColors();
  const [materials, setMaterials] = useState<ApiMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formVisible, setFormVisible] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<ApiMaterial | null>(
    null,
  );
  const [deletingMaterial, setDeletingMaterial] = useState<ApiMaterial | null>(
    null,
  );

  // Solo la primera carga muestra "Cargando materiales...". Las siguientes
  // (cada vez que se vuelve a esta pestaña) se actualizan en silencio, para
  // que el stock quede al día después de marcar una pieza como vendida en
  // Historial, sin parpadeo en la lista.
  const hasLoadedOnce = useRef(false);

  const loadMaterials = useCallback(async () => {
    if (!hasLoadedOnce.current) setLoading(true);
    try {
      setMaterials(await fetchMaterials());
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      hasLoadedOnce.current = true;
      setLoading(false);
    }
  }, []);

  // useFocusEffect (no useEffect) porque las 7 pestañas quedan montadas en
  // memoria (Tabs de Expo Router): un useEffect normal solo se dispara la
  // primera vez que abres esta pestaña.
  useFocusEffect(
    useCallback(() => {
      loadMaterials();
    }, [loadMaterials]),
  );

  const openCreate = () => {
    setEditingMaterial(null);
    setFormVisible(true);
  };

  const openEdit = (material: ApiMaterial) => {
    setEditingMaterial(material);
    setFormVisible(true);
  };

  const confirmDelete = async () => {
    if (deletingMaterial) {
      try {
        await deleteMaterialApi(deletingMaterial.id);
        await loadMaterials();
      } catch (err) {
        setError(getErrorMessage(err));
      }
    }
    setDeletingMaterial(null);
  };

  return (
    <TabScreen active="materiales">
      <View className="mb-6 flex-row items-center gap-2">
        <Ionicons name="cube-outline" size={26} color={AppColors.green} />
        <View className="flex-1">
          <Text className={`text-xl font-extrabold ${INK_TEXT}`}>
            Materiales
          </Text>
          <Text className="text-brand-green">
            Materiales y existencias disponibles para tus piezas
          </Text>
        </View>
      </View>

      <Button label="+ Nuevo material" onPress={openCreate} className="mb-4" />

      <FormError message={error} />

      {loading && (
        <Text className={`mb-3 text-center ${MUTED_TEXT}`}>Cargando materiales...</Text>
      )}

      {!loading && materials.length === 0 && !error && (
        <Card className="mb-3">
          <Text className={`text-center ${MUTED_TEXT}`}>
            Aún no has creado ningún material.
          </Text>
        </Card>
      )}

      {materials.map((material) => {
        const status = getMaterialStatus(material);
        const isAvailable = status === "Disponible";
        return (
          <Card key={material.id} className="mb-3">
            <View className="flex-row items-start justify-between gap-2">
              <View className="flex-1">
                <Text className={`text-[17px] font-extrabold ${INK_TEXT}`}>
                  {material.name}
                </Text>
                <Text className="text-sm text-brand-turquoise">
                  {material.categoryName}
                </Text>
              </View>
              <View
                className={`rounded-full px-2 py-1 ${
                  isAvailable ? "bg-brand-green" : "bg-brand-error"
                }`}
              >
                <Text className="text-[10px] font-extrabold text-white">
                  {status}
                </Text>
              </View>
              <Pressable
                onPress={() => openEdit(material)}
                hitSlop={8}
                className="ml-1"
              >
                <Ionicons
                  name="pencil"
                  size={16}
                  color={theme.mutedInk}
                />
              </Pressable>
              <Pressable
                onPress={() => setDeletingMaterial(material)}
                hitSlop={8}
                className="ml-2"
              >
                <Ionicons name="trash" size={16} color={theme.mutedInk} />
              </Pressable>
            </View>
            <Text className={`mt-1 ${MUTED_TEXT}`}>
              {formatMaterialDetail(material, currency)}
            </Text>
          </Card>
        );
      })}

      <MaterialFormModal
        visible={formVisible}
        material={editingMaterial}
        onClose={() => setFormVisible(false)}
        onSaved={loadMaterials}
      />

      <ConfirmDialog
        visible={Boolean(deletingMaterial)}
        title="Eliminar material"
        message={`¿Seguro que deseas eliminar "${deletingMaterial?.name}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        destructive
        onConfirm={confirmDelete}
        onCancel={() => setDeletingMaterial(null)}
      />
    </TabScreen>
  );
}
