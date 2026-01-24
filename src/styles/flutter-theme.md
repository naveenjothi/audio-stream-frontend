# Flutter Theme Sync

To ensure the "TPS Design System" is consistent across Web and Mobile, use this `ThemeData` configuration in your Flutter app.

## Core Color Tokens

| Tailwind Token | Flutter Color | Usage |
| :--- | :--- | :--- |
| `tps-charcoal` | `Color(0xFF0B0D10)` | Scaffold Background, Main Surface |
| `tps-surface` | `Color(0xFF16191D)` | Card Background, Modal Background |
| `tps-cyan` | `Color(0xFF40E0FF)` | Primary Action, Active States, Glows |
| `tps-lilac` | `Color(0xFFB9A7FF)` | Secondary Accent, Gradients |
| `tps-muted` | `Color(0xFF8E95A1)` | Secondary Text, Icons |

## Flutter Implementation

```dart
import 'package:flutter/material.dart';

class TPSTheme {
  static const Color charcoal = Color(0xFF0B0D10);
  static const Color surface = Color(0xFF16191D);
  static const Color cyan = Color(0xFF40E0FF);
  static const Color lilac = Color(0xFFB9A7FF);
  static const Color muted = Color(0xFF8E95A1);

  static ThemeData get darkTheme {
    return ThemeData(
      brightness: Brightness.dark,
      scaffoldBackgroundColor: charcoal,
      cardColor: surface,
      
      // Color Scheme
      colorScheme: const ColorScheme.dark(
        primary: cyan,
        secondary: lilac,
        surface: surface,
        background: charcoal,
        onBackground: Colors.white,
        onSurface: Colors.white,
      ),

      // Text Theme
      textTheme: const TextTheme(
        headlineLarge: TextStyle(
          fontFamily: 'Inter',
          fontWeight: FontWeight.bold,
          color: Colors.white,
          letterSpacing: -0.5,
        ),
        bodyMedium: TextStyle(
          fontFamily: 'Inter',
          color: muted,
        ),
      ),
      
      // Component Themes
      cardTheme: CardTheme(
        color: surface,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(24.0), // Matches rounded-tps (1.5rem = 24px)
        ),
        elevation: 0,
      ),
      
      iconTheme: const IconThemeData(
        color: muted,
        size: 24.0,
      ),
    );
  }
}
```

## Guidelines for Deviation
- **Gradients**: Only use `tps-cyan` to `tps-lilac` for high-impact moments (Hero text, Plays).
- **Shadows**: Avoid heavy drop shadows. Use colored shadows (e.g., `cyan.withOpacity(0.2)`) for glows.
