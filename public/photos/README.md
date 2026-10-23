# 📸 How to Add Your Photographs

Place your four images in this folder with the following names:

| File name   | Caption shown on site              |
|-------------|-------------------------------------|
| photo1.jpg  | "A moment worth keeping."          |
| photo2.jpg  | "One for the memories."            |
| photo3.jpg  | "A little piece of happiness."     |
| photo4.jpg  | "Some things remain special."      |

## Tips

- **Supported formats:** JPG, PNG, WebP — any standard image format works.
- **Proportions:** The polaroid frame uses `object-cover`. Portrait (3:4) or square photos look best.
- **Size:** Keep each image under 2 MB for fast mobile loading.
- **Privacy:** These photos are only visible locally / when you deploy. They are never uploaded anywhere automatically.

## Changing captions or the letter

All editable text is in one file:

```
src/config/content.js
```

Open it and you will find clearly labelled sections for:
- `INVITATION` — the opening card text
- `LETTER` — the handwritten letter body
- `PHOTOS` — file paths and captions for each photograph
- `QUOTES` — the three literary quote cards
- `FINAL` — the birthday closing screen text
