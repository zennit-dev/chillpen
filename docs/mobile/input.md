# Input

A text input component for React Native.

## Installation

```bash
bun add @zenncore/mobile
```

## Usage

```tsx
import { Input } from '@zenncore/mobile';
```

## Props

| Prop | Type | Description |
|------|------|-------------|
| `className` | `string` | Tailwind CSS classes |
| `value` | `string` | Input value |
| `onChangeText` | `(text: string) => void` | Text change callback |
| `placeholder` | `string` | Placeholder text |
| All TextInput props | `TextInputProps` | React Native TextInput props |

---

## Examples

### Basic Input

```tsx
const [text, setText] = useState('');

<Input
  value={text}
  onChangeText={setText}
  placeholder="Enter text..."
/>
```

### With Placeholder Style

```tsx
<Input
  className="text-lg"
  placeholder="Type here..."
  placeholderTextColor="gray"
/>
```

---

## Notes

- Built on React Native's `TextInput`
- Uses Tailwind via `className`
- Default classes: foreground color for text, placeholder dimmed
