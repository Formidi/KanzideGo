/*:
 * @plugindesc 
 * @author Micelle
 */

(function() {
  const ORIGINAL_reserveSpecific = ImageManager.reserveSpecific;
  ImageManager.reserveSpecific = function(filename, folder, hue, reservationId) {
    const bitmap = ORIGINAL_reserveSpecific.call(this, filename, folder, hue, reservationId);
    const timeout = 5000; // 5秒
    const timer = setTimeout(() => {
      if (!bitmap.isReady()) {
        bitmap._image.src = "";
        console.warn(`Timeout: ${folder}/${filename}.png`);
      }
    }, timeout);
    bitmap.addLoadListener(() => clearTimeout(timer));
    return bitmap;
  };
})();