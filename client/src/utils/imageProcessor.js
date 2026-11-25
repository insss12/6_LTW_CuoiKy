export class ImageProcessor {
  constructor({
    maxBytes = 5 * 1024 * 1024,
    maxDimension = 900,
    quality = 0.8,
    allowedTypes = ["image/jpeg", "image/png", "image/webp"]
  } = {}) {
    this.maxBytes = maxBytes;
    this.maxDimension = maxDimension;
    this.quality = quality;
    this.allowedTypes = allowedTypes;
  }

  validate(file) {
    if (!file) {
      return "Vui lòng chọn một tệp ảnh.";
    }

    if (!this.allowedTypes.includes(file.type)) {
      return "Chỉ chấp nhận ảnh JPG, PNG hoặc WEBP.";
    }

    if (file.size > this.maxBytes) {
      return `Ảnh quá lớn, tối đa ${Math.round(
        this.maxBytes / 1024 / 1024
      )}MB.`;
    }

    return "";
  }

  loadImage(file) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const image = new Image();

      image.onload = () => {
        URL.revokeObjectURL(url);
        resolve(image);
      };

      image.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Không đọc được tệp ảnh."));
      };

      image.src = url;
    });
  }

  async toDataUrl(file) {
    const image = await this.loadImage(file);

    const scale = Math.min(
      1,
      this.maxDimension / Math.max(image.width, image.height)
    );

    const canvas = document.createElement("canvas");
    canvas.width = Math.round(image.width * scale);
    canvas.height = Math.round(image.height * scale);

    const context = canvas.getContext("2d");
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    return canvas.toDataURL("image/jpeg", this.quality);
  }
}

export const imageProcessor = new ImageProcessor();