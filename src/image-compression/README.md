# Image Compression Service

Сервис для сжатия изображений с использованием библиотеки Sharp.

## Использование

### Базовое использование

```typescript
import { ImageCompressionService } from './image-compression.service';

// Инжектируем сервис
constructor(private readonly imageCompressionService: ImageCompressionService) {}

// Сжимаем изображение с настройками по умолчанию
// (1920px по большей стороне, качество 85%, формат JPEG)
const compressedPath = await this.imageCompressionService.compress('/path/to/image.jpg');
```

### Расширенные настройки

```typescript
// Сжимаем с кастомными параметрами
const compressedPath = await this.imageCompressionService.compress('/path/to/image.jpg', {
  maxSize: 1024, // Максимальный размер по большей стороне
  quality: 90, // Качество JPEG (1-100)
  format: 'jpeg', // Формат выходного файла
});
```

## API

### Метод `compress(imagePath: string, options?: CompressionOptions): Promise<string>`

Сжимает изображение и сохраняет результат в оригинальный путь.

**Параметры:**

- `imagePath` - путь к исходному изображению
- `options` - опции сжатия (опционально)

**Опции сжатия:**

- `maxSize?: number` - максимальный размер по большей стороне (по умолчанию: 1920)
- `quality?: number` - качество JPEG (по умолчанию: 85)
- `format?: 'jpeg' | 'png' | 'webp'` - формат выходного файла (по умолчанию: 'jpeg')

**Возвращает:** Promise с путем к сжатому изображению (тот же, что и исходный)

### Метод `getImageInfo(imagePath: string): Promise<sharp.Metadata>`

Получает информацию об изображении.

**Параметры:**

- `imagePath` - путь к изображению

**Возвращает:** Promise с метаданными изображения

## Особенности

- Сохраняет пропорции изображения
- Не увеличивает изображения, которые уже меньше целевого размера
- Перезаписывает оригинальный файл сжатой версией
- Поддерживает логирование операций
- Обрабатывает ошибки с подробным логированием
