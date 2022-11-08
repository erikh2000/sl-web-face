export async function loadImage(url:string):Promise<HTMLImageElement> {
  const image:HTMLImageElement = new Image();
  image.src = url;
  return new Promise<HTMLImageElement>((resolve, reject) => {
    image.onload = () => {
      resolve(image);
    };
    image.onerror = () => {
      reject();
    }
  });
}