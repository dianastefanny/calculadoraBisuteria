import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import { Button } from "@/components/button";
import { Card } from "@/components/card";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { DesignFormModal } from "@/components/design-form-modal";
import { TabScreen } from "@/components/tab-screen";
import { AppColors } from "@/constants/app-theme";
import { deleteDesign, useDesigns, type Design } from "@/constants/demo-designs";
import { useMaterials } from "@/constants/demo-materials";

/**
 * Pestaña Diseños: se crean diseños de piezas indicando qué materiales usan
 * y en qué cantidad, para que más adelante Cálculos les sume el tiempo de
 * mano de obra y otros costos.
 *
 * "+ Nuevo diseño" y el lápiz de cada tarjeta abren el mismo
 * DesignFormModal (sin diseño = crear, con diseño = editar); el bote de
 * basura pide confirmación (ConfirmDialog) antes de eliminar — mismo patrón
 * que Materiales y Empaques. Los datos viven en
 * src/constants/demo-designs.ts mientras no hay backend, ver el TODO ahí
 * para la conexión futura con Laravel.
 */
export default function Disenos() {
  const designs = useDesigns();
  const materials = useMaterials();
  const [formVisible, setFormVisible] = useState(false);
  const [editingDesign, setEditingDesign] = useState<Design | null>(null);
  const [deletingDesign, setDeletingDesign] = useState<Design | null>(null);

  const openCreate = () => {
    setEditingDesign(null);
    setFormVisible(true);
  };

  const openEdit = (design: Design) => {
    setEditingDesign(design);
    setFormVisible(true);
  };

  const confirmDelete = () => {
    if (deletingDesign) deleteDesign(deletingDesign.id);
    setDeletingDesign(null);
  };

  return (
    <TabScreen active="disenos">
      <View className="mb-6 flex-row items-center gap-2">
        <Ionicons name="sparkles-outline" size={26} color={AppColors.green} />
        <View className="flex-1">
          <Text className="text-xl font-extrabold text-white">Diseños</Text>
          <Text className="text-brand-green">
            Guarda y consulta los diseños de tus piezas
          </Text>
        </View>
      </View>

      <Button label="+ Nuevo diseño" onPress={openCreate} className="mb-4" />

      {designs.length === 0 && (
        <Card className="mb-3">
          <Text className="text-center text-brand-soft-text">
            Aún no has creado ningún diseño.
          </Text>
        </Card>
      )}

      {designs.map((design) => (
        <Card key={design.id} className="mb-3">
          <View className="flex-row items-start justify-between gap-2">
            <Text className="flex-1 text-[17px] font-extrabold text-white">
              {design.name}
            </Text>
            <Pressable
              onPress={() => openEdit(design)}
              hitSlop={8}
              className="ml-1"
            >
              <Ionicons name="pencil" size={16} color={AppColors.softText} />
            </Pressable>
            <Pressable
              onPress={() => setDeletingDesign(design)}
              hitSlop={8}
              className="ml-2"
            >
              <Ionicons name="trash" size={16} color={AppColors.softText} />
            </Pressable>
          </View>

          {!!design.description && (
            <Text className="mt-1 text-brand-soft-text">
              {design.description}
            </Text>
          )}

          {design.materials.length > 0 && (
            <View className="mt-3 gap-1">
              {design.materials.map((item) => {
                const material = materials.find(
                  (m) => m.id === item.materialId,
                );
                return (
                  <Text
                    key={item.materialId}
                    className="text-xs text-brand-soft-text"
                  >
                    • {material?.name ?? "Material eliminado"} — {item.quantity}{" "}
                    {material?.unit ?? ""}
                  </Text>
                );
              })}
            </View>
          )}
        </Card>
      ))}

      <DesignFormModal
        visible={formVisible}
        design={editingDesign}
        onClose={() => setFormVisible(false)}
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
