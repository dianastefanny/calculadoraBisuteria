import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import { Button } from "@/components/button";
import { Card } from "@/components/card";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { PackagingFormModal } from "@/components/packaging-form-modal";
import { TabScreen } from "@/components/tab-screen";
import { AppColors } from "@/constants/app-theme";
import { useCurrency } from "@/constants/currency-store";
import {
  deletePackaging,
  formatPackagingDetail,
  getPackagingStatus,
  usePackagingOptions,
  type Packaging,
} from "@/constants/demo-packaging";

/**
 * Pestaña Empaques: clases de empaque guardadas por el usuario, usadas al
 * cotizar una pieza (Cálculos, sección "Empaques y Presentación").
 *
 * "+ Nuevo empaque" y el lápiz de cada tarjeta abren el mismo
 * PackagingFormModal (sin empaque = crear, con empaque = editar); el bote de
 * basura pide confirmación (ConfirmDialog) antes de eliminar — mismo patrón
 * que Materiales. Los datos viven en src/constants/demo-packaging.ts
 * mientras no hay backend, ver el TODO ahí para la conexión futura con
 * Laravel.
 */
export default function Empaques() {
  const packagingOptions = usePackagingOptions();
  const currency = useCurrency();
  const [formVisible, setFormVisible] = useState(false);
  const [editingPackaging, setEditingPackaging] = useState<Packaging | null>(
    null,
  );
  const [deletingPackaging, setDeletingPackaging] =
    useState<Packaging | null>(null);

  const openCreate = () => {
    setEditingPackaging(null);
    setFormVisible(true);
  };

  const openEdit = (packaging: Packaging) => {
    setEditingPackaging(packaging);
    setFormVisible(true);
  };

  const confirmDelete = () => {
    if (deletingPackaging) deletePackaging(deletingPackaging.id);
    setDeletingPackaging(null);
  };

  return (
    <TabScreen active="empaques">
      <View className="mb-6 flex-row items-center gap-2">
        <Ionicons name="gift-outline" size={26} color={AppColors.green} />
        <View className="flex-1">
          <Text className="text-xl font-extrabold text-white">Empaques</Text>
          <Text className="text-brand-green">
            Tus clases de empaque y presentación guardadas
          </Text>
        </View>
      </View>

      {packagingOptions.map((packaging) => {
        const status = getPackagingStatus(packaging);
        const isAvailable = status === "Disponible";
        return (
          <Card key={packaging.id} className="mb-3">
            <View className="flex-row items-start justify-between gap-2">
              <Text className="flex-1 text-[17px] font-extrabold text-white">
                {packaging.name}
              </Text>
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
                onPress={() => openEdit(packaging)}
                hitSlop={8}
                className="ml-1"
              >
                <Ionicons
                  name="pencil"
                  size={16}
                  color={AppColors.softText}
                />
              </Pressable>
              <Pressable
                onPress={() => setDeletingPackaging(packaging)}
                hitSlop={8}
                className="ml-2"
              >
                <Ionicons name="trash" size={16} color={AppColors.softText} />
              </Pressable>
            </View>
            <Text className="mt-1 text-brand-soft-text">
              {formatPackagingDetail(packaging, currency.symbol)}
            </Text>
          </Card>
        );
      })}

      <Button label="+ Nuevo empaque" onPress={openCreate} />

      <PackagingFormModal
        visible={formVisible}
        packaging={editingPackaging}
        onClose={() => setFormVisible(false)}
      />

      <ConfirmDialog
        visible={Boolean(deletingPackaging)}
        title="Eliminar empaque"
        message={`¿Seguro que deseas eliminar "${deletingPackaging?.name}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        destructive
        onConfirm={confirmDelete}
        onCancel={() => setDeletingPackaging(null)}
      />
    </TabScreen>
  );
}
