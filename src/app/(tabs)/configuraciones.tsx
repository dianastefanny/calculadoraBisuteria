import Ionicons from "@expo/vector-icons/Ionicons";
import { useColorScheme } from "nativewind";
import { useCallback, useEffect, useState } from "react";
import { Pressable, Switch, Text, View } from "react-native";

import {
  deleteIndirectCost as deleteIndirectCostApi,
  fetchBenefits,
  fetchConfiguration,
  fetchIndirectCosts,
  fetchMe,
  getErrorMessage,
  updateConfiguration,
  updatePassword,
  updateProfile,
} from "@/api/client";
import { Button } from "@/components/button";
import { Card } from "@/components/card";
import { ConfirmDialog } from "@/components/confirm-dialog";
import {
  EditFieldModal,
  type EditFieldModalField,
} from "@/components/edit-field-modal";
import { FormError } from "@/components/form-error";
import {
  IndirectCostFormModal,
  type ApiIndirectCost,
} from "@/components/indirect-cost-form-modal";
import { TabScreen } from "@/components/tab-screen";
import {
  AppColors,
  INK_TEXT,
  MUTED_TEXT,
  useThemeColors,
} from "@/constants/app-theme";
import { formatAmount, useCurrency } from "@/constants/currency-store";
import {
  EMAIL_REGEX,
  NAME_REGEX,
  PASSWORD_REGEX,
  PHONE_REGEX,
} from "@/constants/validation";

type EditableRowKey =
  | "nameLastName"
  | "phone"
  | "email"
  | "monthlySalary"
  | "monthlyProductiveHours"
  | "monthlyProduction"
  | "defaultMargin";

const PROFILE_ROW_KEYS: EditableRowKey[] = ["nameLastName", "phone", "email"];
const SETTINGS_ROW_KEYS: EditableRowKey[] = [
  "monthlySalary",
  "monthlyProductiveHours",
  "monthlyProduction",
  "defaultMargin",
];

/**
 * Pestaña Configuraciones: datos de la cuenta del usuario,
 * cambio de contraseña, apariencia (modo oscuro/claro) y preferencias de
 * cálculo. Todo conectado al backend real: perfil y contraseña vía
 * GET/PUT /me y PUT /password; preferencias de cálculo vía
 * GET/PUT /configuration.
 */
export default function Configuraciones() {
  const theme = useThemeColors();
  const currency = useCurrency();
  // Modo oscuro/claro: usa el controlador de NativeWind (mismo mecanismo
  // que activa las clases "dark:" en toda la app). El valor elegido también
  // se guarda en el backend (campo "theme" de /configuration) para que la
  // próxima vez que el usuario inicie sesión se le aplique automáticamente.
  const { colorScheme, setColorScheme } = useColorScheme();
  const isDarkMode = colorScheme === "dark";

  // Datos de la cuenta. Cada fila se edita aparte: tocarla abre
  // EditFieldModal solo con lo suyo.
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  useEffect(() => {
    fetchMe()
      .then((profile) => {
        setName(profile.name);
        setLastName(profile.lastName);
        setPhone(profile.phone);
        setEmail(profile.email);
        setProfileError(null);
      })
      .catch((err) => setProfileError(getErrorMessage(err)))
      .finally(() => setProfileLoading(false));
  }, []);

  // Guarda un cambio de perfil en el backend y actualiza los 4 campos con
  // la respuesta real, sin importar cuál fila se haya editado.
  const saveProfile = async (
    overrides: Partial<{
      name: string;
      lastName: string;
      phone: string;
      email: string;
    }>,
  ) => {
    try {
      const updated = await updateProfile({
        name: overrides.name ?? name,
        lastName: overrides.lastName ?? lastName,
        phone: overrides.phone ?? phone,
        email: overrides.email ?? email,
      });
      setName(updated.name);
      setLastName(updated.lastName);
      setPhone(updated.phone);
      setEmail(updated.email);
      setProfileError(null);
    } catch (err) {
      setProfileError(getErrorMessage(err));
    }
  };

  // Preferencias de cálculo: estos campos son justo los que usa el
  // backend para calcular labor_cost e indirect_cost en Cálculos.
  const [monthlySalary, setMonthlySalary] = useState("0");
  const [monthlyProductiveHours, setMonthlyProductiveHours] = useState("0");
  // Opcional ("" = no configurado): si se llena, los costos indirectos se
  // reparten por pieza en vez de por minuto de mano de obra.
  const [monthlyProduction, setMonthlyProduction] = useState("");
  const [defaultMargin, setDefaultMargin] = useState("0");
  const [configLoading, setConfigLoading] = useState(true);
  const [configError, setConfigError] = useState<string | null>(null);

  useEffect(() => {
    fetchConfiguration()
      .then((configuration) => {
        setMonthlySalary(configuration.monthlySalary);
        setMonthlyProductiveHours(configuration.monthlyWorkingHours);
        setMonthlyProduction(configuration.monthlyProduction);
        setDefaultMargin(configuration.defaultMargin);
        setConfigError(null);
      })
      .catch((err) => setConfigError(getErrorMessage(err)))
      .finally(() => setConfigLoading(false));
  }, []);

  // Guarda un cambio de configuración en el backend y actualiza los campos
  // con la respuesta real (fuente de verdad), sin importar cuál fila se
  // haya editado.
  const saveConfig = async (
    overrides: Partial<{
      monthlySalary: string;
      monthlyProductiveHours: string;
      monthlyProduction: string;
      defaultMargin: string;
      theme: string;
    }>,
  ) => {
    try {
      const updated = await updateConfiguration({
        monthlySalary: overrides.monthlySalary ?? monthlySalary,
        monthlyWorkingHours:
          overrides.monthlyProductiveHours ?? monthlyProductiveHours,
        monthlyProduction: overrides.monthlyProduction ?? monthlyProduction,
        defaultMargin: overrides.defaultMargin ?? defaultMargin,
        theme: overrides.theme ?? colorScheme,
      });
      setMonthlySalary(updated.monthlySalary);
      setMonthlyProductiveHours(updated.monthlyWorkingHours);
      setMonthlyProduction(updated.monthlyProduction);
      setDefaultMargin(updated.defaultMargin);
      setConfigError(null);
    } catch (err) {
      setConfigError(getErrorMessage(err));
    }
  };

  // Costos indirectos: lista directamente aquí (no en pantalla aparte) para
  // que agregar uno solo tome un paso, igual que las demás preferencias.
  const [indirectCosts, setIndirectCosts] = useState<ApiIndirectCost[]>([]);
  const [indirectCostsLoading, setIndirectCostsLoading] = useState(true);
  const [indirectCostsError, setIndirectCostsError] = useState<string | null>(
    null,
  );
  const [indirectCostFormVisible, setIndirectCostFormVisible] =
    useState(false);
  const [editingIndirectCost, setEditingIndirectCost] =
    useState<ApiIndirectCost | null>(null);
  const [deletingIndirectCost, setDeletingIndirectCost] =
    useState<ApiIndirectCost | null>(null);

  const loadIndirectCosts = useCallback(async () => {
    setIndirectCostsLoading(true);
    try {
      setIndirectCosts(await fetchIndirectCosts());
      setIndirectCostsError(null);
    } catch (err) {
      setIndirectCostsError(getErrorMessage(err));
    } finally {
      setIndirectCostsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadIndirectCosts();
  }, [loadIndirectCosts]);

  const openCreateIndirectCost = () => {
    setEditingIndirectCost(null);
    setIndirectCostFormVisible(true);
  };

  const openEditIndirectCost = (item: ApiIndirectCost) => {
    setEditingIndirectCost(item);
    setIndirectCostFormVisible(true);
  };

  const confirmDeleteIndirectCost = async () => {
    if (deletingIndirectCost) {
      try {
        await deleteIndirectCostApi(deletingIndirectCost.id);
        await loadIndirectCosts();
      } catch (err) {
        setIndirectCostsError(getErrorMessage(err));
      }
    }
    setDeletingIndirectCost(null);
  };

  // Prestaciones legales: solo lectura por ahora (no hay pantalla para
  // crearlas/editarlas todavía). Se activan o no como grupo desde el
  // interruptor "Incluir prestaciones legales" que ya existe en Cálculos.
  const [benefits, setBenefits] = useState<
    { id: string; name: string; percentage: string }[]
  >([]);
  const [benefitsLoading, setBenefitsLoading] = useState(true);
  const [benefitsError, setBenefitsError] = useState<string | null>(null);

  useEffect(() => {
    fetchBenefits()
      .then((data) => {
        setBenefits(data);
        setBenefitsError(null);
      })
      .catch((err) => setBenefitsError(getErrorMessage(err)))
      .finally(() => setBenefitsLoading(false));
  }, []);

  const [editingRow, setEditingRow] = useState<EditableRowKey | null>(null);

  const editableRows: Record<
    EditableRowKey,
    {
      rowLabel: string;
      displayValue: string;
      fields: EditFieldModalField[];
      validate: (values: Record<string, string>) => string | null;
      onSave: (values: Record<string, string>) => void;
    }
  > = {
    nameLastName: {
      rowLabel: "Nombre y apellido",
      displayValue: `${name} ${lastName}`.trim(),
      fields: [
        {
          key: "name",
          label: "Nombre",
          value: name,
          placeholder: "Tu nombre",
          icon: "person-outline",
        },
        {
          key: "lastName",
          label: "Apellido",
          value: lastName,
          placeholder: "Tu apellido",
          icon: "person-outline",
        },
      ],
      validate: (v) =>
        !v.name.trim() || !v.lastName.trim()
          ? "El nombre y el apellido son obligatorios."
          : !NAME_REGEX.test(v.name.trim()) ||
              !NAME_REGEX.test(v.lastName.trim())
            ? "El nombre y el apellido solo pueden contener letras y espacios."
            : null,
      onSave: (v) => saveProfile({ name: v.name.trim(), lastName: v.lastName.trim() }),
    },
    phone: {
      rowLabel: "Teléfono",
      displayValue: phone,
      fields: [
        {
          key: "phone",
          label: "Teléfono",
          value: phone,
          placeholder: "Ej. 3001234567",
          icon: "call-outline",
          keyboardType: "phone-pad",
        },
      ],
      // El teléfono es opcional, por eso solo se valida si se escribió algo.
      validate: (v) =>
        v.phone.trim() && !PHONE_REGEX.test(v.phone.trim())
          ? "Ingresa un número de teléfono válido."
          : null,
      onSave: (v) => saveProfile({ phone: v.phone.trim() }),
    },
    email: {
      rowLabel: "Correo electrónico",
      displayValue: email,
      fields: [
        {
          key: "email",
          label: "Correo electrónico",
          value: email,
          placeholder: "ejemplo@correo.com",
          icon: "mail-outline",
          keyboardType: "email-address",
          autoCapitalize: "none",
        },
      ],
      validate: (v) =>
        !v.email.trim()
          ? "El correo es obligatorio."
          : !EMAIL_REGEX.test(v.email.trim())
            ? "Ingresa un correo electrónico válido."
            : null,
      onSave: (v) => saveProfile({ email: v.email.trim() }),
    },
    monthlySalary: {
      rowLabel: "Salario mensual",
      displayValue: monthlySalary,
      fields: [
        {
          key: "monthlySalary",
          label: "Salario mensual",
          value: monthlySalary,
          placeholder: "0",
          keyboardType: "numeric",
        },
      ],
      validate: (v) =>
        !v.monthlySalary.trim() || Number.isNaN(Number(v.monthlySalary))
          ? "Ingresa un valor numérico válido."
          : null,
      onSave: (v) => saveConfig({ monthlySalary: v.monthlySalary }),
    },
    monthlyProductiveHours: {
      rowLabel: "Horas productivas de trabajo mensual",
      displayValue: monthlyProductiveHours,
      fields: [
        {
          key: "monthlyProductiveHours",
          label: "Horas productivas de trabajo mensual",
          value: monthlyProductiveHours,
          placeholder: "0",
          keyboardType: "numeric",
        },
      ],
      validate: (v) =>
        !v.monthlyProductiveHours.trim() ||
        Number.isNaN(Number(v.monthlyProductiveHours))
          ? "Ingresa un valor numérico válido."
          : null,
      onSave: (v) =>
        saveConfig({ monthlyProductiveHours: v.monthlyProductiveHours }),
    },
    monthlyProduction: {
      rowLabel: "Piezas productivas mensuales (opcional)",
      displayValue: monthlyProduction,
      fields: [
        {
          key: "monthlyProduction",
          value: monthlyProduction,
          keyboardType: "numeric",
          helperText:
            "Si lo llenas, los costos indirectos se reparten por pieza en vez de por minuto de mano de obra. Déjalo vacío para seguir calculando por minutos.",
        },
      ],
      validate: (v) => {
        const trimmed = v.monthlyProduction.trim();
        if (!trimmed) return null;
        const value = Number(trimmed);
        return Number.isNaN(value) || value < 0
          ? "Ingresa un número válido, o déjalo vacío."
          : null;
      },
      onSave: (v) =>
        saveConfig({ monthlyProduction: v.monthlyProduction.trim() }),
    },
    defaultMargin: {
      rowLabel: "Margen de ganancia por defecto (%)",
      displayValue: defaultMargin,
      fields: [
        {
          key: "defaultMargin",
          label: "Margen de ganancia por defecto (%)",
          value: defaultMargin,
          placeholder: "0",
          keyboardType: "numeric",
        },
      ],
      validate: (v) => {
        const value = Number(v.defaultMargin);
        return !v.defaultMargin.trim() || Number.isNaN(value) || value < 0 || value > 99.99
          ? "Ingresa un porcentaje válido entre 0 y 99.99."
          : null;
      },
      onSave: (v) => saveConfig({ defaultMargin: v.defaultMargin }),
    },
  };
  const activeRow = editingRow ? editableRows[editingRow] : null;

  // Cambio de contraseña: también se edita en un modal aparte, sin mostrar
  // los campos siempre abiertos en la pantalla.
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const passwordFields: EditFieldModalField[] = [
    {
      key: "currentPassword",
      label: "Contraseña actual",
      value: "",
      placeholder: "Introduce tu contraseña actual",
      secureTextEntry: true,
      icon: "lock-closed-outline",
    },
    {
      key: "newPassword",
      label: "Nueva contraseña",
      value: "",
      placeholder: "Introduce la contraseña aquí",
      secureTextEntry: true,
      icon: "lock-closed-outline",
      helperText:
        "La contraseña debe tener mínimo 8 caracteres, con al menos una mayúscula, una minúscula, un número y un carácter especial.",
    },
    {
      key: "confirmNewPassword",
      label: "Confirmar nueva contraseña",
      value: "",
      placeholder: "Introduce la contraseña aquí",
      secureTextEntry: true,
      icon: "lock-closed-outline",
    },
  ];

  const validatePassword = (v: Record<string, string>) => {
    if (!v.currentPassword || !v.newPassword || !v.confirmNewPassword) {
      return "Completa los tres campos de contraseña.";
    }
    if (!PASSWORD_REGEX.test(v.newPassword)) {
      return "La nueva contraseña no cumple los requisitos indicados arriba.";
    }
    if (v.newPassword !== v.confirmNewPassword) {
      return "Las contraseñas ingresadas no coinciden.";
    }
    // La contraseña actual la valida el backend (Hash::check contra la real).
    return null;
  };

  const savePassword = async (v: Record<string, string>) => {
    try {
      await updatePassword({
        currentPassword: v.currentPassword,
        newPassword: v.newPassword,
        confirmNewPassword: v.confirmNewPassword,
      });
      setPasswordError(null);
      setPasswordSuccess("Contraseña actualizada correctamente.");
    } catch (err) {
      setPasswordSuccess(null);
      setPasswordError(getErrorMessage(err));
    }
  };

  // Iniciales para el círculo de "Datos de la cuenta" (ej. "Ana" + "Pérez" → "AP").
  const initials =
    `${name.trim().charAt(0)}${lastName.trim().charAt(0)}`.toUpperCase();

  const renderEditableRow = (key: EditableRowKey, isFirst: boolean) => {
    const row = editableRows[key];
    return (
      <Pressable
        key={key}
        onPress={() => setEditingRow(key)}
        className={`flex-row items-center justify-between py-3 ${
          isFirst ? "" : "border-t border-brand-input-border"
        }`}
      >
        <View className="flex-1">
          <Text className={`text-sm ${MUTED_TEXT}`}>{row.rowLabel}</Text>
          <Text className={`mt-0.5 font-bold ${INK_TEXT}`}>
            {row.displayValue || "—"}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={theme.mutedInk} />
      </Pressable>
    );
  };

  return (
    <TabScreen active="configuraciones">
      <Text className={`mb-6 text-xl font-extrabold ${INK_TEXT}`}>
        Configuraciones
      </Text>

      <Card className="mb-6">
        <View className="mb-2 flex-row items-center gap-4">
          <View className="h-14 w-14 items-center justify-center rounded-full bg-brand-green">
            <Text
              className="text-lg font-extrabold"
              style={{ color: AppColors.white }}
            >
              {initials}
            </Text>
          </View>
          <Text className={`flex-1 text-[17px] font-extrabold ${INK_TEXT}`}>
            Datos de la cuenta
          </Text>
        </View>

        <FormError message={profileError} />

        {profileLoading ? (
          <Text className={`py-3 text-center ${MUTED_TEXT}`}>
            Cargando datos de la cuenta...
          </Text>
        ) : (
          PROFILE_ROW_KEYS.map((key, index) =>
            renderEditableRow(key, index === 0),
          )
        )}
      </Card>

      <Card className="mb-6">
        <Text className={`mb-2 text-[17px] font-extrabold ${INK_TEXT}`}>
          Seguridad
        </Text>

        <FormError variant="success" message={passwordSuccess} />
        <FormError message={passwordError} />

        <Pressable
          onPress={() => {
            setPasswordSuccess(null);
            setPasswordError(null);
            setChangingPassword(true);
          }}
          className="flex-row items-center justify-between py-3"
        >
          <View className="flex-1">
            <Text className={`text-sm ${MUTED_TEXT}`}>Contraseña</Text>
            <Text className={`mt-0.5 font-bold ${INK_TEXT}`}>••••••••</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={theme.mutedInk} />
        </Pressable>
      </Card>

      <Card className="mb-6">
        <Text className={`mb-2 text-[17px] font-extrabold ${INK_TEXT}`}>
          Apariencia
        </Text>

        <View className="flex-row items-center justify-between py-3">
          <View className="flex-1">
            <Text className={`text-sm ${MUTED_TEXT}`}>Modo oscuro</Text>
            <Text className={`mt-0.5 font-bold ${INK_TEXT}`}>
              {isDarkMode ? "Activado" : "Desactivado"}
            </Text>
          </View>
          <Switch
            value={isDarkMode}
            onValueChange={(value) => {
              const nextTheme = value ? "dark" : "light";
              // Cambia el tema al instante (sin esperar al servidor) y
              // guarda la elección en la cuenta para la próxima vez que
              // inicie sesión.
              setColorScheme(nextTheme);
              saveConfig({ theme: nextTheme });
            }}
            trackColor={{ false: AppColors.softText, true: AppColors.green }}
            thumbColor={AppColors.white}
          />
        </View>
      </Card>

      <Card className="mb-6">
        <Text className={`mb-2 text-[17px] font-extrabold ${INK_TEXT}`}>
          Preferencias de cálculo
        </Text>

        <FormError message={configError} />

        {configLoading ? (
          <Text className={`py-3 text-center ${MUTED_TEXT}`}>
            Cargando configuración...
          </Text>
        ) : (
          SETTINGS_ROW_KEYS.map((key, index) =>
            renderEditableRow(key, index === 0),
          )
        )}
      </Card>

      <Card className="mb-6">
        <Text className={`mb-2 text-[17px] font-extrabold ${INK_TEXT}`}>
          Costos indirectos
        </Text>
        <Text className={`mb-3 text-sm ${MUTED_TEXT}`}>
          Arriendo, servicios y otros gastos mensuales que Cálculos reparte
          entre tu producción mensual.
        </Text>

        <FormError message={indirectCostsError} />

        <Button
          label="+ Agregar costo indirecto"
          onPress={openCreateIndirectCost}
          className="mb-2"
        />

        {indirectCostsLoading ? (
          <Text className={`py-3 text-center ${MUTED_TEXT}`}>
            Cargando costos indirectos...
          </Text>
        ) : indirectCosts.length === 0 ? (
          <Text className={`py-2 text-sm ${MUTED_TEXT}`}>
            Aún no has agregado ningún costo indirecto.
          </Text>
        ) : (
          indirectCosts.map((item, index) => (
            <Pressable
              key={item.id}
              onPress={() => openEditIndirectCost(item)}
              className={`flex-row items-center justify-between py-3 ${
                index === 0 ? "" : "border-t border-brand-input-border"
              }`}
            >
              <View className="flex-1">
                <Text className={`font-bold ${INK_TEXT}`}>{item.name}</Text>
                <Text className={`text-sm ${MUTED_TEXT}`}>
                  {item.costTypeName} · {currency.symbol}
                  {formatAmount(item.monthlyAmount, currency.code)}/mes
                </Text>
              </View>
              <Pressable
                onPress={() => setDeletingIndirectCost(item)}
                hitSlop={8}
                className="ml-2"
              >
                <Ionicons name="trash" size={16} color={theme.mutedInk} />
              </Pressable>
            </Pressable>
          ))
        )}
      </Card>

      <IndirectCostFormModal
        visible={indirectCostFormVisible}
        indirectCost={editingIndirectCost}
        onClose={() => setIndirectCostFormVisible(false)}
        onSaved={loadIndirectCosts}
      />

      <ConfirmDialog
        visible={Boolean(deletingIndirectCost)}
        title="Eliminar costo indirecto"
        message={`¿Seguro que deseas eliminar "${deletingIndirectCost?.name}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        destructive
        onConfirm={confirmDeleteIndirectCost}
        onCancel={() => setDeletingIndirectCost(null)}
      />

      <Card className="mb-6">
        <Text className={`mb-2 text-[17px] font-extrabold ${INK_TEXT}`}>
          Prestaciones legales
        </Text>
        <Text className={`mb-3 text-sm ${MUTED_TEXT}`}>
          Porcentajes de referencia que Cálculos suma sobre tu salario cuando
          activas "Incluir prestaciones legales".
        </Text>

        <FormError message={benefitsError} />

        {benefitsLoading ? (
          <Text className={`py-3 text-center ${MUTED_TEXT}`}>
            Cargando prestaciones...
          </Text>
        ) : benefits.length === 0 ? (
          <Text className={`py-2 text-sm ${MUTED_TEXT}`}>
            No tienes prestaciones configuradas.
          </Text>
        ) : (
          benefits.map((benefit, index) => (
            <View
              key={benefit.id}
              className={`flex-row items-center justify-between py-3 ${
                index === 0 ? "" : "border-t border-brand-input-border"
              }`}
            >
              <Text className={`font-bold ${INK_TEXT}`}>{benefit.name}</Text>
              <Text className={MUTED_TEXT}>{benefit.percentage}%</Text>
            </View>
          ))
        )}
      </Card>

      <EditFieldModal
        visible={editingRow !== null}
        title={`Editar ${activeRow?.rowLabel.toLowerCase() ?? ""}`}
        fields={activeRow?.fields ?? []}
        validate={activeRow?.validate}
        onSave={(values) => activeRow?.onSave(values)}
        onClose={() => setEditingRow(null)}
      />

      <EditFieldModal
        visible={changingPassword}
        title="Cambiar contraseña"
        fields={passwordFields}
        saveLabel="Actualizar contraseña"
        validate={validatePassword}
        onSave={savePassword}
        onClose={() => setChangingPassword(false)}
      />
    </TabScreen>
  );
}
