/*!	Curve function for canvas 2.3.8
 *	(c) Epistemex 2013-2018
 *	www.epistemex.com
 *	License: MIT
 */

/**
 * Draws a cardinal spline through given point array. Points must be arranged
 * as: [x1, y1, x2, y2, ..., xn, yn]. It adds the points to the current path.
 *
 * There must be a minimum of two points in the input array but the function
 * is only useful where there are three points or more.
 *
 * The method continues previous path of the context. If you don't want that
 * then you need to use moveTo() with the first point from the input array.
 *
 * The points for the cardinal spline are returned as a new array.
 *
 * @param {CanvasRenderingContext2D} ctx - context to use
 * @param {Array} points - point array
 * @param {Number} [tension=0.5] - tension. Typically between [0.0, 1.0] but can be exceeded
 * @param {Number} [numOfSeg=25] - number of segments between two points (line resolution)
 * @param {Boolean} [close=false] - Close the ends making the line continuous
 * @returns {Float32Array} New array with the calculated points that was added to the path
 */
export function curve(ctx: CanvasRenderingContext2D,
                      points: number[],
                      tension: number = 0.5,
                      numOfSeg: number = 25,
                      close: boolean = true): Float32Array {

    if (typeof points === "undefined" || points.length < 2) {
        return new Float32Array(0)
    }

    // options or defaults

    let pts: number[],															// for cloning point array
        i: number = 1,
        l: number = points.length,
        rPos: number = 0,
        rLen: number = (l - 2) * numOfSeg + 2 + (close ? 2 * numOfSeg : 0),
        res: Float32Array = new Float32Array(rLen),
        cache: Float32Array = new Float32Array((numOfSeg + 2) << 2),
        cachePtr: number = 4

    pts = points.slice(0)

    if (close) {
        pts.unshift(points[l - 1])										// insert end point as first point
        pts.unshift(points[l - 2])
        pts.push(points[0], points[1]) 								// first point as last point
    } else {
        pts.unshift(points[1])											// copy 1. point and insert at beginning
        pts.unshift(points[0])
        pts.push(points[l - 2], points[l - 1])							// duplicate end-points
    }

    // cache inner-loop calculations as they are based on t alone
    cache[0] = 1														// 1,0,0,0

    for (; i < numOfSeg; i++) {

        let st: number = i / numOfSeg,
            st2: number = st * st,
            st3: number = st2 * st,
            st23: number = st3 * 2,
            st32: number = st2 * 3

        cache[cachePtr++] = st23 - st32 + 1							// c1
        cache[cachePtr++] = st32 - st23								// c2
        cache[cachePtr++] = st3 - 2 * st2 + st							// c3
        cache[cachePtr++] = st3 - st2									// c4
    }

    cache[++cachePtr] = 1												// 0,1,0,0

    // calc. points
    parse(pts, cache, l, tension)

    if (close) {
        pts = []
        pts.push(points[l - 4], points[l - 3],
            points[l - 2], points[l - 1], 							// second last and last
            points[0], points[1],
            points[2], points[3]
        ) 								// first and second
        parse(pts, cache, 4, tension)
    }

    function parse(pts: number[], cache: Float32Array, l: number, tension: number): void {

        for (let i = 2, t; i < l; i += 2) {

            let pt1: any = pts[i],
                pt2: any = pts[i + 1],
                pt3: any = pts[i + 2],
                pt4: any = pts[i + 3],

                t1x: number = (pt3 - pts[i - 2]) * tension,
                t1y: number = (pt4 - pts[i - 1]) * tension,
                t2x: number = (pts[i + 4] - pt1) * tension,
                t2y: number = (pts[i + 5] - pt2) * tension,
                c: number = 0, c1, c2, c3, c4

            for (t = 0; t < numOfSeg; t++) {

                c1 = cache[c++]
                c2 = cache[c++]
                c3 = cache[c++]
                c4 = cache[c++]

                res[rPos++] = c1 * pt1 + c2 * pt3 + c3 * t1x + c4 * t2x
                res[rPos++] = c1 * pt2 + c2 * pt4 + c3 * t1y + c4 * t2y
            }
        }
    }

    // add last point
    l = close ? 0 : points.length - 2
    res[rPos++] = points[l++]
    res[rPos] = points[l]

    ctx.moveTo(res[0], res[1])
    // add lines to path
    for (i = 2, l = res.length; i < l; i += 2) {
        ctx.lineTo(res[i], res[i + 1])
    }

    return res
}
