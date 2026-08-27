import { Image, Text, View } from "react-native";

export type BrandHeaderProps = {
  title?: string;
  className?: string;
};

export function BrandHeader({
  title = "CUENTA CUENTAS",
  className = "",
}: BrandHeaderProps) {
  return (
    <View className={`mb-6 items-center ${className}`}>
      <Image
        source={require("@/assets/images/logo-cc.png")}
        className="mb-2"
        style={{ width: 200, height: 200 }}
        resizeMode="contain"
      />
      <Text className="text-center font-extrabold tracking-wide text-brand-turquoise">
        {title}
      </Text>
    </View>
  );
}
