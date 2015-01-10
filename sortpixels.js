var sortPixels = (function(){

  var blockSize = 50;

  var canvas, ctx, width, height;
  var imageData, imageDataWrapper;




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

  function getVal(height, color, brightness, brightnessDiff) {
      var a =  0.7;
      return  a * brightness * brightnessDiff + (1 - a) * height;
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
    var column = new Array(Math.floor(height / blockSize));
    var brightness = getBlockBrightness(x, y);
    var brightnessNext = getBlockBrightness(x, y);
    for(j = 0; j < height / blockSize; j++) {
      y = j * blockSize;
      var block = getBlock(x, y);
      var brightnessPrevious = brightness;
      var brightness = brightnessNext;
      brightnessNext = getBlockBrightness(x, y == height - blockSize ? y : y + blockSize);
      var brightnessDiff = (brightnessPrevious + brightnessNext  - 2 * brightness) / 2; // Measure of local brightness difference
      column[j] = {j: j, block: block, val: getVal(y / height, block, brightness, brightnessDiff)};
    }
    column = column.sort(function (a, b) {
        return a.val - b.val;
    });
    for(j = 0; j < height / blockSize; j++) {
      setBlockValue(x, j * blockSize, column[j].block);
    }
  }

  function setPixelValue(x, y, rgb) {
    var offset = (x + y * width) * 4;
    for(var i = 0; i < 3; i++) {
      imageData[offset + i] = rgb[0 + i];
    }
  }

  function getPixelValue(x, y) {
    var offset = (x + y * width) * 4;
    return Array.prototype.slice.call(imageData, offset, offset + 3);
  }

  function getPixelBrightness(x, y) {
    var offset = (x + y * width) * 4;
    var r = imageData[offset];
    var g = imageData[offset + 1];
    var b = imageData[offset + 2];
    return Math.max(r,g,b) / 255;
  }

  function setBlockValue(x, y, block) {
    var i = 0;
    forBlock(x, y, function(x, y) {
      setPixelValue(x, y, block[i++]);
    });

  }

  function getBlock(x, y) {
    return mapBlock(x, y, getPixelValue);
  }

  function getBlockBrightness(x, y) {
    return reduceBlock(x, y, function (x, y, memo) {
      return memo + getPixelBrightness(x, y);
    }, 0) / blockSize / blockSize;
  }

  function forBlock(x, y, iteration) {
    for (var i = 0; i < blockSize; i++) {
      for (var j = 0; j < blockSize; j++) {
        iteration(x + i, y + j, i, j);
      }
    }
  }

  function mapBlock(x, y, mapper) {
    var block = [];
    forBlock(x, y, function (x, y) {
      block.push(mapper(x, y));
    });
    return block;
  }

  function reduceBlock(x, y, reducer, initial) {
    var val = initial;
    forBlock(x, y, function (x, y) {
      val = reducer(x, y, val);
    });
    return val;
  }

  return init;

})();
