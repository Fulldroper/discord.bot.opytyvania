module.exports = () => {
  Number.prototype.sleep = function (number) {
    if(!number) number = this
    return new Promise(res => {
      setInterval(res, number)
    }) 
  }
  Number.prototype.numCutter = function (num, digits = 1) {
    if (!num) num = this;
    if (num < 100) return num * 1;
    const lookup = [
      { value: 1e3, symbol: "k" },
      { value: 1e6, symbol: "M" },
      { value: 1e9, symbol: "G" },
      { value: 1e12, symbol: "T" },
      { value: 1e15, symbol: "P" },
      { value: 1e18, symbol: "E" }
    ];
    for(let i = 0;i < lookup.length;i++){
      if(
        (i == (lookup.lenght - 1 ))|| (
            num > lookup[i].value &&
            num < lookup[i+1].value
        )
      ){
        const toFixed = +`1e${digits}`
        return `${Math.trunc((num / lookup[i].value)*toFixed)/toFixed}${lookup[i].symbol}`
      }
    }
  }
  Number.prototype.msToDate = function (x) {
      if (!x) x = this;
      x = Number.parseInt(x, 10)
      const 
        toSec = 1000,
        toMin = toSec * 60,
        toHour = toMin * 60,
        toDay = toHour * 24,
        toYears = toDay * 365.25,
        f = b => {
            const n = Math.trunc(x / b);
            return (n > 0 ? (x = x - (n * b), n) : undefined);
        }
      return {
        y : f(toYears),
        d : f(toDay),
        h : f(toHour),
        m : f(toMin),
        s : f(toSec)
      }; 
  }
  Number.prototype.toFixed = function(num) {
    const n = `${this}`
    let payload = ''
    for (let i = 0; i < (num - n.length); i++) {
      payload+= '0'
    }
    return (payload+n);
  }
  Array.prototype.rand = function () {
    return this[Math.floor(Math.random() * this.length)]
  }
  /**
   * Merges given count and on of declensions: one, few or many into a string
   * @param {Object} config - required configuration from number, and declensions for quantities one, few and many
   * @param {number} config.count - quantity of something
   * @param {string} config.one - word describing one
   * @param {string} config.few - a word that describes several
   * @param {string} config.many - a word that describes a lot
   * @example
   * declension({ count: 5, one: 'користувач', few: 'користувача', many: 'користувачів' });
   * // 5 користувачів
   * @return {string} a string from a number and the desired declension
   */
   Number.prototype.declension = function(options = {}) {
    const {
      one = 'користувач',
      few = 'користувача',
      many = 'користувачів',
      count = this
    } = options
    if (Number.isNaN(count)) return false;
    // reserve declaration
    const declensionNumbers = {
      '1': one,
      '2': few,
      '3': few,
      '4': few,
      '5': many,
      '6': many,
      '7': many,
      '8': many,
      '9': many,
      '0': many
    }
    // check declension and return
    return `${count} ${declensionNumbers[String(count).slice(-1)]}`    
  }
}