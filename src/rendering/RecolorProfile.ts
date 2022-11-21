export const NO_REPLACE:[number,number,number] = [-1,-1,-1];

export type RecolorInstruction = {
  // Color to match against. Elements of array are r, g, and b values.
  rgbMatch:[number, number, number],
  // Color to replace a matched pixel with.
  rgbReplace:[number, number, number],
  // Tolerable difference between individual r, g, and b values comparing source pixel to matching pixel.
  matchTolerance:number,
  // If true, then recolored pixel will blend between source and replace RGB in proportion to the match, 
  // e.g. 50% match will recolor with 50% source and 50% replacement color. 
  useSmoothing:boolean
}

export type RecolorProfile = {
  instructions:RecolorInstruction[]  
}

export const BLACK_SKIN_PROFILE:RecolorProfile = {
  instructions: [
    {rgbMatch:[199, 199, 199], rgbReplace:NO_REPLACE, matchTolerance:30, useSmoothing:true},
    {rgbMatch:[221, 221, 221], rgbReplace:NO_REPLACE, matchTolerance:30, useSmoothing:true},
    {rgbMatch:[240, 240, 240], rgbReplace:NO_REPLACE, matchTolerance:30, useSmoothing:true},
    {rgbMatch:[245, 210, 212], rgbReplace:[235,180,200], matchTolerance:30, useSmoothing:true},
    {rgbMatch:[226, 197, 197], rgbReplace:[149,110,96], matchTolerance:30, useSmoothing:true},
    {rgbMatch:[224, 175, 177], rgbReplace:[138,106,88], matchTolerance:30, useSmoothing:true},
    {rgbMatch:[220, 157, 159], rgbReplace:[120,98,86], matchTolerance:30, useSmoothing:true},
    {rgbMatch:[193, 140, 142], rgbReplace:[110,90,83], matchTolerance:30, useSmoothing:true},
    {rgbMatch:[179, 103, 103], rgbReplace:[100,82,78], matchTolerance:30, useSmoothing:true}
  ]
};