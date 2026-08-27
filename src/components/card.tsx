import type { ReactNode } from "react";
import { View } from "react-native";

export type CardProps = {
  children: ReactNode;
  className?: string;
};

export function Card({ children, className = "" }: CardProps) {
  return (
    <View
      className={`rounded-2xl border border-brand-input-border bg-brand-input p-[18px] ${className}`}
    >
      {children}
    </View>
  );
}
