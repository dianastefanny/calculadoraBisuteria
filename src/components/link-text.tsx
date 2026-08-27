import { Text } from "react-native";

export type LinkTextProps = {
  label: string;
  actionLabel: string;
  onPress: () => void;
  className?: string;
};

export function LinkText({
  label,
  actionLabel,
  onPress,
  className = "",
}: LinkTextProps) {
  return (
    <Text className={`text-center text-brand-soft-text ${className}`}>
      {label}{" "}
      <Text
        onPress={onPress}
        className="font-bold text-brand-turquoise underline"
      >
        {actionLabel}
      </Text>
    </Text>
  );
}
