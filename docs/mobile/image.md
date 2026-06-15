# Image

An image component for React Native using Expo Image.

## Installation

```bash
bun add @zenncore/mobile expo-image
```

## Usage

```tsx
import { Image } from '@zenncore/mobile';
```

## Props

| Prop | Type | Description |
|------|------|-------------|
| `source` | `ImageSourcePropType` | Image source |
| `className` | `string` | Tailwind CSS classes |
| All Image props | `ImageProps` | Expo Image props |

---

## Examples

### Basic Image

```tsx
<Image
  source={{ uri: 'https://example.com/image.jpg' }}
  className="w-20 h-20 rounded-lg"
/>
```

### With Placeholder

```tsx
<Image
  source={{ uri: 'https://example.com/image.jpg' }}
  placeholder={{ blurhash: '...' }}
  className="w-20 h-20"
/>
```

---

## Notes

- Built on `expo-image`
- Uses `nativewind` for Tailwind via `cssInterop`
- Supports blurhash placeholders
- Optimized image loading with caching
