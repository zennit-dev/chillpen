# Button

A touchable button component for React Native.

## Installation

```bash
bun add @zenncore/mobile
```

## Usage

```tsx
import { Button } from '@zenncore/mobile';
```

## Props

| Prop | Type | Description |
|------|------|-------------|
| `className` | `string` | Tailwind CSS classes |
| `onPress` | `() => void` | Press handler |
| `disabled` | `boolean` | Disabled state |
| `...PressableProps` | `PressableProps` | All React Native Pressable props |

---

## Examples

### Basic Button

```tsx
<Button onPress={() => console.log('pressed')}>
  <Text>Click me</Text>
</Button>
```

### Disabled Button

```tsx
<Button disabled onPress={() => console.log('pressed')}>
  <Text>Disabled</Text>
</Button>
```

---

## Notes

- Built on React Native's `Pressable`
- Includes active scale animation (95%)
- Uses Tailwind via `className`
- Children render inside the Pressable
