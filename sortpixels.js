var sortPixels = (function(){

  var canvas, ctx, width, height;
  var imageData, imageDataWrapper;

  var crange = 255 * 255 * 255;

  function init(img) {
    setup(img);
    draw();

    return canvas;
  }

  function setup(img) {
    canvas = document.createElement('canvas');
    width = canvas.width = img.naturalWidth;
    height = canvas.height = img.naturalHeight;

    ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    imageDataWrapper = ctx.getImageData(0, 0, width, height);
    imageData = imageDataWrapper.data;
  }

  function getVal(j, color, bright, bl, br) {
    //var d = ((bright - bl) * (bright - bl) + (bright - br) * (bright - br)) / 255 / 255 / 2;
    return  bright    +    255 * j / height;
  }

  function draw() {
   for (var i = 0; i < width; i++) {
      sortColumn(i);
    }
    ctx.putImageData(imageDataWrapper, 0, 0);
  }

  function sortColumn(i) {
    var j = 0;

      var column = new Array(height);
      var bright = getPixelBrightness(i, 0);
      var br = getPixelBrightness(i, 0);
      for(j = 0; j < height; j++) {
        var col = getPixelValue(i, j);
        var bl = bright;
        var bright = br;
        var br = getPixelBrightness(i, j == height - 1 ? j : j + 1);
        column[j] = {j: j, col: col, val: getVal(j, col, bright, bl, br)};
      }

      column = column.sort(function (a, b) {
          return a.val - b.val;
      });

      for(j=0; j < height; j++) {
        setPixelValue(i, j, column[j].col);
      }

  }

  function setPixelValue(x, y, val) {
    var offset = (x + y * width) * 4;
    var r = (val >> 16) & 255;
    var g = (val >> 8) & 255;
    var b = val & 255;
    imageData[offset] = r;
    imageData[offset+1] = g;
    imageData[offset+2] = b;
  }

  function getPixelValue(x, y) {
    var offset = (x + y * width) * 4;
    var r = imageData[offset];
    var g = imageData[offset + 1];
    var b = imageData[offset + 2];
    return ( ((255 << 8) | r) << 8 | g) << 8 | b;
  }

  function getPixelBrightness(x, y) {
    var offset = (x + y * width) * 4;
    var r = imageData[offset];
    var g = imageData[offset + 1];
    var b = imageData[offset + 2];
    return Math.max(r,g,b);
  }

  return init;

})();
