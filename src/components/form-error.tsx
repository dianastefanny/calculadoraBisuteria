import { Text, View } from "react-native";

export type FormErrorProps = {
  message?: string | null;
  variant?: "error" | "success";
  className?: string;
};

export function FormError({
  message,
  variant = "error",
  className = "",
}: FormErrorProps) {
  if (!message) return null;

  const isSuccess = variant === "success";

  return (
    <View
      className={`mb-4 rounded-[9px] p-3 ${isSuccess ? "bg-brand-success-background" : "bg-brand-error"} ${className}`}
    >
      <Text
        className={isSuccess ? "text-brand-success-text" : "font-bold text-white"}
      >
        {message}
      </Text>
    </View>
  );
}
