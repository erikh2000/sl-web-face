export type RGB = [number,number,number];
export type HSV = [number,number,number];

function _hex3ToRgb(hex3:string):RGB {
  const r = hex3.substring(0,1), g = hex3.substring(1,2), b = hex3.substring(2,3);
  const rgb:RGB = [ 
    parseInt(`${r}${r}`, 16), 
    parseInt(`${g}${g}`, 16), 
    parseInt(`${b}${b}`, 16) 
  ];
  if (isNaN(rgb[0]) || isNaN(rgb[1]) || isNaN(rgb[2])) return [0,0,0];
  return rgb;
}

function _hex6ToRgb(hex6:string):RGB {
  const r = hex6.substring(0,2), g = hex6.substring(2,4), b = hex6.substring(4,6);
  const rgb:RGB =  [
    parseInt(r, 16),
    parseInt(g, 16),
    parseInt(b, 16)
  ];
  if (isNaN(rgb[0]) || isNaN(rgb[1]) || isNaN(rgb[2])) return [0,0,0];
  return rgb;
}

// hexColor can be: #fff fff #ffffff ffffff (case-insensitive) 
export function hexColorToRgb(hexColor:string):RGB {
  const trimmed = hexColor.toLowerCase().trim();
  const text = trimmed.startsWith('#') ? hexColor.substring(1) : hexColor;
  if (text.length < 3) return [0,0,0];
  if (text.length < 6) return _hex3ToRgb(text);
  return _hex6ToRgb(text);
}

export function hsvToRgb(h:number, s:number, v:number):RGB {
  let f= (n:number,k=(n+h/60)%6) => v - v*s*Math.max( Math.min(k,4-k,1), 0);
  return [f(5),f(3),f(1)];
}

export function rgbToHsv(r:number,g:number,b:number):HSV {
  let v=Math.max(r,g,b), c=v-Math.min(r,g,b);
  let h= c && ((v==r) ? (g-b)/c : ((v==g) ? 2+(b-r)/c : 4+(r-g)/c));
  return [60*(h<0?h+6:h), v&&c/v, v];
}

function _adjustContrastSimple(r:number, g:number, b:number, contrast:number):RGB {
  function _adjust(v:number) {
    return Math.min((v - 127) * contrast + 127, 255);
  }
  
  return [_adjust(r), _adjust(g), _adjust(b)];
}

export function adjustContrast(r:number, g:number, b:number, contrast:number, brightnessThreshold:number = 0):RGB {
  if (!brightnessThreshold) return _adjustContrastSimple(r, g, b, contrast);
  const originalBrightness = (r+g+b)/3;

  function _adjust(v:number) {
    if (originalBrightness < brightnessThreshold) return v;
    const adjusted = (v - 127) * contrast + 127;
    const t = (255 - v) / (255 - brightnessThreshold);
    return Math.min(adjusted*(1-t) + v*t, 255);
  }

  return [_adjust(r), _adjust(g), _adjust(b)];
}
