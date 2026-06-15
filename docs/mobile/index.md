# @zenncore/mobile

React Native components for mobile applications.

## Installation

```bash
bun add @zenncore/mobile
```

## Components

| Component | Description |
|-----------|-------------|
| [Button](./button.md) | Touchable button component |
| [Text](./text.md) | Text component |
| [Input](./input.md) | Text input component |
| [Image](./image.md) | Image component (Expo Image) |

---

## Usage

```tsx
import { Button, Text, Input, Image } from '@zenncore/mobile';

function MyScreen() {
  return (
    <Button onPress={() => console.log('pressed')}>
      <Text>Click me</Text>
    </Button>
  );
}
```

## Requirements

- React Native
- Expo (for Image component)
- NativeWind for Tailwind CSS support
