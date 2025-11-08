# Responsiveness-Dokumentation

## Grid-Einstellungen und Breakpoints

Für die responsive Umsetzung der LocalEats-Seite habe ich drei Breakpoints gewählt: Mobile (bis 767px), Tablet (768px+) und Desktop (1100px+). Die Mobile-First-Strategie ermöglicht eine optimale Performance auf kleineren Geräten.

Bei der Mobile-Ansicht verwende ich Flexbox für eine einfache vertikale Anordnung der Cards. Ab dem Tablet-Breakpoint setze ich CSS Grid mit `repeat(auto-fit, minmax(350px, 1fr))` ein, wodurch sich die Spaltenanzahl automatisch an die verfügbare Breite anpasst. Die Featured Card nutzt `grid-column: span 2` um bei ausreichend Platz zwei Spalten zu belegen.

Für Desktop habe ich bewusst `repeat(2, 1fr)` statt auto-fit gewählt, um eine konsistente zwei-spaltige Struktur zu gewährleisten. Die kleinen Cards verwenden das gleiche Grid-System für perfekte Ausrichtung.

## Screenshots

- `view-360.png` - Mobile Ansicht (360px Breite)
- `view-768.png` - Tablet Ansicht (768px Breite) 
- `view-1200.png` - Desktop Ansicht (1200px Breite)
