import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, Text, View } from "react-native";

export type ScreenHeaderProps = {
  title: string;
  onBack?: () => void;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightPress?: () => void;
  className?: string;
};

/**
 * Encabezado que se repite arriba de varias pantallas (no la de login):
 * un título en el centro/izquierda, con dos botones opcionales:
 * - onBack: si se pasa, aparece una flecha "<" para volver a la pantalla anterior.
 * - rightIcon/onRightPress: si se pasan, aparece un ícono a la derecha con
 *   una acción propia (por ejemplo, el ícono de cerrar sesión en el menú).
 *
 * Ejemplo con flecha de volver: <ScreenHeader title="Inventario" onBack={() => router.back()} />
 */
export function ScreenHeader({
  title,
  onBack,
  rightIcon,
  onRightPress,
  className = "",
}: ScreenHeaderProps) {
  return (
    <View className={`mb-6 flex-row items-center ${className}`}>
      {onBack && (
        <Pressable onPress={onBack} hitSlop={8} className="mr-3">
          <Ionicons name="chevron-back" size={26} color="#fff" />
        </Pressable>
      )}
      <Text className="flex-1 text-2xl font-extrabold text-white">
        {title}
      </Text>
      {rightIcon && (
        <Pressable onPress={onRightPress} hitSlop={8} className="ml-3">
          <Ionicons name={rightIcon} size={24} color="#fff" />
        </Pressable>
      )}
    </View>
  );
}
