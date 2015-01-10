var sortPixels = (function(){

  var canvas, ctx, width, height;
  var imageData, imageDataWrapper;

  var crange = 255 * 255 * 255;

  var blockSize = 10;

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
      var a = 0.1;
      if ( d < 0) {
          d = -d;
      }
      return  a * bright + (1 - a) * j / height;
  }

  function draw() {
   for (var i = 0; i < width / blockSize; i++) {
      sortColumn(i * blockSize);
    }
    ctx.putImageData(imageDataWrapper, 0, 0);
  }

  function sortColumn(x) {
    var j = 0;
    var y = 0;
    var column = new Array(height);
    var bright = getBlockBrightness(x, y);
    var br = getBlockBrightness(x, y);
    for(j = 0; j < height / blockSize; j++) {
      y = j * blockSize;
      var block = getBlock(x, y);
      var bl = bright;
      var bright = br;
      br = getBlockBrightness(x, y == height - 1 ? y : y + 1);
      column[j] = {j: j, block: block, val: getVal(y, block, bright, bl, br)};
    }
    column = column.sort(function (a, b) {
        return a.val - b.val;
    });
    for(j=0; j < height / blockSize; j++) {
      setBlockValue(x, j * blockSize, column[j].block);
    }
  }

  function setPixelValue(x, y, rgb) {
    var offset = (x + y * width) * 4;
    imageData[offset] = rgb[0];
    imageData[offset+1] = rgb[1];
    imageData[offset+2] = rgb[2];
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

  function getBlockBrightness(x, y) {
    return reduceBlock(x, y, function (x, y, memo) {
      return memo + getPixelBrightness(x, y);
    }, 0) / blockSize / blockSize;
  }

  function getPixelBrightness(x, y) {
    var offset = (x + y * width) * 4;
    var r = imageData[offset];
    var g = imageData[offset + 1];
    var b = imageData[offset + 2];
    return Math.max(r,g,b) / 255;
  }

  function getBlock(x, y) {
    return mapBlock(x, y, getPixelValue)
  }

  function forBlock(x, y, iteration) {
    for (var i = 0; i < blockSize; i++) {
      var col = [];
      block.push(col);
      for (var j = 0; j < blockSize; j++) {
        col.push(mapper(x + i, y + j));
      }
    }
  }

  function mapBlock(x, y, mapper) {
    var block = [];
    for (var i = 0; i < blockSize; i++) {
      var col = [];
      block.push(col);
      for (var j = 0; j < blockSize; j++) {
        col.push(mapper(x + i, y + j));
      }
    }
    return block;
  }

  function reduceBlock(x, y, reducer, initial) {
    var val = initial;
    for (var i = 0; i < blockSize; i++) {
      for (var j = 0; j < blockSize; j++) {
        val = reducer(x + i, y + j, val);
      }
    }
    return val;
  }

  return init;

})();
