// Fix TS2786 errors caused by @types/react@19.2.x incompatibility with
// Radix UI components compiled against older React types.
// This augmentation ensures ReactPortal includes children as ReactNode.
import 'react';

declare module 'react' {
  interface ReactPortal {
    children?: React.ReactNode;
  }
}
