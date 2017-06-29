Array.prototype.random = function () {
  return this[Math.floor((Math.random()*this.length))];
}

String.prototype.replaceAt=function(index, replacement) {
    return this.substr(0, index) + replacement+ this.substr(index + replacement.length);
}