import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import { Button } from "@/components/button";
import { Card } from "@/components/card";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { MaterialFormModal } from "@/components/material-form-modal";
import { TabScreen } from "@/components/tab-screen";
import { AppColors } from "@/constants/app-theme";
import { getCategoryName } from "@/constants/demo-categories";
import {
  deleteMaterial,
  formatMaterialDetail,
  getMaterialStatus,
  useMaterials,
  type Material,
} from "@/constants/demo-materials";
import { useCurrency } from "@/constants/currency-store";

/**
 * Pestaña Materiales: primera pantalla que se muestra después de iniciar
 * sesión. Aquí se crean, editan y listan los materiales en existencia (antes
 * vivía en inventory.tsx, y luego en insumos.tsx).
 *
 * "+ Nuevo material" y el lápiz de cada tarjeta abren el mismo
 * MaterialFormModal (sin material = crear, con material = editar); no hay
 * un formulario aparte para cada caso. El bote de basura pide confirmación
 * (ConfirmDialog) antes de eliminar. Los datos viven en
 * src/constants/demo-materials.ts mientras no hay backend, ver el TODO ahí
 * para la conexión futura con Laravel.
 */
export default function Materiales() {
  const materials = useMaterials();
  const currency = useCurrency();
  const [formVisible, setFormVisible] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(
    null,
  );
  const [deletingMaterial, setDeletingMaterial] = useState<Material | null>(
    null,
  );

  const openCreate = () => {
    setEditingMaterial(null);
    setFormVisible(true);
  };

  const openEdit = (material: Material) => {
    setEditingMaterial(material);
    setFormVisible(true);
  };

  const confirmDelete = () => {
    if (deletingMaterial) deleteMaterial(deletingMaterial.id);
    setDeletingMaterial(null);
  };

  return (
    <TabScreen active="materiales">
      <View className="mb-6 flex-row items-center gap-2">
        <Ionicons name="cube-outline" size={26} color={AppColors.green} />
        <View className="flex-1">
          <Text className="text-xl font-extrabold text-white">
            Materiales
          </Text>
          <Text className="text-brand-green">
            Materiales y existencias disponibles para tus piezas
          </Text>
        </View>
      </View>

      {materials.map((material) => {
        const status = getMaterialStatus(material);
        const isAvailable = status === "Disponible";
        return (
          <Card key={material.id} className="mb-3">
            <View className="flex-row items-start justify-between gap-2">
              <View className="flex-1">
                <Text className="text-[17px] font-extrabold text-white">
                  {material.name}
                </Text>
                <Text className="text-xs text-brand-turquoise">
                  {getCategoryName(material.category)}
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
                  color={AppColors.softText}
                />
              </Pressable>
              <Pressable
                onPress={() => setDeletingMaterial(material)}
                hitSlop={8}
                className="ml-2"
              >
                <Ionicons name="trash" size={16} color={AppColors.softText} />
              </Pressable>
            </View>
            <Text className="mt-1 text-brand-soft-text">
              {formatMaterialDetail(material, currency.symbol)}
            </Text>
          </Card>
        );
      })}

      <Button label="+ Nuevo material" onPress={openCreate} />

      <MaterialFormModal
        visible={formVisible}
        material={editingMaterial}
        onClose={() => setFormVisible(false)}
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
