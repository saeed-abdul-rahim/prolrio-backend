export default function arraySplit(inputArray: any[], splitSize = 10) {
    const result = inputArray.reduce((resultArray: any[][], item: any, index: number) => { 
        const chunkIndex = Math.floor(index/splitSize)
        if(!resultArray[chunkIndex]) resultArray[chunkIndex] = []
        resultArray[chunkIndex].push(item)
        return resultArray
    }, [])
    return result
}