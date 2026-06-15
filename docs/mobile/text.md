# Text

A text component for React Native.

## Installation

```bash
bun add @zenncore/mobile
```

## Usage

```tsx
import { Text } from '@zenncore/mobile';
```

## Props

| Prop | Type | Description |
|------|------|-------------|
| `className` | `string` | Tailwind CSS classes |
| All Text props | `TextProps` | React Native Text props |

---

## Examples

### Basic Text

```tsx
<Text>Hello World</Text>
```

### Styled Text

```tsx
<Text className="text-lg font-bold text-primary">
  Large Bold Text
</Text>
```

---

## Notes

- Built on React Native's `Text`
- Uses Tailwind via `className`
- Default class applies foreground color
