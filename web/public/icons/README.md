# PWA Icons

Adicionar os seguintes arquivos PNG neste diretório:

| Arquivo | Tamanho | Finalidade |
|---|---|---|
| `icon-192.png` | 192×192 | Ícone padrão (Android/Chrome) |
| `icon-512.png` | 512×512 | Ícone padrão (splash screen) |
| `icon-maskable-192.png` | 192×192 | Ícone maskable com safe zone (zona segura = 80% do centro) |
| `icon-maskable-512.png` | 512×512 | Ícone maskable com safe zone |

Use o arquivo `icon.svg` como base. Para gerar os PNGs:

```bash
# Com Inkscape
inkscape icon.svg --export-width=192 --export-filename=icon-192.png
inkscape icon.svg --export-width=512 --export-filename=icon-512.png

# Ou use https://maskable.app para gerar os maskable icons
```

Os maskable icons devem ter o conteúdo principal dentro de 80% da área central (safe zone).
