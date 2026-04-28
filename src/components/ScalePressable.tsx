import React, { PropsWithChildren, useRef } from "react";
import {
  Animated,
  GestureResponderEvent,
  Pressable,
  PressableProps,
  StyleProp,
  ViewStyle,
} from "react-native";

type Props = PropsWithChildren<
  PressableProps & {
    style?: StyleProp<ViewStyle>;
    onPress?: (event: GestureResponderEvent) => void;
  }
>;

export default function ScalePressable({
  children,
  style,
  onPress,
  ...rest
}: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  const animateTo = (value: number) => {
    Animated.spring(scale, {
      toValue: value,
      useNativeDriver: true,
      speed: 30,
      bounciness: 4,
    }).start();
  };

  return (
    <Animated.View style={[style, { transform: [{ scale }] }]}>
      <Pressable
        {...rest}
        onPressIn={(event) => {
          animateTo(0.97);
          rest.onPressIn?.(event);
        }}
        onPressOut={(event) => {
          animateTo(1);
          rest.onPressOut?.(event);
        }}
        onPress={onPress}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}
