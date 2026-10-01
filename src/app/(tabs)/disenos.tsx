import Ionicons from "@expo/vector-icons/Ionicons";
import { useCallback, useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";

import {
  deleteDesign as deleteDesignApi,
  fetchDesigns,
  getErrorMessage,
  getUnitLabel,
} from "@/api/client";
import { Button } from "@/components/button";
import { Card } from "@/components/card";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { DesignFormModal, type ApiDesign } from "@/components/design-form-modal";
import { EmptyState } from "@/components/empty-state";
import { FormError } from "@/components/form-error";
import { SearchField, matchesSearch } from "@/components/search-field";
import { TabScreen } from "@/components/tab-screen";
import { AppColors, INK_TEXT, MUTED_TEXT, useThemeColors } from "@/constants/app-theme";

/**
 * Pestaña Diseños: se crean diseños de piezas indicando qué materiales usan
 * y en qué cantidad, para que más adelante Cálculos les sume el tiempo de
 * mano de obra y otros costos. Conectada al backend real
 * (GET/DELETE /designs).
 *
 * "+ Nuevo diseño" y el lápiz de cada tarjeta abren el mismo
 * DesignFormModal (sin diseño = crear, con diseño = editar); el bote de
 * basura pide confirmación (ConfirmDialog) antes de eliminar — mismo patrón
 * que Materiales y Empaques.
 */
export default function Disenos() {
  const theme = useThemeColors();
  const [designs, setDesigns] = useState<ApiDesign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formVisible, setFormVisible] = useState(false);
  const [editingDesign, setEditingDesign] = useState<ApiDesign | null>(null);
  const [deletingDesign, setDeletingDesign] = useState<ApiDesign | null>(null);
  const [search, setSearch] = useState("");

  const loadDesigns = useCallback(async () => {
    setLoading(true);
    try {
      setDesigns(await fetchDesigns());
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDesigns();
  }, [loadDesigns]);

  const filteredDesigns = designs.filter(
    (design) =>
      matchesSearch(design.name, search) ||
      matchesSearch(design.reference, search),
  );

  const openCreate = () => {
    setEditingDesign(null);
    setFormVisible(true);
  };

  const openEdit = (design: ApiDesign) => {
    setEditingDesign(design);
    setFormVisible(true);
  };

  const confirmDelete = async () => {
    if (deletingDesign) {
      try {
        await deleteDesignApi(deletingDesign.id);
        await loadDesigns();
      } catch (err) {
        setError(getErrorMessage(err));
      }
    }
    setDeletingDesign(null);
  };

  return (
    <TabScreen active="disenos">
      <View className="mb-6 flex-row items-center gap-2">
        <Ionicons name="sparkles-outline" size={26} color={AppColors.green} />
        <View className="flex-1">
          <Text className={`text-xl font-extrabold ${INK_TEXT}`}>Diseños</Text>
          <Text className="text-brand-green">
            Guarda y consulta los diseños de tus piezas
          </Text>
        </View>
      </View>

      <Button label="+ Nuevo diseño" onPress={openCreate} className="mb-4" />

      <SearchField
        value={search}
        onChangeText={setSearch}
        placeholder="Buscar por nombre o referencia..."
        className="mb-3"
      />

      <FormError message={error} />

      {loading && (
        <Text className={`mb-3 text-center ${MUTED_TEXT}`}>Cargando diseños...</Text>
      )}

      {!loading && designs.length === 0 && !error && (
        <EmptyState message="Aún no has creado ningún diseño." />
      )}

      {!loading && designs.length > 0 && filteredDesigns.length === 0 && (
        <EmptyState message="No se encontró ningún diseño con ese nombre o referencia." />
      )}

      {filteredDesigns.map((design) => (
        <Card key={design.id} className="mb-3">
          <View className="flex-row items-start justify-between gap-2">
            <View className="flex-1">
              <Text className={`text-[17px] font-extrabold ${INK_TEXT}`}>
                {design.name}
              </Text>
              {!!design.reference && (
                <Text className="text-sm text-brand-turquoise">
                  Ref: {design.reference}
                </Text>
              )}
            </View>
            <Pressable
              onPress={() => openEdit(design)}
              hitSlop={8}
              className="ml-1"
            >
              <Ionicons name="pencil" size={16} color={theme.mutedInk} />
            </Pressable>
            <Pressable
              onPress={() => setDeletingDesign(design)}
              hitSlop={8}
              className="ml-2"
            >
              <Ionicons name="trash" size={16} color={theme.mutedInk} />
            </Pressable>
          </View>

          {!!design.description && (
            <Text className={`mt-1 ${MUTED_TEXT}`}>
              {design.description}
            </Text>
          )}

          {design.materials.length > 0 && (
            <View className="mt-3 gap-1">
              {design.materials.map((item) => (
                <Text key={item.materialId} className={`text-sm ${MUTED_TEXT}`}>
                  • {item.materialName || "Material eliminado"} — {item.quantity}{" "}
                  {getUnitLabel(item.materialUnit)}
                </Text>
              ))}
            </View>
          )}
        </Card>
      ))}

      <DesignFormModal
        visible={formVisible}
        design={editingDesign}
        onClose={() => setFormVisible(false)}
        onSaved={loadDesigns}
      />

      <ConfirmDialog
        visible={Boolean(deletingDesign)}
        title="Eliminar diseño"
        message={`¿Seguro que deseas eliminar "${deletingDesign?.name}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        destructive
        onConfirm={confirmDelete}
        onCancel={() => setDeletingDesign(null)}
      />
    </TabScreen>
  );
}
