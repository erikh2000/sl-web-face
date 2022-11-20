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