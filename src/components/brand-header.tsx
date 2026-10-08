import { Image } from "expo-image";
import { Text, View } from "react-native";

export type BrandHeaderProps = {
  title?: string;
  className?: string;
};

/**
 * Encabezado con el logo y el nombre "CUENTA CUENTAS". Se usa arriba del
 * formulario de inicio de sesión (y se puede reutilizar en cualquier otra
 * pantalla que necesite mostrar la marca).
 */
export function BrandHeader({
  title = "CUENTA CUENTAS",
  className = "",
}: BrandHeaderProps) {
  return (
    <View className={`mb-6 items-center ${className}`}>
      {/* Logo animado (se reproduce una vez y queda en el logo final).
          expo-image y no Image de react-native, porque en Android solo
          expo-image anima los GIF. */}
      <Image
        source={require("@/assets/images/logo-cc-animado.gif")}
        style={{ width: 200, height: 200, marginBottom: 8 }}
        contentFit="contain"
        autoplay
      />
      <Text className="text-center font-extrabold tracking-wide text-brand-turquoise">
        {title}
      </Text>
    </View>
  );
}
