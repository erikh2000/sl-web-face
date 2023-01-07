/* The face document is meant to be understandable and hand-editable as YAML. This means favoring easy-to-edit settings 
   over more "correct" or normalized data structures. Base and parts members should not extend to include part-specific
   info beyond layout. That info can be stored in separate variables, e.g. "irisColor" is not listed with the eyes part. */
type FaceDocument = {
  skinTone: string, // One of the names in SkinTone.ts
  hairColor: string, // One of the names in HairColor.ts
  irisColor: string, // One of the names in IrisColor.ts
  base: string, // aka "head" part. In "url @x,y" or "url @x,y,w,h" format though X,Y are ignored.
  parts: string[] // Layout information in "url @x,y" or "url @x,y,w,h" format.
}

export default FaceDocument;