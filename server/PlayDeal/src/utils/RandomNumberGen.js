
module.exports = class RandomNumberGen
{
  constructor(seed=null)
  {
    this._seedInited = false;
    
    if(seed) {
      this.setSeed(seed);      
    } else {
      this.resetSeed();
    }
  }
  
  resetSeed()
  {
    this._seed = String(Math.random());
    this._generateRandomFunction();
  }
  
  setSeed(seed)
  {
    this._seed = seed;
    this._generateRandomFunction();
  }
  
  getSeed()
  {
    return this._seed;
  }
  
  _generateRandomFunction()
  {
    function xmur3(str) {
        for(var i = 0, h = 1779033703 ^ str.length; i < str.length; i++)
            h = Math.imul(h ^ str.charCodeAt(i), 3432918353),
            h = h << 13 | h >>> 19;
        return function() {
            h = Math.imul(h ^ h >>> 16, 2246822507);
            h = Math.imul(h ^ h >>> 13, 3266489909);
            return (h ^= h >>> 16) >>> 0;
        }
    }
    function mulberry32(a) {
      return function() {
        var t = a += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
      }
    }

    // Create xmur3 state:
    let seed = this.getSeed();

    var s = xmur3(seed);

    // Output one 32-bit hash to provide the seed for mulberry32.
    this._rand = mulberry32(s());
    this._seedInited = true;
  }
  
  // 0-1
  rand()
  {
    return this._rand();
  }
  
  randBetween(min, max)
  {
      return (this.rand() * (1 + max - min)) + min;
  }
  
  randIntBetween(min, max)
  {
    // min and max included 
    return Math.floor(this.randBetween(Math.floor(min), Math.floor(max)));
  }
}
