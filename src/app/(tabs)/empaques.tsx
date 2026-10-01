import Ionicons from "@expo/vector-icons/Ionicons";
import { useFocusEffect } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { Pressable, Text, View } from "react-native";

import {
  deletePackaging as deletePackagingApi,
  fetchPackagings,
  getErrorMessage,
} from "@/api/client";
import { Button } from "@/components/button";
import { Card } from "@/components/card";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { EmptyState } from "@/components/empty-state";
import { FormError } from "@/components/form-error";
import {
  PackagingFormModal,
  type ApiPackaging,
} from "@/components/packaging-form-modal";
import { SearchField, matchesSearch } from "@/components/search-field";
import { TabScreen } from "@/components/tab-screen";
import { AppColors, INK_TEXT, MUTED_TEXT, useThemeColors } from "@/constants/app-theme";
import { formatAmount, useCurrency, type CurrencyOption } from "@/constants/currency-store";

function getPackagingStatus(packaging: ApiPackaging): "Disponible" | "Agotado" {
  const stockNumber = Number(packaging.stock);
  return Number.isFinite(stockNumber) && stockNumber > 0
    ? "Disponible"
    : "Agotado";
}

function formatPackagingDetail(packaging: ApiPackaging, currency: CurrencyOption) {
  return `${packaging.stock} disponibles · ${currency.symbol}${formatAmount(packaging.unitCost, currency.code)} c/u`;
}

/**
 * Pestaña Empaques: clases de empaque guardadas por el usuario, usadas al
 * cotizar una pieza (Cálculos, sección "Empaques y Presentación").
 * Conectada al backend real (GET/DELETE /packagings).
 *
 * "+ Nuevo empaque" y el lápiz de cada tarjeta abren el mismo
 * PackagingFormModal (sin empaque = crear, con empaque = editar); el bote de
 * basura pide confirmación (ConfirmDialog) antes de eliminar — mismo patrón
 * que Materiales.
 */
export default function Empaques() {
  const currency = useCurrency();
  const theme = useThemeColors();
  const [packagingOptions, setPackagingOptions] = useState<ApiPackaging[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formVisible, setFormVisible] = useState(false);
  const [editingPackaging, setEditingPackaging] = useState<ApiPackaging | null>(
    null,
  );
  const [deletingPackaging, setDeletingPackaging] =
    useState<ApiPackaging | null>(null);
  const [search, setSearch] = useState("");

  // Solo la primera carga muestra "Cargando empaques...". Las siguientes
  // (cada vez que se vuelve a esta pestaña) se actualizan en silencio, para
  // que el stock quede al día después de marcar una pieza como vendida en
  // Historial, sin parpadeo en la lista.
  const hasLoadedOnce = useRef(false);

  const loadPackagings = useCallback(async () => {
    if (!hasLoadedOnce.current) setLoading(true);
    try {
      setPackagingOptions(await fetchPackagings());
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
      loadPackagings();
    }, [loadPackagings]),
  );

  const filteredPackagingOptions = packagingOptions.filter((packaging) =>
    matchesSearch(packaging.name, search),
  );

  const openCreate = () => {
    setEditingPackaging(null);
    setFormVisible(true);
  };

  const openEdit = (packaging: ApiPackaging) => {
    setEditingPackaging(packaging);
    setFormVisible(true);
  };

  const confirmDelete = async () => {
    if (deletingPackaging) {
      try {
        await deletePackagingApi(deletingPackaging.id);
        await loadPackagings();
      } catch (err) {
        setError(getErrorMessage(err));
      }
    }
    setDeletingPackaging(null);
  };

  return (
    <TabScreen active="empaques">
      <View className="mb-6 flex-row items-center gap-2">
        <Ionicons name="gift-outline" size={26} color={AppColors.green} />
        <View className="flex-1">
          <Text className={`text-xl font-extrabold ${INK_TEXT}`}>Empaques</Text>
          <Text className="text-brand-green">
            Tus clases de empaque y presentación guardadas
          </Text>
        </View>
      </View>

      <Button label="+ Nuevo empaque" onPress={openCreate} className="mb-4" />

      <SearchField
        value={search}
        onChangeText={setSearch}
        placeholder="Buscar empaque..."
        className="mb-3"
      />

      <FormError message={error} />

      {loading && (
        <Text className={`mb-3 text-center ${MUTED_TEXT}`}>Cargando empaques...</Text>
      )}

      {!loading && packagingOptions.length === 0 && !error && (
        <EmptyState message="Aún no has creado ningún empaque." />
      )}

      {!loading &&
        packagingOptions.length > 0 &&
        filteredPackagingOptions.length === 0 && (
          <EmptyState message="No se encontró ningún empaque con ese nombre." />
        )}

      {filteredPackagingOptions.map((packaging) => {
        const status = getPackagingStatus(packaging);
        const isAvailable = status === "Disponible";
        return (
          <Card key={packaging.id} className="mb-3">
            <View className="flex-row items-start justify-between gap-2">
              <Text className={`flex-1 text-[17px] font-extrabold ${INK_TEXT}`}>
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
                  color={theme.mutedInk}
                />
              </Pressable>
              <Pressable
                onPress={() => setDeletingPackaging(packaging)}
                hitSlop={8}
                className="ml-2"
              >
                <Ionicons name="trash" size={16} color={theme.mutedInk} />
              </Pressable>
            </View>
            <Text className={`mt-1 ${MUTED_TEXT}`}>
              {formatPackagingDetail(packaging, currency)}
            </Text>
          </Card>
        );
      })}

      <PackagingFormModal
        visible={formVisible}
        packaging={editingPackaging}
        onClose={() => setFormVisible(false)}
        onSaved={loadPackagings}
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
