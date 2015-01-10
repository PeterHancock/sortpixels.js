var sortPixels = (function(){

  var canvas, ctx, width, height;
  var imageData, imageDataWrapper;

  var crange = 255 * 255 * 255;

  var blockSize = 100;

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
      var d = (bl + br  - 2 * bright) / 2; // Measure of local brightness difference
      var a = 0.4;
      if ( d < 0) {
          d = -d;
      }
      return  a * d / 255  +  (1 - a) * j / height;
  }

  function draw() {
   for (var i = 0; i < width / blockSize; i++) {
      sortColumn(i * blockSize);
    }
    ctx.putImageData(imageDataWrapper, 0, 0);
  }

  function sortColumn(x) {
    var j = 0;

      var column = new Array(height);
      var bright = getPixelBrightness(x, 0);
      var br = getPixelBrightness(x, 0);
      for(j = 0; j < height / blockSize; j++) {
        var y = j * blockSize;
        var col = getPixelValue(x, y);
        var block = getBlock(x, y);
        var bl = bright;
        var bright = br;
        br = getPixelBrightness(x, y == height - 1 ? y : y + 1);
        column[j] = {j: j, block: block, val: getVal(y, col, bright, bl, br)};
      }

      column = column.sort(function (a, b) {
          return a.val - b.val;
      });

      for(j=0; j < height / blockSize; j++) {
        setBlockValue(x, j * blockSize, column[j].block);
      }

  }

  function setPixelValue(x, y, val) {
    var offset = (x + y * width) * 4;
    var r = val[0];
    var g = val[1];
    var b = val[2];
    imageData[offset] = r;
    imageData[offset+1] = g;
    imageData[offset+2] = b;
  }

  function setBlockValue(x, y, block) {
    for (var i = 0; i < blockSize; i++) {
      for (var j = 0; j < blockSize; j++) {
        setPixelValue(x + i, y + j, block[i][j])
      }
    }
  }

  function getPixelValue(x, y) {
    var offset = (x + y * width) * 4;
    var r = imageData[offset];
    var g = imageData[offset + 1];
    var b = imageData[offset + 2];
    return [r, g, b];
  }

  function getPixelBrightness(x, y) {
    var offset = (x + y * width) * 4;
    var r = imageData[offset];
    var g = imageData[offset + 1];
    var b = imageData[offset + 2];
    return Math.max(r,g,b);
  }

  function getBlock(x, y) {
    var block = [];
    for (var i = 0; i < blockSize; i++) {
      var col = [];
      block.push(col);
      for (var j = 0; j < blockSize; j++) {
        col.push(getPixelValue(x + i, y + j));
      }
    }
    return block;
  }
  return init;

})();
