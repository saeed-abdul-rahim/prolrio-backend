export default function addObjArr(objArr: any[]): any {
    return objArr.reduce((acc, n) => {
        for (const prop in n) {
          if (acc.hasOwnProperty(prop)) acc[prop] += n[prop]
          else acc[prop] = n[prop]
        }
        return acc;
    }, {})
}
